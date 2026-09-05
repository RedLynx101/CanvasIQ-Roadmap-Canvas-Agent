import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
await mkdir("docs/images", { recursive: true });
await mkdir("docs/examples", { recursive: true });
await page.goto("http://127.0.0.1:4320/compare");
await page
  .getByRole("button", { name: "Explore an example", exact: true })
  .click();
for (const route of ["compare", "portfolio", "roadmap", "evidence"]) {
  await page.goto(`http://127.0.0.1:4320/${route}`);
  await page.getByText("EXAMPLE WORKSPACE · SYNTHETIC DATA").waitFor();
  await page.screenshot({ path: `docs/images/${route}.png` });
}
await page.goto("http://127.0.0.1:4320/compare");
await page.getByRole("button", { name: "Switch to dark theme" }).click();
await page.screenshot({ path: "docs/images/compare-dark.png" });
await page.getByRole("button", { name: "Switch to light theme" }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "docs/images/compare-mobile.png",
  fullPage: true,
});
await page.goto("http://127.0.0.1:4320/roadmap");
await page.getByRole("heading", { name: "A plan that fits" }).waitFor();
await page.screenshot({
  path: "docs/images/roadmap-mobile.png",
  fullPage: true,
});
await page.setViewportSize({ width: 1440, height: 1050 });
await page.goto("http://127.0.0.1:4320/canvas");
await page
  .getByRole("heading", { name: "A more resilient operation" })
  .waitFor();
await page.screenshot({ path: "docs/images/decision.png" });
await page.pdf({
  path: "docs/examples/northstar-decision.pdf",
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log("Captured eight workspace views and the decision PDF.");
