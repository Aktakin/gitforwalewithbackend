import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Switch,
  FormControlLabel,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Brightness4,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ variant = 'icon' }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  // Icon variant - for navbar/toolbar
  if (variant === 'icon') {
    return (
      <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: 'relative',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.div
                key="dark"
                initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <DarkMode sx={{ color: '#90caf9', fontSize: 16 }} />
              </motion.div>
            ) : (
              <motion.div
                key="light"
                initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <LightMode sx={{ color: '#ff9800', fontSize: 16 }} />
              </motion.div>
            )}
          </AnimatePresence>
        </IconButton>
      </Tooltip>
    );
  }

  // Switch variant - for settings pages
  if (variant === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={isDarkMode}
            onChange={toggleTheme}
            sx={{
              width: 62,
              height: 34,
              padding: 0,
              '& .MuiSwitch-switchBase': {
                padding: 0,
                margin: 2,
                transitionDuration: '300ms',
                '&.Mui-checked': {
                  transform: 'translateX(28px)',
                  color: '#fff',
                  '& + .MuiSwitch-track': {
                    backgroundColor: isDarkMode ? '#5C7FFF' : '#000080',
                    opacity: 1,
                    border: 0,
                  },
                },
              },
              '& .MuiSwitch-thumb': {
                boxSizing: 'border-box',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  left: 0,
                  top: 0,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundImage: isDarkMode
                    ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' height=\'20\' width=\'20\' viewBox=\'0 0 20 20\'><path fill=\'%23666\' d=\'M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z\'/></svg>")'
                    : 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' height=\'20\' width=\'20\' viewBox=\'0 0 20 20\'><path fill=\'%23666\' d=\'M4.2 2.5l-.7.7L6.05 5.75l.7-.7L4.2 2.5zm-.44 7.5c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5zm12.64-7.5l-.7.7 2.55 2.55.7-.7-2.55-2.55zm0 15l2.55-2.55-.7-.7-2.55 2.55.7.7zM10 3.5C5.86 3.5 2.5 6.86 2.5 11S5.86 18.5 10 18.5s7.5-3.36 7.5-7.5S14.14 3.5 10 3.5z\'/></svg>")',
                },
              },
              '& .MuiSwitch-track': {
                borderRadius: 34 / 2,
                backgroundColor: isDarkMode ? '#333' : '#e9e9ea',
                opacity: 1,
                transition: muiTheme.transitions.create(['background-color'], {
                  duration: 500,
                }),
              },
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Brightness4 sx={{ fontSize: 20 }} />
            <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </Box>
        }
      />
    );
  }

  // Compact variant - for mobile/small spaces
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Box
          onClick={toggleTheme}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.div
                key="dark"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DarkMode sx={{ fontSize: 18, color: '#90caf9' }} />
              </motion.div>
            ) : (
              <motion.div
                key="light"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LightMode sx={{ fontSize: 18, color: '#ff9800' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </motion.div>
    );
  }

  // Floating variant - for floating action buttons
  if (variant === 'floating') {
    return (
      <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
        <motion.div
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: 'fixed',
            bottom: 80,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Box
            onClick={toggleTheme}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
              border: `2px solid ${isDarkMode ? '#333333' : '#e0e0e0'}`,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <AnimatePresence mode="wait">
              {isDarkMode ? (
                <motion.div
                  key="dark"
                  initial={{ rotate: -180, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 180, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                >
                  <DarkMode sx={{ fontSize: 24, color: '#90caf9' }} />
                </motion.div>
              ) : (
                <motion.div
                  key="light"
                  initial={{ rotate: 180, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -180, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                >
                  <LightMode sx={{ fontSize: 24, color: '#ff9800' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </motion.div>
      </Tooltip>
    );
  }

  // Default to icon variant
  return <ThemeToggle variant="icon" />;
};

export default ThemeToggle;
