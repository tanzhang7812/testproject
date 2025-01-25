import React from 'react';
import { Box, Typography } from '@mui/material';
import UnionAssemble from '../../../../component/UnionAssemble';
import { ComponentPropsProps } from '../../WorkflowConstants';

const UnionProps : React.FC<ComponentPropsProps> = ({id,description}) => {
  return (
    <Box sx={{height:'100%'}}>
      <Box sx={{p:2,height:70}}>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
      </Box>
    <Box sx={{borderTop:'1px solid #e0e0e0',height:'calc(100% - 70px)'}}>
      <UnionAssemble
          value={value}
          datasets={datasets}
          onChange={(output) => {
            console.log('Selected columns:', output);
          }}
        />
    </Box>
    </Box>
  );
};

export default UnionProps; 


const value = {
  "datasets": [
    {
      'Dataset01': ['key', 'animal', 'birthday']
    },
    {
      'Dataset02': [ 'key', 'animal', 'birthday', 'age']
    }
  ],
  "result": [
    { header: 'Key', name: 'key', dataType: 'string' },
    { header: 'Animal', name: 'animal', dataType: 'string' },
    { header: 'Birthday', name: 'birthday', dataType: 'date' },
    { header: 'Age', name: 'age', dataType: 'number' }
  ]
}


const datasets = [
  {
    'Dataset01': [
      { name: 'key', dataType: 'string', header: 'Key' },
      { name: 'animal', dataType: 'string', header: 'Animal' },
      { name: 'birthday', dataType: 'date', header: 'Birthday' }
    ]
  },
  {
    'Dataset02': [
      { name: 'key', dataType: 'string', header: 'Key' },
      { name: 'animal', dataType: 'string', header: 'Animal' },
      { name: 'age', dataType: 'number', header: 'Age' }, // 类型不匹配示例
      { name: 'birthday', dataType: 'date', header: 'Birthday' }
    ]
  }
];