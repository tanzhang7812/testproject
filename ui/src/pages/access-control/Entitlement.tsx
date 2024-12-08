import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, List, ListItem, ListItemText, ListItemIcon, Paper } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PowerDataGrid from '../../component/PowerDataGrid';
import { ColumnConfig } from '../../component/PowerDataGrid';

interface Group {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  role: string;
  joined_at: string;
}

interface ProcessId {
  id: number;
  name: string;
  type: string;
  created_at: string;
}

interface Pipeline {
  id: number;
  name: string;
  status: string;
  created_at: string;
}

interface Job {
  id: number;
  name: string;
  status: string;
  last_run: string;
}

// Mock data
const mockGroups: Group[] = [
  { id: 1, name: 'Data Scientists' },
  { id: 2, name: 'ETL Developers' },
  { id: 3, name: 'Business Analysts' },
];

const mockData = {
  users: {
    1: [
      {
        id: 1,
        user_id: 1,
        name: 'bob.wilson',
        email: 'bob.wilson@example.com',
        status: 'inactive',
        created_at: '2024-01-04 14:20:00'
      },
      {
        id: 2,
        user_id: 2,
        name: 'john.doe',
        email: 'john.doe@example.com',
        status: 'active',
        created_at: '2024-01-02 11:30:00'
      }
    ],
    2: [
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
  processIds: {
    1: [
      { id: 1, name: 'Process A', type: 'ETL', created_at: '2024-01-01' },
      { id: 2, name: 'Process B', type: 'Analysis', created_at: '2024-01-02' }
    ]
  },
  pipelines: {
    1: [
      { id: 1, name: 'Pipeline A', status: 'Active', created_at: '2024-01-01' },
      { id: 2, name: 'Pipeline B', status: 'Inactive', created_at: '2024-01-02' }
    ]
  },
  jobs: {
    1: [
      { id: 1, name: 'Job A', status: 'Running', last_run: '2024-01-01' },
      { id: 2, name: 'Job B', status: 'Completed', last_run: '2024-01-02' }
    ]
  }
};

const Entitlement: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
  };

  const userColumns: ColumnConfig[] = [
    { field: 'user_id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Username', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'created_at', headerName: 'Created At', flex: 1 },
  ];

  const processColumns: ColumnConfig[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'created_at', headerName: 'Created At', flex: 1 }
  ];

  const pipelineColumns: ColumnConfig[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'created_at', headerName: 'Created At', flex: 1 }
  ];

  const jobColumns: ColumnConfig[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'last_run', headerName: 'Last Run', flex: 1 }
  ];

  const getTabContent = () => {
    if (!selectedGroup) return null;

    const groupId = selectedGroup.id;
    let data: any[] = [];
    let columns: ColumnConfig[] = [];

    switch (activeTab) {
      case 0: // Users
        data = mockData.users[groupId] || [];
        columns = userColumns;
        break;
      case 1: // Process IDs
        data = mockData.processIds[groupId] || [];
        columns = processColumns;
        break;
      case 2: // Pipelines
        data = mockData.pipelines[groupId] || [];
        columns = pipelineColumns;
        break;
      case 3: // Jobs
        data = mockData.jobs[groupId] || [];
        columns = jobColumns;
        break;
    }

    return (
      <PowerDataGrid
        name={['Users', 'Process IDs', 'Pipelines', 'Jobs'][activeTab]}
        rows={data}
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
      />
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 2 }}>
      {/* Left side - Groups */}
      <Paper 
        elevation={1}
        sx={{ 
          width: '20%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: '#f8f9fa',
            fontWeight: 500,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.primary',
            letterSpacing: '0.5px'
          }}
        >
          <GroupIcon sx={{ fontSize: '1.2rem', opacity: 0.8 }} />
          Groups
        </Typography>
        <List sx={{ pt: 1, overflow: 'auto', flexGrow: 1 }}>
          {mockGroups.map((group) => (
            <ListItem
              key={group.id}
              button
              selected={selectedGroup?.id === group.id}
              onClick={() => handleGroupClick(group)}
              sx={{
                mb: 0.5,
                mx: 1,
                borderRadius: 1,
                width: 'auto',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit'
                  }
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                  '&.Mui-selected': {
                    bgcolor: 'primary.dark',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <GroupIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={group.name}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: selectedGroup?.id === group.id ? 500 : 400,
                  whiteSpace: 'normal'
                }}
                sx={{ margin: 0 }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Right side - Content */}
      <Paper 
        elevation={1}
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Users" />
            <Tab label="Process IDs" />
            <Tab label="Pipelines" />
            <Tab label="Jobs" />
          </Tabs>
        </Box>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {getTabContent()}
        </Box>
      </Paper>
    </Box>
  );
};

export default Entitlement; 