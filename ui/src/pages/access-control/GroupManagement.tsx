import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PowerDataGrid from '../../component/PowerDataGrid';
import { ColumnConfig } from '../../component/PowerDataGrid';

interface Group {
  id: number;
  group_id: number;
  group_name: string;
  description: string;
  created_at: string;
}

// Mock data
const mockGroups = [
  {
    id: 2,
    group_id: 2,
    group_name: 'Data Scientists',
    description: 'Data science and analytics team',
    created_at: '2024-01-02'
  },
  {
    id: 3,
    group_id: 3,
    group_name: 'ETL Developers',
    description: 'ETL development team',
    created_at: '2024-01-03'
  },
  {
    id: 4,
    group_id: 4,
    group_name: 'Business Analysts',
    description: 'Business analysis team',
    created_at: '2024-01-04'
  }
];

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState(mockGroups);

  const groupColumns: ColumnConfig[] = [
    { field: 'group_name', headerName: 'Name', flex: 1,formConfig: {
        type: 'text',
        required: true,
      }, },
    { field: 'description', headerName: 'Description', flex: 1.5,formConfig: {
        type: 'textarea',
      }, },
    { field: 'created_at', headerName: 'Created At', flex: 1 }
  ];

  const handleAdd = (data: any) => {
    const newGroup = {
      id: Math.max(...groups.map(g => g.id)) + 1,
      group_id: Math.max(...groups.map(g => g.group_id)) + 1,
      group_name: data.group_name,
      description: data.description,
      created_at: new Date().toISOString().split('T')[0]
    };
    setGroups([...groups, newGroup]);
  };

  const handleEdit = (data: any) => {
    const updatedGroups = groups.map(group => 
      group.id === data.id ? { ...group, ...data } : group
    );
    setGroups(updatedGroups);
  };

  const handleDelete = (data: any) => {
    const updatedGroups = groups.filter(group => group.id !== data.id);
    setGroups(updatedGroups);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <PowerDataGrid
          name="Group"
          rows={groups}
          columns={groupColumns}
          features={{
            add: true,
            edit: true,
            delete: true,
            search: {
              field: 'group_name',
              placeholder: 'Search by name'
            },
            toolbar: {
              filter: true,
              columns: true,
            }
          }}
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      </Box>
    </Box>
  );
};

export default GroupManagement; 