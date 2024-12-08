import React, {createContext, useContext, useEffect, useMemo, useReducer, useState} from "react";

const SettingsContext=createContext(null);
const SettingsDispatchContext=createContext(null);
import {useTranslation} from "react-i18next";
import "./i18n/i18n.ts";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";
import 'dayjs/locale/zh-cn';

function settingsReducer(settings,action){
    switch (action.type){
        case 'changeLanguage':{
            return {...settings,language:action.language}
        }
        case 'changeMode':{
            return {...settings,mode:action.mode}
        }
    }
}
export function SettingsProvider({children}){
    const { t, i18n } = useTranslation();
    const [settings,dispatch]=useReducer(settingsReducer,{'language':i18n.language,'mode':'light'})
    const actions={
        changeLanguage:(language)=> {
            dispatch({type:'changeLanguage',language})
            i18n.changeLanguage(language);
        },
        changeMode:(mode)=>{
            dispatch({type:'changeMode',mode})
        }
    }

    return(
        <SettingsContext.Provider value={{...settings,t}}>
            <SettingsDispatchContext.Provider value={{...actions}}>
                {children}
            </SettingsDispatchContext.Provider>
        </SettingsContext.Provider>
    )
}

export function useSettings(){
    return useContext(SettingsContext)
}

export function useSettingsDispatch(){
    return useContext(SettingsDispatchContext)
}