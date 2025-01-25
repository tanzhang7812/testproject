import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FilterAssemble, { Field, Operation, ConditionGroup } from '../../component/FilterAssemble';
import { FunctionDef } from '../../component/CodeEditor';

const lfields = [
    { value: "name", dataType: 'string', header: 'Name' },
    { value: "age", dataType: 'int', header: 'Age' },
    { value: "birthday", dataType: 'date', header: 'Birthday' },
    { value: "meetingtime", dataType: 'timestamp', header: 'Meeting Time' },
    { value: "currenttime", dataType: 'timestamp', header: 'Current Time' },
  ];
  
  const rfields = [
    { value: "name", dataType: 'string', header: 'Name' },
    { value: "age", dataType: 'int', header: 'Age' },
    { value: "birthday", dataType: 'date', header: 'Birthday' },
  ];
  
  const operations = [
    { label: "equal to", value: "=", type: 'field', category: 'string|date|number' },
    { label: "not equal to", value: "!=", type: 'text', category: 'string|number' },
    { label: "greater than", value: ">", type: 'field', category: 'string|date|number' },
    { label: "less than", value: "<", type: 'field', category: 'string|date|number' },
    { label: "greater than or equal to", value: ">=", type: 'field', category: 'string|date|number' },
    { label: "less than or equal to", value: "<=", type: 'field', category: 'string|date|number' }
  ];


const initialConditions: ConditionGroup[] = [
  {
    "type": "orgroup",
    "group": [
      {
        "field": "name",
        "funcfield": "name",
        "operate": "=",
        "value": []
      },
      {
        "field": "age",
        "funcfield": "age",
        "operate": "=",
        "value": ["age","age"]
      }
    ]
  }
]
// Sample functions for CodeEditor
const filterFunctions: FunctionDef[] = [
  {
      name: 'ABS',
      params: [{ name: 'number', dataType: 'number' }],
      returnType: 'number',
      category: 'Numeric Functions',
      description: 'Returns the absolute value of a number',
  },
  {
      name: 'ROUND',
      params: [
          { name: 'number', dataType: 'number' },
          { name: 'decimals', dataType: 'int' },
      ],
      returnType: 'number',
      category: 'Numeric Functions',
      description: 'Rounds a number to a specified number of decimal places',
  },
  {
      name: 'CONCAT',
      params: [
          { name: 'str1', dataType: 'string' },
          { name: 'str2', dataType: 'string' },
      ],
      returnType: 'string',
      category: 'String Functions',
      description: 'Concatenates two strings',
  },
  {
      name: 'UPPER',
      params: [{ name: 'str', dataType: 'string' }],
      returnType: 'string',
      category: 'String Functions',
      description: 'Converts a string to uppercase',
  },
];
const FilterDemo: React.FC = () => {
  const [conditions, setConditions] = useState(initialConditions as ConditionGroup[]);

  const handleChange = (newConditions: typeof conditions) => {
    setConditions(newConditions);
    console.log('Filter conditions changed:', newConditions);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Filter Assemble Demo
      </Typography>
      
      <FilterAssemble
        lfields={lfields as Field[]}
        rfields={rfields as Field[]}
        operations={operations as Operation[]}
        conditions={initialConditions}
        onChange={handleChange}
        functions={filterFunctions  }
      />

      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Current Filter JSON:
        </Typography>
        <pre>
          {JSON.stringify(conditions, null, 2)}
        </pre>
      </Paper>
    </Box>
  );
};

export default FilterDemo; 
