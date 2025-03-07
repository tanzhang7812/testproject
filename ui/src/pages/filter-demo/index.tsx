import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FilterAssemble, { Field, Operation, ConditionGroup } from '../../component/FilterAssemble';
import { FunctionDef } from '../../component/CodeEditor';

const fields = [
  { value: "name", dataType: 'string', header: 'Name' },
  { value: "age", dataType: 'int', header: 'Age' },
  { value: "birthday", dataType: 'date', header: 'Birthday' },
  { value: "meetingtime", dataType: 'timestamp', header: 'Meeting Time' },
  { value: "currenttime", dataType: 'timestamp', header: 'Current Time' },
];

const operations = [
  { label: "is", value: "IS", type: 'text', category: 'string|number' },
  { label: "is not", value: "IS_NOT", type: 'text', category: 'string|number' },
  { label: "is one of", value: "IS_ONE_OF", type: 'oneof', category: 'string' },
  { label: "start with", value: "START_WITH", type: 'text', category: 'string' },
  { label: "end with", value: "END_WITH", type: 'text', category: 'string' },
  { label: "contains", value: "CONTAINS", type: 'text', category: 'string' },
  { label: "is same as", value: "IS_SAME", type: 'field', category: 'string|number|date' },
  { label: "is different from", value: "IS_DIFF", type: 'field', category: 'string|number|date' },
  { label: "on", value: "ON", type: 'date', category: 'date' },
  { label: "not on", value: "NOT_ON", type: 'date', category: 'date' },
  { label: "before", value: "BEFORE", type: 'date', category: 'date' },
  { label: "after", value: "AFTER", type: 'date', category: 'date' },
  { label: "at or before", value: "AT_OR_BEFORE", type: 'date', category: 'date' },
  { label: "at or after", value: "AT_OR_AFTER", type: 'date', category: 'date' },
  { label: "between", value: "BETWEEN", type: 'between', category: 'date|number' },
  { label: "at", value: "AT", type: 'date', category: 'date' },
  { label: "not at", value: "NOT_AT", type: 'date', category: 'date' },
  { label: "is empty", value: "EMPTY", type: 'none', category: 'string|number|date' },
  { label: "is not empty", value: "NOT_EMPTY", type: 'none', category: 'string|number|date' },
];

const initialConditions: ConditionGroup[] = [
  {
    "type": "orgroup",
    "group": [
      {
        "field": "name",
        "funcfield": "name",
        "operate": "IS",
        "value": []
      },
      {
        "field": "age",
        "funcfield": "age",
        "operate": "IS",
        "value": [
          "234"
        ]
      }
    ]
  },
  {
    "type": "or"
  },
  {
    "type": "",
    "group": [
      {
        "field": "name",  
        "funcfield": "name",
        "operate": "IS",
        "value": []
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
        lfields={fields as Field[]}
        rfields={fields as Field[]}
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
