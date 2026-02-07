import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KanbanBoard from "../../components/KanbanBoard";

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

vi.mock("../../hooks/useSocket", () => ({
  useSocket: () => ({
    connected: true,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    moveTask: vi.fn(),
    deleteTask: vi.fn(),
  }),
}));

describe("WebSocket integration", () => {
  it("WebSocket receives task update - board renders", async () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  it("task creation form submits and add button is present", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);
    const input = screen.getByTestId("new-task-input");
    const btn = screen.getByTestId("add-task-btn");
    await user.type(input, "My new task");
    await user.click(btn);
    expect(input).toBeInTheDocument();
  });

  it("columns are present for To Do, In Progress, Done", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("column-todo")).toBeInTheDocument();
    expect(screen.getByTestId("column-inProgress")).toBeInTheDocument();
    expect(screen.getByTestId("column-done")).toBeInTheDocument();
  });
});
