import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { CommonComponentPropsProps } from '../../WorkflowConstants';
import FilterAssemble from '../../../../component/FilterAssemble';

const FilterProps: React.FC<CommonComponentPropsProps> = ({ form,id,props,description,onChange }) => {
    const [conditions, setConditions] = useState(initialConditions);

    const handleChange = (newConditions: typeof conditions) => {
      setConditions(newConditions);
      console.log('Filter conditions changed:', newConditions);
    };
    return (
    <Box>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
      <FilterAssemble
        fields={fields}
        operations={operations}
        conditions={conditions}
        onChange={handleChange}
      />
    </Box>
  );
};

export default FilterProps; 


const fields = [
    { value: "name", dataType: 'string', header: 'Name' },
    { value: "age", dataType: 'number', header: 'Age' },
    { value: "birthday", dataType: 'date', header: 'Birthday' },
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
    { label: "at or before ", value: "AT_OR_BEFORE", type: 'date', category: 'date' },
    { label: "at or after", value: "AT_OR_AFTER", type: 'date', category: 'date' },
    { label: "greater than", value: "GT", type: 'number', category: 'number' },
    { label: "greater than or is", value: "GT_OR_IS", type: 'number', category: 'number' },
    { label: "greater than field", value: "GT_FIELD", type: 'field', category: 'number' },
    { label: "greater than or is field", value: "GT_OR_IS_FIELD", type: 'field', category: 'number' },
    { label: "less than", value: "LT", type: 'number', category: 'number' },
    { label: "less than or is", value: "LT_OR_IS", type: 'number', category: 'number' },
    { label: "less than field", value: "LT_FIELD", type: 'field', category: 'number' },
    { label: "less than or is field", value: "LT_OR_IS_FIELD", type: 'field', category: 'number' },
    { label: "between", value: "BETWEEN", type: 'between', category: 'date|number' },
    { label: "is empty", value: "EMPTY", type: 'none', category: 'string|number|date' },
    { label: "is not empty", value: "NOT_EMPTY", type: 'none', category: 'string|number|date' },
  ] ;
  
  const initialConditions = [
    {
      type: "andgroup",
      group: [
        { field: "name", funcfield: "name", operate: "IS_SAME", value: ["name"] },
        { field: "age", funcfield: "age", operate: "BETWEEN", value: [18, 30] },
        { field: "birthday", funcfield: "birthday", operate: "ON", value: ["2024-01-01"] }
      ]
    },
    {
      type: "and"
    }
    ,
    {
      type: "",
      group: [
        { field: "name", funcfield: "name", operate: "IS", value: ["Tom"] }
      ]
    }
  ];