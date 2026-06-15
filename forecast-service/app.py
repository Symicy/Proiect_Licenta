from __future__ import annotations

from datetime import datetime, timedelta, timezone
from itertools import product
from typing import Literal

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator
from statsmodels.tsa.arima.model import ARIMA


MIN_VALID_POINTS = 12
MAX_POINTS = 5000


class HistoricalPoint(BaseModel):
    timestamp: datetime
    value: float

    @field_validator("timestamp")
    @classmethod
    def normalize_timestamp(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)


class ForecastRequest(BaseModel):
    points: list[HistoricalPoint] = Field(default_factory=list, max_length=MAX_POINTS)
    horizonHours: int = Field(default=24, ge=1, le=168)
    stepHours: int = Field(default=3, ge=1, le=24)


class ForecastPoint(BaseModel):
    timestamp: str
    value: float
    lower: float | None = None
    upper: float | None = None


class ForecastResponse(BaseModel):
    status: Literal["ok", "insufficient_data", "model_error"]
    forecast: list[ForecastPoint]
    order: tuple[int, int, int] | None = None
    metadata: dict[str, float | int | str | None]


app = FastAPI(title="WattWise Forecast Service", version="1.0.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def valid_ordered_points(points: list[HistoricalPoint]) -> list[HistoricalPoint]:
    ordered = sorted(points, key=lambda point: point.timestamp)
    cleaned: list[HistoricalPoint] = []

    for point in ordered:
        if np.isfinite(point.value):
            cleaned.append(point)

    return cleaned


def select_arima_order(values: np.ndarray) -> tuple[tuple[int, int, int], float]:
    best_order: tuple[int, int, int] | None = None
    best_aic = float("inf")

    for order in product(range(4), range(2), range(4)):
        p, d, q = order
        if p == 0 and d == 0 and q == 0:
            continue

        try:
            fitted = ARIMA(
                values,
                order=order,
                enforce_stationarity=False,
                enforce_invertibility=False,
            ).fit()
        except Exception:
            continue

        if np.isfinite(fitted.aic) and fitted.aic < best_aic:
            best_order = order
            best_aic = float(fitted.aic)

    return best_order or (1, 1, 1), best_aic


@app.post("/forecast", response_model=ForecastResponse)
def forecast(request: ForecastRequest) -> ForecastResponse:
    points = valid_ordered_points(request.points)
    if len(points) < MIN_VALID_POINTS:
        return ForecastResponse(
            status="insufficient_data",
            forecast=[],
            order=None,
            metadata={
                "validPoints": len(points),
                "requiredPoints": MIN_VALID_POINTS,
                "horizonHours": request.horizonHours,
                "stepHours": request.stepHours,
            },
        )

    values = np.asarray([point.value for point in points], dtype=float)
    forecast_steps = max(1, int(np.ceil(request.horizonHours / request.stepHours)))

    try:
        order, aic = select_arima_order(values)
        fitted = ARIMA(
            values,
            order=order,
            enforce_stationarity=False,
            enforce_invertibility=False,
        ).fit()
        result = fitted.get_forecast(steps=forecast_steps)
        predicted_mean = np.asarray(result.predicted_mean, dtype=float)
        confidence = result.conf_int(alpha=0.05)
    except Exception as error:
        return ForecastResponse(
            status="model_error",
            forecast=[],
            order=None,
            metadata={
                "validPoints": len(points),
                "horizonHours": request.horizonHours,
                "stepHours": request.stepHours,
                "error": str(error),
            },
        )

    last_timestamp = points[-1].timestamp
    forecast_points: list[ForecastPoint] = []

    for index, value in enumerate(predicted_mean, start=1):
        lower = None
        upper = None

        try:
            lower = float(confidence[index - 1][0])
            upper = float(confidence[index - 1][1])
        except Exception:
            lower = None
            upper = None

        timestamp = last_timestamp + timedelta(hours=request.stepHours * index)
        forecast_points.append(
            ForecastPoint(
                timestamp=timestamp.isoformat().replace("+00:00", "Z"),
                value=float(max(value, 0)),
                lower=float(max(lower, 0)) if lower is not None and np.isfinite(lower) else None,
                upper=float(max(upper, 0)) if upper is not None and np.isfinite(upper) else None,
            )
        )

    return ForecastResponse(
        status="ok",
        forecast=forecast_points,
        order=order,
        metadata={
            "validPoints": len(points),
            "horizonHours": request.horizonHours,
            "stepHours": request.stepHours,
            "steps": forecast_steps,
            "aic": aic if np.isfinite(aic) else None,
            "lastObservedValue": float(values[-1]),
        },
    )
