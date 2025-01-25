import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, Tabs, Tab } from '@mui/material';
import PowerForm from '../../../component/form/PowerForm';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormProvider } from '../../../component/form/PowerFormContext';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useWorkflow, useWorkflowState } from '../context/WorkflowContext';
import { Variables } from '../WorkflowConstants';
import { DynamicItem } from '../../../component/DynamicItemManage';
import DynamicItemManage from '../../../component/DynamicItemManage';

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

const ParameterList = ({ variables, onAdd, onDelete, onChange }: {
  variables: Variables[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  onChange: (index: number, field: 'key' | 'value', value: string) => void;
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ flex: 1 }}>Variables</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add Variable
        </Button>
      </Box>
      {variables.map((variable, index) => (
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
            value={variable.key}
            onChange={(e) => {
                onChange(index, 'key', e.target.value)
            }}
            sx={{ flex: 1 }}
          />
          <Autocomplete
            size="small"
            freeSolo
            options={PREDEFINED_FUNCTIONS}
            value={variable.value}
            onChange={(_, newValue) => {
                onChange(index, 'value', newValue || '')
            }}
            onInputChange={(_, newValue, reason) =>{
              if (reason === 'input') {
                onChange(index, 'value', newValue)
              }
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
               onDelete(index)
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

const WorkflowProps = () => {

  const { workflowInfoProps, variablesProps,targetTab, componentsPropsProps, handleWorkflowPropsChange } = useWorkflow()
  const [currentTab, setCurrentTab] = useState(targetTab.workflowprops);
  const [variables, setVariables] = useState(variablesProps.variables)
  useEffect(()=>{
    setVariables(variablesProps.variables)
  },[variablesProps.variables])
  useEffect(()=>{
    setCurrentTab(targetTab.workflowprops)
  },[targetTab.workflowprops])
  const handleAddVariable = () => {
    const newVariables = [...variables, { key: '', value: '' }]
    handleWorkflowPropsChange('variables', newVariables)
    setVariables(newVariables)
  };

  const handleDeleteVariable = (index: number) => {
    const newVariables = variables.filter((_, i) => i !== index)
    handleWorkflowPropsChange('variables', newVariables)
    setVariables(newVariables)
  };

  const handleVariableChange = (index: number, field: 'key' | 'value', value: string) => {
    const newVariables = [...variables];
    newVariables[index] = {
      ...newVariables[index],
      [field]: value
    };
    handleWorkflowPropsChange('variables', newVariables)
    setVariables(newVariables)
  };
  const [items, setItems] = useState<DynamicItem[]>(initialItems);
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs 
        value={currentTab} 
        onChange={(_, newValue) => setCurrentTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Information" />
        <Tab label="Variables" />
      </Tabs>

      {currentTab === 0 && (
        <Box sx={{ flex: 1, overflow: 'auto',p:1  }}>
          <FormProvider 
            defaultValue={{
              id: workflowInfoProps.id,
              name: workflowInfoProps.name,
              description: workflowInfoProps.description,
            }}
          onValueChange={(values) => {
            handleWorkflowPropsChange('workflowInfo', values);
          }}
        >
          <PowerForm
            fields={basicFields}
            labelWidth={100}
          />
        </FormProvider>
        </Box>
      )}

      {currentTab === 1 && (
        <Box sx={{ flex: 1, overflow: 'auto',p:2 }}>
            <DynamicItemManage
                    title=""
                    fields={fields}
                    items={items}
                    onChange={setItems}
                    defaultValue={{
                        name: '',
                        type: 'CurrentDay',
                        format: 'YYYY-MM-DD'
                    }}
                    group={group}
                    dynamicFormRef={dynamicFormRef}
                    idField="name"
                />
        </Box>
      )}
    </Box>
  );
};

export default WorkflowProps; 


const fields = [
  {
      name: 'name',
      label: 'Name',
      type: 'textinput',
      required: true,
      validateStrict: (value: string) => {
        if (!value) return true; // Skip validation if empty
        const validPattern = /^[a-zA-Z0-9_\.]+$/;
        if(!validPattern.test(value)){
            return 'Name must be made up of letters, numbers, underscores, and dots';
        }
        return true;
    }
  },
  {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options:[{label:'CurrentDay',value:'CurrentDay'},{label:'PlainText',value:'PlainText'}],
  }
];

const group = {
  'param': {
      name: 'Parameter',
      header: 'divider',    
      orient: 'v',
      inline: true
  }
};

const dynamicFormRef = {
  'type': {
      'CurrentDay': [
          {
              name: 'format',
              label: 'Format',
              type: 'select',
              required: true,
              options:[{label:'YYYY-MM-DD',value:'YYYY-MM-DD'},{label:'YYYY/MM/DD',value:'YYYY/MM/DD'}],
              group:'param',
          }
      ],
      'PlainText': [
          {
              name: 'format',
              label: 'Format',
              type: 'textinput',
              required: true,
              group:'param',
          }
      ]
  }
};

const initialItems: DynamicItem[] = [
  {
      id: '1',
      name: 'Current Date',
      type: 'CurrentDay',
      format: 'YYYY-MM-DD'
  }
];