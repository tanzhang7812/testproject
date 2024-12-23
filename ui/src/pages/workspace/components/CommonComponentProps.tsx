import React from 'react';
import { Box, Typography } from '@mui/material';
import PowerForm, { FormField } from '../../../component/form/PowerForm';
import { FormProvider } from '../../../component/form/PowerFormContext';
import { CommonComponentPropsProps } from '../WorkflowConstants';



const CommonComponentProps: React.FC<CommonComponentPropsProps> = ({ form,id,props,description,onChange }) => {
  return (
    <Box sx={{height:'100%',p:2}}>
    <Typography sx={{lineHeight: 'normal'}} variant="body2" color="text.secondary">{description}</Typography>
      <FormProvider defaultValue={props} onValueChange={(values) => {
            Object.assign(props, values);
            onChange?.(id, values);
          }}>
        <PowerForm
          labelWidth={120}
          {...form}
        />
      </FormProvider>
    </Box>
  );
};

export default CommonComponentProps; 