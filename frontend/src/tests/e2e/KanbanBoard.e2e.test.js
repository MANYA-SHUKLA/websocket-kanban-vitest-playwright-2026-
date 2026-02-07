import { test, expect } from "@playwright/test";

const MINI_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

test.describe("Kanban Board E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page shows Real-time Kanban Board title", async ({ page }) => {
    await expect(page.getByText("Real-time Kanban Board")).toBeVisible();
  });

  test("User can create a task and see it on the board", async ({ page }) => {
    await expect(page.getByTestId("new-task-input")).toBeVisible();
    await page.getByTestId("new-task-input").fill("E2E Test Task");
    await page.getByTestId("add-task-btn").click();
    await expect(page.getByText("E2E Test Task")).toBeVisible();
    await expect(page.getByTestId("column-todo")).toContainText("E2E Test Task");
  });

  test("User can drag a task between columns", async ({ page }) => {
    await page.getByTestId("new-task-input").fill("Task to drag");
    await page.getByTestId("add-task-btn").click();
    await expect(page.getByText("Task to drag")).toBeVisible();
    const taskCard = page.locator("[data-testid^=task-]").filter({ hasText: "Task to drag" }).first();
    await expect(taskCard).toBeVisible();
    const inProgressColumn = page.getByTestId("column-inProgress");
    await taskCard.dragTo(inProgressColumn);
    await expect(inProgressColumn).toContainText("Task to drag");
  });

  test("UI updates in real-time when another user modifies tasks", async ({ browser }) => {
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();
    try {
      await page1.goto("/");
      await page2.goto("/");
      await expect(page1.getByTestId("new-task-input")).toBeVisible();
      await page1.getByTestId("new-task-input").fill("Remote user task");
      await page1.getByTestId("add-task-btn").click();
      await expect(page1.getByText("Remote user task")).toBeVisible();
      await expect(page2.getByText("Remote user task")).toBeVisible({ timeout: 10000 });
    } finally {
      await page1.close();
      await page2.close();
    }
  });

  test("User can delete a task", async ({ page }) => {
    await page.getByTestId("new-task-input").fill("Task to delete");
    await page.getByTestId("add-task-btn").click();
    await expect(page.getByText("Task to delete")).toBeVisible();
    const card = page.locator("[data-testid^=task-]").filter({ hasText: "Task to delete" }).first();
    await card.getByRole("button", { name: "Delete task" }).click();
    await expect(page.getByText("Task to delete")).not.toBeVisible();
  });

  test("Priority can be selected and updated", async ({ page }) => {
    await page.getByTestId("new-task-input").fill("Priority task");
    await page.getByTestId("add-task-btn").click();
    await expect(page.getByText("Priority task")).toBeVisible();
    const card = page.locator("[data-testid^=task-]").filter({ hasText: "Priority task" }).first();
    await card.locator("[data-testid^=task-edit-]").click();
    await page.getByTestId("task-edit-priority").selectOption("High");
    await page.getByTestId("task-save").click();
    await expect(card.locator("[data-testid^=task-priority-]")).toHaveText("High");
  });

  test("Category can be changed and persisted", async ({ page }) => {
    await page.getByTestId("new-task-input").fill("Category task");
    await page.getByTestId("add-task-btn").click();
    await expect(page.getByText("Category task")).toBeVisible();
    const card = page.locator("[data-testid^=task-]").filter({ hasText: "Category task" }).first();
    await card.locator("[data-testid^=task-edit-]").click();
    await page.getByTestId("task-edit-category").selectOption("Bug");
    await page.getByTestId("task-save").click();
    await expect(card.locator("[data-testid^=task-category-]")).toHaveText("Bug");
  });
});

test.describe("File Upload E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("new-task-input").fill("Upload task");
    await page.getByTestId("add-task-btn").click();
    await expect(page.getByText("Upload task")).toBeVisible();
  });

  test("User uploads valid file and preview is shown", async ({ page }) => {
    const fileInput = page.getByTestId("task-file-input");
    await fileInput.setInputFiles({
      name: "valid.png",
      mimeType: "image/png",
      buffer: MINI_PNG,
    });
    await expect(page.getByTestId("task-attachment-preview-0")).toBeVisible();
  });

  test("Invalid file shows error", async ({ page }) => {
    const fileInput = page.getByTestId("task-file-input");
    await fileInput.setInputFiles({
      name: "invalid.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("not an image"),
    });
    await expect(page.getByTestId("task-file-error")).toContainText("Only PNG, JPG, and PDF");
  });
});

test.describe("Graph E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Graph is visible and shows task progress", async ({ page }) => {
    await expect(page.getByTestId("task-chart")).toBeVisible();
    await expect(page.getByTestId("chart-completion")).toContainText("0 / 0 tasks");
  });

  test("Graph updates when new task is added", async ({ page }) => {
    await page.getByTestId("new-task-input").fill("Chart task");
    await page.getByTestId("add-task-btn").click();
    await expect(page.getByText("Chart task")).toBeVisible();
    await expect(page.getByTestId("chart-completion")).toContainText("0 / 1 tasks");
  });

  test("Graph updates when task is moved to Done", async ({ page }) => {
    await page.getByTestId("new-task-input").fill("Complete me");
    await page.getByTestId("add-task-btn").click();
    await expect(page.getByText("Complete me")).toBeVisible();
    await expect(page.getByTestId("chart-completion")).toContainText("0 / 1 tasks");
    const taskCard = page.locator("[data-testid^=task-]").filter({ hasText: "Complete me" }).first();
    const doneColumn = page.getByTestId("column-done");
    await taskCard.dragTo(doneColumn);
    await expect(page.getByTestId("chart-completion")).toContainText("1 / 1 tasks");
  });
});
