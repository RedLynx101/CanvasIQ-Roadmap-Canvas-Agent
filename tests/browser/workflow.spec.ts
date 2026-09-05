import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { exampleProject } from "../../data/example";
import { newInitiative } from "../../domain/schema";
test("corrupt storage is preserved until explicit recovery", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("canvasiq-workspace-v2", "unreadable-original"),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Recover your saved workspace" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "New project", exact: true }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("canvasiq-workspace-v2")),
  ).toBe("unreadable-original");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download recovery copy" }).click();
  const stream = await (await pending).createReadStream();
  let raw = "";
  for await (const chunk of stream!) raw += chunk;
  expect(JSON.parse(raw).workspace).toBe("unreadable-original");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Start fresh", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Start with a decision" }),
  ).toBeVisible();
});
test("complete manual workflow, recovery, evidence and exports", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore an example", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /36-month net present value/ }),
  ).toContainText("$502,501");
  await page.getByRole("button", { name: "Conservative", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /36-month net present value/ }),
  ).toContainText("-$24,478");
  await page.getByRole("button", { name: "Base case", exact: true }).click();
  await page.getByRole("link", { name: "Initiatives 02" }).click();
  await page
    .getByRole("button", { name: "Add initiative", exact: true })
    .click();
  await page
    .getByLabel("Initiative name", { exact: true })
    .fill("Review automation");
  await page
    .getByLabel("Operating problem", { exact: true })
    .fill("Manual review takes time.");
  await page
    .getByLabel("Implementation cost ($)", { exact: true })
    .fill("10000");
  await page
    .getByLabel("Annual operating cost ($)", { exact: true })
    .fill("2000");
  await page.getByLabel("Annual benefit ($)", { exact: true }).fill("25000");
  await page
    .getByRole("button", { name: "Save initiative", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Review automation", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Review automation", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Portfolio 04" }).click();
  await page.getByRole("button", { name: "Recommend portfolio" }).click();
  await expect(
    page.getByRole("heading", { name: "Why this portfolio" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Roadmap 05" }).click();
  await expect(
    page.getByRole("heading", { name: "A plan that fits" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Resolve before committing" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Evidence 06" }).click();
  await page.getByRole("button", { name: "Add evidence" }).click();
  await page.getByLabel("Source or reference").fill("Operating report Q3");
  await page
    .getByLabel("Rationale", { exact: true })
    .fill("Checked against monthly invoice volume.");
  await page.getByRole("button", { name: "Save evidence" }).click();
  await expect(
    page.getByRole("cell", { name: /Operating report Q3/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Decision brief 07" }).click();
  await page.getByLabel("Decision name").fill("Approved pilot shortlist");
  await page
    .getByLabel("Why this portfolio?")
    .fill("Prioritize measurable improvements with available capacity.");
  await page.getByRole("button", { name: "Save decision snapshot" }).click();
  await expect(
    page.getByRole("heading", { name: "Approved pilot shortlist" }),
  ).toBeVisible();
  const jsonDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Project JSON" }).click();
  const json = await jsonDownload;
  const stream = await json.createReadStream();
  let body = "";
  for await (const part of stream!) body += part;
  const parsed = JSON.parse(body);
  expect(parsed.initiatives).toHaveLength(6);
  expect(parsed.snapshots).toHaveLength(1);
  expect(
    parsed.evidence.some(
      (e: { source: string }) => e.source === "Operating report Q3",
    ),
  ).toBe(true);
  const file = page.getByLabel("Import project file");
  await file.setInputFiles({
    name: "restored.json",
    mimeType: "application/json",
    buffer: Buffer.from(body),
  });
  await expect(page.getByLabel("Active project").locator("option")).toHaveCount(
    3,
  );
  await file.setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":999}'),
  });
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Could not import",
  );
  expect(errors).toEqual([]);
});
test("keyboard, accessible controls, mobile layout and dark theme", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore an example", exact: true })
    .click();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.goto("/initiatives");
  await page
    .getByRole("button", { name: "Add initiative", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Add initiative", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/compare");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Roadmap 05" }).click();
  await expect(
    page.getByRole("heading", { name: "A plan that fits" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const mobile = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(mobile.violations).toEqual([]);
  // A 720px layout exercises the reflow width of a 1440px display at 200% zoom.
  for (const width of [720, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeVisible();
  }
});
test("AI proposals require acceptance and survive a subsequent brief save", async ({
  page,
}) => {
  const { id, selected, ...initiative } = newInitiative();
  void id;
  void selected;
  initiative.name = "Invoice review pilot";
  await page.route("**/api/assistant", async (route) => {
    expect(route.request().postDataJSON().consent).toBe(true);
    await route.fulfill({
      contentType: "text/event-stream",
      body: `data: ${JSON.stringify({
        type: "result",
        data: {
          answer: "Validate invoice volume before estimating savings.",
          questions: [],
          proposal: { targetId: null, initiative },
        },
      })}\n\n`,
    });
  });
  await page.goto("/brief");
  await page
    .getByRole("button", { name: "Open example strategy", exact: true })
    .click();
  await page.getByLabel("Strategy name").fill("A reviewed strategy");
  await page.getByRole("button", { name: "Ask CanvasIQ" }).click();
  await page.getByLabel("Deployment access code").fill("synthetic-test-only");
  await page
    .getByLabel("I agree to send this planning context to OpenAI.")
    .check();
  await page
    .getByLabel("Your question")
    .fill("Propose an invoice review pilot with unknown costs.");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(
    page.getByRole("heading", { name: "Invoice review pilot" }),
  ).toBeVisible();
  const current = () =>
    page.evaluate(() => {
      const workspace = JSON.parse(
        localStorage.getItem("canvasiq-workspace-v2")!,
      );
      return workspace.projects.find(
        (p: { id: string }) => p.id === workspace.activeId,
      );
    });
  expect((await current()).initiatives).toHaveLength(5);
  await page.getByRole("button", { name: "Apply draft" }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(
    "Draft applied",
  );
  await page.getByRole("button", { name: "Close panel" }).click();
  await page.getByRole("button", { name: "Save brief" }).click();
  await page.reload();
  const saved = await current();
  expect(saved.name).toBe("A reviewed strategy");
  expect(saved.initiatives).toHaveLength(6);
  expect(saved.initiatives.at(-1)).toMatchObject({
    name: "Invoice review pilot",
    selected: false,
    annualBenefit: null,
  });
  expect(saved.conversation).toHaveLength(2);
  expect(JSON.stringify(saved)).not.toContain("synthetic-test-only");
});
test("assistant consent and disabled-provider recovery leave data unchanged", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore an example", exact: true })
    .click();
  await page.getByRole("button", { name: "Ask CanvasIQ" }).click();
  await expect(
    page.getByRole("button", { name: "Send question" }),
  ).toBeDisabled();
  await page.getByLabel("Deployment access code").fill("a-test-access-code");
  await page
    .getByLabel("I agree to send this planning context to OpenAI.")
    .check();
  await page.getByLabel("Your question").fill("What should I verify?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("status")).toContainText(
    "AI assistance is disabled",
  );
  await page.getByRole("button", { name: "Close panel" }).click();
  await expect(
    page.getByRole("button", { name: /36-month net present value/ }),
  ).toContainText("$502,501");
});
test("blocked dependencies stay visible and do not silently count as value", async ({
  page,
}) => {
  const p = exampleProject();
  p.initiatives.find((i) => i.id === "data")!.selected = false;
  await page.goto("/");
  await page.getByLabel("Import project file").setInputFiles({
    name: "blocked.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(p)),
  });
  await expect(page.getByRole("status")).toContainText("cannot be scheduled");
  await page.goto("/roadmap");
  await expect(
    page.getByRole("heading", { name: "Resolve before committing" }),
  ).toBeVisible();
});
