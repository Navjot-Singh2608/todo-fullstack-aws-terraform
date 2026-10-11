import type { Todo, TodoCreate, TodoQuery, TodoStats, TodoUpdate } from '../types';

// Empty string = same origin (Vite proxy in dev, reverse proxy in production).
const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the API server. Is the backend running on port 8000?');
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === 'string') message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((d: { msg: string }) => d.msg).join(', ');
    } catch {
      /* ignore non-JSON bodies */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const todoApi = {
  list(query: TodoQuery): Promise<Todo[]> {
    const params = new URLSearchParams({ status: query.status, sort: query.sort, order: query.order });
    if (query.search.trim()) params.set('search', query.search.trim());
    if (query.priority) params.set('priority', query.priority);
    return request<Todo[]>(`/api/todos?${params.toString()}`);
  },
  stats: () => request<TodoStats>('/api/todos/stats'),
  create: (data: TodoCreate) => request<Todo>('/api/todos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: TodoUpdate) =>
    request<Todo>(`/api/todos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggle: (id: number) => request<Todo>(`/api/todos/${id}/toggle`, { method: 'PATCH' }),
  remove: (id: number) => request<void>(`/api/todos/${id}`, { method: 'DELETE' }),
  clearCompleted: () => request<{ deleted: number }>('/api/todos/completed', { method: 'DELETE' }),
};
