import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export function useSocket(onSync, onCreated, onUpdated, onMoved, onDeleted, onError) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const callbacksRef = useRef({ onSync, onCreated, onUpdated, onMoved, onDeleted, onError });
  callbacksRef.current = { onSync, onCreated, onUpdated, onMoved, onDeleted, onError };

  useEffect(() => {
    const socket = io(SOCKET_URL, { autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("sync:tasks", (tasks) => callbacksRef.current.onSync?.(tasks));
    socket.on("task:created", (task) => callbacksRef.current.onCreated?.(task));
    socket.on("task:updated", (task) => callbacksRef.current.onUpdated?.(task));
    socket.on("task:moved", (task) => callbacksRef.current.onMoved?.(task));
    socket.on("task:deleted", (payload) => callbacksRef.current.onDeleted?.(payload));
    socket.on("error", (payload) => callbacksRef.current.onError?.(payload));

    return () => {
      socket.off("connect").off("disconnect").off("sync:tasks").off("task:created").off("task:updated").off("task:moved").off("task:deleted").off("error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const createTask = (payload) => socketRef.current?.emit("task:create", payload);
  const updateTask = (payload) => socketRef.current?.emit("task:update", payload);
  const moveTask = (id, column) => socketRef.current?.emit("task:move", { id, column });
  const deleteTask = (id) => socketRef.current?.emit("task:delete", { id });

  return { connected, createTask, updateTask, moveTask, deleteTask };
}
