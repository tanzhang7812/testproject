import React from 'react';
import { Box, Typography } from '@mui/material';
import PowerForm, { FormField } from '../../../component/form/PowerForm';
import { FormProvider } from '../../../component/form/PowerFormContext';
import { useWorkflow } from '../context/WorkflowContext';
import { ComponentPropsProps } from '../WorkflowConstants';



const CommonComponentProps: React.FC<ComponentPropsProps> = ({ form,id,description }) => {
  const {componentsPropsProps,handleWorkflowPropsChange} = useWorkflow()
  const props = componentsPropsProps[id]
  return (
    <Box sx={{height:'100%',p:2}}>
    <Typography sx={{lineHeight: 'normal'}} variant="body2" color="text.secondary">{description}</Typography>
      <FormProvider defaultValue={props} onValueChange={(values) => {
            handleWorkflowPropsChange(id, values);
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