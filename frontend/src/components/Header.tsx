import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import type { PaletteMode } from '@mui/material';

interface Props {
  mode: PaletteMode;
  onToggleMode: () => void;
}

export default function Header({ mode, onToggleMode }: Props) {
  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <TaskAltIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Todo App
        </Typography>
        <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
          <IconButton color="inherit" onClick={onToggleMode} aria-label="toggle theme">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
