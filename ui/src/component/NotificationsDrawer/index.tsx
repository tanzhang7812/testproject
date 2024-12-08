import React, { useState, useMemo } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CircleIcon from '@mui/icons-material/Circle';
import { styled, alpha } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import DoneAllIcon from '@mui/icons-material/DoneAll';

interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  type?: 'success' | 'warning' | 'info' | 'error';
}

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  cursor: 'pointer',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const NotificationDot = styled(CircleIcon)<{ read?: boolean }>(({ theme, read }) => ({
  fontSize: 8,
  color: read ? theme.palette.text.disabled : theme.palette.primary.main,
}));

const TimeText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

const NotificationTypeIcon = styled(CircleIcon)<{ type: 'success' | 'warning' | 'info' | 'error' }>(({ theme, type }) => ({
  fontSize: 16,
  color: theme.palette[type].main,
}));

export default function NotificationsDrawer({ open, onClose, notifications: initialNotifications }: NotificationsDrawerProps) {
  const [searchText, setSearchText] = useState('');
  const [notifications, setNotifications] = useState(initialNotifications);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => 
      notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [notifications, searchText]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 480,
          maxWidth: '100%',
        },
      }}
    >
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon 
            color="primary" 
            sx={{ 
              animation: unreadCount ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' },
              }
            }} 
          />
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography
              variant="caption"
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                ml: 1,
                fontWeight: 600,
              }}
            >
              {unreadCount} new
            </Typography>
          )}
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DrawerHeader>

      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <TextField
          size="small"
          placeholder="Search notifications..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        {notifications.length > 0 && (
          <Button
            variant="text"
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={!unreadCount}
            sx={{ 
              textTransform: 'none',
              whiteSpace: 'nowrap',
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: alpha('#000', 0.04),
              }
            }}
          >
            Mark all read
          </Button>
        )}
      </Box>
      
      <List sx={{ p: 0, height: '100%', overflow: 'auto' }}>
        {filteredNotifications.length === 0 ? (
          <Box
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <NotificationsIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography>
              {searchText ? 'No matching notifications' : 'No notifications'}
            </Typography>
          </Box>
        ) : (
          filteredNotifications.map((notification) => (
            <StyledListItem 
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <NotificationDot read={notification.read} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {notification.type && <NotificationTypeIcon type={notification.type} />}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: notification.read ? 400 : 600,
                        color: notification.read ? 'text.primary' : 'primary.main',
                        mb: 0.5,
                      }}
                    >
                      {notification.title}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{
                        display: 'block',
                        mb: 0.5,
                        opacity: notification.read ? 0.8 : 1,
                      }}
                    >
                      {notification.content}
                    </Typography>
                    <TimeText>
                      {notification.time}
                    </TimeText>
                  </>
                }
              />
            </StyledListItem>
          ))
        )}
      </List>
    </Drawer>
  );
} 