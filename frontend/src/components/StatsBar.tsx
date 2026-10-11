import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import type { TodoStats } from '../types';

export default function StatsBar({ stats }: { stats: TodoStats }) {
  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const items = [
    { label: 'Total', value: stats.total, color: 'text.primary' },
    { label: 'Active', value: stats.active, color: 'primary.main' },
    { label: 'Completed', value: stats.completed, color: 'success.main' },
    { label: 'Overdue', value: stats.overdue, color: 'error.main' },
  ];
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {items.map((i) => (
          <Grid key={i.label} size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  {i.label}
                </Typography>
                <Typography variant="h5" sx={{ color: i.color }}>
                  {i.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        <LinearProgress variant="determinate" value={pct} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
          {pct}% done
        </Typography>
      </Box>
    </Box>
  );
}
