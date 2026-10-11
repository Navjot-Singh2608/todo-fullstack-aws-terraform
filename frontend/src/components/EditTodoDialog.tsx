import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import type { Priority, Todo, TodoUpdate } from '../types';
import { PRIORITY_LABEL } from '../utils';

interface Props {
  todo: Todo | null;
  onClose: () => void;
  onSave: (id: number, data: TodoUpdate) => Promise<unknown>;
}

export default function EditTodoDialog({ todo, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description ?? '');
      setPriority(todo.priority);
      setDueDate(todo.due_date ?? '');
      setCompleted(todo.completed);
    }
  }, [todo]);

  const handleSave = async () => {
    if (!todo || !title.trim()) return;
    setSaving(true);
    const ok = await onSave(todo.id, {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
      completed,
    });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={!!todo} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit todo</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            error={!title.trim()}
            helperText={!title.trim() ? 'Title is required' : ' '}
            autoFocus
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              fullWidth
            >
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <MenuItem key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Due date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <FormControlLabel
            control={<Switch checked={completed} onChange={(e) => setCompleted(e.target.checked)} />}
            label="Completed"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!title.trim() || saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
