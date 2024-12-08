import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PowerDataGrid from '../../component/PowerDataGrid';
import { ColumnConfig } from '../../component/PowerDataGrid';

interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
  permissions: string[];
}

// Mock data
const mockRoles: Role[] = [
  {
    id: 1,
    name: 'Owner',
    description: 'Full group access',
    created_at: '2024-01-01',
    permissions: ['all']
  },
  {
    id: 2,
    name: 'Developer',
    description: 'Development access',
    created_at: '2024-01-02',
    permissions: ['pipeline view', 'pipeline edit', 'job view', 'job edit']
  },
  {
    id: 3,
    name: 'Viewer',
    description: 'Read-only access',
    created_at: '2024-01-03',
    permissions: ['pipeline read']
  }
];

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);

  const columns: ColumnConfig[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1.5 },
    { 
      field: 'permissions', 
      headerName: 'Permissions', 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.value.map((permission: string) => (
            <Box
              key={permission}
              sx={{
                backgroundColor: '#f5f5f5',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem'
              }}
            >
              {permission}
            </Box>
          ))}
        </Box>
      )
    },
    { field: 'created_at', headerName: 'Created At', flex: 1 }
  ];

  const handleAdd = (data: any) => {
    // TODO: Implement role creation
    console.log('Add role:', data);
  };

  const handleEdit = (data: any) => {
    // TODO: Implement role update
    console.log('Edit role:', data);
  };

  const handleDelete = (data: any) => {
    // TODO: Implement role deletion
    console.log('Delete role:', data);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <PowerDataGrid
          name="Role"
          rows={roles}
          columns={columns}
          features={{
            add: true,
            edit: true,
            delete: true,
            toolbar: {
              filter: true,
              columns: true,
            }
          }}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>
    </Box>
  );
};

export default RoleManagement; 