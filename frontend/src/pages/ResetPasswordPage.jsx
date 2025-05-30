import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!pw || pw.length < 6) return setError('Passwort zu kurz.');
    if (pw !== pw2) return setError('Passwörter stimmen nicht überein.');
    try {
      await api.post('/auth/reset-password', { token, password: pw });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Zurücksetzen.');
    }
  };
  if (!token) return <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}><div className="alert alert-danger">Kein Token angegeben.</div></div>;
  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card bg-dark text-white shadow p-4" style={{ minWidth: 350, maxWidth: 400, width: '100%' }}>
        <h3 className="fw-bold mb-3 text-center">Neues Passwort setzen</h3>
        {success ? (
          <div className="alert alert-success">Passwort erfolgreich gesetzt! Du wirst weitergeleitet ...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Neues Passwort</label>
              <input
                type="password"
                className="form-control"
                value={pw}
                onChange={e => setPw(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Wiederholen</label>
              <input
                type="password"
                className="form-control"
                value={pw2}
                onChange={e => setPw2(e.target.value)}
                required
              />
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <button type="submit" className="btn btn-primary w-100 fw-bold">Passwort setzen</button>
          </form>
        )}
      </div>
    </div>
  );
} 