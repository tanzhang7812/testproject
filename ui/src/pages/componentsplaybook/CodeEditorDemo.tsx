import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CodeEditor, { Field, FunctionDef } from '../../component/CodeEditor';
import { validateExpression } from '../../component/CodeEditor/utils';

// Sample fields
const sampleFields: Field[] = [
  { name: 'id', dataType: 'int' },
  { name: 'amount', dataType: 'decimal' },
  { name: 'created_at', dataType: 'timestamp' },
  { name: 'updated_at', dataType: 'timestamp' },
  { name: 'temperature', dataType: 'float' },
  { name: 'population', dataType: 'bigint' },
  { name: 'event_date', dataType: 'date' },
];

// Sample functions grouped by category
const sampleFunctions: FunctionDef[] = [
  // Type conversion functions
  {
    name: 'cast',
    params: [
      { 
        name: 'value', 
        dataType: 'field',
        description: 'Value to cast (use "as" keyword followed by the target type)'
      }
    ],
    returnType: 'field',
    category: 'Type Functions',
    description: 'Casts a value to a specified type. Usage: cast(value as type)',
  },

  // Numeric functions
  {
    name: 'ABS',
    params: [{ name: 'number', dataType: 'field|number' }],
    returnType: 'field',
    category: 'Numeric Functions',
    description: 'Returns the absolute value of a number',
  },
  {
    name: 'ROUND',
    params: [
      { name: 'number', dataType: 'field|number' },
      { name: 'decimals', dataType: 'int' },
    ],
    returnType: 'field',
    category: 'Numeric Functions',
    description: 'Rounds a number to a specified number of decimal places',
  },
  
  // Date functions
  {
    name: 'DATE_ADD',
    params: [
      { name: 'date', dataType: 'field|date' },
      { name: 'interval', dataType: 'field|string|int' },
      { name: 'unit', dataType: 'field|string' },
    ],
    returnType: 'field',
    category: 'Date Functions',
    description: 'Adds a time/date interval to a date and returns the date',
  },
  {
    name: 'DATE_FORMAT',
    params: [
      { name: 'date', dataType: 'field|date' },
      { name: 'format', dataType: 'string',optional:true },
    ],
    returnType: 'field',
    category: 'Date Functions',
    description: 'Formats a date as specified',
  },
  
  // String functions
  {
    name: 'CONCAT',
    params: [
      { name: 'string1', dataType: 'any' },
      { name: 'string2', dataType: 'any' },
    ],
    returnType: 'field',
    category: 'String Functions',
    description: 'Concatenates two strings',
  },
  {
    name: 'SUBSTRING',
    params: [
      { name: 'string', dataType: 'field|string' },
      { name: 'start', dataType: 'int' },
      { name: 'length', dataType: 'int' },
    ],
    returnType: 'field',
    category: 'String Functions',
    description: 'Extracts a substring from a string',
  },
];

export default function CodeEditorDemo() {
  const [code, setCode] = useState('CONCAT(, "123")');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  // Validate expression whenever code changes
  useEffect(() => {
    const { isValid, errors } = validateExpression(code, sampleFields, sampleFunctions);
    setError(!isValid);
    setHelperText(errors.join('; '));
  }, [code]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Code Editor Demo
        </Typography>
        <Typography sx={{ mb: 2 }}>
          A code editor component with field and function suggestions. Click the input field to open the editor.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <CodeEditor
          value={code}
          onChange={setCode}
          fields={sampleFields}
          functions={sampleFunctions}
          drawerPosition="right"
          error={error}
          helperText={helperText}
        />
      </Paper>
    </Box>
  );
} 