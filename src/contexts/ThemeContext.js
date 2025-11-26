import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const CustomThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to light
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('skillbridge-theme');
    return savedTheme === 'dark';
  });

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('skillbridge-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Light theme configuration
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1E90FF',
        light: '#5BB3FF',
        dark: '#0066CC',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#dc004e',
        light: '#ff5983',
        dark: '#9a0036',
        contrastText: '#ffffff',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1E90FF',
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
      },
      divider: '#e0e0e0',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '8px 24px',
          },
          contained: {
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            borderRadius: 12,
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
            color: '#333333',
          },
        },
      },
    },
  });

  // Dark theme configuration
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#5C7FFF',
        light: '#7A9AFF',
        dark: '#4A66FF',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#f48fb1',
        light: '#f8bbd9',
        dark: '#e91e63',
        contrastText: '#000000',
      },
      success: {
        main: '#66bb6a',
        light: '#81c784',
        dark: '#4caf50',
      },
      warning: {
        main: '#ffb74d',
        light: '#ffcc02',
        dark: '#ff9800',
      },
      error: {
        main: '#ef5350',
        light: '#e57373',
        dark: '#f44336',
      },
      info: {
        main: '#64b5f6',
        light: '#90caf9',
        dark: '#2196f3',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3b3b3',
      },
      divider: '#333333',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '8px 24px',
          },
          contained: {
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e1e1e',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            borderRadius: 12,
            border: '1px solid #333333',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            borderBottom: '1px solid #333333',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e1e1e',
            border: '1px solid #333333',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#333333',
              },
              '&:hover fieldset': {
                borderColor: '#555555',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#90caf9',
              },
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e1e1e',
            border: '1px solid #333333',
            '&:before': {
              display: 'none',
            },
          },
        },
      },
    },
  });

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const contextValue = {
    isDarkMode,
    toggleTheme,
    theme: currentTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;



