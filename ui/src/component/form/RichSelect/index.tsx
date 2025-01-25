import React, { useState, forwardRef } from 'react';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import { styled, SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface RichSelectOption {
  id: string | number;
  title?: string;
  description?: string;
  image?: string;
  content?: React.ReactNode;
}

interface RichSelectProps {
  options: RichSelectOption[];
  value: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  multiple?: boolean;
  columns?: number;
  width?: number | string;
  height?: number | string;
  gap?: number;
  disabled?: boolean;
  imageStyle?: SxProps;
  titleAlign?: 'left' | 'center' | 'right';
}

const SelectBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'multiple' && prop !== 'disabled'
})<{ selected?: boolean; multiple?: boolean; disabled?: boolean }>(({ theme, selected, disabled }) => ({
  position: 'relative',
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: selected 
    ? alpha(theme.palette.primary.main, 0.02) 
    : disabled 
      ? theme.palette.action.disabledBackground 
      : 'transparent',
  opacity: disabled ? 0.6 : 1,

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: alpha(theme.palette.primary.main, 0.04),
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },

  '&:hover': !disabled && {
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
    '&::before': {
      opacity: 1,
    },
  },

  '& .MuiCheckbox-root, .MuiRadio-root': {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: theme.spacing(0.5),
    color: selected ? theme.palette.primary.main : theme.palette.action.active,
    transition: 'all 0.2s ease',
    zIndex: 1,
  },

  '& .MuiTypography-root': {
    transition: 'transform 0.2s ease',
  },

  '& img': {
    transition: 'transform 0.2s ease',
  },

  '&:hover img': {
    transform: 'scale(1.02)',
  },
}));

const ImageContainer = styled(Box)({
  marginBottom: 8,
  overflow: 'hidden',
  borderRadius: 4,
  '& img': {
    objectFit: 'cover',
    display: 'block',
  },
});

export default function RichSelect({
  options,
  value,
  onChange,
  multiple = false,
  columns = 3,
  width = 'auto',
  height = 'auto',
  gap = 2,
  disabled = false,
  imageStyle,
  titleAlign = 'left',
}: RichSelectProps) {
  const isSelected = (optionId: string | number) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionId);
    }
    return value === optionId;
  };

  const handleSelect = (optionId: string | number) => {
    if (disabled) return;
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(optionId)
        ? currentValue.filter(v => v !== optionId)
        : [...currentValue, optionId];
      onChange(newValue);
    } else {
      onChange(optionId);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        width: '100%',
      }}
    >
      {options.map((option) => {
        const selected = isSelected(option.id);

        return (
          <SelectBox
            key={option.id}
            selected={selected}
            multiple={multiple}
            disabled={disabled}
            onClick={() => !disabled && handleSelect(option.id)}
            sx={{
              width,
              height,
            }}
          >
            {multiple ? (
              <Checkbox
                size='small'
                checked={selected}
                onClick={(e) => e.stopPropagation()}
                onChange={() => !disabled && handleSelect(option.id)}
                disabled={disabled}
              />
            ) : (
              <Radio
                size='small'
                checked={selected}
                onClick={(e) => e.stopPropagation()}
                onChange={() => !disabled && handleSelect(option.id)}
                disabled={disabled}
              />
            )}

            {option.image && (
              <ImageContainer sx={imageStyle}>
                <img src={option.image} alt={option.title}/>
              </ImageContainer>
            )}

            {option.title && (
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, textAlign: titleAlign }}>
                {option.title}
              </Typography>
            )}

            {option.description && (
              <Typography variant="body2" color="text.secondary">
                {option.description}
              </Typography>
            )}

            {option.content && (
              <Box sx={{ mt: 'auto' }}>
                {option.content}
              </Box>
            )}
          </SelectBox>
        );
      })}
    </Box>
  );
} 