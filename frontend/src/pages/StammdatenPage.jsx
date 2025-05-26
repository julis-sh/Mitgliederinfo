import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Alert, Stack } from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function EditDialog({ open, onClose, onSave, initial, label, fields }) {
  const [form, setForm] = React.useState(initial || {});
  React.useEffect(() => { setForm(initial || {}); }, [initial]);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initial ? `${label} bearbeiten` : `${label} anlegen`}</DialogTitle>
      <DialogContent>
        {fields.map(f => (
          <TextField key={f.name} label={f.label} name={f.name} value={form[f.name]||''} onChange={handleChange} required fullWidth sx={{ mb: 2 }} />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={() => onSave(form)} variant="contained">Speichern</Button>
      </DialogActions>
    </Dialog>
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
      } else {
        await api.post('/kreise', data);
      }
      setOpenKreis(false); setEditKreis(null);
      const res = await api.get('/kreise'); setKreise(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Speichern');
    }
  };
  const handleSaveSzenario = async (data) => {
    setError('');
    try {
      if (editSzenario) {
        await api.put(`/szenarien/${editSzenario._id}`, data);
      } else {
        await api.post('/szenarien', data);
      }
      setOpenSzenario(false); setEditSzenario(null);
      const res = await api.get('/szenarien'); setSzenarien(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Speichern');
    }
  };
  const handleDeleteKreis = async (id) => {
    setError('');
    try {
      await api.delete(`/kreise/${id}`);
      setKreise(kreise => kreise.filter(k => k._id !== id));
      setDeleteKreis(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Löschen');
    }
  };
  const handleDeleteSzenario = async (id) => {
    setError('');
    try {
      await api.delete(`/szenarien/${id}`);
      setSzenarien(szenarien => szenarien.filter(s => s._id !== id));
      setDeleteSzenario(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Löschen');
    }
  };
  // Drag & Drop Handler
  const onDragEnd = async (result, type) => {
    if (!result.destination) return;
    if (type === 'kreise') {
      const items = Array.from(kreise);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);
      setKreise(items);
      // Persistenz
      await api.patch('/kreise/order', { ids: items.map(k => k._id) });
    } else if (type === 'szenarien') {
      const items = Array.from(szenarien);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);
      setSzenarien(items);
      await api.patch('/szenarien/order', { ids: items.map(s => s._id) });
    }
  };
  return (
    <Box maxWidth={900} mx="auto" mt={4}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 1 }}><ArrowBack /></IconButton>
      <Typography variant="h5" mb={3}>Stammdaten: Kreise & Szenarien</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        {/* Kreise */}
        <Box flex={1}>
          <Typography variant="h6" mb={1}>Kreise</Typography>
          <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => { setEditKreis(null); setOpenKreis(true); }}>Neuer Kreis</Button>
          {loading ? <CircularProgress sx={{ mt: 4 }} /> : (
            <DragDropContext onDragEnd={result => onDragEnd(result, 'kreise')}>
              <Droppable droppableId="kreise-droppable">
                {provided => (
                  <Table size="small" ref={provided.innerRef} {...provided.droppableProps}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Aktionen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kreise.map((k, idx) => (
                        <Draggable key={k._id} draggableId={k._id} index={idx}>
                          {provided2 => (
                            <TableRow ref={provided2.innerRef} {...provided2.draggableProps} {...provided2.dragHandleProps}>
                              <TableCell>{k.name}</TableCell>
                              <TableCell>
                                <IconButton onClick={() => { setEditKreis(k); setOpenKreis(true); }}><Edit /></IconButton>
                                <IconButton onClick={() => setDeleteKreis(k._id)}><Delete /></IconButton>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Box>
        {/* Szenarien */}
        <Box flex={1}>
          <Typography variant="h6" mb={1}>Szenarien</Typography>
          <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => { setEditSzenario(null); setOpenSzenario(true); }}>Neues Szenario</Button>
          {loading ? <CircularProgress sx={{ mt: 4 }} /> : (
            <DragDropContext onDragEnd={result => onDragEnd(result, 'szenarien')}>
              <Droppable droppableId="szenarien-droppable">
                {provided => (
                  <Table size="small" ref={provided.innerRef} {...provided.droppableProps}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Wert</TableCell>
                        <TableCell>Label</TableCell>
                        <TableCell>Aktionen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {szenarien.map((s, idx) => (
                        <Draggable key={s._id} draggableId={s._id} index={idx}>
                          {provided2 => (
                            <TableRow ref={provided2.innerRef} {...provided2.draggableProps} {...provided2.dragHandleProps}>
                              <TableCell>{s.value}</TableCell>
                              <TableCell>{s.label}</TableCell>
                              <TableCell>
                                <IconButton onClick={() => { setEditSzenario(s); setOpenSzenario(true); }}><Edit /></IconButton>
                                <IconButton onClick={() => setDeleteSzenario(s._id)}><Delete /></IconButton>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Box>
      </Stack>
      {/* Dialoge */}
      <EditDialog open={openKreis} onClose={() => { setOpenKreis(false); setEditKreis(null); }} onSave={handleSaveKreis} initial={editKreis} label="Kreis" fields={[{ name: 'name', label: 'Name' }]} />
      <EditDialog open={openSzenario} onClose={() => { setOpenSzenario(false); setEditSzenario(null); }} onSave={handleSaveSzenario} initial={editSzenario} label="Szenario" fields={[{ name: 'value', label: 'Wert' }, { name: 'label', label: 'Label' }]} />
      <Dialog open={!!deleteKreis} onClose={() => setDeleteKreis(null)}>
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>Möchtest du diesen Kreis wirklich löschen?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteKreis(null)}>Abbrechen</Button>
          <Button color="error" onClick={() => handleDeleteKreis(deleteKreis)}>Löschen</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteSzenario} onClose={() => setDeleteSzenario(null)}>
        <DialogTitle>Löschen bestätigen</DialogTitle>
        <DialogContent>Möchtest du dieses Szenario wirklich löschen?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSzenario(null)}>Abbrechen</Button>
          <Button color="error" onClick={() => handleDeleteSzenario(deleteSzenario)}>Löschen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 