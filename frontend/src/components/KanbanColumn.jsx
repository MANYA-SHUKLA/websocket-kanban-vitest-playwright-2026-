import React from "react";
import { useDrop } from "react-dnd";
import { TaskCard } from "./TaskCard";

const ITEM_TYPE = "TASK";

export function KanbanColumn({ columnId, title, tasks, onMoveTask, onUpdateTask, onDeleteTask }) {
  const [{ isOver }, dropRef] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => {
      if (item.fromColumn !== columnId) {
        onMoveTask(item.id, columnId);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  const columnClass = columnId.replace(/([A-Z])/g, (m) => m.toLowerCase());
  return (
    <div
      ref={dropRef}
      className={`kanban-column kanban-column--${columnClass} ${isOver ? "kanban-column--over" : ""}`}
      data-testid={`column-${columnId}`}
    >
      <h3 className="kanban-column__title">{title}</h3>
      <div className="kanban-column__tasks">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={columnId}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
