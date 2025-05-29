import React from 'react';
import { Box, Typography, Card, CardActionArea, CardContent, Grid, Avatar, Stack, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import StorageIcon from '@mui/icons-material/Storage';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import TimelineIcon from '@mui/icons-material/Timeline';
import Tooltip from '@mui/material/Tooltip';
import AddCircleIcon from '@mui/icons-material/AddCircle';
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
  {
    label: 'Mailversand',
    icon: <EmailIcon fontSize="large" color="primary" />, 
    path: '/mail',
    admin: false,
    desc: 'Mitglieder-Mails versenden'
  },
  {
    label: 'Empfänger/Kreise',
    icon: <GroupIcon fontSize="large" color="secondary" />, 
    path: '/recipients',
    admin: true,
    desc: 'Kreisverbände & Funktionsträger verwalten'
  },
  {
    label: 'Mail-Templates',
    icon: <ListAltIcon fontSize="large" color="action" />, 
    path: '/templates',
    admin: true,
    desc: 'Vorlagen für Mails bearbeiten'
  },
  {
    label: 'Audit-Log',
    icon: <SettingsIcon fontSize="large" color="disabled" />, 
    path: '/auditlog',
    admin: true,
    desc: 'Mailversand-Protokoll einsehen'
  },
  {
    label: 'Benutzerverwaltung',
    icon: <SupervisorAccountIcon fontSize="large" color="success" />,
    path: '/users',
    admin: true,
    desc: 'Admins & Nutzer verwalten'
  },
  {
    label: 'Stammdaten',
    icon: <StorageIcon fontSize="large" color="warning" />, 
    path: '/stammdaten',
    admin: true,
    desc: 'Kreise & Szenarien verwalten'
  },
];

const statCards = [
  { label: 'Empfänger', icon: <PeopleIcon color="secondary" />, key: 'recipients' },
  { label: 'Kreise', icon: <GroupIcon color="action" />, key: 'kreise' },
  { label: 'Szenarien', icon: <TimelineIcon color="warning" />, key: 'szenarien' },
  { label: 'Mail-Templates', icon: <FolderIcon color="success" />, key: 'templates' },
  { label: 'Benutzer', icon: <SupervisorAccountIcon color="info" />, key: 'users' },
];

const quickLinks = [
  { label: 'Neue Mail', icon: <EmailIcon />, path: '/mail', color: 'primary' },
  { label: 'Empfänger hinzufügen', icon: <PeopleIcon />, path: '/recipients', color: 'secondary' },
];

export default function StartPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = React.useState({ members: 0, recipients: 0, kreise: 0, szenarien: 0, templates: 0, users: 0 });
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
      });
      setLogs((auditlog.data || []).slice(0, 5));
      setLoading(false);
    }).catch(e => {
      setError('Fehler beim Laden der Dashboard-Daten.');
      setLoading(false);
    });
  }, []);

  return (
    <Box maxWidth={900} mx="auto" mt={6}>
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Avatar src="/juli-logo.svg" alt="Junge Liberale Logo" sx={{ width: 120, height: 120, mb: 2 }} />
        <Typography variant="h3" color="primary" gutterBottom fontWeight={700}>
          Mitgliederinfo
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={2}>
          Willkommen im Mail-Dashboard der Jungen Liberalen Schleswig-Holstein.
        </Typography>
        {/* Quick-Links */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2} mb={2}>
          {quickLinks.map(link => (
            <Card key={link.label} sx={{ px: 2, py: 1, bgcolor: `${link.color}.light`, boxShadow: 1, cursor: 'pointer', '&:hover': { boxShadow: 4, bgcolor: `${link.color}.main`, color: '#fff' } }} onClick={() => navigate(link.path)}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {link.icon}
                <Typography fontWeight={600}>{link.label}</Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
      ) : (
        <>
          {/* Quick-Stats */}
          <Grid container spacing={2} justifyContent="center" mb={3}>
            {statCards.map(stat => (
              <Grid item xs={6} sm={4} md={2} key={stat.key}>
                <Tooltip title={`Anzahl der ${stat.label.toLowerCase()}`} arrow>
                  <Card sx={{ p: 2, textAlign: 'center', boxShadow: 2, transition: '0.2s', '&:hover': { boxShadow: 6, bgcolor: 'grey.100' } }}>
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                      {stat.icon}
                      <Typography variant="h5" fontWeight={700}>{stats[stat.key]}</Typography>
                      <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                    </Box>
                  </Card>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
          {/* Navigation Cards */}
          <Grid container spacing={4} justifyContent="center" mb={3}>
            {cards.filter(card => !card.admin || user?.role === 'admin').map(card => (
              <Grid item xs={12} sm={6} md={4} key={card.label}>
                <Card sx={{ minHeight: 180, boxShadow: 3, transition: '0.2s', '&:hover': { boxShadow: 8, bgcolor: 'grey.50' } }}>
                  <CardActionArea onClick={() => navigate(card.path)} sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 150 }}>
                      {card.icon}
                      <Typography variant="h6" mt={2} fontWeight={600}>{card.label}</Typography>
                      <Typography variant="body2" color="text.secondary" align="center" mt={1}>{card.desc}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          {/* Audit-Log Timeline */}
          <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={1} sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1 }} /> Letzte Aktionen
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {logs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Keine Aktionen gefunden.</Typography>
            ) : (
              <Stack spacing={2}>
                {logs.map(l => (
                  <Box key={l._id || l.createdAt} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="primary" fontWeight={600}>{new Date(l.createdAt).toLocaleString('de-DE')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {l.user ? <b>{l.user}</b> : 'System'}: {l.type === 'mail' ? 'Mailversand' : l.type}
                        {l.scenario && <> &nbsp;| Szenario: <b>{l.scenario}</b></>}
                        {l.kreis && <> &nbsp;| Kreis: <b>{l.kreis}</b></>}
                        {l.mitgliedEmail && <> &nbsp;| Mitglied: <b>{l.mitgliedEmail}</b></>}
                        {l.empfaenger && l.empfaenger.length > 0 && <> &nbsp;| Empfänger: <b>{Array.isArray(l.empfaenger) ? l.empfaenger.join(', ') : l.empfaenger}</b></>}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
} 