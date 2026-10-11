export type Priority = 'low' | 'medium' | 'high';
export type StatusFilter = 'all' | 'active' | 'completed';
export type SortField = 'created_at' | 'due_date' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  due_date: string | null; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string | null;
  priority?: Priority;
  due_date?: string | null;
}

export type TodoUpdate = Partial<TodoCreate & { completed: boolean }>;

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

export interface TodoQuery {
  status: StatusFilter;
  search: string;
  priority: Priority | '';
  sort: SortField;
  order: SortOrder;
}
