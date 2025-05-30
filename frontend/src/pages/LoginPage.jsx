import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MS_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MS_TENANT_ID}`,
    redirectUri: window.location.origin + '/login',
  },
};
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
    setLoading(true);
    setServerError('');
    try {
      await msalInstance.initialize();
      const loginResponse = await msalInstance.loginPopup({ scopes: ['openid', 'profile', 'email'] });
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
      setServerError('Microsoft-Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#181a1b' }}>
      <div className="card bg-dark text-white shadow p-4 mx-auto" style={{ minWidth: 320, maxWidth: 400, width: '100%' }}>
        <div className="text-center mb-3">
          <img src="/juli-logo.svg" alt="Logo" style={{ width: 60, height: 60 }} className="mb-2" />
          <h3 className="fw-bold">Login</h3>
        </div>
        <button
          className="btn btn-outline-light w-100 mb-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
          onClick={handleMicrosoftLogin}
          disabled={loading}
        >
          <i className="bi bi-microsoft"></i> Mit Microsoft 365 anmelden
        </button>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">E-Mail</label>
            <input
              className={`form-control${errors.email ? ' is-invalid' : ''}`}
              {...register('email', { required: 'E-Mail erforderlich' })}
              disabled={loading}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Passwort</label>
            <input
              type="password"
              className={`form-control${errors.password ? ' is-invalid' : ''}`}
              {...register('password', { required: 'Passwort erforderlich' })}
              disabled={loading}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>
          {serverError && <div className="alert alert-danger py-2">{serverError}</div>}
          <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
            {loading ? 'Einloggen...' : 'Login'}
          </button>
          <div className="mt-3 text-center">
            <Link to="/reset-request" className="link-light small">Passwort vergessen?</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 