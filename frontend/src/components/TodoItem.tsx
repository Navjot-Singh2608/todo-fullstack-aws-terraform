import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import type { Todo } from '../types';
import { PRIORITY_COLOR, PRIORITY_LABEL, formatDue, isOverdue } from '../utils';

interface Props {
  todo: Todo;
  onToggle: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete }: Props) {
  const overdue = isOverdue(todo.due_date, todo.completed);
  return (
    <ListItem
      divider
      sx={{ py: 1.5, pr: 13, opacity: todo.completed ? 0.65 : 1, transition: 'opacity .2s' }}
      secondaryAction={
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton aria-label={`edit ${todo.title}`} onClick={() => onEdit(todo)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton aria-label={`delete ${todo.title}`} color="error" onClick={() => onDelete(todo)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <ListItemIcon sx={{ minWidth: 44 }}>
        <Checkbox
          edge="start"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          slotProps={{ input: { 'aria-label': `mark ${todo.title} as ${todo.completed ? 'active' : 'done'}` } }}
        />
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={
          <Typography
            sx={{
              fontWeight: 500,
              textDecoration: todo.completed ? 'line-through' : 'none',
              wordBreak: 'break-word',
            }}
          >
            {todo.title}
          </Typography>
        }
        secondary={
          <>
            {todo.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {todo.description}
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                icon={<FlagIcon />}
                label={PRIORITY_LABEL[todo.priority]}
                color={PRIORITY_COLOR[todo.priority]}
                variant="outlined"
              />
              {todo.due_date && (
                <Chip
                  size="small"
                  icon={<EventIcon />}
                  label={overdue ? `Overdue · ${formatDue(todo.due_date)}` : formatDue(todo.due_date)}
                  color={overdue ? 'error' : 'default'}
                  variant={overdue ? 'filled' : 'outlined'}
                />
              )}
            </Stack>
          </>
        }
      />
    </ListItem>
  );
}
