import { describe, it, expect } from "vitest";
import { taskReducer, ACTIONS, createTaskPayload, isAllowedFile, PRIORITIES, CATEGORIES } from "../../lib/taskReducer";

describe("taskReducer", () => {
  it("SET_TASKS replaces state with payload", () => {
    const state = [];
    const payload = [{ id: "1", title: "A", column: "todo" }];
    const next = taskReducer(state, { type: ACTIONS.SET_TASKS, payload });
    expect(next).toEqual(payload);
  });

  it("SET_TASKS with non-array keeps state", () => {
    const state = [{ id: "1" }];
    const next = taskReducer(state, { type: ACTIONS.SET_TASKS, payload: null });
    expect(next).toBe(state);
  });

  it("TASK_CREATED adds task", () => {
    const state = [];
    const task = { id: "1", title: "New", column: "todo" };
    const next = taskReducer(state, { type: ACTIONS.TASK_CREATED, payload: task });
    expect(next).toHaveLength(1);
    expect(next[0]).toEqual(task);
  });

  it("TASK_CREATED does not duplicate if id exists", () => {
    const task = { id: "1", title: "A", column: "todo" };
    const state = [task];
    const next = taskReducer(state, { type: ACTIONS.TASK_CREATED, payload: task });
    expect(next).toHaveLength(1);
  });

  it("TASK_UPDATED updates task by id", () => {
    const state = [{ id: "1", title: "Old", column: "todo" }];
    const updated = { id: "1", title: "New", column: "todo" };
    const next = taskReducer(state, { type: ACTIONS.TASK_UPDATED, payload: updated });
    expect(next[0].title).toBe("New");
  });

  it("TASK_UPDATED returns same state if task not found", () => {
    const state = [{ id: "1" }];
    const next = taskReducer(state, { type: ACTIONS.TASK_UPDATED, payload: { id: "2", title: "X" } });
    expect(next).toBe(state);
  });

  it("TASK_MOVED updates column", () => {
    const state = [{ id: "1", title: "A", column: "todo" }];
    const next = taskReducer(state, { type: ACTIONS.TASK_MOVED, payload: { id: "1", column: "done" } });
    expect(next[0].column).toBe("done");
  });

  it("TASK_MOVED returns same state if task not found", () => {
    const state = [{ id: "1" }];
    const next = taskReducer(state, { type: ACTIONS.TASK_MOVED, payload: { id: "2", column: "done" } });
    expect(next).toBe(state);
  });

  it("TASK_DELETED removes task by id", () => {
    const state = [{ id: "1" }, { id: "2" }];
    const next = taskReducer(state, { type: ACTIONS.TASK_DELETED, payload: { id: "1" } });
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe("2");
  });

  it("unknown action returns state unchanged", () => {
    const state = [{ id: "1" }];
    const next = taskReducer(state, { type: "UNKNOWN" });
    expect(next).toBe(state);
  });
});

describe("createTaskPayload", () => {
  it("returns payload with defaults", () => {
    const p = createTaskPayload();
    expect(p.title).toBe("Untitled");
    expect(p.description).toBe("");
    expect(p.priority).toBe("Medium");
    expect(p.category).toBe("Feature");
    expect(p.attachments).toEqual([]);
  });
  it("uses provided values", () => {
    const p = createTaskPayload("T", "D", "High", "Bug", ["url1"]);
    expect(p.title).toBe("T");
    expect(p.description).toBe("D");
    expect(p.priority).toBe("High");
    expect(p.category).toBe("Bug");
    expect(p.attachments).toEqual(["url1"]);
  });
});

describe("isAllowedFile", () => {
  it("allows PNG", () => {
    expect(isAllowedFile({ name: "x.png", type: "image/png" })).toBe(true);
  });
  it("allows JPG", () => {
    expect(isAllowedFile({ name: "x.jpg", type: "image/jpeg" })).toBe(true);
  });
  it("allows PDF", () => {
    expect(isAllowedFile({ name: "x.pdf", type: "application/pdf" })).toBe(true);
  });
  it("rejects .exe", () => {
    expect(isAllowedFile({ name: "x.exe", type: "application/octet-stream" })).toBe(false);
  });
  it("rejects null", () => {
    expect(isAllowedFile(null)).toBe(false);
  });
});

describe("constants", () => {
  it("PRIORITIES and CATEGORIES are arrays", () => {
    expect(PRIORITIES).toContain("Low");
    expect(PRIORITIES).toContain("Medium");
    expect(PRIORITIES).toContain("High");
    expect(CATEGORIES).toContain("Bug");
    expect(CATEGORIES).toContain("Feature");
    expect(CATEGORIES).toContain("Enhancement");
  });
});
