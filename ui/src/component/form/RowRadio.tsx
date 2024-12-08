import {FormControl, FormControlLabel, Radio, RadioGroup} from "@mui/material";
import React, {forwardRef} from "react";
import FormHelperText from "@mui/material/FormHelperText";


export default forwardRef((props,ref)=> {
    const {options,error,disabled,helperText,onChange,value,dataType}=props
    const conChange=(e,v)=>{
        if(dataType==='boolean'){
           throw new Error('Not support boolean for radio')
        }
        if(dataType==='number'){
            onChange(e,Number(v))
            return
        }
        onChange(e,v)
    }
    return (
        <FormControl error={error}>
            <RadioGroup
                row
                onChange={conChange}
                ref={ref}
                value={value}
            >
                {options.map((el,index)=><FormControlLabel key={index} value={el.value} control={<Radio />} label={el.label} disabled={!!disabled?disabled:el.disabled}/>)}
            </RadioGroup>
            <FormHelperText sx={{marginLeft:'14px',marginTop:'4px'}} id="component-error-text">{helperText}</FormHelperText>
        </FormControl>
    );
})