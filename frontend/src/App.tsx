import { useCallback, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { PaletteMode } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';

import Header from './components/Header';
import StatsBar from './components/StatsBar';
import AddTodoForm from './components/AddTodoForm';
import FilterBar from './components/FilterBar';
import TodoList from './components/TodoList';
import EditTodoDialog from './components/EditTodoDialog';
import ConfirmDialog from './components/ConfirmDialog';
import { useTodos } from './hooks/useTodos';
import { buildTheme } from './theme';
import type { Todo, TodoQuery } from './types';

type Toast = { message: string; severity: 'success' | 'error' } | null;

function loadMode(prefersDark: boolean): PaletteMode {
  try {
    const saved = localStorage.getItem('todo-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* storage unavailable */
  }
  return prefersDark ? 'dark' : 'light';
}

export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<PaletteMode>(() => loadMode(prefersDark));
  const theme = useMemo(() => buildTheme(mode), [mode]);

  const [query, setQuery] = useState<TodoQuery>({
    status: 'all',
    search: '',
    priority: '',
    sort: 'created_at',
    order: 'desc',
  });
  const [editing, setEditing] = useState<Todo | null>(null);
  const [deleting, setDeleting] = useState<Todo | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const onError = useCallback((message: string) => setToast({ message, severity: 'error' }), []);
  const notify = (message: string) => setToast({ message, severity: 'success' });

  const { todos, stats, loading, create, update, toggle, remove, clearCompleted } = useTodos(query, onError);

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    try {
      localStorage.setItem('todo-theme', next);
    } catch {
      /* ignore */
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header mode={mode} onToggleMode={toggleMode} />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          My tasks
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Plan, prioritise and get things done.
        </Typography>

        <StatsBar stats={stats} />

        <AddTodoForm
          onAdd={async (data) => {
            const created = await create(data);
            if (created) notify('Todo added');
            return created;
          }}
        />

        <FilterBar query={query} onChange={(q) => setQuery((prev) => ({ ...prev, ...q }))} />

        <TodoList
          todos={todos}
          loading={loading}
          onToggle={(id) => void toggle(id)}
          onEdit={setEditing}
          onDelete={setDeleting}
        />

        {stats.completed > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button color="error" startIcon={<ClearAllIcon />} onClick={() => setConfirmClear(true)}>
              Clear completed ({stats.completed})
            </Button>
          </Box>
        )}
      </Container>

      <EditTodoDialog
        todo={editing}
        onClose={() => setEditing(null)}
        onSave={async (id, data) => {
          const res = await update(id, data);
          if (res) notify('Todo updated');
          return res;
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete todo?"
        message={`"${deleting?.title ?? ''}" will be permanently deleted.`}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await remove(deleting.id);
            notify('Todo deleted');
          }
        }}
      />

      <ConfirmDialog
        open={confirmClear}
        title="Clear completed?"
        message={`This will delete ${stats.completed} completed todo(s).`}
        confirmLabel="Clear"
        onClose={() => setConfirmClear(false)}
        onConfirm={async () => {
          const res = await clearCompleted();
          if (res) notify(`Removed ${res.deleted} completed todo(s)`);
        }}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={toast?.severity === 'error' ? 6000 : 2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ThemeProvider>
  );
}
