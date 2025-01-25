import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import NumbersIcon from '@mui/icons-material/Numbers';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RttIcon from '@mui/icons-material/Rtt';

interface FieldDisplayProps {
  name: string;
  dataType: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'black';
}

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color?: FieldDisplayProps['color'] }>(({ theme, color = 'primary' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  color: color === 'black' ? theme.palette.common.black : theme.palette[color].main,
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
}));

const FieldDisplay: React.FC<FieldDisplayProps> = ({ name, dataType, color = 'primary' }) => {
  const getIcon = () => {
    const type = dataType.toLowerCase();
    if (['int', 'decimal', 'float', 'double', 'number', 'bigint'].includes(type)) {
      return <NumbersIcon />;
    }
    if (['string', 'text'].includes(type)) {
      return <RttIcon />;
    }
    if (type === 'date') {
      return <CalendarMonthIcon />;
    }
    if (type === 'timestamp') {
      return <AccessTimeIcon />;
    }
    return <TextFieldsIcon />;
  };

  return (
    <StyledBox sx={{}}>
      <IconWrapper color={color}>
        {getIcon()}
      </IconWrapper>
      <Box sx={{ margin: 0,
        lineHeight: '1.5',
        letterSpacing: '0.00938em'
      }}>
        {name}
      </Box>
    </StyledBox>
  );
};

export default FieldDisplay;
