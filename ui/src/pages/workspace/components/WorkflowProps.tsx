import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import PowerForm from '../../../component/form/PowerForm';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormProvider } from '../../../component/form/PowerFormContext';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

interface Parameter {
  key: string;
  value: string;
}

interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  parameters: Parameter[];
}

interface WorkflowPropsProps {
  config: WorkflowConfig;
  onChange?: (config: WorkflowConfig) => void;
}

const PREDEFINED_FUNCTIONS = [
  'current_day()',
  'previous_business_day()'
];

const basicFields = [
  {
    name: 'id',
    label: 'ID',
    type: 'textinput',
    disabled: true, 
  },
  {
    name: 'name',
    label: 'Name',
    type: 'textinput',
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea'
  },
];

const ParameterList = ({ parameters, onAdd, onDelete, onChange }: {
  parameters: Parameter[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  onChange: (index: number, field: 'key' | 'value', value: string) => void;
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ flex: 1 }}>Parameters</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add Parameter
        </Button>
      </Box>
      {parameters.map((param, index) => (
        <Box 
          key={index}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 1,
            p: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <TextField
            size="small"
            label="Key"
            value={param.key}
            onChange={(e) => {
                //onChange(index, 'key', e.target.value)
            }}
            sx={{ flex: 1 }}
          />
          <Autocomplete
            size="small"
            freeSolo
            options={PREDEFINED_FUNCTIONS}
            value={param.value}
            onChange={(_, newValue) => {
                //onChange(index, 'value', newValue || '')
            }}
            onInputChange={(_, newValue) =>{
                // onChange(index, 'value', newValue)
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Value"
                sx={{ flex: 1 }}
              />
            )}
            sx={{ flex: 1 }}
          />
          <IconButton 
            size="small" 
            onClick={() =>{
                // onDelete(index)
            }}
            sx={{ 
              color: 'error.main',
              '&:hover': {
                color: 'error.dark',
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

const WorkflowProps = ({ config, onChange }: WorkflowPropsProps) => {
    
  const handleAddParameter = () => {
    const newConfig = {
      ...config,
      parameters: [
        ...config.parameters,
        { key: '', value: '' }
      ]
    };
    onChange?.(newConfig);
  };

  const handleDeleteParameter = (index: number) => {
    const newConfig = {
      ...config,
      parameters: config.parameters.filter((_, i) => i !== index)
    };
    onChange?.(newConfig);
  };

  const handleParameterChange = (index: number, field: 'key' | 'value', value: string) => {
    const newParameters = [...config.parameters];
    newParameters[index] = {
      ...newParameters[index],
      [field]: value
    };
    const newConfig = {
      ...config,
      parameters: newParameters
    };
    onChange?.(newConfig);
  };

  return (
    <Box>
      <FormProvider defaultValue={{
          id: config.id,
          name: config.name,
          description: config.description,
        }}>
        <PowerForm
          fields={basicFields}
          labelWidth={100}
        />
      </FormProvider>
      <ParameterList
        parameters={config.parameters}
        onAdd={handleAddParameter}
        onDelete={handleDeleteParameter}
        onChange={handleParameterChange}
      />
    </Box>
  );
};

export default WorkflowProps; 