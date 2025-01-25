import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import DynamicItemManage, { DynamicItem } from '../../component/DynamicItemManage';

const fields = [
    {
        name: 'name',
        label: 'Name',
        type: 'textinput',
        required: true,
        validate: (value: string) => {
            if (!value) return true; // Skip validation if empty
            const validPattern = /^[a-zA-Z0-9_\.]+$/;
            if(!validPattern.test(value)){
                return 'Name must be made up of letters, numbers, underscores, and dots';
            }
            return true;
        }
    },
    {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options:[{label:'CurrentDay',value:'CurrentDay'},{label:'PlainText',value:'PlainText'}],
    }
];

const group = {
    'param': {
        name: 'Parameter',
        header: 'divider',    
        orient: 'v',
        inline: true
    }
};

const dynamicFormRef = {
    'type': {
        'CurrentDay': [
            {
                name: 'format',
                label: 'Format',
                type: 'select',
                required: true,
                options:[{label:'YYYY-MM-DD',value:'YYYY-MM-DD'},{label:'YYYY/MM/DD',value:'YYYY/MM/DD'}],
                group:'param',
            }
        ],
        'PlainText': [
            {
                name: 'format',
                label: 'Format',
                type: 'textinput',
                required: true,
            }
        ]
    }
};

const initialItems: DynamicItem[] = [
    {
        id: Date.now().toString(),
        name: 'Current Date',
        type: 'CurrentDay',
        format: 'YYYY-MM-DD'
    }
];

export default function DynamicItemManageDemo() {
    const [items, setItems] = useState<DynamicItem[]>(initialItems);

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Dynamic Item Manage Demo
                </Typography>
                <Typography sx={{ mb: 2 }}>
                    A component for managing dynamic form items with PowerForm. Items can be expanded/collapsed, 
                    and the name field is used as the item identifier.
                </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <DynamicItemManage
                    title="Dynamic Items"
                    fields={fields}
                    items={items}
                    onChange={setItems}
                    defaultValue={{
                        name: '',
                        type: 'CurrentDay',
                        format: 'YYYY-MM-DD'
                    }}
                    group={group}
                    dynamicFormRef={dynamicFormRef}
                    idField="name"
                />
            </Paper>
            <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Union Result
        </Typography>
        <Box sx={{
          bgcolor: 'background.default',
          p: 2,
          borderRadius: 1,
          '& pre': {
            margin: 0,
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }
        }}>
          <pre>
            {JSON.stringify(items, null, 2)}
          </pre>
        </Box>
      </Paper>
        </Box>
    );
} 