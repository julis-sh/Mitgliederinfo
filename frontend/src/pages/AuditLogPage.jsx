import React from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function Toast({ show, message, type, onClose }) {
  if (!show) return null;
  return (
    <div className={`toast show admin-toast bg-${type === 'success' ? 'success' : 'danger'} text-white`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={onClose}></button>
      </div>
    </div>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'danger' });
  const navigate = useNavigate();
  React.useEffect(() => {
    setLoading(true);
    api.get('/auditlog').then(r => { setLogs(r.data); setLoading(false); }).catch(() => { setError('Fehler beim Laden der Logs'); setToast({ show: true, message: 'Fehler beim Laden der Logs.', type: 'danger' }); setLoading(false); });
  }, []);
  return (
    <div className="container-xl mt-4">
      <button className="btn btn-link text-light mb-2" onClick={() => navigate('/')}>← Zurück</button>
      <h2 className="text-white mb-3">Audit-Log</h2>
      {error && <div className="alert alert-danger mb-2">{error}</div>}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Lädt...</span></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle">
            <thead>
              <tr>
                <th>Datum</th>
                <th>User</th>
                <th>Szenario</th>
                <th>Kreis</th>
                <th>Mitglied</th>
                <th>Empfänger</th>
                <th>Typ</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={7} className="table-empty-row">Keine Logs vorhanden.</td></tr>
              ) : logs.map(l => (
                <tr key={l._id}>
                  <td>{new Date(l.createdAt).toLocaleString('de-DE')}</td>
                  <td>{l.user}</td>
                  <td>{l.scenario}</td>
                  <td>{l.kreis}</td>
                  <td>{l.mitgliedEmail}</td>
                  <td>{Array.isArray(l.empfaenger) ? l.empfaenger.map(e => <span key={e} className="badge bg-secondary me-1">{e}</span>) : l.empfaenger}</td>
                  <td>{l.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
} 