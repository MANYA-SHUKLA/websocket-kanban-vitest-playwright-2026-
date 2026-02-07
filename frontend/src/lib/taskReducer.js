export const ACTIONS = {
  SET_TASKS: "SET_TASKS",
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_MOVED: "TASK_MOVED",
  TASK_DELETED: "TASK_DELETED",
};

export function taskReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_TASKS:
      return Array.isArray(action.payload) ? [...action.payload] : state;
    case ACTIONS.TASK_CREATED:
      return state.some((t) => t.id === action.payload.id) ? state : [...state, action.payload];
    case ACTIONS.TASK_UPDATED: {
      const idx = state.findIndex((t) => t.id === action.payload.id);
      if (idx === -1) return state;
      const next = [...state];
      next[idx] = action.payload;
      return next;
    }
    case ACTIONS.TASK_MOVED: {
      const idx = state.findIndex((t) => t.id === action.payload.id);
      if (idx === -1) return state;
      const next = [...state];
      next[idx] = { ...next[idx], column: action.payload.column };
      return next;
    }
    case ACTIONS.TASK_DELETED:
      return state.filter((t) => t.id !== action.payload.id);
    default:
      return state;
  }
}

export const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "inProgress", label: "In Progress" },
  { id: "done", label: "Done" },
];
export const PRIORITIES = ["Low", "Medium", "High"];
export const CATEGORIES = ["Bug", "Feature", "Enhancement"];

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
const ALLOWED_EXT = [".png", ".jpg", ".jpeg", ".pdf"];

export function isAllowedFile(file) {
  if (!file || !file.name) return false;
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXT.includes(ext);
}

export function createTaskPayload(title, description, priority, category, attachments) {
  return {
    title: title ?? "Untitled",
    description: description ?? "",
    priority: priority ?? "Medium",
    category: category ?? "Feature",
    attachments: Array.isArray(attachments) ? attachments : [],
  };
}
