import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import theme from '../juLiTheme';
import LoginPage from './pages/LoginPage';
import StartPage from './pages/StartPage';
import RecipientsPage from './pages/RecipientsPage';
import TemplatesPage from './pages/TemplatesPage';
import MailPage from './pages/MailPage';
import UserMenu from './components/UserMenu';
import RequireAdmin from './components/RequireAdmin';
import AuditLogPage from './pages/AuditLogPage';
import UsersPage from './pages/UsersPage';
import StammdatenPage from './pages/StammdatenPage';
import ResetRequestPage from './pages/ResetRequestPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const [mode, setMode] = React.useState(() => localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light');
  React.useEffect(() => {
    const handler = () => setMode(localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light');
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);
  const dynamicTheme = React.useMemo(() => createTheme({ ...theme, palette: { ...theme.palette, mode } }), [mode]);
  return (
    <ThemeProvider theme={dynamicTheme}>
      <CssBaseline />
      <BrowserRouter>
        <UserMenu />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-request" element={<ResetRequestPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<RequireAuth><StartPage /></RequireAuth>} />
          <Route path="/recipients" element={<RequireAuth><RequireAdmin><RecipientsPage /></RequireAdmin></RequireAuth>} />
          <Route path="/templates" element={<RequireAuth><RequireAdmin><TemplatesPage /></RequireAdmin></RequireAuth>} />
          <Route path="/mail" element={<RequireAuth><MailPage /></RequireAuth>} />
          <Route path="/auditlog" element={<RequireAuth><RequireAdmin><AuditLogPage /></RequireAdmin></RequireAuth>} />
          <Route path="/users" element={<RequireAuth><RequireAdmin><UsersPage /></RequireAdmin></RequireAuth>} />
          <Route path="/stammdaten" element={<RequireAuth><RequireAdmin><StammdatenPage /></RequireAdmin></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
} 