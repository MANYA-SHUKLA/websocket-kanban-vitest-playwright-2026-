import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSocket } from "../../hooks/useSocket";

const mockEmit = vi.fn();
const mockOn = vi.fn();
const mockDisconnect = vi.fn();

function createMockSocket() {
  const socket = {
    emit: mockEmit,
    on: mockOn,
    off: vi.fn(function () {
      return this;
    }),
    disconnect: mockDisconnect,
  };
  return socket;
}

vi.mock("socket.io-client", () => ({
  io: () => createMockSocket(),
}));

describe("useSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("registers socket event handlers on mount", () => {
    renderHook(() => useSocket());
    expect(mockOn).toHaveBeenCalledWith("connect", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("disconnect", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("sync:tasks", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("task:created", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("task:updated", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("task:moved", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("task:deleted", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("returns createTask that emits task:create", () => {
    const { result } = renderHook(() => useSocket());
    result.current.createTask({ title: "Test", description: "", priority: "Medium", category: "Feature", attachments: [] });
    expect(mockEmit).toHaveBeenCalledWith("task:create", { title: "Test", description: "", priority: "Medium", category: "Feature", attachments: [] });
  });

  it("returns updateTask that emits task:update", () => {
    const { result } = renderHook(() => useSocket());
    result.current.updateTask({ id: "1", title: "Updated" });
    expect(mockEmit).toHaveBeenCalledWith("task:update", { id: "1", title: "Updated" });
  });

  it("returns moveTask that emits task:move", () => {
    const { result } = renderHook(() => useSocket());
    result.current.moveTask("1", "done");
    expect(mockEmit).toHaveBeenCalledWith("task:move", { id: "1", column: "done" });
  });

  it("returns deleteTask that emits task:delete", () => {
    const { result } = renderHook(() => useSocket());
    result.current.deleteTask("1");
    expect(mockEmit).toHaveBeenCalledWith("task:delete", { id: "1" });
  });

  it("calls onSync when sync:tasks is emitted", () => {
    let syncHandler;
    mockOn.mockImplementation((event, fn) => {
      if (event === "sync:tasks") syncHandler = fn;
    });
    const onSync = vi.fn();
    renderHook(() => useSocket(onSync));
    expect(syncHandler).toBeDefined();
    syncHandler([{ id: "1", title: "A" }]);
    expect(onSync).toHaveBeenCalledWith([{ id: "1", title: "A" }]);
  });

  it("calls onCreated when task:created is emitted", () => {
    let handler;
    mockOn.mockImplementation((event, fn) => {
      if (event === "task:created") handler = fn;
    });
    const onCreated = vi.fn();
    renderHook(() => useSocket(undefined, onCreated));
    handler({ id: "1", title: "New" });
    expect(onCreated).toHaveBeenCalledWith({ id: "1", title: "New" });
  });
});
