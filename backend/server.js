require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const corsOrigin = process.env.FRONTEND_URL || "*";
const io = new Server(server, { cors: { origin: corsOrigin } });

app.get("/", (req, res) => {
  res.send("Made with ♥ by Manya Shukla © 2026");
});

const tasks = new Map();
let nextId = 1;

const COLUMNS = ["todo", "inProgress", "done"];
const PRIORITIES = ["Low", "Medium", "High"];
const CATEGORIES = ["Bug", "Feature", "Enhancement"];

function isValidTaskPayload(payload) {
  if (!payload || typeof payload !== "object") return false;
  if (payload.title !== undefined && typeof payload.title !== "string") return false;
  if (payload.description !== undefined && typeof payload.description !== "string") return false;
  if (payload.priority !== undefined && !PRIORITIES.includes(payload.priority)) return false;
  if (payload.category !== undefined && !CATEGORIES.includes(payload.category)) return false;
  if (payload.attachments !== undefined) {
    if (!Array.isArray(payload.attachments)) return false;
    if (!payload.attachments.every((a) => typeof a === "string")) return false;
  }
  return true;
}

function getAllTasks() {
  return Array.from(tasks.values());
}

io.on("connection", (socket) => {
  socket.emit("sync:tasks", getAllTasks());

  socket.on("task:create", (payload) => {
    try {
      if (!isValidTaskPayload(payload)) {
        socket.emit("error", { message: "Invalid task payload" });
        return;
      }
      const task = {
        id: String(nextId++),
        title: payload.title ?? "Untitled",
        description: payload.description ?? "",
        column: "todo",
        priority: payload.priority ?? "Medium",
        category: payload.category ?? "Feature",
        attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
        createdAt: Date.now(),
      };
      tasks.set(task.id, task);
      io.emit("task:created", task);
    } catch (err) {
      socket.emit("error", { message: err.message || "task:create failed" });
    }
  });

  socket.on("task:update", (payload) => {
    try {
      const { id, ...updates } = payload;
      if (!id || !tasks.has(String(id))) {
        socket.emit("error", { message: "Task not found" });
        return;
      }
      const task = tasks.get(String(id));
      const merged = { ...task };
      if (updates.title !== undefined) merged.title = updates.title;
      if (updates.description !== undefined) merged.description = updates.description;
      if (updates.priority !== undefined) {
        if (!PRIORITIES.includes(updates.priority)) {
          socket.emit("error", { message: "Invalid priority" });
          return;
        }
        merged.priority = updates.priority;
      }
      if (updates.category !== undefined) {
        if (!CATEGORIES.includes(updates.category)) {
          socket.emit("error", { message: "Invalid category" });
          return;
        }
        merged.category = updates.category;
      }
      if (updates.attachments !== undefined) {
        if (!Array.isArray(updates.attachments) || !updates.attachments.every((a) => typeof a === "string")) {
          socket.emit("error", { message: "Invalid attachments" });
          return;
        }
        merged.attachments = updates.attachments;
      }
      tasks.set(merged.id, merged);
      io.emit("task:updated", merged);
    } catch (err) {
      socket.emit("error", { message: err.message || "task:update failed" });
    }
  });

  socket.on("task:move", (payload) => {
    try {
      const { id, column } = payload;
      if (!id || !tasks.has(String(id))) {
        socket.emit("error", { message: "Task not found" });
        return;
      }
      if (!column || !COLUMNS.includes(column)) {
        socket.emit("error", { message: "Invalid column" });
        return;
      }
      const task = tasks.get(String(id));
      const updated = { ...task, column };
      tasks.set(updated.id, updated);
      io.emit("task:moved", updated);
    } catch (err) {
      socket.emit("error", { message: err.message || "task:move failed" });
    }
  });

  socket.on("task:delete", (payload) => {
    try {
      const id = payload?.id ?? payload;
      if (!id || !tasks.has(String(id))) {
        socket.emit("error", { message: "Task not found" });
        return;
      }
      tasks.delete(String(id));
      io.emit("task:deleted", { id: String(id) });
    } catch (err) {
      socket.emit("error", { message: err.message || "task:delete failed" });
    }
  });

  socket.on("disconnect", () => {});
});

io.engine.on("connection_error", (err) => {
  console.error("Connection error:", err.message);
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
