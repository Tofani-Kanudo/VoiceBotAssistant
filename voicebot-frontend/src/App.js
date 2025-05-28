import React, { useMemo, useState, useEffect } from 'react';
import VoicebotUI from './components/voiceBotUI';
import { Container, CssBaseline, Fab, Zoom } from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  // Load theme from localStorage or default to light
  const getInitialMode = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('themeMode') || 'light';
    }
    return 'light';
  };
  const [mode, setMode] = useState(getInitialMode);
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  }), [mode]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Zoom in style={{ transitionDelay: '200ms' }}>
        <Fab
          color="primary"
          onClick={toggleTheme}
          sx={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 1300,
            boxShadow: 4,
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            transition: 'background 0.3s, color 0.3s',
            '&:hover': {
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
          aria-label="toggle theme"
        >
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </Fab>
      </Zoom>
      <Container>
        <VoicebotUI />
      </Container>
    </ThemeProvider>
  );
}

export default App;
