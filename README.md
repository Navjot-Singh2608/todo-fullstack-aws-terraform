# Todo App — React + TypeScript + Material UI + FastAPI

A full-stack todo application.

| Layer    | Stack |
|----------|-------|
| Frontend | React 18, TypeScript, Vite, Material UI (MUI v6) |
| Backend  | FastAPI, SQLAlchemy 2, Pydantic v2, SQLite |
| Tests    | pytest (backend API) |

## Features

- Create, edit, complete and delete todos
- Title, description, priority (low / medium / high) and due date
- Filter by status (All / Active / Completed) and priority, live search
- Sort by created date, due date, priority or title (asc/desc)
- Stats cards (total / active / completed / overdue) and progress bar
- Overdue highlighting, "Clear completed", confirmation dialogs, toast notifications
- Light / dark mode (remembered in the browser)
- Interactive API docs at http://localhost:8000/docs

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** (20 or 22 recommended)

## Quick start (Windows)

Open two terminals in this folder:

```bat
start-backend.bat     :: terminal 1 – API on http://localhost:8000
start-frontend.bat    :: terminal 2 – UI on  http://localhost:5173
```

Then open **http://localhost:5173**.

macOS / Linux: `./start.sh` starts both.

## Manual setup

### Backend

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# mac/linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The SQLite database (`backend/todos.db`) is created automatically on first start.
Optional settings go in `backend/.env` (see `.env.example`).

Run the tests:

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # dev server with hot reload on :5173
npm run build      # type-check + production build into dist/
```

In development, Vite proxies every `/api` request to `http://127.0.0.1:8000`,
so no CORS setup is needed. To point the built frontend at a different API,
set `VITE_API_URL` (e.g. `VITE_API_URL=https://api.example.com npm run build`).

## Docker

```bash
docker compose up --build
```

Open **http://localhost:3000** (nginx serves the React build and proxies `/api` to FastAPI).
Data is kept in the `todo-data` volume.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/todos` | List todos. Query: `status=all\|active\|completed`, `search`, `priority`, `sort=created_at\|due_date\|priority\|title`, `order=asc\|desc` |
| GET    | `/api/todos/stats` | Counts: total, active, completed, overdue |
| POST   | `/api/todos` | Create `{title, description?, priority?, due_date?}` |
| GET    | `/api/todos/{id}` | Get one |
| PATCH  | `/api/todos/{id}` | Partial update (any field incl. `completed`) |
| PATCH  | `/api/todos/{id}/toggle` | Flip completed |
| DELETE | `/api/todos/{id}` | Delete one |
| DELETE | `/api/todos/completed` | Delete all completed |
| GET    | `/api/health` | Health check |

## Project structure

```
todoApp/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, startup
│   │   ├── config.py        # settings (env / .env)
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # Todo ORM model
│   │   ├── schemas.py       # Pydantic request/response models
│   │   ├── crud.py          # DB operations
│   │   └── routers/todos.py # /api/todos endpoints
│   ├── tests/test_todos.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/todos.ts     # typed API client
│   │   ├── hooks/           # useTodos, useDebounce
│   │   ├── components/      # Header, StatsBar, AddTodoForm, FilterBar, TodoList, TodoItem, dialogs
│   │   ├── App.tsx, theme.ts, types.ts, utils.ts, main.tsx
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml
├── start-backend.bat / start-frontend.bat / start.sh
└── README.md
```
