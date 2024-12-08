import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Collapse from '@mui/material/Collapse';
import { alpha } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import ListItemButton from '@mui/material/ListItemButton';
import Accordion from '@mui/material/Accordion';
import { ResizableBox } from 'react-resizable';
import InputBase from '@mui/material/InputBase';


// 创建主容器
export const WorkspaceContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
});

export const WSDesignContainer = styled(Box)({
  flex: 1,
  height: 'calc(100% - 50px)',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
});

export const WorkflowDesigner = styled(Box)({
  width: '100%',
  backgroundColor: '#fff',
  overflow: 'auto',
  position: 'relative',
  height: '100%',
});

export  const WorkflowResultContainer = styled(Box)({
  width: '100%',
  backgroundColor: '#fff',
  overflow: 'auto',
  flex: 1,
});


// 修改搜索框样式
export const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.text.secondary,
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
  },
  margin: theme.spacing(2),
  marginBottom: theme.spacing(1),
  height: '32px', // 减小高度
}));

export const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1), // 减小内边距
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  '& .MuiSvgIcon-root': {
    fontSize: '1.1rem', // 减小图标大小
  },
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  height: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.75, 1, 0.75, 0), // 减小内边距
    paddingLeft: `calc(1em + ${theme.spacing(3)})`, // 调整左侧内边距
    width: '100%',
    height: '100%',
    fontSize: '0.8125rem', // 减小字体大小
  },
}));

// 添加 Tab Panel 组件
export const TabPanel = styled(Box)({
  flex: 1,
  height: '100%',
  overflow: 'auto',
});

// 添加 Result 容器样式
export const ResultContainer = styled(Box)({
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
});

// 修改垂直 Tabs 样式
export const VerticalTabs = styled(Tabs)(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    minWidth: '80px', // 增加宽度以适应文字
    minHeight: '80px', // 增加高度以适应文字
    padding: theme.spacing(1),
    flexDirection: 'column', // 设置为纵向排列
    '& .MuiSvgIcon-root': {
      marginBottom: theme.spacing(0.5), // 图标和文字之间的间距
    },
  },
}));

// 组件组标题样式
export const GroupTitle = styled(ListItemButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

// 修改组件项样式
export const ComponentItem = styled(ListItemButton)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  '& .MuiListItemIcon-root': {
    minWidth: 40,
    '& .MuiSvgIcon-root': {
      fontSize: '1.4rem', // 增大图标尺寸
    },
  },
  '& .MuiListItemText-root': {
    margin: 0,
    '& .MuiTypography-root': {
      fontSize: '0.75rem', // 减小文字尺寸
    },
  },
}));

// 修改 Accordion 样式
export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  '&.MuiAccordion-root': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  '& .MuiAccordionSummary-root': {
    minHeight: 40,
    padding: theme.spacing(0, 1),
    '&.Mui-expanded': {
      minHeight: 40,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  '& .MuiAccordionSummary-content': {
    margin: 0,
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  '& .MuiAccordionDetails-root': {
    padding: 0,
  },
}));

// 自定义 ResizableBox 样式
export const StyledResizableBox = styled(ResizableBox)(({ theme }) => ({
  position: 'relative',
  width: '100% !important',
  '& .react-resizable-handle': {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    width: '100% !important',
    height: '8px',
    cursor: 'row-resize',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 1,
    backgroundImage: 'none !important',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      width: '100%',
      top: '50%',
      height: '1px',
      backgroundColor: theme.palette.divider,
    },
    '& .MuiSvgIcon-root': {
      position: 'relative',
      color: theme.palette.text.secondary,
      fontSize: 16,
      padding: '2px',
      backgroundColor: theme.palette.background.paper,
      borderRadius: '4px',
      border: `1px solid ${theme.palette.divider}`,
      transition: 'all 0.2s ease',
    },
    '&:hover': {
      '& .MuiSvgIcon-root': {
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
      '&::before': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
}));

// 修改 ComponentNav 样式
export const ComponentNav = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'collapsed'
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  width: collapsed ? '12px' : 180,
  minWidth: collapsed ? '12px' : 180,
  height: '100%',
  transition: 'all 0.2s ease',
  position: 'relative',
  overflow: 'visible',
  backgroundColor: theme.palette.background.paper,
  flexShrink: 0,
}));

// 修改分割线和图标样式
export const NavDivider = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '1px',
  height: '100%',
  backgroundColor: theme.palette.divider,
}));

// 修改切换按钮样式
export const ToggleButton = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  right: 0,
  width: '24px',
  height: '24px',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '50%',
  transform: 'translate(50%, -50%)',
  zIndex: 10,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease',
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
}));



export const DesignerContainer = styled(Box)({
  display: 'flex',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

export const ComponentSettingContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded'
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: expanded ? 800 : 600,
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1,
  transition: 'all 0.3s ease-in-out',
  boxShadow: expanded 
    ? '0 8px 24px rgba(0,0,0,0.12)' 
    : '0 2px 8px rgba(0,0,0,0.08)',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

export const ComponentSettingHeader = styled(Box)(({ theme }) => ({
  height: '40px',
  minHeight: '40px',
  padding: theme.spacing(0, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiIconButton-root': {
    padding: 6,
    height: 28,
    width: 28,
  },
}));

export const ComponentSettingContent = styled(Box)({
  flex: 1,
  overflow: 'auto',
  padding: '16px',
  transition: 'all 0.3s ease-in-out',
});

// export const WorkflowChartContainer = styled(Box)({
//   position: 'relative',
//   flex: 1,
//   height: '100%',
//   overflow: 'hidden',
// });

export const WorkflowChartContainer = styled(Box)({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
});

export const WorkflowHeader = styled(Box)(({ theme }) => ({
  height: '40px',
  minHeight: '40px',
  padding: theme.spacing(0, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

export const WorkflowContent = styled(Box)({
  width: '100%',
  height: 'calc(100% - 40px)',
  overflow: 'hidden',
  '& .react-flow__container': {
    backgroundColor: 'transparent',
  },
  '& .react-flow__renderer': {
    backgroundColor: 'transparent',
  },
  '& .react-flow__pane': {
    backgroundColor: 'transparent',
  },
  '& .react-flow__node': {
    fontSize: 12,
    '&.selected': {
      boxShadow: '0 0 0 2px #1976d2',
    },
  },
  '& .react-flow__node-default': {
    width: 'auto',
    height: 'auto',
    border: 'none',
    padding: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  '& .react-flow__handle': {
    width: 8,
    height: 8,
    backgroundColor: '#1976d2',
  },
  '& .react-flow__edge-path': {
    stroke: '#1976d2',
  },
  '& .react-flow__controls': {
    boxShadow: '0 0 2px rgba(0,0,0,0.1)',
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#fff',
    '& button': {
      backgroundColor: '#fff',
      borderBottom: '1px solid #eee',
      '&:hover': {
        backgroundColor: '#f5f5f5',
      },
    },
  },
  '& .react-flow__minimap': {
    backgroundColor: '#fff',
    borderRadius: 4,
    boxShadow: '0 0 2px rgba(0,0,0,0.1)',
  },
}); 