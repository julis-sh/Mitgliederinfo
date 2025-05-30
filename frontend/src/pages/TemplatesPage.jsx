import React from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function safeArray(val) {
  return Array.isArray(val) ? val : [];
}

function TemplateForm({ show, onClose, onSave, initial, kreise, szenarien }) {
  const [form, setForm] = React.useState(initial || { attachments: [] });
  const [uploading, setUploading] = React.useState(false);
  React.useEffect(() => { setForm(initial || { attachments: [] }); }, [initial, show]);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    const res = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    setForm(f => ({
      ...f,
      attachments: [
        ...(Array.isArray(f.attachments) ? f.attachments : []),
        { filename: file.name, url: res.data.url }
      ]
    }));
    setUploading(false);
  };
  const removeAttachment = (idx) => setForm(f => ({ ...f, attachments: safeArray(f.attachments).filter((_, i) => i !== idx) }));

  const handleSave = () => {
    const safeAttachments = Array.isArray(form.attachments) ? form.attachments.filter(a => a && a.filename && a.url) : [];
    onSave({ ...form, attachments: safeAttachments });
  };

  return (
    <div className={`modal fade${show ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: show ? 'rgba(0,0,0,0.5)' : 'none' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title">{initial ? 'Template bearbeiten' : 'Template anlegen'}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Typ</label>
                <select className="form-select" name="type" value={form.type||''} onChange={handleChange} required>
                  <option value="">Bitte wählen</option>
                  <option value="mitglied">Mitglied</option>
                  <option value="empfaenger">Empfänger</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Szenario</label>
                <select className="form-select" name="scenario" value={form.scenario||''} onChange={handleChange} required>
                  <option value="">Bitte wählen</option>
                  {szenarien.map(s => <option key={s._id || s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {form.type === 'empfaenger' && (
                <div className="col-md-4">
                  <label className="form-label">Kreis (optional)</label>
                  <select className="form-select" name="kreis" value={form.kreis||''} onChange={handleChange}>
                    <option value="">Alle Kreise (Standard-Template)</option>
                    {kreise.map(k => <option key={k._id || k.id} value={k._id || k.id}>{k.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="form-text text-secondary mb-2">
              Hinweis: Platzhalter wie {'{vorname}'}, {'{nachname}'}, {'{mitgliedsnummer}'}, ... können verwendet werden.
            </div>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={form.name||''} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Betreff</label>
              <input className="form-control" name="subject" value={form.subject||''} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Mail-Text (HTML)</label>
              <textarea className="form-control" name="body" value={form.body||''} onChange={handleChange} rows={4} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Anhänge</label>
              <input type="file" className="form-control mb-2" onChange={handleFile} disabled={uploading} />
              <ul className="list-group">
                {safeArray(form.attachments).map((a, i) => (
                  <li className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center" key={i}>
                    <span><i className="bi bi-paperclip me-2"></i>{a.filename}</span>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeAttachment(i)}>Entfernen</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Speichern</button>
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

export default function TemplatesPage() {
  const [templates, setTemplates] = React.useState([]);
  const [show, setShow] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState(null);
  const [kreise, setKreise] = React.useState([]);
  const [szenarien, setSzenarien] = React.useState([]);
  const [error, setError] = React.useState('');
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  React.useEffect(() => {
    setLoading(true);
    api.get('/templates').then(r => { setTemplates(r.data); setLoading(false); });
    api.get('/kreise').then(r => setKreise(r.data));
    api.get('/szenarien').then(r => setSzenarien(r.data));
  }, []);
  const handleSave = async (data) => {
    const payload = {
      ...data,
      scenario: typeof data.scenario === 'object' ? data.scenario.value : data.scenario,
      kreis: data.kreis ? data.kreis : undefined
    };
    try {
      if (edit) {
        await api.put(`/templates/${edit._id}`, payload);
        setToast({ show: true, message: 'Template gespeichert.', type: 'success' });
      } else {
        await api.post('/templates', payload);
        setToast({ show: true, message: 'Template angelegt.', type: 'success' });
      }
      setShow(false); setEdit(null);
      setLoading(true);
      const res = await api.get('/templates'); setTemplates(res.data); setLoading(false);
    } catch (err) {
      setToast({ show: true, message: 'Fehler beim Speichern.', type: 'danger' });
    }
  };
  const handleDelete = async (id) => {
    try {
      await api.delete(`/templates/${id}`);
      setTemplates(templates => templates.filter(t => t._id !== id));
      setDeleteId(null);
      setToast({ show: true, message: 'Template gelöscht.', type: 'success' });
    } catch {
      setToast({ show: true, message: 'Fehler beim Löschen.', type: 'danger' });
    }
  };
  return (
    <div className="container-xl mt-4">
      <button className="btn btn-link text-light mb-2" onClick={() => navigate('/')}>← Zurück</button>
      <h2 className="text-white mb-3">Mail-Templates</h2>
      {error && <div className="alert alert-danger mb-2">{error}</div>}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Lädt...</span></div>
        </div>
      ) : (
        szenarien.map(szenario => {
          const filtered = templates.filter(t => t.scenario === szenario.value);
          return (
            <div className="card bg-dark text-white mb-4" key={szenario.value}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-bold">{szenario.label}</span>
                <button className="btn btn-outline-light btn-sm" onClick={() => { setEdit(null); setShow(true); }}>Neues Template</button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-dark table-hover mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Typ</th>
                        <th>Betreff</th>
                        <th>Anzahl Anhänge</th>
                        <th>Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={5} className="table-empty-row">Keine Templates vorhanden.</td></tr>
                      ) : filtered.map(t => (
                        <tr key={t._id}>
                          <td>{t.name}</td>
                          <td>{t.type}</td>
                          <td>{t.subject}</td>
                          <td>{Array.isArray(t.attachments) ? t.attachments.length : 0}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEdit(t); setShow(true); }}>Bearbeiten</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteId(t._id)}>Löschen</button>
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
      <TemplateForm show={show} onClose={() => { setShow(false); setEdit(null); }} onSave={handleSave} initial={edit} kreise={kreise} szenarien={szenarien} />
      {/* Delete Modal */}
      <div className={`modal fade${deleteId ? ' show d-block' : ''}`} tabIndex="-1" style={{ background: deleteId ? 'rgba(0,0,0,0.5)' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-white">
            <div className="modal-header">
              <h5 className="modal-title">Löschen bestätigen</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteId(null)}></button>
            </div>
            <div className="modal-body">Möchtest du dieses Template wirklich löschen?</div>
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