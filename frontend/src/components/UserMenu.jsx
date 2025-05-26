import React from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Avatar, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function getUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export default function UserMenu() {
  const user = getUser();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const [showTimeout, setShowTimeout] = React.useState(false);
  const timeoutRef = React.useRef();
  const warningRef = React.useRef();
  const TIMEOUT = 30 * 60 * 1000; // 30 Minuten
  const WARNING = 29 * 60 * 1000; // 29 Minuten
  const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem('darkMode') === 'true');

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleToggleDark = () => {
    localStorage.setItem('darkMode', !darkMode);
    setDarkMode(!darkMode);
    window.dispatchEvent(new Event('themeChange'));
  };

  // Reset-Timeout bei User-Interaktion
  React.useEffect(() => {
    const resetTimeout = () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      setShowTimeout(false);
      warningRef.current = setTimeout(() => setShowTimeout(true), WARNING);
      timeoutRef.current = setTimeout(() => handleLogout(), TIMEOUT);
    };
    resetTimeout();
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimeout));
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimeout));
    };
  }, []);

  return (
    <>
      <Box position="absolute" top={16} right={16}>
        <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
          <Avatar>{user.email[0].toUpperCase()}</Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          <Box px={2} py={1}>
            <Typography variant="subtitle2">{user.email}</Typography>
            <Typography variant="caption" color="text.secondary">{user.role}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleToggleDark}>
            {darkMode ? <Brightness7Icon sx={{ mr: 1 }} /> : <Brightness4Icon sx={{ mr: 1 }} />}
            {darkMode ? 'Helles Design' : 'Dark Mode'}
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
      <Dialog open={showTimeout} onClose={() => setShowTimeout(false)}>
        <DialogTitle>Automatischer Logout</DialogTitle>
        <Box px={3} pb={2}>
          <Typography>Du wirst in 1 Minute automatisch ausgeloggt.<br />Bitte bestätige eine Aktion, um eingeloggt zu bleiben.</Typography>
        </Box>
        <DialogActions>
          <Button onClick={() => setShowTimeout(false)} autoFocus>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 