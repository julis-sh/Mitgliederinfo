import React from 'react';
import { Box, Typography, Button, MenuItem, Select, InputLabel, FormControl, Stack, Alert, CircularProgress, TextField, Chip, Tooltip, IconButton, Accordion, AccordionSummary, AccordionDetails, Card, CardContent, CardActions, Stepper, Step, StepLabel } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Mapping: Welche Felder sind für welches Szenario relevant?
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
  {
    label: 'Persönliche Daten',
    fields: ['vorname', 'nachname', 'geschlecht', 'geburtsdatum'],
  },
  {
    label: 'Adresse',
    fields: ['strasse', 'hausnummer', 'plz', 'ort'],
  },
  {
    label: 'Kontakt',
    fields: ['email', 'telefon'],
  },
  {
    label: 'Mitgliedschaft',
    fields: ['kreis', 'kreis_neu', 'kreis_alt', 'mitgliedsnummer', 'eintrittsdatum', 'austrittsdatum'],
  },
];

export default function MailPage() {
  const [scenario, setScenario] = React.useState('');
  const [mitglied, setMitglied] = React.useState({});
  const [attachments, setAttachments] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const [kreise, setKreise] = React.useState([]);
  const [szenarien, setSzenarien] = React.useState([]);
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    api.get('/kreise').then(r => setKreise(r.data));
    api.get('/szenarien').then(r => setSzenarien(r.data));
  }, []);

  const handleMitgliedChange = e => setMitglied(m => ({ ...m, [e.target.name]: e.target.value }));

  const handleFile = async (e) => {
  };
  const removeAttachment = idx => {};

  const handleSend = async () => {
    setLoading(true); setSuccess(''); setError('');
    try {
      await api.post('/mail', {
        mitglied,
        scenario,
        attachments: attachments.map(a => ({ filename: a.serverFilename })),
      });
      setSuccess('Mails erfolgreich versendet!');
      setAttachments([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Versand');
    } finally {
      setLoading(false);
    }
  };

  // Steps dynamisch filtern: Nur Steps mit mindestens einem relevanten Feld für das Szenario
  const filteredSteps = steps.filter(stepObj => stepObj.fields.some(feld => feldRelevant(feld, scenario)));

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 1 }}><ArrowBack /></IconButton>
      <Typography variant="h5" mb={2}>Mailversand</Typography>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {filteredSteps.map((s, idx) => (
          <Step key={s.label} completed={step > idx}>
            <StepLabel>{s.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Szenario</InputLabel>
          <Select value={scenario} onChange={e => { setScenario(e.target.value); setStep(0); }} required>
            {szenarien.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </Select>
        </FormControl>
        {scenario && (
          <Card elevation={3} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>{filteredSteps[step]?.label}</Typography>
              <Stack spacing={2}>
                {filteredSteps[step]?.fields.map(feld => {
                  if (!feldRelevant(feld, scenario)) return null;
                  if (feld === 'geschlecht') {
                    return (
                      <FormControl fullWidth key={feld} required>
                        <InputLabel>Geschlecht</InputLabel>
                        <Select name="geschlecht" value={mitglied.geschlecht||''} onChange={handleMitgliedChange} required>
                          <MenuItem value="m">Männlich</MenuItem>
                          <MenuItem value="w">Weiblich</MenuItem>
                          <MenuItem value="d">Divers</MenuItem>
                        </Select>
                      </FormControl>
                    );
                  }
                  if (feld === 'geburtsdatum' || feld === 'eintrittsdatum' || feld === 'austrittsdatum') {
                    return (
                      <Tooltip title="Format: JJJJ-MM-TT" key={feld}>
                        <TextField label={feld.charAt(0).toUpperCase() + feld.slice(1).replace('datum', 'datum')} name={feld} type="date" value={mitglied[feld]||''} onChange={handleMitgliedChange} InputLabelProps={{ shrink: true }} fullWidth required />
                      </Tooltip>
                    );
                  }
                  if (feld === 'kreis' || feld === 'kreis_neu' || feld === 'kreis_alt') {
                    return (
                      <FormControl fullWidth key={feld} required>
                        <InputLabel>{feld === 'kreis' ? 'Kreis' : feld === 'kreis_neu' ? 'Neuer Kreis' : 'Alter Kreis'}</InputLabel>
                        <Select name={feld} value={mitglied[feld]||''} onChange={handleMitgliedChange} required>
                          {kreise.map(k => <MenuItem key={k.id} value={k.id}>{k.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    );
                  }
                  if (feld === 'email') {
                    return (
                      <TextField key={feld} label="E-Mail" name="email" value={mitglied.email||''} onChange={handleMitgliedChange} required fullWidth helperText={!mitglied.email ? "Pflichtfeld" : (!mitglied.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/) ? "Ungültige E-Mail-Adresse" : "") } error={!!mitglied.email && !mitglied.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)} />
                    );
                  }
                  return (
                    <TextField key={feld} label={feld.charAt(0).toUpperCase() + feld.slice(1)} name={feld} value={mitglied[feld]||''} onChange={handleMitgliedChange} required fullWidth helperText={'Pflichtfeld'} />
                  );
                })}
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Button disabled={step === 0} onClick={() => setStep(s => s - 1)}>Zurück</Button>
              {step < filteredSteps.length - 1 ? (
                <Button variant="contained" onClick={() => setStep(s => s + 1)} disabled={filteredSteps[step].fields.some(f => feldRelevant(f, scenario) && (!mitglied[f] || (f === 'email' && !mitglied.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) ))}>
                  Weiter
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={handleSend} disabled={loading || !scenario || !filteredSteps.every(st => st.fields.filter(f => feldRelevant(f, scenario)).every(f => mitglied[f] && (f !== 'mitgliedsnummer' || mitglied[f] !== undefined))) || (feldRelevant('email', scenario) && (!mitglied.email || !mitglied.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)))}>
                  {loading ? <CircularProgress size={24} /> : 'Mails versenden'}
                </Button>
              )}
            </CardActions>
          </Card>
        )}
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Box>
  );
} 