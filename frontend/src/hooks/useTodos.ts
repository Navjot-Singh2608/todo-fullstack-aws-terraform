import { useCallback, useEffect, useState } from 'react';
import { todoApi } from '../api/todos';
import type { Todo, TodoCreate, TodoQuery, TodoStats, TodoUpdate } from '../types';
import { useDebounce } from './useDebounce';

const EMPTY_STATS: TodoStats = { total: 0, active: 0, completed: 0, overdue: 0 };

export function useTodos(query: TodoQuery, onError: (msg: string) => void) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const search = useDebounce(query.search, 300);

  const refresh = useCallback(async () => {
    try {
      const [list, s] = await Promise.all([todoApi.list({ ...query, search }), todoApi.stats()]);
      setTodos(list);
      setStats(s);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.status, query.priority, query.sort, query.order, search, onError]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  // Each mutation runs, then re-fetches so filters/sorting/stats stay consistent.
  const run = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        const result = await fn();
        await refresh();
        return result;
      } catch (e) {
        onError((e as Error).message);
        return undefined;
      }
    },
    [refresh, onError],
  );

  return {
    todos,
    stats,
    loading,
    refresh,
    create: (data: TodoCreate) => run(() => todoApi.create(data)),
    update: (id: number, data: TodoUpdate) => run(() => todoApi.update(id, data)),
    toggle: (id: number) => {
      // optimistic UI for snappy checkbox clicks
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
      return run(() => todoApi.toggle(id));
    },
    remove: (id: number) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      return run(() => todoApi.remove(id));
    },
    clearCompleted: () => run(() => todoApi.clearCompleted()),
  };
}
