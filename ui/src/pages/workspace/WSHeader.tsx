import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { AppBar } from '@mui/material';



interface WSHeaderProps {
  title?: string;
}
// 创建 WSHeader 组件
export const Header = styled(AppBar)(({ theme }) => ({
    position: 'relative',
    height: '50px',
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none',
    '& .MuiToolbar-root': {
      height: '50px',
      minHeight: '50px',
      padding: theme.spacing(0, 2),
    },
  }));
  
export default function WSHeader({ title = 'Workflow name' }: WSHeaderProps) {
  return (
    <Header>
      <Toolbar>
        <Typography 
          variant="subtitle1" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: 'common.white',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            sx={{ 
              color: 'common.white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <HelpOutlineIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{ 
              color: 'common.white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <AccountCircleOutlinedIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </Header>
  );
} 