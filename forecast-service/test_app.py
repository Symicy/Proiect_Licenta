from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app import app


client = TestClient(app)


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
    start = datetime(2026, 6, 1, tzinfo=timezone.utc)
    points = [
        {
            "timestamp": (start + timedelta(hours=3 * index)).isoformat().replace("+00:00", "Z"),
            "value": 100 + index * 1.25,
        }
        for index in range(24)
    ]

    response = client.post(
        "/forecast",
        json={
            "points": points,
            "horizonHours": 12,
            "stepHours": 3,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert len(payload["forecast"]) == 4
    assert payload["order"] is not None
