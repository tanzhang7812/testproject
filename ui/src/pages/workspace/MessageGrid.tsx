import React, { useEffect, useMemo, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { styled, useTheme } from '@mui/material/styles';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Typography from '@mui/material/Typography';
import { WorkflowError, WorkflowErrorItem } from './context/WorkflowContext';

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
      <StatusIcon status={params.value} sx={{ height: '30px', width: '30px' }}>
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
    field: 'name',
    headerName: 'Node Name',
    width: 180,
  },
  {
    field: 'message',
    headerName: 'Message',
    flex: 1,
  },
  {
    field: 'time',
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
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const HeaderLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  height: '35px',
  lineHeight: '35px',
  marginLeft: '16px',
});

const HeaderRight = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  height: '35px',
  lineHeight: '35px',
});

// 添加这些样式组件
const ErrorLabel = styled('span')(({ theme }) => ({
  fontSize: '0.875rem', // 14px
}));

const WarningLabel = styled('span')(({ theme }) => ({
  fontSize: '0.875rem', // 14px
}));

const NormalLabel = styled('span')({
  fontSize: '0.875rem' // 14px
});

interface MessageGridProps {
  errors: WorkflowErrorItem[];
}

export default function MessageGrid({ errors = [] }: MessageGridProps) {
  const [viewType, setViewType] = useState('all'); // 修改初始值为 'all'
  // 移除 filteredRows 状态，改用计算值
  const theme = useTheme();
  // 处理单选框变化
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setViewType(event.target.value);
  };

  // 使用 useMemo 计算过滤后的行
  const filteredRows = useMemo(() => {
    if (viewType === 'all') {
      return errors;
    }
    return errors.filter(row => row.status === viewType);
  }, [errors, viewType]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <GridHeader>
        <HeaderLeft>
          <Typography variant="body2" color="text.secondary">
            Total: {filteredRows.length} records
          </Typography>
          <RadioGroup
            row
            value={viewType}
            onChange={handleFilterChange}
            sx={{ ml: 2 }}
          >
            <FormControlLabel
              value="all"
              control={<Radio size="small" sx={{ color: theme.palette.text.primary, '&.Mui-checked': { color: theme.palette.text.primary } }} />}
              label={<NormalLabel>All</NormalLabel>}
            />
            <FormControlLabel
              value="error"
              control={<Radio size="small" sx={{ color: theme.palette.error.main, '&.Mui-checked': { color: theme.palette.error.main } }} />}
              label={<ErrorLabel>Error</ErrorLabel>}
            />
            <FormControlLabel
              value="warning"
              control={<Radio size="small" sx={{ color: theme.palette.warning.main, '&.Mui-checked': { color: theme.palette.warning.main } }} />}
              label={<WarningLabel>Warning</WarningLabel>}
            />
          </RadioGroup>
        </HeaderLeft>
        <HeaderRight>
          {/* <Button
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
          </Button> */}
        </HeaderRight>
      </GridHeader>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid
          rowHeight={30}
          columnHeaderHeight={40}
          rows={filteredRows}
          columns={columns}
          initialState={{
            sorting: {
              sortModel: [{ field: 'time', sort: 'desc' }],
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