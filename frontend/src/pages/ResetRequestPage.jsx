import React from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import api from '../api';

export default function ResetRequestPage() {
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/request-reset', { email });
      setSent(true);
    } catch (err) {
      setError('Fehler beim Absenden.');
    }
  };
  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2} align="center">Passwort zurücksetzen</Typography>
      {sent ? (
        <Alert severity="success">Falls die E-Mail existiert, wurde eine Reset-Mail versendet.</Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField label="E-Mail" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} required />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Reset-Link anfordern</Button>
        </form>
      )}
    </Box>
  );
} 