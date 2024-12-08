import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { styled } from '@mui/material/styles';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';

interface DragZoomPopupProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  defaultPosition?: { x: number; y: number };
  zIndex?: number;
  onFocus?: () => void;
  isActive?: boolean;
}

const PopupHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  background: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'move',
  userSelect: 'none',
  transition: 'background-color 0.2s ease',
}));

const PopupContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  overflow: 'auto',
}));

const PopupOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1500,
  pointerEvents: 'none',
});

export default function DragZoomPopup({
  open,
  onClose,
  title,
  children,
  width = 500,
  height = 400,
  defaultPosition = { x: 100, y: 100 },
  zIndex = 1500,
  onFocus,
  isActive = false,
}: DragZoomPopupProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setIsFullscreen(false);
      setPosition(defaultPosition);
    }
  }, [open, defaultPosition]);

  if (!open) return null;

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (isFullscreen) {
      setPosition(defaultPosition);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    if (dragRef.current) {
      dragRef.current.style.transition = 'none';
    }
    if (onFocus) onFocus();
  };

  const handleDragStop = () => {
    setIsDragging(false);
    if (dragRef.current) {
      dragRef.current.style.transition = 'all 0.3s ease';
    }
  };

  const handleHeaderClick = () => {
    if (onFocus) onFocus();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleFullscreenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFullscreenToggle();
  };

  const popupStyle = isFullscreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        transform: 'none',
        maxWidth: 'none',
        maxHeight: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }
    : {
        position: 'fixed',
        width,
        height,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      };

  return (
    <PopupOverlay style={{ zIndex }}>
      <Draggable
        handle=".drag-handle"
        bounds="parent"
        position={isFullscreen ? { x: 0, y: 0 } : undefined}
        defaultPosition={defaultPosition}
        onStart={handleDragStart}
        onStop={handleDragStop}
        disabled={isFullscreen}
        scale={1}
      >
        <Paper
          ref={dragRef}
          elevation={isDragging ? 16 : (isActive ? 8 : 2)}
          sx={{
            ...popupStyle,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto',
            willChange: 'transform',
            transition: 'all 0.2s ease',
            boxShadow: theme => isActive 
              ? `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`
              : undefined,
            '& .MuiIconButton-root': {
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            },
          }}
          onClick={handleHeaderClick}
        >
          <PopupHeader 
            className="drag-handle"
            onClick={handleHeaderClick}
            sx={{
              cursor: isFullscreen ? 'default' : 'move',
              opacity: isDragging ? 0.8 : 1,
              transition: 'all 0.2s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              msUserSelect: 'none',
              bgcolor: theme => isActive 
                ? alpha(theme.palette.primary.main, 0.04)
                : 'background.paper',
              borderBottom: theme => `1px solid ${isActive 
                ? alpha(theme.palette.primary.main, 0.1)
                : theme.palette.divider}`,
              '&:hover': {
                bgcolor: theme => isActive 
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.action.hover, 0.04),
              }
            }}
          >
            <Box sx={{ 
              flex: 1,
              opacity: isDragging ? 0.8 : 1,
              transition: 'opacity 0.2s ease',
              color: theme => isActive ? 'primary.main' : 'text.primary',
              fontWeight: isActive ? 600 : 400,
            }}>
              {title}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleFullscreenClick}
                sx={{ 
                  color: theme => isActive ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCloseClick}
                sx={{ 
                  color: theme => isActive ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </PopupHeader>
          <PopupContent>{children}</PopupContent>
        </Paper>
      </Draggable>
    </PopupOverlay>
  );
} 