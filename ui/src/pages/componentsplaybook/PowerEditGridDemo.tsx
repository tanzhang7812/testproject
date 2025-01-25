import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import PowerEditGrid, { ValidationError, GridChangeInfo } from '../../component/PowerEditGrid';
import FieldDisplay from '../../component/form/FieldDisplay';

export default function PowerEditGridDemo() {
  const handleValidate = (errors: ValidationError[]) => {
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
    }
  };

  const handleValueChange = (changeInfo: GridChangeInfo) => {
    console.log('Change type:', changeInfo.type);
    console.log('New data:', changeInfo.data);
    console.log('Validation:', changeInfo.validation);
    if (changeInfo.changes) {
      console.log('Changes:', changeInfo.changes);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Power Edit Grid Demo
        </Typography>
        <Typography sx={{ mb: 2 }}>
          A powerful editable data grid component with advanced features.
        </Typography>
        <FieldDisplay name="age" dataType="int" color="black" />
        <FieldDisplay name="name" dataType="string" color="primary" />
        <FieldDisplay name="status" dataType="string" color="success" />  
      </Paper>

      <Paper sx={{ p: 3}}>
        <PowerEditGrid 
          fields={fieldConfig} 
          data={data}
          selectedRowIds={['1','2']}
          features={{
            add: true,
            delete: true,
            export: true,
            drag: true
          }}
          onValidate={handleValidate}
          onValueChange={handleValueChange}
          onSelectedChange={(selectedIds) => {
            console.log('Selected rows:', selectedIds);
            // 处理选中状态变化
          }}
        />
      </Paper>
    </Box>
  );
} 

const fieldConfig = [
    {
        name: 'name',
        label: 'Name',
        type: 'textinput',
        required: true,
        width: 200,
        cell: (value: string,row: any) => {
            return <FieldDisplay name={value} dataType={row.dataType} color="black"/>
        }
    },
    {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        width: 200,
        options: [{label: 'man', value: 'man'}, {label: 'woman', value: 'woman'}],
    },
    {
        name: 'isStudent',
        label: 'Is Student',
        type: 'checkbox',
        required: true,
        width: 200,
    },
    {
        name: 'birthday',
        label: 'Birthday',
        type: 'date',
        required: true,
        width: "*",
    }
];

const data = [
    {
      id: '1',
      name: 'name',
      dataType: 'string',
      gender: 'man',
      isStudent: true,
      birthday: '2020-01-01'
    },
    {
        id: '2',
        name: 'gender',
        dataType: 'string',
        gender: 'man',
        isStudent: true,
        birthday: '2020-01-01'
    },
    {
        id: '3',
        name: 'isStudent',
        dataType: 'number',
        gender: 'woman',
        isStudent: false,
        birthday: '2000-01-01'
    },
    {
        id: '4',
        name: 'birthday',
        dataType: 'date',
        gender: 'man',
        isStudent: true,
        birthday: '2022-02-01'
    }
];