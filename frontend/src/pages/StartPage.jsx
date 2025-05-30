import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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

const cards = [
  { label: 'Mailversand', icon: 'bi-envelope', path: '/mail', admin: false, desc: 'Mitglieder-Mails versenden' },
  { label: 'Empfänger/Kreise', icon: 'bi-people', path: '/recipients', admin: true, desc: 'Kreisverbände & Funktionsträger verwalten' },
  { label: 'Mail-Templates', icon: 'bi-card-text', path: '/templates', admin: true, desc: 'Vorlagen für Mails bearbeiten' },
  { label: 'Audit-Log', icon: 'bi-gear', path: '/auditlog', admin: true, desc: 'Mailversand-Protokoll einsehen' },
  { label: 'Benutzerverwaltung', icon: 'bi-person-badge', path: '/users', admin: true, desc: 'Admins & Nutzer verwalten' },
  { label: 'Stammdaten', icon: 'bi-database', path: '/stammdaten', admin: true, desc: 'Kreise & Szenarien verwalten' },
];

const statCards = [
  { label: 'Empfänger', icon: 'bi-person-lines-fill', key: 'recipients' },
  { label: 'Kreise', icon: 'bi-diagram-3', key: 'kreise' },
  { label: 'Szenarien', icon: 'bi-graph-up', key: 'szenarien' },
  { label: 'Mail-Templates', icon: 'bi-file-earmark-text', key: 'templates' },
  { label: 'Benutzer', icon: 'bi-people-fill', key: 'users' },
  { label: 'Mails gesendet', icon: 'bi-send', key: 'sentMails' },
];

const quickLinks = [
  { label: 'Neue Mail', icon: 'bi-envelope-plus', path: '/mail', color: 'primary' },
  { label: 'Empfänger hinzufügen', icon: 'bi-person-plus', path: '/recipients', color: 'secondary' },
];

export default function StartPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = React.useState({ recipients: 0, kreise: 0, szenarien: 0, templates: 0, users: 0, sentMails: 0 });
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/recipients').catch(() => ({ data: [] })),
      api.get('/kreise').catch(() => ({ data: [] })),
      api.get('/szenarien').catch(() => ({ data: [] })),
      api.get('/templates').catch(() => ({ data: [] })),
      api.get('/users').catch(() => ({ data: [] })),
      api.get('/auditlog').catch(() => ({ data: [] })),
    ]).then(([recipients, kreise, szenarien, templates, users, auditlog]) => {
      setStats({
        recipients: recipients.data.length,
        kreise: kreise.data.length,
        szenarien: szenarien.data.length,
        templates: templates.data.length,
        users: users.data.length,
        //sentMails: (auditlog.data || []).filter(l => l.type === 'mail').length, // TODO: fix this
        sentMails: auditlog.data.length,
      });
      setLogs((auditlog.data || []).slice(0, 5));
      setLoading(false);
    }).catch(e => {
      setError('Fehler beim Laden der Dashboard-Daten.');
      setLoading(false);
    });
  }, []);

  return (
    <div className="container-xl mt-5">
      <div className="text-center mb-4">
        <img src="/juli-logo.svg" alt="Junge Liberale Logo" style={{ width: 100, height: 100 }} className="mb-3" />
        <h1 className="fw-bold text-primary">Mitgliederinformationssystem</h1>
        <h5 className="text-secondary mb-3">Willkommen im Mail-Dashboard der Jungen Liberalen Schleswig-Holstein.</h5>
        <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
          {quickLinks.map(link => (
            <button key={link.label} className={`btn btn-${link.color} d-flex align-items-center gap-2`} onClick={() => navigate(link.path)}>
              <i className={`bi ${link.icon}`}></i> {link.label}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Lädt...</span></div>
        </div>
      ) : (
        <>
          {/* Statistiken */}
          <div className="row g-3 mb-4">
            {statCards.map(stat => (
              <div className="col-6 col-md-4 col-lg-2" key={stat.key}>
                <div className="card bg-dark text-white text-center shadow-sm h-100">
                  <div className="card-body">
                    <i className={`bi ${stat.icon} mb-2`} style={{ fontSize: 28 }}></i>
                    <h3 className="fw-bold mb-0">{stats[stat.key]}</h3>
                    <div className="small text-secondary">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Navigation Cards */}
          <div className="row g-4 mb-4">
            {cards.filter(card => !card.admin || user?.role === 'admin').map(card => (
              <div className="col-12 col-md-6 col-lg-4" key={card.label}>
                <div className="card h-100 shadow-sm bg-secondary bg-gradient text-white border-0" style={{ cursor: 'pointer' }} onClick={() => navigate(card.path)}>
                  <div className="card-body d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 150 }}>
                    <i className={`bi ${card.icon} mb-2`} style={{ fontSize: 32 }}></i>
                    <h5 className="fw-bold">{card.label}</h5>
                    <div className="small text-light text-center">{card.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Audit-Log Timeline */}
          <div className="card bg-dark text-white shadow-sm mb-5">
            <div className="card-header d-flex align-items-center gap-2">
              <i className="bi bi-gear"></i>
              <span className="fw-bold">Letzte Aktionen</span>
            </div>
            <ul className="list-group list-group-flush">
              {logs.length === 0 ? (
                <li className="list-group-item bg-dark text-secondary">Keine Aktionen gefunden.</li>
              ) : (
                logs.map(l => (
                  <li className="list-group-item bg-dark text-white" key={l._id || l.createdAt}>
                    <div className="fw-bold text-primary">{new Date(l.createdAt).toLocaleString('de-DE')}</div>
                    <div className="small">
                      {l.user ? <b>{l.user}</b> : 'System'}: {l.type === 'mail' ? 'Mailversand' : l.type}
                      {l.scenario && <> | Szenario: <b>{l.scenario}</b></>}
                      {l.kreis && <> | Kreis: <b>{l.kreis}</b></>}
                      {l.mitgliedEmail && <> | Mitglied: <b>{l.mitgliedEmail}</b></>}
                      {l.empfaenger && l.empfaenger.length > 0 && <> | Empfänger: <b>{Array.isArray(l.empfaenger) ? l.empfaenger.join(', ') : l.empfaenger}</b></>}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
} 