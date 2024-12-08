import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DragZoomPopup from '../../component/DragZoomPopup';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

const generateLoremIpsum = () => {
  return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`.repeat(5);
};

interface PopupState {
  id: number;
  open: boolean;
  zIndex: number;
  position: { x: number; y: number };
}

export default function DragZoomPopupDemo() {
  const [popups, setPopups] = useState<PopupState[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1500);

  const handleOpen = () => {
    const newPopup: PopupState = {
      id: Date.now(),
      open: true,
      zIndex: maxZIndex + 1,
      position: { x: 100 + popups.length * 30, y: 100 + popups.length * 30 },
    };
    setPopups([...popups, newPopup]);
    setMaxZIndex(maxZIndex + 1);
  };

  const handleClose = (id: number) => {
    setPopups(popups.filter(popup => popup.id !== id));
  };

  const handleFocus = (id: number) => {
    setPopups(popups.map(popup => ({
      ...popup,
      zIndex: popup.id === id ? maxZIndex + 1 : popup.zIndex,
    })));
    setMaxZIndex(maxZIndex + 1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          DragZoom Popup Demo
        </Typography>
        <Typography sx={{ mb: 2 }}>
          This component demonstrates multiple draggable and zoomable popup windows.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleOpen}>
            Open New Popup
          </Button>
          {popups.length > 0 && (
            <Button variant="outlined" onClick={() => setPopups([])}>
              Close All
            </Button>
          )}
        </Stack>
      </Paper>

      {popups.map((popup, index) => (
        <DragZoomPopup
          key={popup.id}
          open={popup.open}
          onClose={() => handleClose(popup.id)}
          title={
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Popup Window #{index + 1}
            </Typography>
          }
          width={600}
          height={400}
          defaultPosition={popup.position}
          zIndex={popup.zIndex}
          onFocus={() => handleFocus(popup.id)}
          isActive={popup.zIndex === maxZIndex}
        >
          <Typography>
            {generateLoremIpsum()}
          </Typography>
        </DragZoomPopup>
      ))}
    </Box>
  );
} 