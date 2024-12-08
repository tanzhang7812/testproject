import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/material/styles';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Typography from '@mui/material/Typography';

interface Message {
  id: string;
  status: 'error' | 'warning';
  nodeId: string;
  nodeName: string;
  message: string;
  timestamp: string;
}

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 'none',
  backgroundColor: theme.palette.background.paper,
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme.palette.background.default,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: '36px !important',
    maxHeight: '36px !important',
    lineHeight: '36px !important',
    padding: '0 16px',
  },
  '& .MuiDataGrid-row': {
    minHeight: '36px !important',
    maxHeight: '36px !important',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: `1px solid ${theme.palette.divider}`,
    minHeight: '42px',
  },
  '& .MuiDataGrid-virtualScroller': {
    backgroundColor: 'transparent',
  },
  '& .MuiDataGrid-columnHeaderTitleContainer': {
    padding: 0,
  },
  '& .MuiDataGrid-columnHeader': {
    padding: '0 16px',
  },
}));

const StatusIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status'
})<{ status: 'error' | 'warning' }>(({ theme, status }) => ({
  color: status === 'error' 
    ? theme.palette.error.main 
    : theme.palette.warning.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const columns: GridColDef[] = [
  {
    field: 'status',
    headerName: 'Status',
    width: 70,
    renderCell: (params) => (
      <StatusIcon status={params.value}>
        {params.value === 'error' ? <ErrorIcon /> : <WarningIcon />}
      </StatusIcon>
    ),
  },
  {
    field: 'nodeId',
    headerName: 'Node ID',
    width: 130,
  },
  {
    field: 'nodeName',
    headerName: 'Node Name',
    width: 180,
  },
  {
    field: 'message',
    headerName: 'Message',
    flex: 1,
  },
  {
    field: 'timestamp',
    headerName: 'Time',
    width: 180,
  },
];

// 示例数据
const rows: Message[] = [
  {
    id: '1',
    status: 'error',
    nodeId: 'node_1',
    nodeName: 'CSV Reader',
    message: 'Failed to read file: file not found',
    timestamp: '2024-01-20 10:30:45',
  },
  {
    id: '2',
    status: 'warning',
    nodeId: 'node_2',
    nodeName: 'Data Filter',
    message: 'Some rows contain invalid data',
    timestamp: '2024-01-20 10:31:00',
  },
  {
    id: '3',
    status: 'error',
    nodeId: 'node_3',
    nodeName: 'Excel Writer',
    message: 'Permission denied: cannot write to output file',
    timestamp: '2024-01-20 10:31:15',
  },
];

const GridHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const HeaderLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const HeaderRight = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export default function MessageGrid() {
  const [viewType, setViewType] = useState('data');

  const handleExport = () => {
    // 实现导出功能
    console.log('Export to Excel');
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <GridHeader>
        <HeaderLeft>
          <Typography variant="body2" color="text.secondary">
            Total: {rows.length} records
          </Typography>
          <RadioGroup
            row
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            sx={{
              '& .MuiFormControlLabel-root': {
                marginRight: 2,
              },
              '& .MuiRadio-root': {
                padding: 0.5,
                marginRight: 0.5,
              },
            }}
          >
            <FormControlLabel 
              value="data" 
              control={<Radio size="small" />} 
              label={
                <Typography variant="body2">
                  Data
                </Typography>
              }
            />
            <FormControlLabel 
              value="metadata" 
              control={<Radio size="small" />} 
              label={
                <Typography variant="body2">
                  MetaData
                </Typography>
              }
            />
          </RadioGroup>
        </HeaderLeft>
        <HeaderRight>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            sx={{
              textTransform: 'none',
              height: 32,
            }}
          >
            Export to Excel
          </Button>
        </HeaderRight>
      </GridHeader>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid
          rowHeight={36}
          columnHeaderHeight={40}
          rows={rows}
          columns={columns}
          initialState={{
            sorting: {
              sortModel: [{ field: 'timestamp', sort: 'desc' }],
            },
          }}
          hideFooter
          disableRowSelectionOnClick
          sx={{ height: '100%', border: 'none' }}
        />
      </Box>
    </Box>
  );
} 