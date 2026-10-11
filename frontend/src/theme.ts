import { createTheme, type PaletteMode } from '@mui/material/styles';

export const buildTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#1976d2' : '#90caf9' },
      secondary: { main: mode === 'light' ? '#9c27b0' : '#ce93d8' },
      background: mode === 'light' ? { default: '#f4f6fb', paper: '#ffffff' } : { default: '#0f1218', paper: '#171b23' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: 'Roboto, system-ui, -apple-system, "Segoe UI", sans-serif',
      h5: { fontWeight: 700 },
    },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
      MuiPaper: { defaultProps: { elevation: 0 } },
      MuiCard: { styleOverrides: { root: ({ theme }) => ({ border: `1px solid ${theme.palette.divider}` }) } },
    },
  });
