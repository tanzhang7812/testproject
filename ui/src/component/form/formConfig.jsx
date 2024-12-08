export const groupConfig = {
    'personalinfo': {
        name: 'Personal Information',
        desc: 'Here is personal information,you could input your information here.',
        orient: 'v',
        collapse: true,
        header: 'more',
        displayControl:{watchFields:['display'],call:(watchValue)=>{
            if(watchValue['display']=='hide'){
                return false
            }else{
                return true
            }
        }}
    },
    'addressinfo': {
        name: 'Address Information',
        orient: 'g',
        column: 3,
        header: 'simple'
    },
    'teacherinfo': {
        name: 'Address Information',
        orient: 'g',
        column: 3,
        header: 'simple'
    }
}

export const fieldsConfig = [
    {
        name: 'display',
        label: 'Display Personal',
        required: true,
        type: 'radio',
        info: 'Name is required',
        options: [{label: 'show', value: 'show'}, {label: 'hide', value: 'hide'}],
    },
    {
        name: 'name',
        label: 'Name',
        required: true,
        type: 'textinput',
        info: 'Name is required',
        group: 'personalinfo'
    },
    {
        name: 'gender',
        label: 'Gender',
        required: true,
        type: 'select',
        info: 'Gender is required',
        options: [{label: 'man', value: 'man'}, {label: 'woman', value: 'woman'}],
        group: 'personalinfo'
    },
    {
        name: 'age',
        label: 'Age',
        required: true,
        type: 'select',
        info: 'Age is required',
        unit: 'years',
        group: 'personalinfo',
        options: Array.from({length:100},(v,i)=>({label: i+'', value: i, group: i<4?'infant':i<13?"children":i<19?'teenager':i<61?'adult':'older'}))
    },
    {
        name: 'birthday',
        label: 'Bithday',
        required: true,
        type: 'datepicker',
        info: 'Bithday is required',
        group: 'personalinfo'
    },
    {
        name: 'type',
        label: 'Type',
        required: true,
        type: 'select',
        info: 'source is required',
        group: 'personalinfo',
        options:[{label:'Student',value:'student'},{label:'Teacher',value:'teacher'}],
    },
    {
        name: 'province',
        label: 'Province',
        required: true,
        type: 'select',
        info: 'source is required',
        group: 'personalinfo',
        options:[{label:'Jiangsu',value:'jiangsu'},{label:'Zhejiang',value:'zhejiang'}],
    },
    {
        name: 'city',
        label: 'City',
        required: true,
        type: 'select',
        info: 'source is required',
        group: 'personalinfo',
        options:{watchFields:['province'],call:(watchValue)=>{
            const province=watchValue['province']
            if(province){
                return cityOptions.filter(el=>el.group===province)
            }else{
                return cityOptions
            }
        }}
    },
    {
        name: 'address1',
        label: 'Address 1',
        required: true,
        type: 'textinput',
        info: 'Bithday is required',
        group: 'addressinfo'
    }, {
        name: 'address2',
        label: 'Address 2',
        type: 'textinput',
        group: 'addressinfo'
    }, {
        name: 'address3',
        label: 'Address 3',
        type: 'textinput',
        group: 'addressinfo'
    },
    {
        name: 'address4',
        label: 'Address 4',
        type: 'textinput',
        group: 'addressinfo'
    },
    {
        name: 'address5',
        label: 'Address 5',
        type: 'textinput',
        group: 'addressinfo'
    },
    {
        name: 'desc',
        label: 'Description',
        type: 'textinput'
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
            }
        ],
        "teacher":[
            {
                name: 'tid',
                label: 'Teacher ID',
                type: 'textinput',
            },
            {
                name: 'level',
                label: 'Level',
                type: 'select',
                options:[{label:'T1',value:'t1'},{label:'T2',value:'t2'}],
                group:''
            }
        ]
    },
    "level":{
        "t1":[
            {
                name: 'sid',
                label: 'Student ID',
                type: 'textinput',
            }
        ],
        "t2":[
            {
                name: 'sid',
                label: 'Student ID',
                type: 'textinput',
            }
        ]
    }

}