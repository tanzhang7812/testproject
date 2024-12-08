import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { styled, lighten, darken } from '@mui/system';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import {forwardRef} from "react";
import Box from '@mui/material/Box';

interface SelectOption {
    label: string;
    value: string | number;
    group?: string;
}

interface SelectProps {
    options: SelectOption[];
    error?: boolean;
    helperText?: string;
    placeHolder?: string;
    onChange: (value: string | number | null) => void;
    value?: string | number;
    disabled?: boolean;
}

interface GroupLabelProps {
  children: React.ReactNode;
  className?: string;
}

const GroupLabel: React.FC<GroupLabelProps> = ({ children, className }) => (
  <Box className={className}>
    {children}
  </Box>
);

const GroupHeader = styled('div',{
    shouldForwardProp: (prop) => prop !== "groupName"
})(({ groupName,theme }) => (groupName?{
    position: 'sticky',
    top: '-8px',
    padding: '4px 10px',
    color: theme.palette.primary.main,
    backgroundColor:
        theme.palette.mode === 'light'
            ? lighten(theme.palette.primary.light, 0.85)
            : darken(theme.palette.primary.main, 0.8),
}:{}));

const GroupItems = styled('ul')({
    padding: 0,
});

export default forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
    const {options, error, helperText, placeHolder, onChange, value, disabled} = props;
    const selectedOption = value ? options.find(el => el.value === value) : null;

    return (
        <Autocomplete
            options={options}
            groupBy={(option) => option.group || ''}
            getOptionLabel={(option) => option?.label || ''}
            onChange={(e, newValue) => {
                // 当清除选项时，newValue 为 null
                onChange(newValue ? newValue.value : null);
            }}
            isOptionEqualToValue={(option, value) => {
                return option?.value === value?.value;
            }}
            sx={{ width: "100%" }}
            size={'small'}
            ref={ref}
            value={selectedOption}
            disabled={disabled}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    error={error} 
                    helperText={helperText} 
                    label={placeHolder} 
                />
            )}
            renderGroup={(params) => (
                <li key={params.key}>
                    <GroupHeader groupName={params.group}>{params.group}</GroupHeader>
                    <GroupItems>{params.children}</GroupItems>
                </li>
            )}
        />
    );
});
