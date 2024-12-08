import { Group } from "@mui/icons-material";
import { Stack, Chip } from "@mui/material";

interface WatchValue {
    display?: string;
    province?: string;
    [key: string]: any;
}

export const groupConfig = {
    'personalinfo': {
        name: 'Personal Information',
        collapse: {open:true},
        header: 'more',
        orient: 'g',
        inline:true,
        displayControl:{watchFields:['display'],call:(watchValue: WatchValue)=>{
                if(watchValue['display']==='false'){
                    return false
                }else{
                    return true
                }
            }}
    },
    'p1': {
        name: 'Personal Information 1',
        desc: 'Left personal information.',
        header: 'simple',
        orient: 'v',
        xs:8,
        group:'personalinfo'
    },
    'p11': {
        name: 'Personal Information 11',
        collapse: {open:true},
        header: 'more',
        orient: 'h',
        group:'p1',
        labelWidth:100,
    },
    'p12': {
        name: 'Personal Information 12',
        collapse: {open:true},
        header: 'more',
        orient: 'h',
        group:'p1',
        labelWidth:100,
    },
    'p2': {
        name: 'Personal Information 2',
        desc: 'Right personal information.',
        header: 'simple',
        orient: 'v',
        xs:4,
        group:'personalinfo',
        labelWidth:100,
    },
    'p21': {
        name: 'Dynamic fields 21',
        desc: 'This is a dynamic fields.',
        header: 'simple',
        orient: 'v',
        group:'p2',
    },
    'addressinfo': {
        name: 'Address Information',
        orient: 'g',
        header: 'simple',
        labelWidth:120,
    }
}

export const fieldsConfig = [
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
        info: 'Name is required',
        group: 'p11'
    },
    {
        name: 'gender',
        label: 'Gender',
        required: true,
        type: 'select',
        info: 'Gender is required',
        options: [{label: 'man', value: 'man'}, {label: 'woman', value: 'woman'}],
        group: 'p11'
    },
    {
        name: 'age',
        label: 'Age',
        required: true,
        type: 'select',
        info: 'Age is required',
        unit: 'years',
        group: 'p12',
        options: Array.from({length:100},(v,i)=>({label: i+'', value: i, group: i<4?'infant':i<13?"children":i<19?'teenager':i<61?'adult':'older'}))
    },
    {
        name: 'birthday',
        label: 'Bithday',
        required: true,
        type: 'date',
        info: 'Bithday is required',
        group: 'p12'
    },
    {
        name: 'type',
        label: 'Type',
        required: true,
        type: 'select',
        info: 'source is required',
        group: 'p2',
        options:[{label:'Student',value:'student'},{label:'Teacher',value:'teacher'}],
    },
    {
        name: 'province',
        label: 'Province',
        required: true,
        type: 'select',
        info: 'source is required',
        group: 'p2',
        options:[{label:'Jiangsu',value:'jiangsu'},{label:'Zhejiang',value:'zhejiang'}],
    },
    {
        name: 'city',
        label: 'City',
        required: true,
        type: 'select',
        info: 'source is required',
        group: 'p2',
        options: {
            watchFields: ['province'],
            call: (watchValue: WatchValue) => {
                const province = watchValue['province'];
                if(province){
                    return cityOptions.filter(el => el.group === province);
                }
                return cityOptions;
            }
        }
    },
    {
        name: 'address1',
        label: 'Address 1',
        type: 'textinput',
        info: 'Bithday is required',
        xs:4,
        group: 'addressinfo'
    }, {
        name: 'address2',
        label: 'Address 2',
        type: 'textinput',
        xs:4,
        group: 'addressinfo'
    }, {
        name: 'address3',
        label: 'Address 3',
        type: 'textinput',
        xs:4,
        group: 'addressinfo'
    },
    {
        name: 'address4',
        label: 'Address 4',
        type: 'textinput',
        xs:4,
        group: 'addressinfo'
    },
    {
        name: 'address5',
        label: 'Address 5',
        type: 'textinput',
        xs:4,
        group: 'addressinfo'
    },
    {
        name: 'desc',
        label: 'Description',
        type: 'textinput',
    },
    {
        name: 'meetingTime',
        label: 'Meeting Time',
        type: 'datetime',
        required: true,
    },
    {
        name: 'birthDate',
        label: 'Birth Date',
        type: 'date',
        required: true,
    },
    {
        name: 'startTime',
        label: 'Start Time',
        type: 'time',
        required: true,
    },
    {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 4,
    },
    {
        name: 'agreement',
        label: 'Agreement',
        type: 'checkbox',
        checkboxLabel: 'I agree to the terms and conditions',
        required: true,
    },
    {
        name: 'plan',
        label: 'Plan Selection',
        type: 'richSelect',
        required: true,
        multiple: true,
        options: [
            {
                id: 'basic',
                title: 'Basic Plan',
                description: 'Perfect for small projects'
            },
            {
                id: 'pro',
                title: 'Pro Plan',
                description: 'Best for professional use'
            },
            {
                id: 'enterprise',
                title: 'Enterprise Plan',
                description: 'For large organizations'
            }
        ],
    },
]

const cityOptions=[{label:'Nanjing',value:'nanjing',group:'jiangsu'},{label:'Suzhou',value:'suzhou',group:'jiangsu'},{label:'Hangzhou',value:'hangzhou',group:'zhejiang'},{label:'Ningbo',value:'ningbo',group:'zhejiang'}]

export const dynamicFormRef={
    "type":{
        "student":[
            {
                name: 'sid',
                label: 'Student ID',
                type: 'textinput',
                group:'p21'
            }
        ],
        "teacher":[
            {
                name: 'tid',
                label: 'Teacher ID',
                type: 'textinput',
                group:'p1',
                inline:false
            },
            {
                name: 'level',
                label: 'Level',
                type: 'select',
                options:[{label:'T1',value:'t1'},{label:'T2',value:'t2'}],
                group:'p12'
            }
        ]
    },
    "level":{
        "t1":[
            {
                name: 'title',
                label: 'Title',
                type: 'textinput',
                group:'p21'
            }
        ],
        "t2":[
            {
                name: 'title2',
                label: 'Title 2',
                type: 'textinput',
            }
        ]
    }

}