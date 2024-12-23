import React from 'react';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { ComponentPropsProps } from '../../WorkflowConstants';
import PowerForm from '../../../../component/form/PowerForm';
import { FormProvider } from '../../../../component/form/PowerFormContext';
import PowerEditGrid from '../../../../component/PowerEditGrid';
import { CircularProgress } from '@mui/material';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

const ReaderProps: React.FC<ComponentPropsProps> = ({ form, id, props, description, onChange }) => {
    const [value, setValue] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    // Handle tab change
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <Box sx={{ height: '100%' }}>
            <Tabs value={value} onChange={handleChange} aria-label="csv configuration tabs">
                <Tab label="Properties" />
                <Tab label="Columns" disabled={true}/>
            </Tabs>
            <TabPanel value={value} index={0}>
                <Typography sx={{ lineHeight: 'normal' }} variant="body2" color="text.secondary">{description}</Typography>
                <FormProvider defaultValue={props} onValueChange={(values) => {
                    Object.assign(props, values);
                    onChange?.(id, values);
                }}>
                    <PowerForm
                        label Width={120}
                        {...form}
                    />
                </FormProvider>

                <Button variant='contained' sx={{ marginTop: 1, marginBottom: 1 }} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null} onClick={() => {
                    console.log(props)
                }}> {loading ? 'Loading...' : 'Get Columns'}</Button>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Box>
                    <Typography sx={{ lineHeight: 'normal' }} variant="body2" color="text.secondary">you can adjust the columns here</Typography>
                    <Box sx={{ height: '100%', marginTop: 1 }}>
                        <PowerEditGrid
                            fields={[{ name: 'column1', label: 'Column 1', type: 'text' }, { name: 'column2', label: 'Column 2', type: 'text' }]}
                            data={[{ column1: 'value1', column2: 'value2' }, { column1: 'value1', column2: 'value2' }, { column1: 'value1', column2: 'value2' }, { column1: 'value1', column2: 'value2' }]}
                        />
                    </Box>
                </Box>
            </TabPanel>


        </Box>
    );
};

export default ReaderProps; 