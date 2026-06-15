import { expect, test, type Page } from "@playwright/test";

async function loginAsCompany(page: Page) {
  await page.goto("/");
  await page.locator('input[type="email"]').first().fill("company.demo@example.com");
  await page.locator('input[type="password"]').first().fill("Demo12345!");
  await page.getByRole("button", { name: /sign in|autentificare/i }).click();
  await expect(page).toHaveURL(/\/home/);
}

test.describe("WattWise dashboard smoke flows", () => {
  test("company user can open dashboard sections", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop section smoke flow is validated in the desktop project.");

    await loginAsCompany(page);

    await expect(page.getByRole("heading", { name: /Fleet Overview|Prezentare flot/i })).toBeVisible();

    await page.goto("/devices");
    await expect(page.getByRole("heading", { name: /Device Inventory|Inventar/i })).toBeVisible();

    await page.goto("/meter");
    await expect(page.getByRole("heading", { name: /Live Readings|Citiri live|Detalii live/i })).toBeVisible();

    await page.goto("/billing");
    await expect(page.getByRole("heading", { name: /Cost By Utility|Costuri pe utilit|Fleet Billing Projection/i })).toBeVisible();
  });

  test("mobile viewport keeps primary navigation reachable", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile navigation is validated only in the mobile project.");

    await loginAsCompany(page);
    await page.setViewportSize({ width: 390, height: 844 });

    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Overview|Prezentare/i }).first()).toBeVisible();

    const devicesNav = page.getByText(/Devices|Dispozitive/i).last();
    await expect(devicesNav).toBeVisible();
    await devicesNav.click();
    await expect(page).toHaveURL(/\/devices/);
    await expect(page.getByRole("heading", { name: /Device Inventory|Inventar/i })).toBeVisible();
  });
});
