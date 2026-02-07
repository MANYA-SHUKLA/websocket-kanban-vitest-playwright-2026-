import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { PRIORITIES, CATEGORIES, isAllowedFile } from "../lib/taskReducer";
import "./TaskCard.css";

const ITEM_TYPE = "TASK";

export function TaskCard({ task, onUpdate, onDelete, columnId }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "Medium");
  const [category, setCategory] = useState(task.category || "Feature");
  const [fileError, setFileError] = useState("");

  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPE,
    item: { id: task.id, fromColumn: columnId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const handleSave = () => {
    onUpdate({
      id: task.id,
      title: title.trim() || "Untitled",
      description: description.trim(),
      priority,
      category,
      attachments: task.attachments || [],
    });
    setEditing(false);
  };

  const handleFileChange = (e) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedFile(file)) {
      setFileError("Only PNG, JPG, and PDF files are allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      const attachments = [...(task.attachments || []), url];
      onUpdate({ id: task.id, attachments, title: task.title, description: task.description, priority: task.priority, category: task.category });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    const attachments = (task.attachments || []).filter((_, i) => i !== index);
    onUpdate({ id: task.id, attachments, title: task.title, description: task.description, priority: task.priority, category: task.category });
  };

  const isImage = (url) => /^data:image\//.test(url) || /\.(png|jpg|jpeg)$/i.test(url);

  const priorityClass = (task.priority || "Medium").replace(/\s+/g, "").toLowerCase();
  const categoryClass = (task.category || "Feature").replace(/\s+/g, "").toLowerCase();

  return (
    <div
      ref={dragRef}
      className={`task-card task-card--priority-${priorityClass} task-card--category-${categoryClass} ${isDragging ? "task-card--dragging" : ""}`}
      data-testid={`task-${task.id}`}
    >
      {editing ? (
        <div className="task-card__edit">
          <input data-testid="task-edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <textarea data-testid="task-edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} />
          <label>
            Priority
            <select data-testid="task-edit-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Category
            <select data-testid="task-edit-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <div className="task-card__edit-actions">
            <button type="button" onClick={handleSave} data-testid="task-save">Save</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-card__header">
            <h4 className="task-card__title">{task.title}</h4>
            <button type="button" className="task-card__delete" onClick={() => onDelete(task.id)} data-testid={`task-delete-${task.id}`} aria-label="Delete task">×</button>
          </div>
          {task.description && <p className="task-card__description">{task.description}</p>}
          <div className="task-card__meta">
            <span className="task-card__priority" data-testid={`task-priority-${task.id}`}>{task.priority}</span>
            <span className="task-card__category" data-testid={`task-category-${task.id}`}>{task.category}</span>
          </div>
          <button type="button" className="task-card__edit-btn" onClick={() => setEditing(true)} data-testid={`task-edit-${task.id}`}>Edit</button>
          <div className="task-card__attachments">
            <label className="task-card__upload">
              <input type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,image/jpg,application/pdf" onChange={handleFileChange} data-testid="task-file-input" />
              Add attachment
            </label>
            {fileError && <p className="task-card__file-error" data-testid="task-file-error">{fileError}</p>}
            {(task.attachments || []).map((url, i) => (
              <div key={i} className="task-card__attachment">
                {isImage(url) ? (
                  <img src={url} alt={`Attachment ${i + 1}`} className="task-card__attachment-img" data-testid={`task-attachment-preview-${i}`} />
                ) : (
                  <span className="task-card__attachment-name" data-testid={`task-attachment-name-${i}`}>PDF / File</span>
                )}
                <button type="button" onClick={() => removeAttachment(i)} aria-label="Remove attachment">×</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
