import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import InboxIcon from '@mui/icons-material/Inbox';
import type { Todo } from '../types';
import TodoItem from './TodoItem';

interface Props {
  todos: Todo[];
  loading: boolean;
  onToggle: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export default function TodoList({ todos, loading, ...handlers }: Props) {
  if (loading && todos.length === 0) {
    return (
      <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={56} />
        ))}
      </Paper>
    );
  }
  if (todos.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', border: 1, borderColor: 'divider' }}>
        <Box sx={{ color: 'text.disabled', mb: 1 }}>
          <InboxIcon sx={{ fontSize: 56 }} />
        </Box>
        <Typography color="text.secondary">Nothing here. Add a todo above to get started.</Typography>
      </Paper>
    );
  }
  return (
    <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <List disablePadding>
        {todos.map((t) => (
          <TodoItem key={t.id} todo={t} {...handlers} />
        ))}
      </List>
    </Paper>
  );
}
