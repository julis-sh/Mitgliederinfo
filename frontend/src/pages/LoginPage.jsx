import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import api from '../api';
import { PublicClientApplication } from '@azure/msal-browser';
import MicrosoftIcon from '@mui/icons-material/Microsoft';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MS_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MS_TENANT_ID}`,
    redirectUri: window.location.origin + '/login',
  },
};
console.log('MSAL Config:', msalConfig);
const msalInstance = new PublicClientApplication(msalConfig);

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

  const handleMicrosoftLogin = async () => {
    console.log('Microsoft-Login-Button geklickt');
    setLoading(true);
    setServerError('');
    try {
      console.log('Starte MSAL-Initialisierung');
      await msalInstance.initialize();
      console.log('Starte loginPopup');
      const loginResponse = await msalInstance.loginPopup({ scopes: ['openid', 'profile', 'email'] });
      console.log('LoginResponse:', loginResponse);
      const msToken = loginResponse.idToken;
      let res;
      try {
        res = await api.post('/auth/microsoft', { token: msToken });
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setServerError('Dein Microsoft-Account ist nicht für den Zugang freigeschaltet. Bitte wende dich an den Administrator.');
        } else {
          setServerError('Microsoft-Login fehlgeschlagen');
        }
        setLoading(false);
        return;
      }
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      console.error('Fehler bei loginPopup:', err);
      setServerError('Microsoft-Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2} align="center">Login</Typography>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        startIcon={<MicrosoftIcon />}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
        onClick={handleMicrosoftLogin}
        disabled={loading}
      >
        Mit Microsoft 365 anmelden
      </Button>
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