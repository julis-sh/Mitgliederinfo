import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserMenu from './components/UserMenu';
import ConnectionStatus from './components/ConnectionStatus';
import LoginPage from './pages/LoginPage';
import StartPage from './pages/StartPage';
import RecipientsPage from './pages/RecipientsPage';
import TemplatesPage from './pages/TemplatesPage';
import MailPage from './pages/MailPage';
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
  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        <UserMenu />
        <div style={{ flex: 1, marginLeft: 240, minHeight: '100vh', background: 'transparent' }}>
          <ConnectionStatus />
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
        </div>
      </div>
    </BrowserRouter>
  );
} 