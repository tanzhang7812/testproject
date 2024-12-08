import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PowerDataGrid from '../../component/PowerDataGrid';
import { ColumnConfig } from '../../component/PowerDataGrid';

interface User {
    id: number;
    user_id: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
}

interface GroupData {
    id: string;
    name: string;
    items: User[];
}

// Mock data
const mockData: GroupData[] = [
    {
        id: 'g1',
        name: 'No Group',
        items: [
            {
                id: 4,
                user_id: 4,
                name: 'bob.wilson',
                email: 'bob.wilson@example.com',
                status: 'inactive',
                created_at: '2024-01-04 14:20:00'
            }
        ]
    },
    {
        id: 'g2',
        name: 'Data Scientists',
        items: [
            {
                id: 1,
                user_id: 1,
                name: 'admin',
                email: 'admin@example.com',
                status: 'active',
                created_at: '2024-01-01 10:00:00'
            }
        ]
    },
    {
        id: 'g3',
        name: 'ETL Developers',
        items: [
            {
                id: 2,
                user_id: 2,
                name: 'john.doe',
                email: 'john.doe@example.com',
                status: 'active',
                created_at: '2024-01-02 11:30:00'
            },
            {
                id: 3,
                user_id: 3,
                name: 'jane.smith',
                email: 'jane.smith@example.com',
                status: 'active',
                created_at: '2024-01-03 09:15:00'
            }
        ]
    },
    {
        id: 'g4',
        name: 'Business Analysts',
        items: [
            {
                id: 5,
                user_id: 5,
                name: 'alice.johnson',
                email: 'alice.johnson@example.com',
                status: 'active',
                created_at: '2024-01-05 16:45:00'
            }
        ]
    },

];

const UserManagement: React.FC = () => {
    const [data] = useState<GroupData[]>(mockData);

    const columns: ColumnConfig[] = [
        { field: 'user_id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Username', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: (params) => (
                params.row.group ? null : (
                    <Box
                        sx={{
                            backgroundColor: params.value === 'active' ? '#e8f5e9' : '#ffebee',
                            color: params.value === 'active' ? '#2e7d32' : '#c62828',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.875rem'
                        }}
                    >
                        {params.value}
                    </Box>
                )
            )
        },
        { field: 'created_at', headerName: 'Created At', flex: 1 },
    ];

    const features = {
        add: false,
        edit: false,
        delete: false,
        search: {
            field: 'name',
            placeholder: 'Search by name'
        },
        toolbar: {
            export: true,
            filter: true,
            columns: true,
        }
    };

    return (
        <Box sx={{ height: '100%' }}>
            <PowerDataGrid
                name="User"
                rows={data}
                columns={columns}
                features={features}
                group={true}
            />
        </Box>
    );
};

export default UserManagement; 