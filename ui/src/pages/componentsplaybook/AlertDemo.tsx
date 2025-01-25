import React from 'react';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';
import { useAlert, showAlert } from '../../component/Alert/AlertService';

export default function AlertDemo() {
  const { show } = useAlert();

  const showAlertInReact = (severity: 'success' | 'info' | 'warning' | 'error') => {
    show({
      message: `This is a ${severity} message using React hook!`,
      severity,
      duration: 3000,
    });
  };

  const showAlertGlobally = (severity: 'success' | 'info' | 'warning' | 'error') => {
    showAlert({
      message: `This is a ${severity} message using global function!`,
      severity,
      duration: 3000,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Alert Component Demo
        </Typography>
        <Typography sx={{ mb: 2 }}>
          A global alert system that can be called from anywhere in the application.
          The first row demonstrates using the React hook, while the second row shows using the global function.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Using React Hook (useAlert)
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => showAlertInReact('success')}
          >
            Show Success
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => showAlertInReact('info')}
          >
            Show Info
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => showAlertInReact('warning')}
          >
            Show Warning
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => showAlertInReact('error')}
          >
            Show Error
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Using Global Function
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => showAlertGlobally('success')}
          >
            Show Success
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => showAlertGlobally('info')}
          >
            Show Info
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => showAlertGlobally('warning')}
          >
            Show Warning
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => showAlertGlobally('error')}
          >
            Show Error
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
} 