import React from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const rollen = ['Vorsitzender', 'Schatzmeister'];

function RecipientForm({ show, onClose, onSave, initial, kreise }) {
  const [form, setForm] = React.useState(initial || {});
  const [error, setError] = React.useState('');
  React.useEffect(() => { setForm(initial || {}); setError(''); }, [initial, show]);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSave = () => {
    if (!form.kreis) {
      setError('Bitte wähle einen Kreis aus.');
      return;
    }
    setError('');
    onSave(form);
  };
  return (
    <div className={`modal fade${show ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: show ? 'rgba(0,0,0,0.5)' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title">{initial ? 'Empfänger bearbeiten' : 'Empfänger anlegen'}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={form.name||''} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">E-Mail</label>
              <input className="form-control" name="email" value={form.email||''} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Kreis</label>
              <select className="form-select" name="kreis" value={form.kreis || ''} onChange={handleChange} required>
                <option value="">Bitte wählen</option>
                {kreise.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Rolle</label>
              <select className="form-select" name="rolle" value={form.rolle||''} onChange={handleChange} required>
                <option value="">Bitte wählen</option>
                {rollen.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!form.kreis}>Speichern</button>
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

export default function RecipientsPage() {
  const [recipients, setRecipients] = React.useState([]);
  const [show, setShow] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState(null);
  const [kreise, setKreise] = React.useState([]);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  React.useEffect(() => {
    setLoading(true);
    api.get('/recipients').then(r => { setRecipients(r.data); setLoading(false); });
    api.get('/kreise').then(r => setKreise(r.data));
  }, []);
  const handleSave = async (data) => {
    setError('');
    const payload = {
      ...data,
      kreisId: data.kreis,
    };
    delete payload.kreis;
    try {
      if (edit) {
        await api.put(`/recipients/${edit.id}`, payload);
        setToast({ show: true, message: 'Empfänger gespeichert.', type: 'success' });
      } else {
        await api.post('/recipients', payload);
        setToast({ show: true, message: 'Empfänger angelegt.', type: 'success' });
      }
      setShow(false); setEdit(null);
      setLoading(true);
      const res = await api.get('/recipients'); setRecipients(res.data); setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Fehler beim Speichern');
      setToast({ show: true, message: 'Fehler beim Speichern.', type: 'danger' });
    }
  };
  const handleDelete = async (id) => {
    const original = recipients.find(r => r.id === id);
    setRecipients(recipients => recipients.filter(r => r.id !== id && r._id !== id));
    setDeleteId(null);
    try {
      await api.delete(`/recipients/${id}`);
      setToast({ show: true, message: 'Empfänger gelöscht.', type: 'success' });
    } catch {
      setRecipients(recipients => [...recipients, original].sort((a, b) => a.id - b.id));
      setToast({ show: true, message: 'Fehler beim Löschen.', type: 'danger' });
    }
  };
  return (
    <div className="container-xl mt-4">
      <button className="btn btn-link text-light mb-2" onClick={() => navigate('/')}>← Zurück</button>
      <h2 className="text-white mb-3">Empfänger/Kreise</h2>
      <input
        className="form-control mb-3"
        placeholder="Suchen... (Name, E-Mail, Rolle, Kreis)"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {error && <div className="alert alert-danger mb-2">{error}</div>}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Lädt...</span></div>
        </div>
      ) : (
        kreise.map(kreis => {
          const filtered = recipients
            .filter(r => (r.kreisId === kreis.id || r.KreisId === kreis.id))
            .filter(r => {
              const q = search.toLowerCase();
              return (
                r.name?.toLowerCase().includes(q) ||
                r.email?.toLowerCase().includes(q) ||
                r.rolle?.toLowerCase().includes(q) ||
                kreis.name?.toLowerCase().includes(q)
              );
            });
          return (
            <div className="card bg-dark text-white mb-4" key={kreis.id}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-bold">{kreis.name}</span>
                <button className="btn btn-outline-light btn-sm" onClick={() => { setEdit(null); setShow(true); }}>Neuer Empfänger</button>
              </div>
              <div className="card-body p-0">
                <div className="d-block d-md-none">
                  {filtered.length === 0 ? (
                    <div className="table-empty-row p-3">Keine Empfänger vorhanden.</div>
                  ) : filtered.map(r => (
                    <div className="card bg-secondary text-white mb-2" key={r.id}>
                      <div className="card-body py-2 px-3">
                        <div className="fw-bold">{r.name}</div>
                        <div className="small">{r.email}</div>
                        <div className="small mb-2">{r.rolle}</div>
                        <div>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEdit(r); setShow(true); }}>Bearbeiten</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(r.id)}>Löschen</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="table-responsive d-none d-md-block">
                  <table className="table table-dark table-hover mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>E-Mail</th>
                        <th>Rolle</th>
                        <th>Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={4} className="table-empty-row">Keine Empfänger vorhanden.</td></tr>
                      ) : filtered.map(r => (
                        <tr key={r.id}>
                          <td>{r.name}</td>
                          <td>{r.email}</td>
                          <td>{r.rolle}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEdit(r); setShow(true); }}>Bearbeiten</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(r.id)}>Löschen</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })
      )}
      <RecipientForm show={show} onClose={() => { setShow(false); setEdit(null); }} onSave={handleSave} initial={edit} kreise={kreise} />
      <div className={`modal fade${deleteId ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: deleteId ? 'rgba(0,0,0,0.5)' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-white">
            <div className="modal-header">
              <h5 className="modal-title">Löschen bestätigen</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteId(null)}></button>
            </div>
            <div className="modal-body">Möchtest du diesen Empfänger wirklich löschen?</div>
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