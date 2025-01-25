import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import UnionAssemble from '../../component/UnionAssemble';

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

export default function UnionAssembleDemo() {
  const [unionResult, setUnionResult] = useState({});



  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Union Assemble Demo
        </Typography>
        <Typography sx={{ mb: 2 }}>
          A component for configuring column selection in a union operation.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, height: 800, mb: 3 }}>
        <UnionAssemble
          value={value}
          datasets={datasets}
          onChange={(output) => {
            console.log('Selected columns:', output);
            setUnionResult(output);
          }}
        />
      </Paper>

      {/* 结果展示区域 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Union Result
        </Typography>
        <Box sx={{
          bgcolor: 'background.default',
          p: 2,
          borderRadius: 1,
          '& pre': {
            margin: 0,
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }
        }}>
          <pre>
            {JSON.stringify(unionResult, null, 2)}
          </pre>
        </Box>
      </Paper>
    </Box>
  );
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