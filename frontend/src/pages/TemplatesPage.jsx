import React from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Stack, Chip, MenuItem, Select, InputLabel, FormControl, List, ListItem, ListItemText, ListItemSecondaryAction, Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, DialogActions as MuiDialogActions, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Add, Edit, Delete, AttachFile, CloudUpload, ArrowBack } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function safeArray(val) {
  return Array.isArray(val) ? val : [];
}

function TemplateForm({ open, onClose, onSave, initial, kreise, szenarien }) {
  const [form, setForm] = React.useState(initial || { attachments: [] });
  const [uploading, setUploading] = React.useState(false);
  React.useEffect(() => { setForm(initial || { attachments: [] }); }, [initial]);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Datei-Upload
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
    // attachments immer als Array von Objekten sichern
    const safeAttachments = Array.isArray(form.attachments) ? form.attachments.filter(a => a && a.filename && a.url) : [];
    onSave({ ...form, attachments: safeAttachments });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial ? 'Template bearbeiten' : 'Template anlegen'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <FormControl>
            <InputLabel>Typ</InputLabel>
            <Select name="type" value={form.type||''} onChange={handleChange} required>
              <MenuItem value="mitglied">Mitglied</MenuItem>
              <MenuItem value="empfaenger">Empfänger</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Szenario</InputLabel>
            <Select name="scenario" value={form.scenario||''} onChange={handleChange} required>
              {szenarien.map(s => <MenuItem key={s._id} value={s.value}>{s.label}</MenuItem>)}
            </Select>
          </FormControl>
          {form.type === 'empfaenger' && (
            <FormControl>
              <InputLabel>Kreis (optional)</InputLabel>
              <Select name="kreis" value={form.kreis||''} onChange={handleChange} displayEmpty>
                <MenuItem value=""><em>Alle Kreise (Standard-Template)</em></MenuItem>
                {kreise.map(k => <MenuItem key={k._id} value={k._id}>{k.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          {form.type === 'empfaenger' && (
            <Typography variant="caption" color="text.secondary">
              Wenn kein Kreis ausgewählt ist, gilt das Template für alle Kreise. Nur für Spezialfälle (abweichende Texte für einzelne Kreise) einen Kreis auswählen.
            </Typography>
          )}
          <TextField label="Name" name="name" value={form.name||''} onChange={handleChange} required />
          <TextField label="Betreff" name="subject" value={form.subject||''} onChange={handleChange} required />
          <TextField label="Mail-Text (HTML, Platzhalter: {vorname} ...)" name="body" value={form.body||''} onChange={handleChange} multiline minRows={4} required />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Hinweis: In den Mail-Templates können Platzhalter wie {'{vorname}'}, {'{nachname}'}, {'{mitgliedsnummer}'}, {'{eintrittsdatum}'}, {'{austrittsdatum}'}, {'{geburtsdatum}'}, {'{strasse}'}, {'{plz}'}, {'{ort}'}, {'{telefon}'}, {'{kreis}'}, {'{kreis_alt}'}, {'{kreis_neu}'}, {'{vorsitzender}'}, {'{schatzmeister}'}, {'{vorsitzender_alt}'}, {'{schatzmeister_alt}'}, {'{vorsitzender_neu}'}, {'{schatzmeister_neu}'} verwendet werden.
          </Typography>
          <Button component="label" startIcon={<CloudUpload />} disabled={uploading}>
            Anhang hochladen
            <input type="file" hidden onChange={handleFile} />
          </Button>
          <List>
            {(Array.isArray(form.attachments) ? form.attachments : []).map((a, i) => (
              <ListItem key={i}>
                <AttachFile sx={{ mr: 1 }} />
                <ListItemText primary={a.filename} secondary={a.url} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removeAttachment(i)}><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave} variant="contained">Speichern</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState(null);
  const [kreise, setKreise] = React.useState([]);
  const [szenarien, setSzenarien] = React.useState([]);
  const navigate = useNavigate();
  React.useEffect(() => {
    setLoading(true);
    api.get('/templates').then(r => { setTemplates(r.data); setLoading(false); });
    api.get('/kreise').then(r => setKreise(r.data));
    api.get('/szenarien').then(r => setSzenarien(r.data));
  }, []);
  const handleSave = async (data) => {
    // Szenario immer als value speichern, kreis nur setzen wenn ausgewählt
    const payload = {
      ...data,
      scenario: typeof data.scenario === 'object' ? data.scenario.value : data.scenario,
      kreis: data.kreis ? data.kreis : undefined
    };
    if (edit) {
      await api.put(`/templates/${edit._id}`, payload);
    } else {
      await api.post('/templates', payload);
    }
    setOpen(false); setEdit(null);
    setLoading(true);
    const res = await api.get('/templates'); setTemplates(res.data); setLoading(false);
  };
  const handleDelete = async (id) => {
    await api.delete(`/templates/${id}`);
    setTemplates(templates => templates.filter(t => t._id !== id));
    setDeleteId(null);
  };
  return (
    <Box maxWidth={1100} mx="auto" mt={4}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 1 }}><ArrowBack /></IconButton>
      <Typography variant="h5" mb={2}>Mail-Templates</Typography>
      {szenarien.map(szenario => (
        <Accordion key={szenario.value} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>{szenario.label}</Typography></AccordionSummary>
          <AccordionDetails>
            <Button variant="outlined" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => { setEdit(null); setOpen(true); }}>Neues Template</Button>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Betreff</TableCell>
                  <TableCell>Anzahl Anhänge</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.filter(t => t.scenario === szenario.value).map(t => (
                  <TableRow key={t._id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.type}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>{safeArray(t.attachments).length}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => { setEdit(t); setOpen(true); }}><Edit /></IconButton>
                      <IconButton onClick={() => setDeleteId(t._id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
      <TemplateForm open={open} onClose={() => { setOpen(false); setEdit(null); }} onSave={handleSave} initial={edit} kreise={kreise} szenarien={szenarien} />
      <MuiDialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <MuiDialogTitle>Löschen bestätigen</MuiDialogTitle>
        <MuiDialogContent>Möchtest du dieses Template wirklich löschen?</MuiDialogContent>
        <MuiDialogActions>
          <Button onClick={() => setDeleteId(null)}>Abbrechen</Button>
          <Button color="error" onClick={() => handleDelete(deleteId)}>Löschen</Button>
        </MuiDialogActions>
      </MuiDialog>
    </Box>
  );
} 