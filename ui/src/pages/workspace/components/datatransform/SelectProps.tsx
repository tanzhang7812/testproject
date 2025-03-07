import React from 'react';
import { Box, Typography } from '@mui/material';
import PowerEditGrid , { ValidationError, GridChangeInfo }from '../../../../component/PowerEditGrid';
import { ComponentPropsProps } from '../../WorkflowConstants';
import FieldDisplay from '../../../../component/form/FieldDisplay';


const SelectProps: React.FC<ComponentPropsProps> = ({ id,description }) => {
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
    <Box sx={{ height: '100%',p:2 }}>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
      <Box sx={{ p: 1, height: 'calc(100% - 50px)' }}>
        <PowerEditGrid 
            fields={fieldConfig} 
          data={data}
          mode="pick"
          selectedRowIds={['1','2']}
          features={{       
            drag: true
          }}
          onValidate={handleValidate}
          onValueChange={handleValueChange}
          onSelectedChange={(selectedIds: string[]) => {
            console.log('Selected rows:', selectedIds);
            // 处理选中状态变化
          }}
        />
      </Box>
    </Box>
  );
};

export default SelectProps; 

const fieldConfig = [
    {
        name: 'name',
        label: 'Name',
        type: 'textinput',
        width: "*",
        cell: (value: string,row: any) => {
            return <FieldDisplay name={value} dataType={row.dataType} color="black"/>
        } 
    }
];

const data = [
    {
        id: '1',
        name: 'name',
        dataType: 'string',
    },
    {
        id: '2',
        name: 'gender',
        dataType: 'string',
    },
    {
        id: '3',
        name: 'age',
        dataType: 'number',
    }
];