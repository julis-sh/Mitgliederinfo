import React from 'react';

function getUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export default function RequireAdmin({ children }) {
  const user = getUser();
  if (!user || user.role !== 'admin') {
    return <div style={{ margin: 32, color: '#c00', fontWeight: 600 }}>Nur für Admins sichtbar.</div>;
  }
  return children;
} 