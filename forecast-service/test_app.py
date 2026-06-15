from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app import app


client = TestClient(app)


def regular_points(count: int = 24, step_hours: int = 3):
    start = datetime(2026, 6, 1, tzinfo=timezone.utc)
    return [
        {
            "timestamp": (start + timedelta(hours=step_hours * index)).isoformat().replace("+00:00", "Z"),
            "value": 100 + index * 1.25,
        }
        for index in range(count)
    ]


def test_health_endpoint_reports_service_ready():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_forecast_returns_insufficient_data_for_short_series():
    response = client.post(
        "/forecast",
        json={
            "points": [
                {"timestamp": "2026-06-01T00:00:00Z", "value": 10},
                {"timestamp": "2026-06-01T03:00:00Z", "value": 11},
            ],
            "horizonHours": 24,
            "stepHours": 3,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "insufficient_data"
    assert payload["forecast"] == []


def test_forecast_returns_points_for_regular_series():
    response = client.post(
        "/forecast",
        json={
            "points": regular_points(),
            "horizonHours": 12,
            "stepHours": 3,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert len(payload["forecast"]) == 4
    assert payload["order"] is not None


def test_forecast_rejects_invalid_horizon_and_step_values():
    response = client.post(
        "/forecast",
        json={
            "points": regular_points(),
            "horizonHours": 0,
            "stepHours": 25,
        },
    )

    assert response.status_code == 422


def test_forecast_uses_ceiling_for_partial_horizon_steps():
    response = client.post(
        "/forecast",
        json={
            "points": regular_points(),
            "horizonHours": 10,
            "stepHours": 3,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["metadata"]["steps"] == 4
    assert len(payload["forecast"]) == 4


def test_selected_arima_order_stays_inside_bounded_grid():
    response = client.post(
        "/forecast",
        json={
            "points": regular_points(36),
            "horizonHours": 24,
            "stepHours": 6,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    p, d, q = payload["order"]
    assert 0 <= p <= 3
    assert 0 <= d <= 1
    assert 0 <= q <= 3
