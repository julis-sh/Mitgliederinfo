import React from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const szenarioFelder = {
  eintritt: ['vorname', 'nachname', 'email', 'strasse', 'hausnummer', 'plz', 'ort', 'telefon', 'kreis', 'geburtsdatum', 'eintrittsdatum', 'mitgliedsnummer'],
  austritt: ['vorname', 'nachname', 'email', 'kreis', 'austrittsdatum', 'mitgliedsnummer'],
  veraenderung: ['vorname', 'nachname', 'strasse', 'hausnummer', 'plz', 'ort', 'telefon', 'email', 'kreis', 'mitgliedsnummer'],
  verbandswechsel_eintritt: ['vorname', 'nachname', 'strasse', 'hausnummer', 'plz', 'ort', 'telefon', 'email', 'geburtsdatum', 'kreis_neu', 'eintrittsdatum', 'mitgliedsnummer'],
  verbandswechsel_austritt: ['vorname', 'nachname', 'email', 'kreis_alt', 'austrittsdatum', 'mitgliedsnummer'],
  verbandswechsel_intern: ['vorname', 'nachname', 'email', 'kreis_alt', 'kreis_neu', 'mitgliedsnummer'],
};

function feldRelevant(feld, scenario) {
  if (!scenario) return false;
  return szenarioFelder[scenario]?.includes(feld);
}

const steps = [
  { label: 'Persönliche Daten', fields: ['vorname', 'nachname', 'geschlecht', 'geburtsdatum'] },
  { label: 'Adresse', fields: ['strasse', 'hausnummer', 'plz', 'ort'] },
  { label: 'Kontakt', fields: ['email', 'telefon'] },
  { label: 'Mitgliedschaft', fields: ['kreis', 'kreis_neu', 'kreis_alt', 'mitgliedsnummer', 'eintrittsdatum', 'austrittsdatum'] },
];

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

export default function MailPage() {
  const [scenario, setScenario] = React.useState('');
  const [mitglied, setMitglied] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const [kreise, setKreise] = React.useState([]);
  const [szenarien, setSzenarien] = React.useState([]);
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    api.get('/kreise').then(r => setKreise(r.data));
    api.get('/szenarien').then(r => setSzenarien(r.data));
  }, []);

  const handleMitgliedChange = e => setMitglied(m => ({ ...m, [e.target.name]: e.target.value }));

  const handleSend = async () => {
    setLoading(true); setSuccess(''); setError('');
    try {
      await api.post('/mail', {
        mitglied,
        scenario,
        attachments: [], // Anhänge können später ergänzt werden
      });
      setSuccess('Mails erfolgreich versendet!');
      setToast({ show: true, message: 'Mails erfolgreich versendet!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Versand');
      setToast({ show: true, message: 'Fehler beim Versand.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const filteredSteps = steps.filter(stepObj => stepObj.fields.some(feld => feldRelevant(feld, scenario)));

  return (
    <div className="container-xl mt-4">
      <button className="btn btn-link text-light mb-2" onClick={() => navigate('/')}>← Zurück</button>
      <h2 className="text-white mb-3">Neue Mail versenden</h2>
      {/* Stepper */}
      <ul className="nav nav-pills mb-3 justify-content-center">
        {filteredSteps.map((s, idx) => (
          <li className="nav-item" key={s.label}>
            <button className={`nav-link${step === idx ? ' active' : ''}${step < idx ? ' disabled' : ''}`} onClick={() => step >= idx && setStep(idx)}>{s.label}</button>
          </li>
        ))}
      </ul>
      <div className="card bg-dark text-white shadow-sm mb-3">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Szenario</label>
            <select className="form-select" value={scenario} onChange={e => { setScenario(e.target.value); setStep(0); }} required>
              <option value="">Bitte wählen</option>
              {szenarien.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {!scenario && <div className="table-empty-row">Bitte wähle ein Szenario aus.</div>}
          {scenario && filteredSteps.length === 0 && <div className="table-empty-row">Für dieses Szenario sind keine Felder definiert.</div>}
          {scenario && filteredSteps.length > 0 && (
            <>
              <h5 className="mb-3">{filteredSteps[step]?.label}</h5>
              {filteredSteps[step]?.fields.map(feld => {
                if (!feldRelevant(feld, scenario)) return null;
                if (feld === 'geschlecht') {
                  return (
                    <div className="mb-3" key={feld}>
                      <label className="form-label">Geschlecht</label>
                      <select className="form-select" name="geschlecht" value={mitglied.geschlecht||''} onChange={handleMitgliedChange} required>
                        <option value="">Bitte wählen</option>
                        <option value="m">Männlich</option>
                        <option value="w">Weiblich</option>
                        <option value="d">Divers</option>
                      </select>
                    </div>
                  );
                }
                if (feld === 'geburtsdatum' || feld === 'eintrittsdatum' || feld === 'austrittsdatum') {
                  return (
                    <div className="mb-3" key={feld}>
                      <label className="form-label">{feld.charAt(0).toUpperCase() + feld.slice(1).replace('datum', 'datum')}</label>
                      <input type="date" className="form-control" name={feld} value={mitglied[feld]||''} onChange={handleMitgliedChange} required />
                    </div>
                  );
                }
                if (feld === 'kreis' || feld === 'kreis_neu' || feld === 'kreis_alt') {
                  return (
                    <div className="mb-3" key={feld}>
                      <label className="form-label">{feld === 'kreis' ? 'Kreis' : feld === 'kreis_neu' ? 'Neuer Kreis' : 'Alter Kreis'}</label>
                      <select className="form-select" name={feld} value={mitglied[feld]||''} onChange={handleMitgliedChange} required>
                        <option value="">Bitte wählen</option>
                        {kreise.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                    </div>
                  );
                }
                if (feld === 'email') {
                  return (
                    <div className="mb-3" key={feld}>
                      <label className="form-label">E-Mail</label>
                      <input type="email" className="form-control" name="email" value={mitglied.email||''} onChange={handleMitgliedChange} required />
                      {!mitglied.email ? <div className="form-text text-danger">Pflichtfeld</div> : (!mitglied.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/) ? <div className="form-text text-danger">Ungültige E-Mail-Adresse</div> : null)}
                    </div>
                  );
                }
                return (
                  <div className="mb-3" key={feld}>
                    <label className="form-label">{feld.charAt(0).toUpperCase() + feld.slice(1)}</label>
                    <input className="form-control" name={feld} value={mitglied[feld]||''} onChange={handleMitgliedChange} required />
                    <div className="form-text text-danger">Pflichtfeld</div>
                  </div>
                );
              })}
              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Zurück</button>
                {step < filteredSteps.length - 1 ? (
                  <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={filteredSteps[step].fields.some(f => feldRelevant(f, scenario) && (!mitglied[f] || (f === 'email' && !mitglied.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) ))}>
                    Weiter
                  </button>
                ) : (
                  <button className="btn btn-success" onClick={handleSend} disabled={loading || !scenario || !filteredSteps.every(st => st.fields.filter(f => feldRelevant(f, scenario)).every(f => mitglied[f] && (f !== 'mitgliedsnummer' || mitglied[f] !== undefined))) || (feldRelevant('email', scenario) && (!mitglied.email || !mitglied.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)))}>
                    {loading ? <span className="spinner-border spinner-border-sm" /> : 'Mails versenden'}
                  </button>
                )}
              </div>
            </>
          )}
          {success && <div className="alert alert-success mt-3">{success}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
} 