import React, { useRef, useState } from 'react'
import Box from "@mui/material/Box";
import PowerForm, { FormField } from "../../component/form/PowerForm.tsx";
import { groupConfig, fieldsConfig, dynamicFormRef } from "../../component/form/formConfigV2";
import Button from "@mui/material/Button";
import { FormProvider } from "../../component/form/PowerFormContext.tsx";
import dayjs from 'dayjs';
import CodeEditor from '../../component/CodeEditor';
import { validateExpression } from '../../component/CodeEditor/utils';

// Sample fields and functions for CodeEditor
const sampleFields = [
    { name: 'id', dataType: 'int' },
    { name: 'amount', dataType: 'decimal' },
    { name: 'created_at', dataType: 'timestamp' },
];

const sampleFunctions = [
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
];

export default () => {
    const onSubmit = (data: any) => {
        console.log('submit', data)
    }
    const [formValue, setFormValue] = useState({
        display: "true",
        name: 'bert',
        gender: 'man',
        meetingTime: '',
        startDate: '',
        endDate: '',
        expression: 'ABS(amount)'
    })
    const formRef = useRef<HTMLButtonElement>(null)

    return <Box sx={{ border: '1px solid #fff', display: 'inline-block', width: "50%" }}>
        <FormProvider
            onSubmit={onSubmit}
            defaultValue={formValue}
            triggerInitValidate={true}
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
                group={groupConfig}
                inline={false}
                fields={curfieldsConfig}
                dynamicFormRef={dynamicFormRef}
            />
            <Button type="submit" variant="contained" ref={formRef}>Submit</Button>
        </FormProvider>
        <Button onClick={() => {
            setFormValue({
                ...formValue,
                display: "false",
                name: 'bb',
                gender: 'woman',
                meetingTime: dayjs('2024-01-01').format('HH:mm:ss')
            })
        }}>update</Button>

        <Button onClick={() => {
            formRef.current?.click()
        }}>submit from outside</Button>
    </Box>
}

const curfieldsConfig: FormField[] = [
    {
        name: 'display',
        label: 'Display Personal',
        required: true,
        type: 'radio',
        info: 'Name is required',
        options: [{ label: 'show', value: 'true' }, { label: 'hide', value: 'false' }],
    },
    {
        name: 'name',
        label: 'Name',
        required: true,
        type: 'textinput',
        info: 'Name is required'
    },
    {
        name: 'gender',
        label: 'Gender',
        required: true,
        type: 'select',
        options: [{ label: 'man', value: 'man' }, { label: 'woman', value: 'woman' }]
    },
    {
        name: 'meetingTime',
        label: 'Meeting Time',
        type: 'time',
        required: true,
    },
    {
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true,
    },
    {
        name: 'endDate',
        label: 'End Date',
        type: 'date',
        required: true,
        validate: (value, formValues) => {
            const startDate = formValues.startDate;
            if (startDate && value < startDate) {
                return "End date must be after start date";
            }
            return undefined;
        }
    },
    {
        name: 'expression',
        label: 'Expression',
        type: 'custom',
        required: true,
        renderField: (props) => {
            const { isValid, errors } = validateExpression(props.value || '', sampleFields, sampleFunctions);
            return (
                <CodeEditor
                    value={props.value}
                    onChange={props.onChange}
                    fields={sampleFields}
                    functions={sampleFunctions}
                    // error={!isValid}
                    // helperText={!isValid ? errors[0] : undefined}
                    error={props.error}
                    helperText={props.helperText}
                    readOnly={props.disabled}
                />
            );
        },
        validate: (value, formValues) => {
            if (!value) return 'Expression is required';
            const { isValid, errors } = validateExpression(value, sampleFields, sampleFunctions);
            return isValid ? undefined : errors[0];
        }
    },
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
