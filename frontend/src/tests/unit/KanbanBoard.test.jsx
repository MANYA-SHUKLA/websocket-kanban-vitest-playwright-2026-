import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import KanbanBoard from "../../components/KanbanBoard";

vi.mock("../../hooks/useSocket", () => ({
  useSocket: () => ({
    connected: true,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    moveTask: vi.fn(),
    deleteTask: vi.fn(),
  }),
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

describe("KanbanBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Kanban board title", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  it("renders loading indicator when syncing (mocked socket does not emit sync)", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("renders new task input and add button", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("new-task-input")).toBeInTheDocument();
    expect(screen.getByTestId("add-task-btn")).toBeInTheDocument();
  });

  it("renders three columns", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("column-todo")).toBeInTheDocument();
    expect(screen.getByTestId("column-inProgress")).toBeInTheDocument();
    expect(screen.getByTestId("column-done")).toBeInTheDocument();
  });

  it("renders task chart", () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId("task-chart")).toBeInTheDocument();
  });
});
