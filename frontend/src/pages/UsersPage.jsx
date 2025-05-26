import React from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Select, InputLabel, FormControl, CircularProgress, Alert } from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const rollen = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

function UserForm({ open, onClose, onSave, initial }) {
  const [form, setForm] = React.useState(initial || {});
  const [pw, setPw] = React.useState('');
  React.useEffect(() => { setForm(initial || {}); setPw(''); }, [initial]);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initial ? 'Benutzer bearbeiten' : 'Benutzer anlegen'}</DialogTitle>
      <DialogContent>
        <TextField label="E-Mail" name="email" value={form.email||''} onChange={handleChange} required fullWidth sx={{ mb: 2 }} disabled={!!initial} />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Rolle</InputLabel>
          <Select name="role" value={form.role||''} onChange={handleChange} required>
            {rollen.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label={initial ? 'Neues Passwort (optional)' : 'Passwort'} type="password" value={pw} onChange={e => setPw(e.target.value)} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={() => onSave({ ...form, password: pw })} variant="contained">Speichern</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function UsersPage() {
  const [users, setUsers] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState(null);
  const [error, setError] = React.useState('');
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
      } else {
        await api.post('/users', data);
      }
      setOpen(false); setEdit(null);
      setLoading(true);
      const res = await api.get('/users'); setUsers(res.data); setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Speichern');
    }
  };
  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/users/${id}`);
      setUsers(users => users.filter(u => u._id !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Löschen');
    }
  };
  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 1 }}><ArrowBack /></IconButton>
      <Typography variant="h5" mb={2}>Benutzerverwaltung</Typography>
      <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => { setEdit(null); setOpen(true); }}>Neuer Benutzer</Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress sx={{ mt: 4 }} /> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>E-Mail</TableCell>
              <TableCell>Rolle</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u._id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEdit(u); setOpen(true); }}><Edit /></IconButton>
                  <IconButton onClick={() => setDeleteId(u._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <UserForm open={open} onClose={() => { setOpen(false); setEdit(null); }} onSave={handleSave} initial={edit} />
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>Möchtest du diesen Benutzer wirklich löschen?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Abbrechen</Button>
          <Button color="error" onClick={() => handleDelete(deleteId)}>Löschen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 