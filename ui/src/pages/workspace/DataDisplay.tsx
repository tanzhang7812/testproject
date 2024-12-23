import React, { useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridFilterModel, GridToolbar } from '@mui/x-data-grid';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import SchemaIcon from '@mui/icons-material/Schema';

interface SchemaItem {
  name: string;
  header: string;
  dataType: string;
}

interface DataDisplayProps {
  schema: SchemaItem[];
  data: any[];
  view: 'schema' | 'data';
  onViewChange: (view: 'schema' | 'data') => void;
  schemaColumns: GridColDef[];
  dataColumns: GridColDef[];
}


const DataDisplay: React.FC<DataDisplayProps> = ({ schema, data, view, onViewChange, schemaColumns, dataColumns }) => {
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  
  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'schema' | 'data',
  ) => {
    if (newView !== null) {
      onViewChange(newView);
    }
  };

  const schemaRows = useMemo(() => {
    return schema.map((item, index) => ({
      id: index,
      ...item
    }));
  }, [schema]);

  const dataRows = useMemo(() => {
    return data.map((item, index) => ({
      id: index,
      ...item
    }));
  }, [data]);
 
  const commonGridProps = {
    disableSelectionOnClick: true,
    hideFooter: true,
    filterMode: 'client' as const,  
    filterModel: filterModel,
    rowHeight: 30,
    columnHeaderHeight: 40,
    onFilterModelChange: (newModel: GridFilterModel) => {
      setFilterModel(newModel);
    },
    slots: {
        toolbar: GridToolbar,
    },
    sx: {
      height: '100%',
      border: 'none',
      '& .MuiDataGrid-root': {
        border: 'none',
      },
      '& .MuiDataGrid-cell': {
        fontSize: '0.875rem',
        borderBottom: 'none',
        borderRight: 'none',
      },
      '& .MuiDataGrid-columnHeaders': {
        borderBottom: 'none',
        backgroundColor: '#fafafa',
      },
      '& .MuiDataGrid-columnHeader': {
        fontSize: '0.875rem',
        fontWeight: 'bold',
        borderRight: 'none',
      },
      '& .MuiDataGrid-columnSeparator': {
        display: 'none',
      },
      '& .MuiDataGrid-row': {
        '&:hover': {
          backgroundColor: '#f5f5f5',
        },
      },
      '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
        outline: 'none',
      },
      '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
        outline: 'none',
      },
      // 过滤器样式
      '& .MuiDataGrid-filterForm': {
        bgcolor: 'background.paper',
      },
    }
  };

   // 过滤数据的函数
   const filterData = (rows: any[], filterModel: GridFilterModel) => {
    if (!filterModel.items.length) return rows;

    return rows.filter(row => {
      return filterModel.items.every(filterItem => {
        const value = row[filterItem.field];
        const filterValue = filterItem.value;

        if (!filterValue) return true;

        switch (filterItem.operator) {
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'equals':
            return String(value) === String(filterValue);
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
          default:
            return true;
        }
      });
    });
  };

  // 过滤后的数据
  const filteredSchemaRows = useMemo(() => 
    filterData(schemaRows, filterModel),
    [schemaRows, filterModel]
  );

  const filteredDataRows = useMemo(() => 
    filterData(dataRows, filterModel),
    [dataRows, filterModel]
  );

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden', // 防止出现滚动条
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          borderBottom: 1, 
          borderColor: 'divider',
          minHeight: '35px', // 固定切换按钮区域高度
          lineHeight: '35px',
        }}
      >
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0,
              textTransform: 'none',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:first-of-type': {
                borderRadius: 0 ,
                borderBottom: 0,  
                borderTop: 0,
                borderLeft: 0,
              },
              '&:last-of-type': {
                borderRadius: 0,
                borderLeft: 0,
                borderBottom: 0,
                borderTop: 0,
              },
            },
          }}
        >
            <ToggleButton value="data" aria-label="data view">
            <CodeIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            Data
          </ToggleButton>
          <ToggleButton value="schema" aria-label="schema view">
            <SchemaIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            Schema
          </ToggleButton>
          
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" sx={{
          height: '35px',
          lineHeight: '35px',
          marginLeft: '16px',
        }}>
            Total: {data.length} records
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          flexGrow: 1,
          height: 'calc(100% - 48px)', // 减去切换按钮区域的高度
          overflow: 'hidden',
        }}
      >
        {view === 'schema' && (
          <DataGrid
            rows={filteredSchemaRows}
            columns={schemaColumns}
            {...commonGridProps}
          />
        )}
        {view === 'data' && (
          <DataGrid
            rows={filteredDataRows}
            columns={dataColumns}
            {...commonGridProps}
          />
        )}
      </Box>
    </Box>
  );
};

export default DataDisplay;