import React, { useState } from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PowerForm, { FormField, FormGroup } from '../form/PowerForm';
import { FormProvider } from '../form/PowerFormContext';
import { dynamicFormRef } from '../form/formConfigV2';

export interface PowerFormField {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    span?: number;
    group?: string;
    dynamicFormRef?: string;
}

export interface DynamicItem {
    id: string;
    [key: string]: any;
}

interface DynamicItemManageProps {
    title?: string;
    fields: PowerFormField[];
    items: DynamicItem[];
    onChange?: (items: DynamicItem[]) => void;
    defaultValue?: any;
    group?: Record<string, FormGroup>;
    dynamicFormRef?: Record<string, Record<string, FormField[]>>;
    idField?: string;
}

const DynamicItemManage: React.FC<DynamicItemManageProps> = ({
    title = 'Items',
    fields,
    items,
    onChange,
    defaultValue = {},
    group,
    dynamicFormRef,
    idField = 'name'
}) => {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const handleAdd = () => {
        const newItem = {
            id: Date.now().toString(),
            ...defaultValue
        };
        onChange?.([...items, newItem]);
        setExpandedItems(prev => ({ ...prev, [newItem.id]: true }));
    };

    const handleDelete = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        onChange?.(newItems);
        const newExpandedItems = { ...expandedItems };
        delete newExpandedItems[id];
        setExpandedItems(newExpandedItems);
    };

    const handleItemChange = (id: string, values: Record<string, any>) => {
        if (idField in values) {
            const isDuplicate = items.some(item => 
                item.id !== id && item[idField] === values[idField]
            );
            if (isDuplicate) {
                return;
            }
        }
        
        const newItems = items.map(item => 
            item.id === id ? { ...item, ...values } : item
        );
        onChange?.(newItems);
    };

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 1
            }}>
                <Typography variant="h6">{title}</Typography>
                <Button
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    variant="contained"
                    size="small"
                >
                    Add Item
                </Button>
            </Box>
            {items.map((item) => (
                <Box 
                    key={item.id} 
                    sx={{ 
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: 'grey.100',
                            borderBottom: expandedItems[item.id] ? 1 : 0,
                            borderColor: 'divider'
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => toggleExpand(item.id)}
                        >
                            {expandedItems[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <Typography sx={{ flex: 1, ml: 1 }}>
                            {item[idField] || 'Unnamed Item'}
                        </Typography>
                        <IconButton
                            onClick={() => handleDelete(item.id)}
                            size="small"
                            color="error"
                        >
                            <DeleteIcon sx={{fontSize:'20px'}}/>
                        </IconButton>
                    </Box>
                    <Box sx={{ 
                        p: 1,
                        display: expandedItems[item.id] ? 'block' : 'none'
                    }}>
                        <FormProvider
                            onSubmit={() => {}}
                            defaultValue={item}
                            onValueChange={(values,name,value,isValid,error) => handleItemChange(item.id, values,name,value,isValid,error)}
                        >
                            <PowerForm
                                fields={fields}
                                inline={false}
                                labelWidth={120}
                                mode="normal"
                                group={group}
                                dynamicFormRef={dynamicFormRef}
                            />
                        </FormProvider>
                    </Box>
                </Box>
            ))}
            {items.length === 0 && (
                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                >
                    No items yet. Click "Add Item" to create one.
                </Typography>
            )}
        </Box>
    );
};

export default DynamicItemManage; 