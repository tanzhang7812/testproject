import React, { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridToolbarColumnsButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import PowerForm from '../form/PowerForm';
import {FormProvider} from "../form/PowerFormContext.tsx";
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

export interface ColumnConfig extends Omit<GridColDef, 'type'> {
  type?: 'text' | 'number' | 'select' | 'date';
  formConfig?: {
    type: 'text' | 'number' | 'select' | 'date' | 'time' | 'datetime';
    required?: boolean;
    options?: { label: string; value: any }[];
  };
  renderCell?: (params: any) => React.ReactNode;
}

interface CustomAction {
  key: string;
  icon: React.ReactNode;
  tooltip?: string;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface PowerDataGridProps {
  columns: ColumnConfig[];
  rows: any[];
  onAdd?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onAction?: (key: string, row?: any) => void;
  actions?: CustomAction[];
  group?: boolean;
  readonly?: boolean;
  expand?: boolean;
  name?: string;
  features?: {
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
    search?: {
        field: string;
        placeholder?: string;
    };
    toolbar?: {
      export?: boolean;
      filter?: boolean;
      columns?: boolean;
      density?: boolean;
    };
  };
}

interface GroupRow {
  id: string;
  isGroup: boolean;
  group: string;
  name: string;
  isExpanded: boolean;
  itemCount: number;
  [key: string]: any;
}   

const SearchField = React.forwardRef<
  HTMLDivElement,
  {
    onSearch: (value: string) => void;
    placeholder?: string;
  }
>((props, ref) => {
  const { onSearch, placeholder } = props;
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  return (
    <TextField
      ref={ref}
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon 
              sx={{ 
                color: focused ? 'primary.main' : 'action.active',
                fontSize: 20 
              }} 
            />
          </InputAdornment>
        ),
      }}
      sx={{ 
        minWidth: 200,
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'divider',
          },
          '&:hover fieldset': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused': {
            '& fieldset': {
              borderWidth: '1px',
            },
          },
        },
      }}
    />
  );
});

SearchField.displayName = 'SearchField';

// Update the CustomToolbar component
const CustomToolbar = React.memo(({ 
  onSearch,
  features,
  onAdd,
  name,
  group,
  handleExpandAll,
  handleCollapseAll
}: {
  onSearch: (value: string) => void;
  features: any;
  onAdd?: () => void;
  name?: string;
  group?: boolean;
  handleExpandAll?: () => void;
  handleCollapseAll?: () => void;
}) => {
  const showToolbar = features.toolbar && (
    features.toolbar.export || 
    features.toolbar.filter || 
    features.toolbar.columns || 
    (features.add && onAdd) || 
    features.search ||
    group
  );

  if (!showToolbar) return null;

  return (
    <GridToolbarContainer sx={{ 
      justifyContent: 'space-between',
      padding: '0.5rem',
    }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {features.add && onAdd && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            Add {name}
          </Button>
        )}
        {features.search && (
          <SearchField
            onSearch={onSearch}
            placeholder={features.search.placeholder || `Search ${features.search.field}`}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {group && (
          <>
            <Button
              size="small"
              startIcon={<ExpandMoreIcon />}
              onClick={handleExpandAll}
            >
              Expand All
            </Button>
            <Button
              size="small"
              startIcon={<ExpandLessIcon />}
              onClick={handleCollapseAll}
            >
              Collapse All
            </Button>
          </>
        )}
        {features.toolbar?.columns && <GridToolbarColumnsButton />}
        {features.toolbar?.filter && <GridToolbarFilterButton />}
        {features.toolbar?.density && <GridToolbarDensitySelector />}
        {features.toolbar?.export && <GridToolbarExport />}
      </Box>
    </GridToolbarContainer>
  );
});

CustomToolbar.displayName = 'CustomToolbar';

const PowerDataGrid: React.FC<PowerDataGridProps> = ({
  columns,
  rows,
  onAdd,
  onEdit,
  onAction,
  actions = [],
  group,
  readonly,
  expand = true,
  name = '',
  features = {
    add: true,
    edit: true,
    delete: true,
    search: undefined,
    toolbar: {
      export: true,
      filter: true, 
      columns: true,
      density: true,
    },
  },
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('edit');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(expand ? rows.map(r => r.id) : [])
  );
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleGroupClick = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEditClick = (row: any) => {
    setEditingRow(row);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingRow({});
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRow(null);
  };

  const handleDialogSave = (values: any) => {
    if (dialogMode === 'edit' && onEdit) {
      onEdit({ ...values, id: editingRow.id });
    } else if (dialogMode === 'add' && onAdd) {
      onAdd(values);
    }
    handleDialogClose();
  };

  const processedRows = React.useMemo(() => {
    if (!group) return rows;

    const result: any[] = [];
    
    rows.forEach(groupRow => {
      // Add group row
      const processedGroup = {
        ...groupRow,
        isGroup: true,
        isExpanded: expandedGroups.has(groupRow.id),
        itemCount: groupRow.items?.length || 0,
      };
      result.push(processedGroup);

      // Add child rows if group is expanded
      if (expandedGroups.has(groupRow.id) && groupRow.items) {
        groupRow.items.forEach(item => {
          result.push({
            ...item,
            id: item.id || `item-${groupRow.id}-${Math.random().toString(36).substr(2, 9)}`,
          });
        });
      }
    });

    return result;
  }, [rows, group, expandedGroups]);

  const actionColumn: GridColDef = {
    field: 'actions',
    headerName: 'Actions',
    width: 120 + (actions.length * 40),
    sortable: false,
    filterable: false,
    editable: false,
    renderCell: (params) => {
      if (params.row.isGroup) {
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            '& .MuiIconButton-root': {
              color: 'primary.main',
            },
            height:'100%',
          }}>
            <IconButton
              size="small"
              onClick={() => handleGroupClick(params.row.id)}
            >
              {params.row.isExpanded ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </IconButton>
            <Typography 
              variant="caption" 
              sx={{ 
                ml: 1,
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              ({params.row.itemCount} items)
            </Typography>
          </Box>
        );
      }
      if (readonly) return null;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {features.edit && onEdit && (
            <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => (!onAction ||onAction?.('edit', params.row))? handleEditClick(params.row):null}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            </Tooltip>
          )}
          {features.delete && (
            <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => onAction?.('delete', params.row)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            </Tooltip>
          )}
          {actions.map((action) => (
            <Tooltip key={action.key} title={action.tooltip || ''}>
              <IconButton
                size="small"
                onClick={() => onAction?.(action.key, params.row)}
                color={action.color || 'inherit'}
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      );
    },
  };

  // Process columns to add action column
  const finalColumns = React.useMemo(() => {
    // First process all columns with group rendering
    const processedCols = columns.map(col => ({
      ...col,
      editable: false,
      renderCell: (params: any) => {
        if (params.row.isGroup) {
          if (col.renderCell && params.value !== undefined) {
            return col.renderCell(params);
          }

          const isNameColumn = params.field === 'name';
          return (
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              pl: isNameColumn ? 0 : 2,
              fontWeight: isNameColumn ? 600 : 500,
              color: isNameColumn ? 'primary.main' : 'text.primary',
              fontSize: isNameColumn ? '0.95rem' : '0.875rem',
              '& .group-value': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
            }}>
              <span className="group-value">
                {params.value}
              </span>
            </Box>
          );
        }

        if (col.renderCell) {
          return col.renderCell(params);
        }

        return (
          <Box sx={{ 
            pl: 2,
            fontSize: '0.875rem',
            color: 'text.primary',
            opacity: 0.9,
          }}>
            {params.value}
          </Box>
        );
      }
    }));

    // Then add action column if needed for edit/delete or group functionality
    if (!readonly && ((features.edit || features.delete) || group)) {
      processedCols.unshift(actionColumn);
    }

    return processedCols;
  }, [columns, readonly, features.edit, features.delete, group]);

  // Convert columns to form fields
  const formFields = columns
    .filter(col => col.field !== 'actions' && col.formConfig)
    .map(col => ({
      name: col.field,
      label: col.headerName || col.field,
      type: col.formConfig?.type || 'text',
      required: col.formConfig?.required || false,
      options: col.formConfig?.options,
      width: col.width,
    }));

  const handleExpandAll = () => {
    setExpandedGroups(new Set(rows.map(r => r.id)));
  };

  const handleCollapseAll = () => {
    setExpandedGroups(new Set());
  };

 

  const filteredRows = React.useMemo(() => {
    if (!searchTerm || !features.search) return processedRows;
    
    if (!group) {
      // Simple filtering for non-grouped data
      return processedRows.filter(row => {
        const fieldValue = row[features.search.field];
        if (!fieldValue) return false;
        return String(fieldValue).toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
  
    // Handle grouped data
    return processedRows.reduce((acc: any[], row) => {
      if (row.isGroup) {
        // For group rows, check if any of its items match the search
        const matchingItems = row.items?.filter((item: any) => {
          const fieldValue = item[features.search.field];
          if (!fieldValue) return false;
          return String(fieldValue).toLowerCase().includes(searchTerm.toLowerCase());
        });
  
        if (matchingItems?.length > 0) {
          // If there are matching items, include the group and its matching items
          acc.push({
            ...row,
            items: matchingItems,
            itemCount: matchingItems.length,
            isExpanded: true // Auto expand groups with matching items
          });
  
          // Add matching items if group is expanded
          matchingItems.forEach(item => {
            acc.push({
              ...item,
              id: item.id || `item-${row.id}-${Math.random().toString(36).substr(2, 9)}`,
            });
          });
        }
      }
      return acc;
    }, []);
  }, [processedRows, searchTerm, features.search, group]);
  
  // Update expandedGroups when search value changes
  React.useEffect(() => {
    if (searchTerm && group) {
      // Automatically expand all groups that have matching items
      const groupsToExpand = new Set(
        filteredRows
          .filter(row => row.isGroup)
          .map(row => row.id)
      );
      setExpandedGroups(groupsToExpand);
    }
  }, [searchTerm, group, filteredRows]);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={filteredRows}
        columns={finalColumns}
        getRowClassName={(params) => params.row.isGroup ? 'group-row' : ''}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        disableColumnMenu
        disableRowSelectionOnClick
        rowHeight={40}
        slots={{
          toolbar: CustomToolbar,
        }}
        slotProps={{
            toolbar: {
              onSearch: handleSearch,
              features,
              onAdd: ()=>{ (!onAction || onAction?.('add')) ? handleAddClick():null},
              name,
              group,
              handleExpandAll,
              handleCollapseAll,
            },
          }}
        sx={{
          '& .group-row': {
            bgcolor: '#f3f3f3',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: '#f3f3f3',
            },
            '& .MuiDataGrid-cell': {
              bgcolor: 'transparent',
            },
          },
          '& .MuiDataGrid-row:not(.group-row)': {
            '&:hover': {
              bgcolor: 'action.hover',
            },
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'background.default',
            borderBottom: 2,
            borderColor: 'divider',
          },
        }}
      />
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'edit' ? 'Edit' : 'Add'} {name}
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {editingRow && (
            <FormProvider 
              defaultValue={editingRow}
              onSubmit={handleDialogSave}
            >
              <Box component="form" noValidate>
                <PowerForm
                  fields={formFields}
                  labelWidth={120}
                />
                <DialogActions>
                  <Button 
                    onClick={() => {
                      // Reset form to initial values
                      setEditingRow(dialogMode === 'edit' ? {...editingRow} : {});
                    }}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit"
                    variant="contained"
                  >
                    {dialogMode === 'edit' ? 'Update' : 'Save'}
                  </Button>
                </DialogActions>
              </Box>
            </FormProvider>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PowerDataGrid; 