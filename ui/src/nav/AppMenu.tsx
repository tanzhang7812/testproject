import React, { useState, useRef, useMemo } from "react";
import { CSSObject, styled, Theme } from "@mui/material/styles";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import logo from "../assets/img/connect.svg";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import MuiListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Home from "@mui/icons-material/Home";
import Settings from "@mui/icons-material/Settings";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ArrowRight from "@mui/icons-material/ArrowRight";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import MenuList from "@mui/material/MenuList";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { Popover, SvgIconProps } from "@mui/material";
import { usePrevious } from "../component/hooks";
import { fontSize, fontWeight } from "@mui/system";
import MuiLink from "@mui/material/Link";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import LightModeIcon from '@mui/icons-material/LightMode';
import NightlightOutlinedIcon from '@mui/icons-material/NightlightOutlined';
import {useTranslation} from "react-i18next";
import {useSettings, useSettingsDispatch} from "../AppContext.tsx";
import SecurityIcon from '@mui/icons-material/Security';


interface MenuDrawerProps extends DrawerProps {
  width: number;
  style?: object;
}

interface AppDrawerProps {
  width?: number;
  open: boolean;
  drawerStyle?: object;
  menus: Array<Menuprops>;
}

interface Menuprops {
  key: string;
  label: string;
  icon: React.ElementType;
  children?: object;
}

const openedMixin = (
  theme: Theme,
  width: number,
  style?: object
): CSSObject => ({
  width: width,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  ...style,
});

const closedMixin = (theme: Theme, style?: object): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  ...style,
});

const MenuDrawer = styled(Drawer, {
  shouldForwardProp: (prop) =>
    prop !== "open" && prop !== "width" && prop !== "style",
})<MenuDrawerProps>(({ theme, open, width, style }) => ({
  width: width,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme, width),
    "& .MuiDrawer-paper": openedMixin(theme, width, style),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme, style),
  }),
}));

const DrawerHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  minHeight: '50px !important',
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  '@media (min-width: 600px)': {
    minHeight: '50px !important',
  }
}));

const ListItemText = styled(MuiListItemText)(({ theme }) => ({
  "& .MuiTypography-root": {
    fontSize: "0.875rem",
    color: theme.palette.grey[200],
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  },
}));

export default ({
  width = 230,
  open,
  drawerStyle = {},
  menus = []
}: AppDrawerProps) => {
  const [activeKey, setActiveKey] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();

  const curMenus = useMemo(() => {
    return menus.map((meu) => {
      const cm = {
        ...meu,
        level: 0,
      };
      if (cm.children) {
        cm.children = (cm.children as any[]).map((ccm) => ({
          ...ccm,
          level: 1,
        }));
      }
      return cm;
    });
  }, [menus]);
  const menuItemClick = (key: string) => {
    setActiveKey(key);
    if (key === "home") {
      navigate(`/`);
    } else {
      navigate(`/${key}`);
    }
  };
  const cpath = location.pathname.substring(1);
  const acturalActiveKey = cpath === "" ? "home" : cpath;

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const onSettingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const openSetting = Boolean(anchorEl);

  return (
    <>

      <AppSettings openSetting={openSetting} anchorEl={anchorEl} handleClose={handleClose}/>
      <MenuDrawer
        variant="permanent"
        open={open}
        width={width}
        style={drawerStyle}
      >
        <DrawerHeader>
          <img src={logo} alt={"logo"}></img>
          {open ? (
            <div
              style={{
                color: "white",
                marginLeft: "10px",
                fontSize: "1rem",
                fontFamily: "fantasy",
                backgroundColor: "cadetblue",
                display: "inline-block",
                padding: "2px 6px",
                borderRadius: "10px",
              }}
            >
              Gen FWK
            </div>
          ) : undefined}
        </DrawerHeader>
        <Divider></Divider>
        <List disablePadding>
          {curMenus.map((cm, index) => {
            return (
              <React.Fragment key={cm.key + '-' + index}>
                <AppMenuItem
                  open={open}
                  key={cm.key}
                  active={cm.key === acturalActiveKey}
                  level={cm.level}
                  ckey={cm.key}
                  label={cm.label}
                  icon={cm.icon}
                  menuItemClick={menuItemClick}
                  onSettingClick={onSettingClick}
                >
                  {cm.children
                    ? cm.children.map((ccm: any, childIndex: number) => {
                        return (
                          <AppMenuItem
                            open={open}
                            key={ccm.key + '-' + childIndex}
                            active={ccm.key === acturalActiveKey}
                            level={ccm.level}
                            ckey={ccm.key}
                            label={ccm.label}
                            menuItemClick={menuItemClick}
                          />
                        );
                      })
                    : undefined}
                </AppMenuItem>
                {cm.key === "home" ? <Divider key={`divider-${index}`} /> : undefined}
              </React.Fragment>
            );
          })}
          <Divider></Divider>
        </List>
      </MenuDrawer>
    </>
  );
};
function AppSettings({openSetting,anchorEl,handleClose}:{openSetting:boolean,anchorEl:Element|null,handleClose:Function}){
  const {t,mode,language}=useSettings();
  const {changeLanguage,changeMode}=useSettingsDispatch()
  return <Popover
      open={openSetting}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "center",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
      sx={{ ml: "20px" }}
  >
   <Box sx={{minWidth:'350px',paddingBottom:'10px'}}>
     <Box sx={{padding:"10px"}}>
       Settings
     </Box>

     <Divider></Divider>
     <Box sx={{padding:"10px"}}>
       <Typography sx={{fontSize:'0.8rem',color:'grey.700'}}>language</Typography>
       <Box sx={{display:'flex',justifyContent:'center'}}>
       <ButtonGroup sx={{marginTop:'10px'}} variant="outlined" aria-label="Basic button group">
         <Button sx={{width:'100px'}} variant={language=='en'?'contained':'outlined'} onClick={()=>{changeLanguage('en')}}>English</Button>
         <Button sx={{width:'100px'}} variant={language=='zh_CN'?'contained':'outlined'} onClick={()=>{changeLanguage('zh_CN')}}>中文</Button>
       </ButtonGroup>
       </Box>
     </Box>
     <Box sx={{padding:"10px"}}>
       <Typography sx={{fontSize:'0.8rem',color:'grey.700'}}>mode</Typography>
       <Box sx={{display:'flex',justifyContent:'center'}}>
         <ButtonGroup sx={{marginTop:'10px'}} variant="outlined" aria-label="Basic button group">
           <Button sx={{width:'100px'}} startIcon={<LightModeIcon/>} variant={mode=='light'?'contained':'outlined'} onClick={()=>{changeMode('light')}}>{t('settings.light')}</Button>
           <Button sx={{width:'100px'}} startIcon={<NightlightOutlinedIcon/>} variant={mode=='dark'?'contained':'outlined'} onClick={()=>{changeMode('dark')}}>{t('settings.dark')}</Button>
         </ButtonGroup>
       </Box>
     </Box>
   </Box>
  </Popover>
}
interface AppMenuItemProps {
  open: boolean;
  active: boolean;
  level: number;
  ckey: string;
  label: string;
  icon?: React.ElementType;
  children?: React.ReactNode;
  menuItemClick: (key: string) => void;
  onSettingClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function AppMenuItem({
  open,
  active,
  level,
  ckey,
  label,
  icon,
  children,
  menuItemClick,
  onSettingClick,
}: AppMenuItemProps) {
  const [listopen, setListOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const MenuIcon = icon;

  // 检查是否有子菜单被选中
  const hasSelectedChild = React.useMemo(() => {
    if (!children) return false;
    const currentPath = location.pathname.substring(1);
    let isChildSelected = false;
    React.Children.forEach(children, (child: any) => {
      if (child.props.ckey === currentPath) {
        isChildSelected = true;
      }
    });
    return isChildSelected;
  }, [children, location]);

  // 当前菜单是否应该显示选中状态
  // 在菜单隐藏状态下，如果子菜单被选中，父菜单也显示选中状态
  // 在菜单展开状态下，父菜单不显示选中状态
  const isActive = active || (!open && hasSelectedChild);

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!open) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMouseLeave = () => {
    if (!open) {
      setAnchorEl(null);
    }
  };

  const handleMenuItemClick = (key: string) => {
    menuItemClick(key);
    setAnchorEl(null);
  };

  return (
    <ListItem
      sx={{
        display: children ? "block" : "flex",
        borderLeft: level !== 0 ? "1px dashed #878787ba" : "0px",
        pl: "15px",
      }}
      disablePadding={level !== 0}
    >
      <ListItemButton
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={
          level == 0
            ? {
                height: 40,
                justifyContent: open ? "initial" : "center",
                borderRadius: "10px",
                backgroundColor: isActive ? "#22658b !important" : "unset",
                cursor: (!open && children) ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.08)',
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 0.3s ease',
                },
                '&:hover': (!open && children) ? {
                  backgroundColor: isActive ? "#22658b !important" : 'unset'
                } : {
                  backgroundColor: isActive ? "#22658b !important" : 'unset',
                  '&::before': {
                    transform: 'scaleX(1)',
                  }
                }
              }
            : {
                height: 35,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
                borderRadius: "10px",
                backgroundColor: isActive ? "#22658b !important" : "unset",
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255, 255, 255, 0.08)',
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 0.3s ease',
                },
                '&:hover': {
                  backgroundColor: isActive ? "#22658b !important" : 'unset',
                  '&::before': {
                    transform: 'scaleX(1)',
                  }
                }
              }
        }
        onClick={
          children 
            ? open 
              ? () => setListOpen(!listopen)
              : undefined
            : () => menuItemClick(ckey)
        }
      >
        {MenuIcon && (
          !open ? (
            children ? (
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 1 : "auto",
                  justifyContent: "center",
                  color: "grey.200",
                }}
              >
                <MenuIcon />
              </ListItemIcon>
            ) : (
              <Tooltip 
                title={label} 
                placement="right"
                arrow
                enterDelay={200}
                leaveDelay={0}
                open={!!anchorEl}
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      '& .MuiTooltip-arrow': {
                        color: 'background.paper',
                      },
                      boxShadow: '0 2px 10px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.3)',
                      fontSize: '0.875rem',
                      padding: '6px 12px',
                      borderRadius: '4px'
                    }
                  },
                  popper: {
                    sx: {
                      zIndex: 2400
                    }
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 1 : "auto",
                    justifyContent: "center",
                    color: "grey.200",
                  }}
                >
                  <MenuIcon />
                </ListItemIcon>
              </Tooltip>
            )
          ) : (
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 1 : "auto",
                justifyContent: "center",
                color: "grey.200",
              }}
            >
              <MenuIcon />
            </ListItemIcon>
          )
        )}
        
        {open && (
          <>
            <ListItemText primary={label} />
            {children && (
              <KeyboardArrowDown
                sx={{
                  mr: -1,
                  color: "grey.200",
                  transform: listopen ? "rotate(-180deg)" : "rotate(0)",
                  transition: "0.2s",
                }}
              />
            )}
          </>
        )}
      </ListItemButton>

      {!open && children && (
        <Popper
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          placement="right-start"
          sx={{ zIndex: 1300 }}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 0],
              },
            },
          ]}
        >
          <Box
            onMouseEnter={() => setAnchorEl(anchorEl)}
            onMouseLeave={() => setAnchorEl(null)}
            sx={{
              display: 'flex',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: -8,
                width: 8,
                height: '100%',
                background: 'transparent',
              }
            }}
          >
            <Paper 
              sx={{ 
                backgroundColor: '#00405c',
                minWidth: 180,
                marginLeft: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 0 3px rgba(0,0,0,0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  padding: '10px 16px',
                  borderBottom: '1px solid',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'grey.200',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {label}
              </Box>
              <MenuList>
                {React.Children.map(children, (child: any, index: number) => {
                  const isSelected = child.props.ckey === location.pathname.substring(1);
                  return (
                    <MenuItem
                      key={child.props.ckey || index}
                      onClick={() => handleMenuItemClick(child.props.ckey)}
                      selected={isSelected}
                      sx={{
                        color: 'grey.200',
                        padding: '8px 15px',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '10px',
                        margin: '0 15px',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255, 255, 255, 0.08)',
                          transform: 'scaleX(0)',
                          transformOrigin: 'left',
                          transition: 'transform 0.3s ease',
                          borderRadius: 'inherit',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#22658b !important',
                          borderRadius: '10px',
                          '&:hover': {
                            backgroundColor: '#22658b !important',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'unset',
                          '&::before': {
                            transform: 'scaleX(1)',
                          }
                        }
                      }}
                    >
                      {child.props.label}
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Paper>
          </Box>
        </Popper>
      )}

      {children && open && (
        <Collapse in={listopen} timeout="auto" unmountOnExit>
          <List component="div" sx={{ ml: 3 }}>
            {children}
          </List>
        </Collapse>
      )}

      {/* {ckey === "home" && open && (
        <Tooltip 
          title="Project Settings" 
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: 'background.paper',
                color: 'text.primary',
                '& .MuiTooltip-arrow': {
                  color: 'background.paper',
                },
                boxShadow: '0 2px 10px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.3)',
                fontSize: '0.875rem',
                padding: '6px 12px',
                borderRadius: '4px'
              }
            }
          }}
        >
          <IconButton
            size="large"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              if (onSettingClick) onSettingClick(event);
            }}
            sx={{
              "& svg": {
                color: "rgba(255,255,255,0.8)",
                transition: "0.2s",
                transform: "translateX(0) rotate(0)",
              },
              "&:hover, &:focus": {
                bgcolor: "unset",
                "& svg:first-of-type": {
                  transform: "translateX(-4px) rotate(-20deg)",
                },
                "& svg:last-of-type": {
                  right: 0,
                  opacity: 1,
                },
              },
              "&::after": {
                content: '""',
                position: "absolute",
                height: "80%",
                display: "block",
                left: 0,
                width: "1px",
                bgcolor: "divider",
              },
            }}
          >
            <Settings />
            <ArrowRight sx={{ position: "absolute", right: 4, opacity: 0 }} />
          </IconButton>
        </Tooltip>
      )} */}
    </ListItem>
  );
}
