import React, {useMemo, useState,forwardRef, useCallback} from 'react'
import Box from "@mui/material/Box";
import {Alert, FormControl, FormControlLabel, FormLabel, RadioGroup, TextField,Radio, Checkbox, TextareaAutosize} from "@mui/material";
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import Tooltip from '@mui/material/Tooltip';
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import { Path, useForm,useFieldArray , Controller,UseFormRegister, SubmitHandler } from "react-hook-form"
import Button from "@mui/material/Button";
import {useFormContext} from "./PowerFormContext.tsx"
import RowRadio from "./RowRadio.tsx";
import Select from "./Select.tsx";
import CodeEditor, { Field as CodeEditorField, FunctionDef } from '../CodeEditor';
import {dynamicFormRef} from "./formConfigV2.ts";
import {array} from "yup";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import RichSelect from './RichSelect';
import { debounce, isEqual } from 'lodash'

interface FieldOption {
    label: string;
    value: string | number;
    group?: string;
}

interface DisplayControl {
    watchFields: string[];
    call: (watchValue: Record<string, any>) => boolean;
}

export interface FormField {
    inline?: any;
    name: string;
    label: string;
    type: string;
    required?: boolean;
    group?: string;
    index?: number;
    labelWidth?: number;
    displayControl?: DisplayControl;
    options?: FieldOption[] | DisplayControl;
    value?: any;
    xs?: number;
    fields?: FormField[];
    d?: string;
    id?: string;
    datatype?: string;
    info?: string;
    unit?: string;
    validate?: (value: any, formValues: any) => string | undefined;
}

export interface FormGroup {
    inline: any;
    name: string;
    header?: string;
    collapse?: { open: boolean };
    orient?: string;
    desc?: string;
    type?: string;
    //fields: FormField[];
    id?: string;
    index?: number;
    labelWidth?: number;
    xs?: number;
}

interface WatchFieldsResult {
    [key: string]: any;
}

interface PowerFormProps {
    padding?: number;
    group?: Record<string, FormGroup>;
    fields?: FormField[];
    orient?: string;
    header?: string;
    name?: string;
    mode?:string;
    inline?: boolean;
    labelWidth?: number;
    desc?: string;
    dynamicFormRef?: Record<string, Record<string, FormField[]>>;
}

interface FormGroupProps {
    root?: boolean;
    children: React.ReactNode;
    collapse?: { open: boolean };
    header?: string;
    name?: string;
    desc?: string;
    orient?: string;
}

interface ControllerFieldProps {
    labelWidth?: number;
    label: string;
    name: string;
    inline?: boolean;
    mode?:string;
    required?: boolean;
    maxWidth?: number | string;
    control: any;
    error?: any;
    watchFieldsResult: WatchFieldsResult;
    type?: 'radio' | 'select' | 'text' | 'date' | 'time' | 'datetime' | 'textarea' | 'checkbox' | 'richSelect' | 'custom';
    options?: FieldOption[] | DisplayControl;
    value?: any;
    rows?: number;
    checked?: boolean;
    info?: string;
    validate?: (value: any, formValues: any) => string | undefined;
    getValues?: () => Record<string, any>;
    renderField?: (props: any) => React.ReactNode;
}

function isWatchedControl(obj: any): obj is DisplayControl {
    return obj && (typeof obj === "object") && 'watchFields' in obj && 'call' in obj;
}

function groupFields(
    watchcol: string[],
    groupMap: Record<string, FormGroup>,
    fields: FormField[],
    groupConfig: Record<string, FormGroup>
): FormField[] {
    const fg: FormField[] = [];
    fields.forEach((ite, index) => {
        if (ite.group) {
            if (!groupMap[ite.group]) {
                const cgf = groupConfig[ite.group];
                if (!cgf) {
                    throw Error(`Not found group for ${ite.group}`);
                }
                groupMap[ite.group] = { ...cgf, type: 'formgroup', fields: [], id: ite.group, index: ite.index };
                fg.push(groupMap[ite.group]);
                if (cgf.displayControl && isWatchedControl(cgf.displayControl)) {
                    cgf.displayControl.watchFields.forEach(wtcfield => {
                        if (!watchcol.includes(wtcfield)) {
                            watchcol.push(wtcfield);
                        }
                    });
                }
            }
            if (ite.type === 'formgroup' && ite.index < groupMap[ite.group].index) {
                groupMap[ite.group].index = ite.index;
            }
            groupMap[ite.group]["fields"].push({ ...ite });
        } else {
            fg.push({ ...ite });
        }
        if (ite.displayControl && isWatchedControl(ite.displayControl)) {
            ite.displayControl.watchFields.forEach(wtcfield => {
                if (!watchcol.includes(wtcfield)) {
                    watchcol.push(wtcfield);
                }
            });
        }
        if (ite.options && isWatchedControl(ite.options)) {
            ite.options.watchFields.forEach(wtcfield => {
                if (!watchcol.includes(wtcfield)) {
                    watchcol.push(wtcfield);
                }
            });
        }
    });
    if (fg.filter(el => !!el.group).length > 0) {
        return groupFields(watchcol, groupMap, fg, groupConfig);
    }
    return fg;
}

function orderFieldsAndStyleSetting(fields: FormField[], labelWidth: number,inline:boolean): void {
    fields.sort((a, b) => (a.index || 0) - (b.index || 0));
    fields.forEach(el => {
        el.labelWidth = el.labelWidth ? el.labelWidth : labelWidth;
        el.inline = el.inline!==undefined?el.inline:inline
        if (el.fields) {
            orderFieldsAndStyleSetting(el.fields, el.labelWidth,el.inline);
        }
    });
}

function processDisplayControl(
    groupedFields: FormField[],
    watchFieldsResult: WatchFieldsResult
): FormField[] {
    return groupedFields.filter(el => {
        if (el.type === 'formgroup' && el.fields) {
            el.fields = processDisplayControl(el.fields, watchFieldsResult);
        }
        return !el.displayControl || el.displayControl.call(watchFieldsResult);
    });
}

function removeSpecticDynFields(activeFields: FormField[],d:string): void {
    for (let i = activeFields.length - 1; i >= 0; i--) {
        const field = activeFields[i];
        
        if (field.type === 'formgroup' && field.fields) {
            removeSpecticDynFields(field.fields,d);
            
            if (field.fields.length === 0) {
                activeFields.splice(i, 1);
            }
        } else if (field.d === d) {
            activeFields.splice(i, 1);
        }
    }
}

function findParentGroup(groupId: string, groupConfig: Record<string, FormGroup>): string | null {
    const group = groupConfig[groupId];
    if (!group) return null;
    
    for (const [key, value] of Object.entries(groupConfig)) {
        if (value.fields?.some(field => field.group === groupId)) {
            return key;
        }
    }
    return null;
}

function findOrCreateGroup(
    groupId: string, 
    activeFields: FormField[], 
    groupConfig: Record<string, FormGroup>,
    processedGroups: Set<string> = new Set()
): FormField | null {
    // 防止循环依赖
    if (processedGroups.has(groupId)) return null;
    processedGroups.add(groupId);

    // 递归搜索函数
    const searchInFields = (fields: FormField[]): FormField | null => {
        for (const field of fields) {
            if (field.type === 'formgroup' && field.id === groupId) {
                return field;
            }
            if (field.type === 'formgroup' && field.fields) {
                const found = searchInFields(field.fields);
                if (found) return found;
            }
        }
        return null;
    };

    // 在整个activeFields树中搜索目标组
    let targetGroup = searchInFields(activeFields);
    if (targetGroup) return targetGroup;

    // 如果没找到，查找父组
    const parentGroupId = findParentGroup(groupId, groupConfig);
    if (!parentGroupId) return null;

    // 在父组中查找
    const parentGroup = findOrCreateGroup(parentGroupId, activeFields, groupConfig, processedGroups);
    if (!parentGroup || !parentGroup.fields) return null;

    // 如果父组存在但目标组不存在，创建目标组
    const cgroupConfig = groupConfig[groupId];
    if (!cgroupConfig) return null;

    const newGroup: FormField = {
        ...cgroupConfig,
        type: 'formgroup',
        fields: [],
        id: groupId
    };
    
    parentGroup.fields.push(newGroup);
    return newGroup;
}

function getActiveFields(
    groupedFields: FormField[],
    watchFieldsResult: WatchFieldsResult,
    dynamicFormRef: Record<string, Record<string, FormField[]>> | undefined,
    groupConfig: Record<string, FormGroup> = {},
    labelWidth: number = 150,
    inline: boolean = true
): FormField[] {
    const activeFields = processDisplayControl(groupedFields, watchFieldsResult);
    
    if (!dynamicFormRef) return activeFields;

    // 递归查找指定组
    const findGroup = (fields: FormField[], groupId: string): FormField | null => {
        for (const field of fields) {
            if (field.type === 'formgroup' && field.id === groupId) {
                return field;
            }
            if (field.type === 'formgroup' && field.fields) {
                const found = findGroup(field.fields, groupId);
                if (found) return found;
            }
        }
        return null;
    };

    // 创建组并确保它被添加到正确的父组中
    const createGroupInParent = (groupId: string, fields: FormField[]): FormField | null => {
        const groupDef = groupConfig[groupId];
        if (!groupDef) return null;

        const newGroup: FormField = {
            ...groupDef,
            type: 'formgroup',
            fields: fields,
            id: groupId,
            labelWidth: groupDef.labelWidth || labelWidth,
            inline: groupDef.inline!==undefined?groupDef.inline:inline
        };

        // 如果组有父组，找到父组并添加
        if (groupDef.group) {
            const parentGroup = findGroup(activeFields, groupDef.group);
            if (parentGroup && parentGroup.fields) {
                parentGroup.fields.push(newGroup);
                return newGroup;
            }
        }

        // 如果没有父组或找不到父组，添加到根级别
        activeFields.push(newGroup);
        return newGroup;
    };

    Object.keys(dynamicFormRef).forEach(el => {
        removeSpecticDynFields(activeFields, el);
        
        const selectedValue = watchFieldsResult[el];
        if (selectedValue && dynamicFormRef[el]?.[selectedValue]?.length > 0) {
            const newFields = dynamicFormRef[el][selectedValue].map(field => {
                // 查找字段所属的组
                const targetGroup = field.group ? findGroup(activeFields, field.group) : null;
                const groupDef = field.group ? groupConfig[field.group] : null;
                
                return {
                    ...field,
                    labelWidth: field.labelWidth || groupDef?.labelWidth || targetGroup?.labelWidth || labelWidth,
                    inline: field.inline!==undefined?field.inline:groupDef?.inline!==undefined?groupDef.inline:targetGroup?.inline!==undefined?targetGroup.inline:inline,
                    d: el
                };
            });

            // 按组分类新字段
            const groupedNewFields = new Map<string, FormField[]>();
            const ungroupedFields: FormField[] = [];

            newFields.forEach(field => {
                if (field.group) {
                    if (!groupedNewFields.has(field.group)) {
                        groupedNewFields.set(field.group, []);
                    }
                    groupedNewFields.get(field.group)?.push(field);
                } else {
                    ungroupedFields.push(field);
                }
            });

            // 将字段添加到已存在的组中或创建新组
            groupedNewFields.forEach((fields, groupId) => {
                const existingGroup = findGroup(activeFields, groupId);
                if (existingGroup) {
                    existingGroup.fields.push(...fields);
                } else {
                    // 创建新组并确保它被添加到正确的父组中
                    createGroupInParent(groupId, fields);
                }
            });

            // 添加未分组的字段
            activeFields.push(...ungroupedFields);
        }
    });

    return activeFields;
}

export default ({ group={},fields=[],labelWidth=150,inline=true, orient = 'v',mode='normal',header,name,desc,dynamicFormRef}: PowerFormProps) => {
    const { control,watch,defaultValue, formState: { errors },getValues,formError } = useFormContext()

    const [groupedFields,watchedFields]=useMemo(()=>{
        const watchcol=dynamicFormRef?Object.keys(dynamicFormRef):[]
        const groupMap={}
        const fg=groupFields(watchcol,groupMap,fields.map((el,index)=>({...el,index})),group)
        orderFieldsAndStyleSetting(fg,labelWidth,inline)
        return [fg,watchcol]
    },[fields,group,dynamicFormRef])

    // const watchAllFields = watch();
    // console.log('watchAllFields',watchAllFields)
    
    const watchFieldsValue = watch(watchedFields)
    const watchFieldsResult =useMemo(()=>{
        const watchResult={}
        watchedFields.forEach((el,index)=>{
            watchResult[el]=watchFieldsValue[index]
        })
        return watchResult;
    },[watchFieldsValue])

    const activeFields=useMemo(()=>{
        return getActiveFields(groupedFields,watchFieldsResult,dynamicFormRef,group,labelWidth,inline)
        //return processDisplayControl(groupedFields,watchFieldsResult)
    },[groupedFields,watchFieldsValue])

    

    const renderForm = (fields: FormField[]) => {
        return fields.map((fieldC, index) => {
            let filedComponent = null;
            if (fieldC.type !== 'formgroup') {
                
                filedComponent = (
                    <ControllerField 
                        key={fieldC.name}
                        {...fieldC} 
                        mode={mode}
                        control={control}  
                        watchFieldsResult={watchFieldsResult}
                        error={errors[fieldC.name]}
                        getValues={getValues}
                    />
                );
            } else {
                filedComponent = (
                    <FormGroup 
                        key={fieldC.name || `group-${index}`}
                        header={fieldC.header} 
                        collapse={fieldC.collapse} 
                        name={fieldC.name} 
                        orient={fieldC.orient} 
                        desc={fieldC.desc}
                    >
                        {renderForm(fieldC.fields || [])}
                    </FormGroup>
                );
            }
            if (fieldC.xs) {
                return (
                    <Grid item xs={fieldC.xs} key={`grid-${fieldC.name || index}`}>
                        {filedComponent}
                    </Grid>
                );
            } else {
                return filedComponent;
            }
        });
    };

    return (<Box>
    {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
            </Alert>
        )}
    <FormGroup root={false} header={header} name={name} orient={orient} desc={desc}>
        {renderForm(activeFields)}
    </FormGroup>
    </Box>)
}

const FormGroup: React.FC<FormGroupProps> = ({
    root,
    children,
    collapse,
    header,
    name,
    desc,
    orient = 'v'
}) => {
    const [open, setOpen] = useState(()=>{
        if(collapse){
            return !!collapse.open
        }
        return true
    })
    const onCollapseClick = () => {
        setOpen(!open)
    }
    const items = orient!=='g'?(
        <Stack
            direction={orient !== 'v' ? "row" :"column" }
            justifyContent="flex-start"
            alignItems="flex-start"
            marginTop={'10px'}
            px={root?2:0}
            gap={1}
        >
            {children}
        </Stack>):(<Grid container>
        {
            children
        }
    </Grid>)
    const headerComp = header ? getFormHeader(header, name, collapse, open, onCollapseClick) : undefined
    return <Box sx={{flexShrink: 0, width: '100%'}}>
        {/*<MoreHeader collapse={collapse} checked={checked} onCollapseClick={onCollapseClick} name={"Advanced"}></MoreHeader>*/}
        {/*<SimpleHeader collapse={collapse} checked={checked} onCollapseClick={onCollapseClick} name={"Advanced"}/>*/}
        {/*<DividerHeader name={"Advanced"}/>*/}
        {headerComp}
        {collapse ? <Collapse in={open}>
            {desc && <Typography fontSize={'0.9rem'} sx={{p: 1, color: 'grey.700'}}>
                {desc}
            </Typography>}
            {items}
        </Collapse> : (<>
            {desc && <Typography fontSize={'0.9rem'} sx={{p: 1, color: 'grey.700'}}>
                {desc}
            </Typography>}
             { items}
            </>  )
        }
    </Box>
}

const getFormHeader = (header, name, collapse, open, onCollapseClick) => {
    if (typeof header === 'string') {
        switch (header) {
            case 'more':
                return <MoreHeader collapse={collapse} open={open} onCollapseClick={onCollapseClick}
                                   name={name}></MoreHeader>
            case 'simple':
                return <SimpleHeader name={name}/>
            case 'divider':
                return <DividerHeader name={name}/>
            default:
                return <></>
        }
    } else if (typeof header === 'function') {
        return header(name, collapse, open, onCollapseClick)
    }
}

const MoreHeader = ({collapse = false, open, name, onCollapseClick}) => {
    return <Box>
        <Box sx={{display: 'flex'}}>
            <Typography>
                {name}
            </Typography>
            <Box sx={{flexGrow: 1}}/>
            {collapse ? <IconButton onClick={onCollapseClick}>
                {open ? <KeyboardArrowDownIcon sx={{color: 'grey.700'}}/> :
                    <ChevronRightIcon sx={{color: 'grey.700'}}/>}
            </IconButton> : undefined}
        </Box>
        <Divider/>
    </Box>
}

const SimpleHeader = ({name}) => {
    return <Box sx={{
        borderLeft: '4px solid #2196f3',
        margin: '16px 0 8px 0',
        padding: '12px 16px',
        backgroundColor: 'rgba(33, 150, 243, 0.02)',
        borderRadius: '0 8px 8px 0',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.04)',
            transform: 'translateX(2px)',
            '&::before': {
                opacity: 1,
                transform: 'scaleX(1)',
            }
        },
        // 添加渐变底部边框效果
        '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, #2196f3 0%, rgba(33, 150, 243, 0.1) 100%)',
            opacity: 0,
            transform: 'scaleX(0.6)',
            transformOrigin: 'left',
            transition: 'all 0.3s ease',
        },
        // 微妙的顶部高光
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        },
        // 更精致的阴影效果
        boxShadow: '0 1px 3px rgba(0,0,0,0.01), 0 1px 2px rgba(0,0,0,0.02)',
        // 改进的文字样式
        typography: {
            fontWeight: 500,
            fontSize: '0.95rem',
            color: 'text.primary',
            letterSpacing: '0.015em',
        }
    }}>
        {name}
    </Box>
}

const DividerHeader = ({name}) => {
    return <Box sx={{height:'40px',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
        <Typography sx={{position:'absolute',backgroundColor:'#fff',left:'40px',padding:'0 10px'}}>{name}</Typography>
        <Divider sx={{flexGrow: 1}}/>
    </Box>
}

const ControllerField = forwardRef<HTMLDivElement, ControllerFieldProps>((props, ref) => {
    const {labelWidth = 150,label,name,info, inline = true,mode, required, maxWidth,control,error,watchFieldsResult,validate,getValues,...others}=props
    const errorObj=getError(label,error)
    const { onFormValueChange } = useFormContext()
    return <Box sx={{
        display: inline ? 'flex' : 'block',
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: maxWidth,
    }}>
        <Box sx={{width:inline ? labelWidth : '100%',flexShrink:0,height:inline?"30px":'20px',lineHeight: inline?"30px":'20px',fontSize:'0.9rem',marginBottom:inline?"0":"2px"}}>
            {label} {required ? <span style={{color: 'red'}}>*</span> : undefined}
            {info && <Tooltip title={info} arrow>
                <HelpOutlineOutlinedIcon style={{color: 'grey', fontSize: '15px', marginLeft: '5px'}}/>
            </Tooltip>}
        </Box>
        <Box sx={{flexGrow: 1}}>
            <Controller
                name={name}
                control={control}
                shouldUnregister={true}
                defaultValue={""}
                rules={{ 
                    required: required ? `${label} is required` : false,
                    validate: validate ? (value) => validate(value, getValues?.() || {}) : undefined 
                }}
                render={({ field }) => {
                    if(others.options && isWatchedControl(others.options)) {
                        others.options=others.options.call(watchFieldsResult,field.value)
                    }
                    if(others.value && isWatchedControl(others.options)) {
                        others.value=others.value.call(watchFieldsResult,field.value)
                    }
                    return <Field ref={ref} size='small' 
                        mode={mode} fullWidth {...field} {...errorObj} {...others}
                        value={field.value || ""} 
                        onValueChange={()=>{
                            onFormValueChange(field.name)
                        }}
                        ></Field>
                }}
            />

        </Box>
    </Box>
})

const Field = forwardRef<HTMLDivElement, any>((props, ref) => {
    const {type,mode,onValueChange, renderField, ...others} = props;
    
    switch (type) {
        case 'radio':
            return <RowRadio ref={ref} {...others} disabled={mode==='readonly'} onChange={(e)=>{
                others.onChange(e)
                onValueChange()
            }}/>;
        case 'number':
            return <TextField disabled={mode==='readonly'} ref={ref} size='small' type='number' fullWidth {...others} onChange={(e)=>{
                others.onChange(e)
                onValueChange()
            }}/>;
        case 'select':
            return <Select ref={ref} {...others} disabled={mode==='readonly'} onChange={(e)=>{
                others.onChange(e)
                onValueChange()
            }}/>;
        case 'datetime':
            return (
                    <TextField
                        ref={ref}
                        type="datetime-local"
                        disabled={mode==='readonly'}
                        {...others}
                        inputProps={{
                            step: props.step || 1
                        }}
                        onChange={(e)=>{
                            others.onChange(e)
                            onValueChange()
                        }}
                    />
            );
        case 'date':
            return (
                    <TextField
                        ref={ref}
                        type="date"
                        disabled={mode==='readonly'}
                        {...others}
                        onChange={(e)=>{
                            others.onChange(e)
                            onValueChange()
                        }}
                    />
            );
        case 'time':
            return (
                    <TextField
                        ref={ref}
                        type="time"
                        disabled={mode==='readonly'}
                        {...others}
                        inputProps={{
                            step: props.step || 1
                        }}
                        onChange={(e)=>{
                            others.onChange(e)
                            onValueChange()
                        }}
                    />
            );
        case 'textarea':
            return (
                <TextField
                    ref={ref}
                    multiline
                    disabled={mode==='readonly'}
                    rows={others.rows || 4}
                    size='small'
                    fullWidth
                    {...others}
                    onChange={(e)=>{
                        others.onChange(e)
                        onValueChange()
                    }}
                />
            );
        case 'checkbox':
            return (
                <FormControlLabel
                    control={
                        <Checkbox
                            ref={ref}
                            disabled={mode==='readonly'}
                            checked={others.value}
                            onChange={(e) => {
                                others.onChange(e.target.checked)
                                onValueChange()
                            }}
                            size='small'
                        />
                    }
                    label={others.checkboxLabel || ''}
                />
            );
        case 'richSelect':
            return <RichSelect disabled={mode==='readonly'} ref={ref} {...others} onChange={(e)=>{
                others.onChange(e)
                onValueChange()
            }}/>;
        case 'codeEditor':
            return (
                <CodeEditor
                    value={others.value}
                    onChange={(value) => {
                        others.onChange(value);
                        onValueChange();
                    }}
                    fields={others.fields || []}
                    functions={others.functions || []}
                    error={others.error}
                    helperText={others.helperText}
                    readOnly={mode === 'readonly'}
                />
            );
        case 'custom':
            if (!renderField) {
                console.warn('renderField is required for custom field type');
                return null;
            }
            return renderField({
                ...others,
                disabled: mode === 'readonly',
                onChange: (value: any) => {
                    others.onChange(value);
                    onValueChange();
                }
            });
        default:
            return <TextField disabled={mode==='readonly'} ref={ref} size='small' fullWidth {...others} onChange={(e)=>{
                others.onChange(e)
                onValueChange()
            }}/>;
    }
});

function getError(label,error){
    if(error){
        return {error:true,helperText:error.message}
    }else{
        return {}
    }
}

