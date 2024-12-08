import React, {createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState} from "react";
import {useTranslation} from "react-i18next";

const FormContext=createContext(null);
import { Path, useForm, Controller,UseFormRegister, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

interface FormProviderProps {
    children: React.ReactNode;
    onSubmit?: (data: any) => void;
    defaultValue?: Record<string, any>;
    onValueChange?: (data: any) => void;
    validateForm?: (values: any) => string | undefined;
    triggerInitValidate?: boolean;
}

export function FormProvider({children, onSubmit, defaultValue,onValueChange,validateForm,triggerInitValidate=false}: FormProviderProps) {
    // const schema=useMemo(()=>{
    //     return createSchema(fields)
    // },[fields])
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const { control, watch,getValues,unregister,formState, handleSubmit,reset,trigger  } = useForm({
        defaultValues: defaultValue || {}, // 设置默认值
        values: defaultValue || {},        // 设置当前值
    })

    const onSubmitHandler = useCallback((data: any) => {
        if (validateForm) {
            const error = validateForm(data);
            setFormError(error);
            if (error) {
                return;
            }
        }
        onSubmit?.(data);
    }, [validateForm, onSubmit]);

    // 添加初始校验效果
    useEffect(() => {
        let timeoutId;
        
        if (triggerInitValidate && defaultValue && Object.keys(defaultValue).length > 0) {
            // 添加一个小延时，确保所有字段都已注册
            timeoutId = setTimeout(() => {
                // 触发所有字段的校验
                //const fields = Object.keys(defaultValue);
                trigger().then(() => {
                    // 如果有自定义校验函数，也执行它
                    if (validateForm) {
                        const error = validateForm(getValues());
                        setFormError(error);
                    }
                });
            }, 100);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [triggerInitValidate, defaultValue, validateForm, trigger, getValues]);


    useEffect(() => {
        if (defaultValue === undefined || Object.keys(defaultValue).length === 0) {
            // 如果是空对象，重置所有字段为空
            reset({}, {
                keepDefaultValues: false // 确保清除默认值
            });
        } else {
            reset(defaultValue);
        }
    }, [defaultValue]);

    return(
        <form onSubmit={onSubmit ? handleSubmit(onSubmitHandler) : undefined}>
        <FormContext.Provider value={{control,formState,watch,getValues,defaultValue,onValueChange,formError}}>
                {children}
        </FormContext.Provider>
        </form>
    )
}

export function useFormContext(){
    return useContext(FormContext)
}

function createSchema(fields){
    const rawSchema={}
    fields.forEach((cfield,index)=>{
        let fieldObj=getDataType(cfield)
        fieldObj=getDataType(cfield)
        if(fieldObj.required){
            fieldObj=fieldObj.required()
        }
        rawSchema[cfield.name]=fieldObj
    })
    return yup.object(rawSchema)
}

function getDataType(field){
    switch (field.dataType){
        case 'number':
            return yup.number();
        case 'date':
            return yup.date();
        default:
            return yup.string()
    }
}