import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

const navLinks = [
  { name: 'Dashboard', icon: 'bi-house', href: '/' },
  { name: 'Neue Mail senden', icon: 'bi-envelope', href: '/mail' },
  { name: 'Empfänger', icon: 'bi-people', href: '/recipients', admin: true },
  { name: 'Mail-Templates', icon: 'bi-card-text', href: '/templates', admin: true },
  { name: 'Benutzer', icon: 'bi-person-badge', href: '/users', admin: true },
  { name: 'Stammdaten', icon: 'bi-database', href: '/stammdaten', admin: true },
  { name: 'Audit-Log', icon: 'bi-gear', href: '/auditlog', admin: true },
];

export default function UserMenu() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar position-fixed top-0 start-0 vh-100 d-flex flex-column p-6" style={{ width: 240, zIndex: 1040 }}>
      <div className="mb-4 text-center">
        <img src="/juli-logo.svg" alt="Logo" style={{ width: 100, height: 100 }} className="mb-2" />

      </div>
      <nav className="flex-grow-1">
        {navLinks.filter(l => !l.admin || user.role === 'admin').map(link => (
          <a
            key={link.name}
            href={link.href}
            className={`nav-link d-flex align-items-center gap-2 px-3 py-2${location.pathname === link.href ? ' active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <i className={`bi ${link.icon}`}></i>
            {link.name}
          </a>
        ))}
      </nav>
      <div className="mt-auto d-flex flex-column align-items-center">
        <div className="mb-2">
          <span className="avatar bg-accent rounded-circle d-inline-flex justify-content-center align-items-center text-dark fw-bold" style={{width:36, height:36}}>
            {(user.displayName ? user.displayName[0] : user.email[0]).toUpperCase()}
          </span>
        </div>
        <div className="small text-white-50 mb-2">{user.displayName || user.email}</div>
        <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>Abmelden</button>
      </div>
    </aside>
  );
} 