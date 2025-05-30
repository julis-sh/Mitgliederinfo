import React from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function EditDialog({ show, onClose, onSave, initial, label, fields }) {
  const [form, setForm] = React.useState(initial || {});
  React.useEffect(() => { setForm(initial || {}); }, [initial, show]);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <div className={`modal fade${show ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: show ? 'rgba(0,0,0,0.5)' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title">{initial ? `${label} bearbeiten` : `${label} anlegen`}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {fields.map(f => (
              <div className="mb-3" key={f.name}>
                <label className="form-label">{f.label}</label>
                <input className="form-control" name={f.name} value={form[f.name]||''} onChange={handleChange} required />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
            <button type="button" className="btn btn-primary" onClick={() => onSave(form)}>Speichern</button>
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

export default function StammdatenPage() {
  const [kreise, setKreise] = React.useState([]);
  const [szenarien, setSzenarien] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editKreis, setEditKreis] = React.useState(null);
  const [editSzenario, setEditSzenario] = React.useState(null);
  const [openKreis, setOpenKreis] = React.useState(false);
  const [openSzenario, setOpenSzenario] = React.useState(false);
  const [deleteKreis, setDeleteKreis] = React.useState(null);
  const [deleteSzenario, setDeleteSzenario] = React.useState(null);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/kreise'),
      api.get('/szenarien')
    ]).then(([k, s]) => {
      setKreise(k.data); setSzenarien(s.data); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const handleSaveKreis = async (data) => {
    setError('');
    try {
      if (editKreis) {
        await api.put(`/kreise/${editKreis._id}`, data);
        setToast({ show: true, message: 'Kreis gespeichert.', type: 'success' });
      } else {
        await api.post('/kreise', data);
        setToast({ show: true, message: 'Kreis angelegt.', type: 'success' });
      }
      setOpenKreis(false); setEditKreis(null);
      const res = await api.get('/kreise'); setKreise(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Speichern');
      setToast({ show: true, message: 'Fehler beim Speichern.', type: 'danger' });
    }
  };
  const handleSaveSzenario = async (data) => {
    setError('');
    try {
      if (editSzenario) {
        await api.put(`/szenarien/${editSzenario._id}`, data);
        setToast({ show: true, message: 'Szenario gespeichert.', type: 'success' });
      } else {
        await api.post('/szenarien', data);
        setToast({ show: true, message: 'Szenario angelegt.', type: 'success' });
      }
      setOpenSzenario(false); setEditSzenario(null);
      const res = await api.get('/szenarien'); setSzenarien(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Speichern');
      setToast({ show: true, message: 'Fehler beim Speichern.', type: 'danger' });
    }
  };
  const handleDeleteKreis = async (id) => {
    setError('');
    try {
      await api.delete(`/kreise/${id}`);
      setKreise(kreise => kreise.filter(k => k._id !== id));
      setDeleteKreis(null);
      setToast({ show: true, message: 'Kreis gelöscht.', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Löschen');
      setToast({ show: true, message: 'Fehler beim Löschen.', type: 'danger' });
    }
  };
  const handleDeleteSzenario = async (id) => {
    setError('');
    try {
      await api.delete(`/szenarien/${id}`);
      setSzenarien(szenarien => szenarien.filter(s => s._id !== id));
      setDeleteSzenario(null);
      setToast({ show: true, message: 'Szenario gelöscht.', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Löschen');
      setToast({ show: true, message: 'Fehler beim Löschen.', type: 'danger' });
    }
  };
  // Sortier-Handler (Up/Down)
  const moveItem = (arr, from, to) => {
    if (to < 0 || to >= arr.length) return arr;
    const updated = [...arr];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    return updated;
  };
  const handleMoveKreis = async (idx, dir) => {
    const newArr = moveItem(kreise, idx, idx + dir);
    setKreise(newArr);
    await api.patch('/kreise/order', { ids: newArr.map(k => k._id) });
    setToast({ show: true, message: 'Sortierung gespeichert.', type: 'success' });
  };
  const handleMoveSzenario = async (idx, dir) => {
    const newArr = moveItem(szenarien, idx, idx + dir);
    setSzenarien(newArr);
    await api.patch('/szenarien/order', { ids: newArr.map(s => s._id) });
    setToast({ show: true, message: 'Sortierung gespeichert.', type: 'success' });
  };
  return (
    <div className="container-xl mt-4">
      <button className="btn btn-link text-light mb-2" onClick={() => navigate('/')}>← Zurück</button>
      <h2 className="text-white mb-3">Stammdaten: Kreise & Szenarien</h2>
      {error && <div className="alert alert-danger mb-2">{error}</div>}
      {loading ? <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Lädt...</span></div></div> : (
        <div className="row g-4">
          {/* Kreise */}
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="text-white mb-0">Kreise</h5>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditKreis(null); setOpenKreis(true); }}>Neuer Kreis</button>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Sortierung</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {kreise.length === 0 ? (
                    <tr><td colSpan={3} className="table-empty-row">Keine Kreise vorhanden.</td></tr>
                  ) : kreise.map((k, idx) => (
                    <tr key={k._id}>
                      <td>{k.name}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-light me-1" disabled={idx === 0} onClick={() => handleMoveKreis(idx, -1)} title="Nach oben"><i className="bi bi-arrow-up"></i></button>
                        <button className="btn btn-sm btn-outline-light" disabled={idx === kreise.length - 1} onClick={() => handleMoveKreis(idx, 1)} title="Nach unten"><i className="bi bi-arrow-down"></i></button>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEditKreis(k); setOpenKreis(true); }}>Bearbeiten</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteKreis(k._id)}>Löschen</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Szenarien */}
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="text-white mb-0">Szenarien</h5>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditSzenario(null); setOpenSzenario(true); }}>Neues Szenario</button>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Wert</th>
                    <th>Label</th>
                    <th>Sortierung</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {szenarien.length === 0 ? (
                    <tr><td colSpan={4} className="table-empty-row">Keine Szenarien vorhanden.</td></tr>
                  ) : szenarien.map((s, idx) => (
                    <tr key={s._id}>
                      <td>{s.value}</td>
                      <td>{s.label}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-light me-1" disabled={idx === 0} onClick={() => handleMoveSzenario(idx, -1)} title="Nach oben"><i className="bi bi-arrow-up"></i></button>
                        <button className="btn btn-sm btn-outline-light" disabled={idx === szenarien.length - 1} onClick={() => handleMoveSzenario(idx, 1)} title="Nach unten"><i className="bi bi-arrow-down"></i></button>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEditSzenario(s); setOpenSzenario(true); }}>Bearbeiten</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteSzenario(s._id)}>Löschen</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Dialoge */}
      <EditDialog show={openKreis} onClose={() => { setOpenKreis(false); setEditKreis(null); }} onSave={handleSaveKreis} initial={editKreis} label="Kreis" fields={[{ name: 'name', label: 'Name' }]} />
      <EditDialog show={openSzenario} onClose={() => { setOpenSzenario(false); setEditSzenario(null); }} onSave={handleSaveSzenario} initial={editSzenario} label="Szenario" fields={[{ name: 'value', label: 'Wert' }, { name: 'label', label: 'Label' }]} />
      {/* Delete Modals */}
      <div className={`modal fade${deleteKreis ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: deleteKreis ? 'rgba(0,0,0,0.5)' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-white">
            <div className="modal-header">
              <h5 className="modal-title">Löschen bestätigen</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteKreis(null)}></button>
            </div>
            <div className="modal-body">Möchtest du diesen Kreis wirklich löschen?</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteKreis(null)}>Abbrechen</button>
              <button className="btn btn-danger" onClick={() => handleDeleteKreis(deleteKreis)}>Löschen</button>
            </div>
          </div>
        </div>
      </div>
      <div className={`modal fade${deleteSzenario ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: deleteSzenario ? 'rgba(0,0,0,0.5)' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-white">
            <div className="modal-header">
              <h5 className="modal-title">Löschen bestätigen</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteSzenario(null)}></button>
            </div>
            <div className="modal-body">Möchtest du dieses Szenario wirklich löschen?</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteSzenario(null)}>Abbrechen</button>
              <button className="btn btn-danger" onClick={() => handleDeleteSzenario(deleteSzenario)}>Löschen</button>
            </div>
          </div>
        </div>
      </div>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
} 