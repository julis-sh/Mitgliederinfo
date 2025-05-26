import React from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Stack, Chip, MenuItem, Select, InputLabel, FormControl, Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, DialogActions as MuiDialogActions, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Alert } from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const rollen = ['Vorsitzender', 'Schatzmeister'];

function RecipientForm({ open, onClose, onSave, initial, kreise }) {
  const [form, setForm] = React.useState(initial || {});
  const [error, setError] = React.useState('');
  React.useEffect(() => { setForm(initial || {}); setError(''); }, [initial]);
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initial ? 'Empfänger bearbeiten' : 'Empfänger anlegen'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Name" name="name" value={form.name||''} onChange={handleChange} required />
          <TextField label="E-Mail" name="email" value={form.email||''} onChange={handleChange} required />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Kreis</InputLabel>
            <Select name="kreis" value={form.kreis || ''} onChange={handleChange} required>
              {kreise.map(k => <MenuItem key={k.id} value={k.id}>{k.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Rolle</InputLabel>
            <Select name="rolle" value={form.rolle||''} onChange={handleChange} required>
              {rollen.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave} variant="contained" disabled={!form.kreis}>Speichern</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function RecipientsPage() {
  const [recipients, setRecipients] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState(null);
  const [kreise, setKreise] = React.useState([]);
  const [error, setError] = React.useState('');
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
      } else {
        await api.post('/recipients', payload);
      }
      setOpen(false); setEdit(null);
      setLoading(true);
      const res = await api.get('/recipients'); setRecipients(res.data); setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Fehler beim Speichern');
    }
  };
  const handleDelete = async (id) => {
    await api.delete(`/recipients/${id}`);
    setRecipients(recipients => recipients.filter(r => r._id !== id));
    setDeleteId(null);
  };
  return (
    <Box maxWidth={800} mx="auto" mt={4}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 1 }}><ArrowBack /></IconButton>
      <Typography variant="h5" mb={2}>Empfänger/Kreise</Typography>
      <TextField
        placeholder="Suchen... (Name, E-Mail, Rolle, Kreis)"
        value={search}
        onChange={e => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {kreise.map(kreis => (
        <Accordion key={kreis.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>{kreis.name}</Typography></AccordionSummary>
          <AccordionDetails>
            <Button variant="outlined" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => { setEdit(null); setOpen(true); }}>Neuer Empfänger</Button>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>E-Mail</TableCell>
                  <TableCell>Rolle</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recipients
                  .filter(r => r.kreisId === kreis.id || r.KreisId === kreis.id)
                  .map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>{r.rolle}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => { setEdit(r); setOpen(true); }}><Edit /></IconButton>
                        <IconButton onClick={() => setDeleteId(r.id)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
      <RecipientForm open={open} onClose={() => { setOpen(false); setEdit(null); }} onSave={handleSave} initial={edit} kreise={kreise} />
      <MuiDialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <MuiDialogTitle>Löschen bestätigen</MuiDialogTitle>
        <MuiDialogContent>Möchtest du diesen Empfänger wirklich löschen?</MuiDialogContent>
        <MuiDialogActions>
          <Button onClick={() => setDeleteId(null)}>Abbrechen</Button>
          <Button color="error" onClick={() => handleDelete(deleteId)}>Löschen</Button>
        </MuiDialogActions>
      </MuiDialog>
    </Box>
  );
} 