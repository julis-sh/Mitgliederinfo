import React from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!pw || pw.length < 6) return setError('Passwort zu kurz.');
    if (pw !== pw2) return setError('Passwörter stimmen nicht überein.');
    try {
      await api.post('/auth/reset-password', { token, password: pw });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Zurücksetzen.');
    }
  };
  if (!token) return <Box maxWidth={400} mx="auto" mt={8}><Alert severity="error">Kein Token angegeben.</Alert></Box>;
  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2} align="center">Neues Passwort setzen</Typography>
      {success ? (
        <Alert severity="success">Passwort erfolgreich gesetzt! Du wirst weitergeleitet ...</Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField label="Neues Passwort" type="password" fullWidth margin="normal" value={pw} onChange={e => setPw(e.target.value)} required />
          <TextField label="Wiederholen" type="password" fullWidth margin="normal" value={pw2} onChange={e => setPw2(e.target.value)} required />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Passwort setzen</Button>
        </form>
      )}
    </Box>
  );
} 