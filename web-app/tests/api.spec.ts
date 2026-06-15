import { expect, request as playwrightRequest, test } from "@playwright/test";

const companyCredentials = {
  email: "company.demo@example.com",
  password: "Demo12345!",
};

test.describe("WattWise API integration", () => {
  test("rejects protected endpoints without a session", async ({ request }) => {
    const response = await request.get("/api/devices");
    expect(response.status()).toBe(401);
  });

  test("authenticates demo company and reads fleet APIs", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: companyCredentials,
    });
    expect(login.status()).toBe(200);

    const me = await request.get("/api/auth/me");
    expect(me.status()).toBe(200);
    const mePayload = await me.json();
    expect(mePayload.user.email).toBe(companyCredentials.email);

    const devicesResponse = await request.get("/api/devices");
    expect(devicesResponse.status()).toBe(200);
    const devicesPayload = await devicesResponse.json();
    expect(Array.isArray(devicesPayload.devices)).toBe(true);
    expect(devicesPayload.devices.length).toBeGreaterThan(0);

    const devEui = devicesPayload.devices[0].devEui;

    const summary = await request.get("/api/devices/summary");
    expect(summary.status()).toBe(200);
    const summaryPayload = await summary.json();
    expect(summaryPayload.summary.totals.deviceCount).toBeGreaterThan(0);

    const readings = await request.get(`/api/devices/${devEui}/readings?mode=latest`);
    expect(readings.status()).toBe(200);

    const cost = await request.get(`/api/devices/${devEui}/cost`);
    expect(cost.status()).toBe(200);
    const costPayload = await cost.json();
    expect(costPayload.cost.estimatedCost).toBeGreaterThanOrEqual(0);

    const forecast = await request.get(`/api/devices/${devEui}/forecast?horizonHours=12&stepHours=3`);
    expect(forecast.status()).toBe(200);
    const forecastPayload = await forecast.json();
    expect(["ok", "insufficient_data", "model_error", "service_unavailable"]).toContain(
      forecastPayload.model.status,
    );
  });

  test("prevents an individual user from reading a company device", async ({ request }) => {
    const companyLogin = await request.post("/api/auth/login", {
      data: companyCredentials,
    });
    expect(companyLogin.status()).toBe(200);

    const companyDevices = await request.get("/api/devices");
    const companyPayload = await companyDevices.json();
    const companyDevEui = companyPayload.devices[0].devEui;

    const userContext = await playwrightRequest.newContext({
      baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    });
    const userLogin = await userContext.post("/api/auth/login", {
      data: {
        email: "user1.demo@example.com",
        password: "Demo12345!",
      },
    });
    expect(userLogin.status()).toBe(200);

    const forbidden = await userContext.get(`/api/devices/${companyDevEui}`);
    expect([403, 404]).toContain(forbidden.status());
    await userContext.dispose();
  });
});
