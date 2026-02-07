import React, { useReducer, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSocket } from "../hooks/useSocket";
import { taskReducer, ACTIONS, COLUMNS, createTaskPayload } from "../lib/taskReducer";
import { KanbanColumn } from "./KanbanColumn";
import { TaskChart } from "./TaskChart";
import "./KanbanBoard.css";

export default function KanbanBoard() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const [syncing, setSyncing] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");

  const { connected, createTask, updateTask, moveTask, deleteTask } = useSocket(
    (initialTasks) => {
      dispatch({ type: ACTIONS.SET_TASKS, payload: initialTasks ?? [] });
      setSyncing(false);
    },
    (task) => dispatch({ type: ACTIONS.TASK_CREATED, payload: task }),
    (task) => dispatch({ type: ACTIONS.TASK_UPDATED, payload: task }),
    (task) => dispatch({ type: ACTIONS.TASK_MOVED, payload: task }),
    (payload) => dispatch({ type: ACTIONS.TASK_DELETED, payload }),
    (payload) => setError(payload?.message ?? "Error")
  );

  const handleAddTask = (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    createTask(createTaskPayload(title, "", "Medium", "Feature", []));
    setNewTitle("");
    setError("");
  };

  const handleUpdateTask = (payload) => {
    updateTask(payload);
    setError("");
  };

  const handleMoveTask = (id, column) => {
    moveTask(id, column);
    setError("");
  };

  const handleDeleteTask = (id) => {
    deleteTask(id);
    setError("");
  };

  const tasksByColumn = (columnId) => tasks.filter((t) => t.column === columnId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="kanban-board" data-testid="kanban-board">
        <header className="kanban-board__header">
          <h2 className="kanban-board__title">Kanban Board</h2>
          <div className="kanban-board__status">
            {syncing ? (
              <span className="kanban-board__syncing" data-testid="loading-indicator">Syncing...</span>
            ) : (
              <span className={`kanban-board__connection ${connected ? "kanban-board__connection--on" : ""}`} data-testid="connection-status">
                {connected ? "Connected" : "Disconnected"}
              </span>
            )}
          </div>
        </header>

        {error && (
          <div className="kanban-board__error" data-testid="board-error" role="alert">
            {error}
          </div>
        )}

        <form className="kanban-board__add" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="New task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            data-testid="new-task-input"
            className="kanban-board__input"
          />
          <button type="submit" data-testid="add-task-btn" className="kanban-board__add-btn" disabled={!connected}>
            Add Task
          </button>
        </form>

        <div className="kanban-board__columns">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              columnId={col.id}
              title={col.label}
              tasks={tasksByColumn(col.id)}
              onMoveTask={handleMoveTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <TaskChart tasks={tasks} />
      </div>
    </DndProvider>
  );
}
