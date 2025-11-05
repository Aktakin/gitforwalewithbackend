import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import App from './App';
import CustomThemeProvider from './contexts/ThemeContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { SocketProvider } from './contexts/SimpleSocketContext';
import { AdminProvider } from './contexts/AdminContext';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CustomThemeProvider>
        <SupabaseAuthProvider>
          <AdminProvider>
            <SocketProvider>
              <CssBaseline />
              <App />
            </SocketProvider>
          </AdminProvider>
        </SupabaseAuthProvider>
      </CustomThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
