import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import App from './App';
import CustomThemeProvider from './contexts/ThemeContext';
import { AuthProvider } from './contexts/MockAuthContext';
import { SocketProvider } from './contexts/SimpleSocketContext';
import { AdminProvider } from './contexts/AdminContext';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CustomThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <SocketProvider>
              <CssBaseline />
              <App />
            </SocketProvider>
          </AdminProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
