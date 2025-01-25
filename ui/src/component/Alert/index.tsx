import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface AlertProps extends Omit<MuiAlertProps, 'severity'> {
  message: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export interface AlertRef {
  show: (props: AlertProps) => void;
}

const StyledAlert = styled(MuiAlert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: theme.shadows[6],
  '& .MuiAlert-icon': {
    fontSize: '1.5rem',
  },
  '& .MuiAlert-message': {
    fontSize: '0.95rem',
    padding: '6px 0',
  },
}));

const Alert = forwardRef<AlertRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [alertProps, setAlertProps] = useState<AlertProps>({
    message: '',
    severity: 'info',
    duration: 3000,
  });

  useEffect(() => {
    const handleGlobalAlert = (event: Event) => {
      const customEvent = event as CustomEvent<AlertProps>;
      setAlertProps(customEvent.detail);
      setOpen(true);
    };

    window.addEventListener('show-alert', handleGlobalAlert);
    return () => {
      window.removeEventListener('show-alert', handleGlobalAlert);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    show: (props: AlertProps) => {
      setAlertProps(props);
      setOpen(true);
    },
  }));

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={alertProps.duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        top: '35% !important',
        transform: 'translateY(-50%)',
      }}
    >
      <StyledAlert
        onClose={handleClose}
        severity={alertProps.severity}
        variant="filled"
        elevation={6}
      >
        {alertProps.message}
      </StyledAlert>
    </Snackbar>
  );
});

Alert.displayName = 'Alert';

export default Alert; 