import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton } from '@mui/material';
import api from '../api';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function AuditLogPage() {
  const [logs, setLogs] = React.useState([]);
  const navigate = useNavigate();
  React.useEffect(() => { api.get('/auditlog').then(r => setLogs(r.data)); }, []);
  return (
    <Box maxWidth={1100} mx="auto" mt={4}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 1 }}><ArrowBack /></IconButton>
      <Typography variant="h5" mb={2}>Audit-Log</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Datum</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Szenario</TableCell>
            <TableCell>Kreis</TableCell>
            <TableCell>Mitglied</TableCell>
            <TableCell>Empfänger</TableCell>
            <TableCell>Typ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map(l => (
            <TableRow key={l._id}>
              <TableCell>{new Date(l.createdAt).toLocaleString('de-DE')}</TableCell>
              <TableCell>{l.user}</TableCell>
              <TableCell>{l.scenario}</TableCell>
              <TableCell>{l.kreis}</TableCell>
              <TableCell>{l.mitgliedEmail}</TableCell>
              <TableCell>{l.empfaenger.map(e => <Chip key={e} label={e} sx={{ mr: 0.5 }} />)}</TableCell>
              <TableCell>{l.type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
} 