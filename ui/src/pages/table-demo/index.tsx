import React, { useState } from 'react';
import { Box, Chip } from '@mui/material';
import PowerDataGrid, { ColumnConfig } from '../../component/PowerDataGrid';
import PreviewIcon from '@mui/icons-material/Preview';
import DownloadIcon from '@mui/icons-material/Download';

// Sample data with two-level structure
const initialRows = [
  {
    id: 'group-1',
    name: 'Group A',
    description: 'Development Team',
    items: [
      { id: 1, name: 'John Doe', description: 'Developer', age: 30, birthday: '1993-01-15', department: 'IT', salary: 50000, status: 'Active' },
      { id: 3, name: 'Bob Johnson', description: 'SQA', age: 35, birthday: '1988-07-10', department: 'Finance', salary: 60000, status: 'Inactive' },
    ]
  },
  {
    id: 'group-2',
    name: 'Group B',
    description: 'Management Team',
    items: [
      { id: 2, name: 'Jane Smith', description: 'HR', age: 28, birthday: '1995-03-20', department: 'HR', salary: 45000, status: 'Active' },
      { id: 5, name: 'Charlie Wilson', description: 'Finance', age: 40, birthday: '1983-11-30', department: 'Finance', salary: 65000, status: 'Active' },
    ]
  },
  {
    id: 'group-3',
    name: 'Group C',
    description: 'Support Team',
    items: [
      { id: 4, name: 'Alice Brown', description: 'IT', age: 32, birthday: '1991-04-25', department: 'IT', salary: 52000, status: 'Active' },
        { id: 6, name: 'Diana Miller', description: 'HR', age: 27, birthday: '1996-09-15', department: 'HR', salary: 42000, status: 'Inactive' },
    ]
  }
];

const columns: ColumnConfig[] = [
  {
    field: 'name',
    headerName: 'Name',
    width: 150,
    formConfig: {
      type: 'text',
      required: true,
    },
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 200,
    formConfig: {
      type: 'text',
      required: false,
    },
  },
  {
    field: 'age',
    headerName: 'Age',
    width: 100,
    formConfig: {
      type: 'number',
      required: true,
    },
  },
  {
    field: 'birthday',
    headerName: 'Birthday',
    width: 150,
    formConfig: {
      type: 'date',
      required: true,
    },
  },
  {
    field: 'department',
    headerName: 'Department',
    width: 150,
    formConfig: {
      type: 'select',
      required: true,
      options: [
        { label: 'IT', value: 'IT' },
        { label: 'HR', value: 'HR' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Marketing', value: 'Marketing' },
      ],
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    formConfig: {
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
    },
    renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Active' ? 'success' : 'error'} 
        />
      )
  },
  {
    field: 'salary',
    headerName: 'Salary',
    width: 150,
    formConfig: {
      type: 'number',
      required: true,
    },
  },
];


const TableDemo: React.FC = () => {
  const [rows, setRows] = useState(initialRows);

  const handleAdd = (newRow: any) => {
    // 添加到第一个组
    const newRows = [...rows];
    newRows[0].items.push({ ...newRow, id: Math.random() });
    setRows(newRows);
  };

  const handleEdit = (editedRow: any) => {
    const newRows = rows.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === editedRow.id ? editedRow : item
      )
    }));
    setRows(newRows);
  };

  const handleDelete = (deletedRow: any) => {
    const newRows = rows.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== deletedRow.id)
    }));
    setRows(newRows);
  };

  const handleSearch = (searchParams: any) => {
    let filteredRows = initialRows.map(group => ({
      ...group,
      items: group.items.filter(item => {
        let match = true;
        if (searchParams.name) {
          match = match && item.name.toLowerCase().includes(searchParams.name.toLowerCase());
        }
        if (searchParams.department) {
          match = match && item.department === searchParams.department;
        }
        if (searchParams.status) {
          match = match && item.status === searchParams.status;
        }
        return match;
      })
    }));
    
    setRows(filteredRows);
  };

  return (
    <Box sx={{height:'100%',width:'100%',p:2 }}>
      <PowerDataGrid
        columns={columns}
        rows={rows}
        onAdd={handleAdd}
        onEdit={handleEdit}
        group={true}
        expand={false}
        name='Employee'
        features = {{
            add: true,
            edit: true,
            delete: true,
            search: {
                field: 'name',  // field to search
                placeholder: 'Search by name'  // optional
            },
            toolbar: {
                export: true,
                filter: true,
                columns: true,
                density: true,
            }
          }}
          actions={[
            {
              key: 'preview',
              icon: <PreviewIcon />,
              tooltip: 'Preview',
              color: 'info'
            },
            {
              key: 'download',
              icon: <DownloadIcon />,
              tooltip: 'Download',
              color: 'success'
            }
          ]}
          onAction={(key, row) => {
            switch (key) {
              case 'delete':
                handleDelete(row);
                break;
              case 'preview':
                // 处理预览
                break;
              case 'download':
                // 处理下载
                break;
              default:
                // for add, edit, will open dialog.
                return true
                break;
            }
          }}
      />
    </Box>
  );
};

export default TableDemo; 