import { useState, type FormEvent } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import AddIcon from '@mui/icons-material/Add';
import type { Priority, TodoCreate } from '../types';
import { PRIORITY_LABEL } from '../utils';

interface Props {
  onAdd: (data: TodoCreate) => Promise<unknown>;
}

export default function AddTodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const created = await onAdd({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
    });
    setSubmitting(false);
    if (created) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          size="small"
          autoFocus
          slotProps={{ htmlInput: { maxLength: 200 } }}
        />
        <TextField
          select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          size="small"
          sx={{ minWidth: 130 }}
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
          size="small"
          sx={{ minWidth: 170 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!title.trim() || submitting}
          sx={{ minWidth: 110 }}
        >
          Add
        </Button>
      </Stack>
      <Collapse in={title.trim().length > 0}>
        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          size="small"
          multiline
          minRows={2}
          sx={{ mt: 2 }}
        />
      </Collapse>
    </Paper>
  );
}
