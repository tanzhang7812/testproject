import React, {useRef, useState} from 'react'
import Box from "@mui/material/Box";
import PowerForm, { FormField } from "../../component/form/PowerForm.tsx";
import {groupConfig, fieldsConfig, dynamicFormRef} from "../../component/form/formConfigV2";
import Button from "@mui/material/Button";
import {FormProvider} from "../../component/form/PowerFormContext.tsx";
import dayjs from 'dayjs';


export default () => {
    const onSubmit = (data) => {
        console.log('submit', data)
    }
    const [formValue, setFormValue]=useState({display:"true",name:'bert',gender:'man',meetingTime:'',startDate:'',endDate:''})
    const formRef=useRef()

   
    return <Box sx={{border: '1px solid #fff', display: 'inline-block', width: "50%"}}>
       <FormProvider onSubmit={onSubmit} defaultValue={formValue} triggerInitValidate={true} onValueChange={(values)=>{
                console.log('watchAllFields',values)
            }}
            validateForm={(values)=>{
               
                return undefined
            }}
            >
            
            <PowerForm labelWidth={160} mode='normal' group={groupConfig} inline={false} fields={curfieldsConfig} dynamicFormRef={dynamicFormRef} 
            />
            <Button  type={"submit"} variant={'contained'} ref={formRef}>Submit</Button>
        </FormProvider>
        <Button onClick={()=>{
            setFormValue({display:"false",name:'bb',gender:'woman',meetingTime:dayjs('2024-01-01')})
        }}>update</Button>

        <Button onClick={()=>{
            formRef.current.click()
        }}>submit from outside</Button>
    </Box>
}


const curfieldsConfig:FormField[] = [
    {
        name: 'display',
        label: 'Display Personal',
        required: true,
        type: 'radio',
        info: 'Name is required',
        options: [{label: 'show', value: 'true'}, {label: 'hide', value: 'false'}],
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
        options: [{label: 'man', value: 'man'}, {label: 'woman', value: 'woman'}]
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
    }
]
