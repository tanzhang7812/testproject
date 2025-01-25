import React, { createContext, useContext, useRef } from 'react';
import Alert, { AlertRef, AlertProps } from './index';

interface AlertContextType {
  show: (props: AlertProps) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const alertRef = useRef<AlertRef>(null);

  const show = (props: AlertProps) => {
    alertRef.current?.show(props);
  };

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      <Alert ref={alertRef} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Global function for non-React code
export const showAlert = (props: AlertProps) => {
  const event = new CustomEvent('show-alert', { detail: props });
  window.dispatchEvent(event);
}; 