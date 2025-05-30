import React from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const rollen = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

function UserForm({ show, onClose, onSave, initial }) {
  const [form, setForm] = React.useState(initial || {});
  const [pw, setPw] = React.useState('');
  React.useEffect(() => { setForm(initial || {}); setPw(''); }, [initial, show]);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <div className={`modal fade${show ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: show ? 'rgba(0,0,0,0.5)' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title">{initial ? 'Benutzer bearbeiten' : 'Benutzer anlegen'}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">E-Mail</label>
              <input className="form-control" name="email" value={form.email||''} onChange={handleChange} required disabled={!!initial} />
            </div>
            <div className="mb-3">
              <label className="form-label">Rolle</label>
              <select className="form-select" name="role" value={form.role||''} onChange={handleChange} required>
                <option value="">Bitte wählen</option>
                {rollen.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">{initial ? 'Neues Passwort (optional)' : 'Passwort'}</label>
              <input className="form-control" type="password" value={pw} onChange={e => setPw(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
            <button type="button" className="btn btn-primary" onClick={() => onSave({ ...form, password: pw })}>Speichern</button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default function UsersPage() {
  const [users, setUsers] = React.useState([]);
  const [show, setShow] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState(null);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  React.useEffect(() => {
    setLoading(true);
    api.get('/users').then(r => { setUsers(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const handleSave = async (data) => {
    setError('');
    try {
      if (edit) {
        await api.put(`/users/${edit._id}`, data);
        setToast({ show: true, message: 'Benutzer gespeichert.', type: 'success' });
      } else {
        await api.post('/users', data);
        setToast({ show: true, message: 'Benutzer angelegt.', type: 'success' });
      }
      setShow(false); setEdit(null);
      setLoading(true);
      const res = await api.get('/users'); setUsers(res.data); setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Speichern');
      setToast({ show: true, message: 'Fehler beim Speichern.', type: 'danger' });
    }
  };
  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/users/${id}`);
      setUsers(users => users.filter(u => u._id !== id));
      setDeleteId(null);
      setToast({ show: true, message: 'Benutzer gelöscht.', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Fehler beim Löschen.', type: 'danger' });
    }
  };
  return (
    <div className="container-xl mt-4">
      <button className="btn btn-link text-light mb-2" onClick={() => navigate('/')}>← Zurück</button>
      <h2 className="text-white mb-3">Benutzerverwaltung</h2>
      <button className="btn btn-primary mb-3" onClick={() => { setEdit(null); setShow(true); }}>Neuer Benutzer</button>
      {error && <div className="alert alert-danger mb-2">{error}</div>}
      {loading ? <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Lädt...</span></div></div> : (
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle">
            <thead>
              <tr>
                <th>E-Mail</th>
                <th>Rolle</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={3} className="table-empty-row">Keine Benutzer vorhanden.</td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEdit(u); setShow(true); }}>Bearbeiten</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(u._id)}>Löschen</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <UserForm show={show} onClose={() => { setShow(false); setEdit(null); }} onSave={handleSave} initial={edit} />
      {/* Delete Modal */}
      <div className={`modal fade${deleteId ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: deleteId ? 'rgba(0,0,0,0.5)' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-white">
            <div className="modal-header">
              <h5 className="modal-title">Löschen bestätigen</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteId(null)}></button>
            </div>
            <div className="modal-body">Möchtest du diesen Benutzer wirklich löschen?</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Abbrechen</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Löschen</button>
            </div>
          </div>
        </div>
      </div>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
} 