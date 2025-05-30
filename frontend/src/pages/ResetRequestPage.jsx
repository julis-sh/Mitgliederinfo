import React from 'react';
import api from '../api';

export default function ResetRequestPage() {
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/request-reset', { email });
      setSent(true);
    } catch (err) {
      setError('Fehler beim Absenden.');
    }
  };
  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card bg-dark text-white shadow p-4" style={{ minWidth: 350, maxWidth: 400, width: '100%' }}>
        <h3 className="fw-bold mb-3 text-center">Passwort zurücksetzen</h3>
        {sent ? (
          <div className="alert alert-success">Falls die E-Mail existiert, wurde eine Reset-Mail versendet.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">E-Mail</label>
              <input
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                type="email"
              />
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <button type="submit" className="btn btn-primary w-100 fw-bold">Reset-Link anfordern</button>
          </form>
        )}
      </div>
    </div>
  );
} 