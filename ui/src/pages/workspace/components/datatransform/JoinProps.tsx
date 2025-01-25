import React, { useState } from 'react';
import { Box, Divider, Tab, Tabs, Typography } from '@mui/material';
import { ComponentPropsProps } from '../../WorkflowConstants';
import { FormProvider } from '../../../../component/form/PowerFormContext';
import PowerForm, { FormField } from '../../../../component/form/PowerForm';
import { useWorkflow } from '../../context/WorkflowContext';
import FilterAssemble, { ConditionGroup } from '../../../../component/FilterAssemble';
import { Field } from '../../../../component/FilterAssemble';
import { Operation } from '../../../../component/FilterAssemble';
import { FunctionDef } from '../../../../component/CodeEditor';
import TabPanel from '../../../../component/tab/TabPanel';
import PowerEditGrid from '../../../../component/PowerEditGrid';
import FieldDisplay from '../../../../component/form/FieldDisplay';

const JoinProps: React.FC<ComponentPropsProps> = ({ form, id, description }) => {
  const { componentsPropsProps, handleWorkflowPropsChange } = useWorkflow()
  const props = componentsPropsProps[id]
  const [value, setValue] = React.useState(0);

  const onSubmit = (data: any) => {
    console.log('submit', data)
  }
  const [formValue, setFormValue] = useState({
    join: 'full'
  })
  const [conditions, setConditions] = useState(initialConditions as ConditionGroup[]);

  const handleChange = (newConditions: typeof conditions) => {
    setConditions(newConditions);
    console.log('Filter conditions changed:', newConditions);
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Box sx={{ height: '100%' }}>
      <Tabs value={value} onChange={handleTabChange} aria-label="csv configuration tabs" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Properties" />
        <Tab label="Columns" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Typography sx={{ lineHeight: 'normal' }} variant="body2" color="text.secondary">{description}</Typography>
        <FormProvider
          onSubmit={onSubmit}
          defaultValue={formValue}
          onValueChange={(values) => {
            console.log('watchAllFields', values)
          }}
          validateForm={(values) => {
            return undefined
          }}
        >
          <PowerForm
            labelWidth={160}
            mode='normal'
            inline={false}
            fields={curfieldsConfig}
          />
        </FormProvider>
        <Divider sx={{ my: 2 }} />
        <FilterAssemble
          lfields={lfields as Field[]}
          rfields={rfields as Field[]}
          operations={operations as Operation[]}
          conditions={initialConditions}
          onChange={handleChange}
          functions={filterFunctions}
          drawerPosition='left'
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
      <Typography sx={{ lineHeight: 'normal' }} variant="body2" color="text.secondary">you can select columns to join, and drag to reorder, and you can rename the column.</Typography>
      <Box sx={{ mt: 1 }}>
      <PowerEditGrid 
          fields={fieldConfig} 
          data={colsdata}
          mode='pick'
          selectedRowIds={['1','2']}
          features={{
            drag: true
          }}
        /> 
      </Box>
      </TabPanel>

    </Box>
  );
};

export default JoinProps;


const curfieldsConfig: FormField[] = [
  {
    name: 'join',
    label: 'Join Type',
    type: 'richSelect',
    required: true,
    columns: 4,
    gap: 1,
    width: 90,
    height: 90,
    titleAlign: 'center',
    imageStyle: {
      width: '50px', height: '50px', '& img': {
        width: 'auto',
        height: 'auto',
      }
    },
    options: [
      {
        id: 'full',
        title: 'Full Join',
        image: 'src/assets/img/full_join.png',
      },
      {
        id: 'inner',
        title: 'Inner Join',
        image: 'src/assets/img/inner_join.png',
      },
      {
        id: 'left',
        title: 'Left Join',
        image: 'src/assets/img/left_join.png',
      },
      {
        id: 'right',
        title: 'Right Join',
        image: 'src/assets/img/right_join.png',
      },
    ],
  },
];
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
        "value": ["age", "age"]
      }
    ]
  }
]

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


const fieldConfig = [
  {
    name: 'input',
    label: 'Input',
    type: 'textinput',
    width: 50,
    cell: (value: string,row: any) => {
      return <>{value}</>
  }
},
  {
      name: 'name',
      label: 'Name',
      type: 'textinput',
      width: 200,
      cell: (value: string,row: any) => {
          return <FieldDisplay name={value} dataType={row.dataType} color="black"/>
      }
  },
  {
      name: 'rename',
      label: 'Rename',
      type: 'textinput',
      width: "*",
  }
];

const colsdata = [
  { id:'1',input: 'left', name: 'name',dataType: 'string', rename: '' },
  { id:'2',input: 'right', name: 'age',dataType: 'int', rename: '' },
  { id:'3',input: 'left', name: 'birthday',dataType: 'date', rename: '' },
];

