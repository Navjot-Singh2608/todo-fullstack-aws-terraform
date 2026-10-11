import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { Priority, SortField, StatusFilter, TodoQuery } from '../types';

interface Props {
  query: TodoQuery;
  onChange: (q: Partial<TodoQuery>) => void;
}

const SORT_LABEL: Record<SortField, string> = {
  created_at: 'Created',
  due_date: 'Due date',
  priority: 'Priority',
  title: 'Title',
};

export default function FilterBar({ query, onChange }: Props) {
  return (
    <Paper sx={{ px: 2, pt: 1, pb: 2, mb: 2, border: 1, borderColor: 'divider' }}>
      <Tabs
        value={query.status}
        onChange={(_, v: StatusFilter) => onChange({ status: v })}
        sx={{ mb: 1.5 }}
        variant="fullWidth"
      >
        <Tab label="All" value="all" />
        <Tab label="Active" value="active" />
        <Tab label="Completed" value="completed" />
      </Tabs>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <TextField
          placeholder="Search todos…"
          value={query.search}
          onChange={(e) => onChange({ search: e.target.value })}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label="Priority"
          value={query.priority}
          onChange={(e) => onChange({ priority: e.target.value as Priority | '' })}
          size="small"
          sx={{ minWidth: 130 }}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          <MenuItem value="">Any</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </TextField>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TextField
            select
            label="Sort by"
            value={query.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortField })}
            size="small"
            sx={{ minWidth: 140 }}
          >
            {(Object.keys(SORT_LABEL) as SortField[]).map((s) => (
              <MenuItem key={s} value={s}>
                {SORT_LABEL[s]}
              </MenuItem>
            ))}
          </TextField>
          <Tooltip title={query.order === 'asc' ? 'Ascending' : 'Descending'}>
            <IconButton
              onClick={() => onChange({ order: query.order === 'asc' ? 'desc' : 'asc' })}
              aria-label="toggle sort order"
            >
              {query.order === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
