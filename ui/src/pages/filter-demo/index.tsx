import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FilterAssemble, { ConditionGroup, Field,Operation }from '../../component/FilterAssemble';

const fields = [
  { value: "name", dataType: 'string', header: 'Name' },
  { value: "age", dataType: 'number', header: 'Age' },
  { value: "birthday", dataType: 'date', header: 'Birthday' },
  { value: "meetingtime", dataType: 'time', header: 'Meeting Time' },
  { value: "currenttime", dataType: 'datetime', header: 'Current Time' },
];

const operations = [
  { label: "is", value: "IS", type: 'text', category: 'string|number' },
  { label: "is not", value: "IS_NOT", type: 'text', category: 'string|number' },
  { label: "is one of", value: "IS_ONE_OF", type: 'oneof', category: 'string' },
  { label: "start with", value: "START_WITH", type: 'text', category: 'string' },
  { label: "end with", value: "END_WITH", type: 'text', category: 'string' },
  { label: "contains", value: "CONTAINS", type: 'text', category: 'string' },
  { label: "is same as", value: "IS_SAME", type: 'field', category: 'string|number|date|time|datetime' },
  { label: "is different from", value: "IS_DIFF", type: 'field', category: 'string|number|date|time|datetime' },
  { label: "on", value: "ON", type: 'date', category: 'date' },
  { label: "not on", value: "NOT_ON", type: 'date', category: 'date' },
  { label: "before", value: "BEFORE", type: 'date', category: 'date|time|datetime' },
  { label: "after", value: "AFTER", type: 'date', category: 'date|time|datetime' },
  { label: "at or before", value: "AT_OR_BEFORE", type: 'date', category: 'date|time|datetime' },
  { label: "at or after", value: "AT_OR_AFTER", type: 'date', category: 'date|time|datetime' },
  { label: "between", value: "BETWEEN", type: 'between', category: 'date|time|datetime|number' },
  { label: "at", value: "AT", type: 'date', category: 'time|datetime' },
  { label: "not at", value: "NOT_AT", type: 'date', category: 'time|datetime' },
  { label: "is empty", value: "EMPTY", type: 'none', category: 'string|number|date|time|datetime' },
  { label: "is not empty", value: "NOT_EMPTY", type: 'none', category: 'string|number|date|time|datetime' },
];

const initialConditions: ConditionGroup[] = [
  {
    "type": "orgroup",
    "group": [
      {
        "field": "",
        "funcfield": "",
        "operate": "",
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
        "field": "",
        "funcfield": "",
        "operate": "",
        "value": []
      }
    ]
  }
]

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
        fields={fields as Field[]}
        operations={operations as Operation[]}
        conditions={initialConditions}
        onChange={handleChange}
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
