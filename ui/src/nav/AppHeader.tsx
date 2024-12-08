import { useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import Badge from "@mui/material/Badge";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import { styled } from "@mui/material/styles";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import NotificationsDrawer from '../component/NotificationsDrawer';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { alpha } from '@mui/material/styles';
import AppBreadcrumbs from "./AppBreadcrumbs";
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';

interface AppBarProps extends MuiAppBarProps {
  drawerOpen: boolean;
  drawerWidth: number;
}

interface AppHeaderProps {
  drawerOpen: boolean;
  drawerWidth: number;
  setOpen: (open: boolean | ((prevOpen: boolean) => boolean)) => void;
  homeName: string;
  menus: Array<{
    key: string;
    label: string;
    children?: Array<{
      key: string;
      label: string;
    }>;
  }>;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "drawerOpen" && prop !== "drawerWidth",
})<AppBarProps>(({ theme, drawerOpen, drawerWidth }) => ({
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  borderBottom: "1px solid #dcdfe4",
  boxShadow: "none",
  ...(drawerOpen && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!drawerOpen && {
    marginLeft: theme.spacing(7),
    width: `calc(100% - ${theme.spacing(7)})`,
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${theme.spacing(8)})`,
    },
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// 创建一个自定义的 Toolbar 组件
const MinHeightToolbar = styled(Toolbar)({
  minHeight: '50px !important', // 强制覆盖默认的 minHeight
  '@media (min-width: 600px)': {
    minHeight: '50px !important', // 确保在所有断点上保持一致的高度
  }
});

// 添加示例通知数据
const mockNotifications = [
  {
    id: '1',
    title: 'System Update',
    content: 'A new system update is available. Please update at your earliest convenience.',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: '2',
    title: 'New Message',
    content: 'You have received a new message from the administrator.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    title: 'Task Completed',
    content: 'The background task has been completed successfully.',
    time: '2 hours ago',
    read: true,
  },
  // ... 可以添加更多通知
];

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.text.secondary,
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    borderWidth: '1px',
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: '300px',
  transition: 'all 0.2s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    height: '1.4375em',
    fontSize: '0.875rem',
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.8,
    },
  },
}));

export default ({
  drawerOpen,
  drawerWidth,
  setOpen,
  homeName,
  menus,
}: AppHeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [searchValue, setSearchValue] = useState('');

  const handleNotificationsClick = () => {
    setNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
  };

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar
        position="fixed"
        drawerOpen={drawerOpen}
        drawerWidth={drawerWidth}
        color={"transparent"}
      >
        <MinHeightToolbar>
          <IconButton
            size="small"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={() => {
              setOpen((open) => !open);
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ 
            display: { xs: "none", sm: "block" },
            flex: 1,
          }}>
            <AppBreadcrumbs 
              menus={menus}
              homeName={homeName}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ 
            display: { xs: "none", md: "flex" },
            alignItems: 'center',
            gap: 2,
          }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Search>
            <IconButton
              size="small"
              aria-label="show 17 new notifications"
              onClick={handleNotificationsClick}
              sx={{ 
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <Badge badgeContent={17} color="error">
                <NotificationsOutlined />
              </Badge>
            </IconButton>
            <IconButton
              size="small"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleAccountClick}
              sx={{ 
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <AccountCircleOutlined />
            </IconButton>
          </Box>
        </MinHeightToolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleAccountClose}
        onClick={handleAccountClose}
        PaperProps={{
          elevation: 4,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
            mt: 1.5,
            minWidth: 220,
            '& .MuiMenuItem-root': {
              minHeight: 42,
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '& .MuiListItemIcon-root': {
                color: 'text.secondary',
                minWidth: 36,
              },
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ 
          px: 2, 
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: theme => `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            John Doe
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            john.doe@example.com
          </Typography>
        </Box>
        <Box sx={{ py: 1 }}>
          <MenuItem>
            <ListItemIcon>
              <PersonOutlineOutlined fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Profile</Typography>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Settings</Typography>
          </MenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <MenuItem sx={{ 
            color: 'error.main',
            '& .MuiListItemIcon-root': {
              color: 'error.main',
            }
          }}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </Box>
      </Menu>

      <NotificationsDrawer
        open={notificationsOpen}
        onClose={handleNotificationsClose}
        notifications={mockNotifications}
      />
    </>
  );
};
