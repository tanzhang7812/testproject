import React from 'react';
import { Box, Typography } from '@mui/material';
import PowerForm, { FormField } from '../../../component/form/PowerForm';
import { FormProvider } from '../../../component/form/PowerFormContext';
import { CommonComponentPropsProps } from '../constants';



const CommonComponentProps: React.FC<CommonComponentPropsProps> = ({ form,id,props,description,onChange }) => {
  return (
    <Box>
    <Typography variant="body2" color="text.secondary">{description}</Typography>
      <FormProvider defaultValue={props} onValueChange={(values) => {
            Object.assign(props, values);
            onChange?.(id, values);
          }}>
        <PowerForm
          fields={form}
          labelWidth={120}
        />
      </FormProvider>
    </Box>
  );
};

export default CommonComponentProps; 