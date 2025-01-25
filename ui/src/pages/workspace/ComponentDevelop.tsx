import { Box, Button } from '@mui/material'
import React, { useRef, useState } from 'react'
import { FormProvider } from '../../component/form/PowerFormContext'
import PowerForm, { FormField } from '../../component/form/PowerForm'
import FilterAssemble, { ConditionGroup } from '../../component/FilterAssemble'
import { Field } from '../../component/FilterAssemble'
import { Operation } from '../../component/FilterAssemble'
import { FunctionDef } from '../../component/CodeEditor'

const ComponentDevelop = () => {
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

    return <Box sx={{ border: '1px solid #fff', display: 'inline-block', width: "600px", height: "600px" }}>
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
        <FilterAssemble
            lfields={lfields as Field[]}
            rfields={rfields as Field[]}
            operations={operations as Operation[]}
            conditions={initialConditions}
            onChange={handleChange}
            functions={filterFunctions}
        />
    </Box>
}

export default ComponentDevelop



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
