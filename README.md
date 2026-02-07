# WebSocket-Powered Kanban Board

## About the app

This is a **real-time Kanban board** for managing tasks with live collaboration. Multiple users can work on the same board at once: every add, edit, move, or delete is synced instantly via WebSockets (Socket.IO).

**What you can do:**

- **Tasks**: Create tasks with a title and description. They start in **To Do**.
- **Columns**: Three columns — **To Do**, **In Progress**, **Done**. Drag and drop tasks between them.
- **Details**: Set **Priority** (Low / Medium / High) and **Category** (Bug / Feature / Enhancement) on each task.
- **Attachments**: Add PNG, JPG, or PDF files to tasks. Images show a preview; PDFs show a label.
- **Progress**: A chart at the bottom shows how many tasks are in each column and the completion percentage (Done / Total).
- **Real-time**: Open the app in two tabs or two browsers — changes in one appear in the other immediately.

The **backend** is a Node.js + Express server with Socket.IO. It keeps tasks in memory and broadcasts all changes to connected clients. The **frontend** is a React app (Vite) with drag-and-drop (React DnD), a progress chart (Recharts), and tests with Vitest (unit + integration) and Playwright (E2E).

---

## Folder structure

```
websocket-kanban-vitest-playwright-2026/
├── .gitignore
├── README.md
│
├── backend/
│   ├── .env.example              # Template: PORT, FRONTEND_URL
│   ├── package.json
│   ├── package-lock.json
│   └── server.js                 # Express + Socket.IO, in-memory tasks, CORS
│
└── frontend/
    ├── .env.example              # Template: VITE_SOCKET_URL
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js            # Vite + Vitest (unit/integration)
    ├── playwright.config.js      # Playwright E2E
    ├── eslint.config.js
    │
    ├── public/
    │   └── favicon.svg            # App favicon (MS)
    │
    └── src/
        ├── main.jsx              # Entry: index.css + App
        ├── App.jsx               # Title + KanbanBoard + Footer
        ├── App.css
        ├── index.css              # Global design tokens (CSS variables)
        ├── setupTests.js         # Vitest: jest-dom
        │
        ├── components/
        │   ├── KanbanBoard.jsx    # Board container, socket hook, add-task form, columns, chart
        │   ├── KanbanBoard.css
        │   ├── KanbanColumn.jsx   # Drop zone, column title, task list
        │   ├── KanbanColumn.css
        │   ├── TaskCard.jsx       # Drag source, edit/delete, priority/category, attachments
        │   ├── TaskCard.css
        │   ├── TaskChart.jsx      # Bar + pie chart (Recharts), completion %
        │   ├── TaskChart.css
        │   ├── Footer.jsx         # “Made with ♥ by Manya Shukla © 2026” + link
        │   └── Footer.css
        │
        ├── hooks/
        │   └── useSocket.js       # Socket.IO client, sync:tasks + task events, create/update/move/delete
        │
        ├── lib/
        │   └── taskReducer.js     # Reducer (SET_TASKS, TASK_*), COLUMNS/PRIORITIES/CATEGORIES, isAllowedFile, createTaskPayload
        │
        └── tests/
            ├── unit/              # Vitest
            │   ├── taskReducer.test.js
            │   ├── useSocket.test.js
            │   └── KanbanBoard.test.jsx
            ├── integration/       # Vitest + React Testing Library
            │   ├── TaskWorkflow.test.jsx
            │   └── WebSocketIntegration.test.jsx
            └── e2e/               # Playwright
                └── KanbanBoard.e2e.test.js
```

**Backend** holds the WebSocket server and task store. **Frontend** holds the React app, styles, socket hook, reducer, and all tests. Copy `.env.example` to `.env` in both backend and frontend (see Setup).

---

## Setup

### Prerequisites

- **Node.js** 18+
- **npm**

### Environment variables

| Where        | File               | Variables |
|-------------|--------------------|-----------|
| Backend     | `backend/.env`     | `PORT` (default 5001), `FRONTEND_URL` (default http://localhost:3000; CORS origin for Socket.IO) |
| Frontend    | `frontend/.env`    | `VITE_SOCKET_URL` (default http://localhost:5001; backend WebSocket URL) |

- Backend loads `.env` via **dotenv**.
- Frontend only exposes variables that start with **VITE_**.

Create env files from the examples:

```bash
# Backend
cd backend && cp .env.example .env

# Frontend
cd frontend && cp .env.example .env
```

### Install and run

**1. Backend** (terminal 1):

```bash
cd backend
cp .env.example .env   # if not done yet
npm install
npm start
```

You should see: `Server running on port 5001`.

**2. Frontend** (terminal 2):

```bash
cd frontend
cp .env.example .env   # if not done yet
npm install
npm run dev
```

The app opens at **http://localhost:3000** and connects to the backend at the URL in `VITE_SOCKET_URL`.

---

## How to use the app

1. **Add a task** — Type a title in the input at the top and click **Add Task**. The task appears in **To Do**.
2. **Move a task** — Drag a card and drop it into **In Progress** or **Done**.
3. **Edit a task** — Click **Edit** on a card, change title, description, **Priority**, or **Category**, then **Save**.
4. **Delete a task** — Click the **×** on the top-right of the card.
5. **Add an attachment** — Click **Add attachment** on a card and choose a PNG, JPG, or PDF. Images show a preview; PDFs show “PDF / File”.
6. **View progress** — The chart at the bottom shows task counts per column and completion percentage.
7. **Real-time** — Open **http://localhost:3000** in another tab or browser; changes sync everywhere.

---

## How to run tests

### Unit and integration (Vitest + React Testing Library)

From the **frontend** folder:

```bash
cd frontend
npm run test
```

- **Unit**: `taskReducer`, `useSocket`, `KanbanBoard` (socket mocked).
- **Integration**: Task workflows, sync:tasks, create task, priority/category.

No backend or browser needed; mocks are used.

### End-to-end (Playwright)

1. Start the **backend** (so the app can connect to the WebSocket):

   ```bash
   cd backend && npm start
   ```

2. From the **frontend** folder:

   ```bash
   cd frontend
   npm run test:e2e
   ```

Playwright builds the app, runs `npm run preview` on port 3000, and runs E2E tests. For a visible browser:

```bash
npx playwright test --headed
# or
npx playwright test --ui
```

---

## Features (summary)

| Area           | Details |
|----------------|--------|
| **Columns**    | To Do, In Progress, Done |
| **Tasks**      | Create, edit, delete; title + description |
| **Drag & drop**| Move tasks between columns (React DnD) |
| **Priority**   | Low, Medium, High (dropdown) |
| **Category**   | Bug, Feature, Enhancement (dropdown) |
| **Attachments**| PNG, JPG, PDF; image preview or file label; unsupported types show an error |
| **Chart**      | Bar chart + pie (Recharts); “X / Y tasks completed (Z%)”; updates with data |
| **Real-time**  | Socket.IO; sync on connect; all changes broadcast to all clients |
| **UI**         | Dark theme, hover effects, loading/syncing state, connection status, footer with author link |

### WebSocket events (backend)

| Event          | Description |
|----------------|-------------|
| `sync:tasks`   | Server → client: full task list on connect |
| `task:create`  | Client → server: create task; server broadcasts `task:created` |
| `task:update`  | Client → server: update task; server broadcasts `task:updated` |
| `task:move`    | Client → server: move task; server broadcasts `task:moved` |
| `task:delete`  | Client → server: delete task; server broadcasts `task:deleted` |
| `error`        | Server → client: invalid payload or other error |

---

## Tech stack

- **Backend**: Node.js, Express, Socket.IO, dotenv
- **Frontend**: React 19, Vite, react-dnd, react-dnd-html5-backend, recharts, socket.io-client
- **Testing**: Vitest, React Testing Library, @testing-library/user-event, Playwright
- **Tooling**: ESLint, Vite (build and preview)
