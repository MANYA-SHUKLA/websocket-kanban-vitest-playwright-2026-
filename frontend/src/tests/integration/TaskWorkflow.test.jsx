import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KanbanBoard from "../../components/KanbanBoard";

let syncCallback;
let onMovedCallback;
let createTaskFn;
let updateTaskFn;
let moveTaskFn;
let deleteTaskFn;

vi.mock("../../hooks/useSocket", () => ({
  useSocket: (onSync, onCreated, onUpdated, onMoved, onDeleted) => {
    syncCallback = onSync;
    onMovedCallback = onMoved;
    return {
      connected: true,
      createTask: (p) => {
        createTaskFn?.(p);
        onCreated?.({ id: "new-1", ...p, column: "todo" });
      },
      updateTask: (p) => {
        updateTaskFn?.(p);
        onUpdated?.({ id: p.id, ...p });
      },
      moveTask: (id, column) => {
        moveTaskFn?.(id, column);
        onMoved?.({ id, column });
      },
      deleteTask: (id) => {
        deleteTaskFn?.(id);
        onDeleted?.({ id });
      },
    };
  },
}));

vi.mock("recharts", () => ({
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
}));

describe("Task workflow integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sync:tasks populates board - tasks appear in columns", async () => {
    render(<KanbanBoard />);
    const initialTasks = [
      { id: "1", title: "Task One", column: "todo", priority: "High", category: "Bug", attachments: [] },
      { id: "2", title: "Task Two", column: "inProgress", priority: "Medium", category: "Feature", attachments: [] },
    ];
    await act(async () => {
      syncCallback(initialTasks);
    });
    await waitFor(() => {
      expect(screen.getByTestId("task-1")).toBeInTheDocument();
      expect(screen.getByText("Task One")).toBeInTheDocument();
    });
    expect(screen.getByTestId("task-2")).toBeInTheDocument();
    expect(screen.getByText("Task Two")).toBeInTheDocument();
  });

  it("creating task calls socket and task appears", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);
    await act(async () => {
      syncCallback([]);
    });
    await act(async () => {
      await user.type(screen.getByTestId("new-task-input"), "New task");
      await user.click(screen.getByTestId("add-task-btn"));
    });
    await waitFor(() => {
      expect(screen.getByText("New task")).toBeInTheDocument();
    });
  });

  it("dropdown changes update task - priority and category visible", async () => {
    render(<KanbanBoard />);
    await act(async () => {
      syncCallback([{ id: "1", title: "T", column: "todo", priority: "Low", category: "Bug", attachments: [] }]);
    });
    await waitFor(() => expect(screen.getByTestId("task-1")).toBeInTheDocument());
    expect(screen.getByTestId("task-priority-1")).toHaveTextContent("Low");
    expect(screen.getByTestId("task-category-1")).toHaveTextContent("Bug");
  });

  it("move task between columns (simulates drag-and-drop result)", async () => {
    render(<KanbanBoard />);
    await act(async () => {
      syncCallback([{ id: "1", title: "Move me", column: "todo", priority: "Medium", category: "Feature", attachments: [] }]);
    });
    await waitFor(() => expect(screen.getByTestId("column-todo")).toHaveTextContent("Move me"));
    await act(async () => {
      onMovedCallback?.({ id: "1", column: "done" });
    });
    await waitFor(() => {
      expect(screen.getByTestId("column-done")).toHaveTextContent("Move me");
    });
    expect(screen.getByTestId("task-1")).toBeInTheDocument();
  });
});
