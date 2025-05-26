import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import api from '../api';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2} align="center">Login</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="E-Mail"
          fullWidth
          margin="normal"
          {...register('email', { required: 'E-Mail erforderlich' })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Passwort"
          type="password"
          fullWidth
          margin="normal"
          {...register('password', { required: 'Passwort erforderlich' })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        {serverError && <Alert severity="error" sx={{ mt: 2 }}>{serverError}</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Einloggen...' : 'Login'}
        </Button>
        <Box mt={2} textAlign="center">
          <Link to="/reset-request" style={{ fontSize: 14 }}>Passwort vergessen?</Link>
        </Box>
      </form>
    </Box>
  );
} 