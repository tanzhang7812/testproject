import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import MuiTableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Select from '../form/Select';
import Checkbox from '@mui/material/Checkbox';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import dayjs from 'dayjs';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  width?: string | number;
  options?: Array<{
    label: string;
    value: string | number;
  }>;
}

interface RowData {
  id: string;
  [key: string]: any;
}

// 添加功能配置接口
interface GridFeatures {
  add?: boolean;
  delete?: boolean;
  export?: boolean;
  drag?: boolean;  // 添加拖动功能配置
}

// 添加校验错误类型
export interface ValidationError {
  rowId: string;
  field: string;
  message: string;
}

// 添加变更类型定义
export type ChangeType = 'reorder' | 'edit' | 'add' | 'delete';

// 添加变更信息接口
export interface GridChangeInfo {
  type: ChangeType;
  data: RowData[];
  validation: ValidationError[];
  changes?: {
    rowId?: string;
    field?: string;
    oldValue?: any;
    newValue?: any;
  };
}

export interface PowerEditGridProps {
  fields: FieldConfig[];
  data: any[];
  features?: {
    add?: boolean;
    delete?: boolean;
    export?: boolean;
    drag?: boolean;
  };
  mode?: 'normal' | 'pick' | 'readonly';
  onValidate?: (errors: ValidationError[]) => void;
  onValueChange?: (info: GridChangeInfo) => void;
  selectedRowIds?: string[];
  onSelectedChange?: (selectedIds: string[]) => void;
}

// 添加校验方法
export const validateGrid = (data: RowData[], fields: FieldConfig[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  data.forEach(row => {
    fields.forEach(field => {
      const value = row[field.name];

      // 必填校验
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          rowId: row.id,
          field: field.name,
          message: `${field.label} is required`,
        });
      }

      // 根据字段类型进行校验
      switch (field.type) {
        case 'date':
          if (value && !dayjs(value).isValid()) {
            errors.push({
              rowId: row.id,
              field: field.name,
              message: `${field.label} is not a valid date`,
            });
          }
          break;
        case 'select':
          if (value && !field.options?.some(opt => opt.value === value)) {
            errors.push({
              rowId: row.id,
              field: field.name,
              message: `${field.label} has invalid value`,
            });
          }
          break;
        // 可以添加更多类型的��验
      }
    });
  });

  return errors;
};

// 添加一个带错误提示的单元格包装组件
const ErrorCell = styled(Box)(({ theme }) => ({
  width: '100%',
  '& .error-field': {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.error.main,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.error.main,
      },
    },
  }
}));

// 修改 CustomField 组件，添加 key 属性以保持焦点
const CustomField = ({ type, value, onChange, options, disabled, error, helperText, rowId, fieldName, ...props }: any) => {
  const field = (
    <Box className={error ? 'error-field' : ''}>
      {(() => {
        switch (type) {
          case 'select':
            return (
              <Select
                key={`${rowId}-${fieldName}`}
                value={value}
                onChange={onChange}
                options={options || []}
                size="small"
                fullWidth
                disabled={disabled}
                error={error}
                {...props}
              />
            );
          case 'checkbox':
            return (
              <Checkbox
                key={`${rowId}-${fieldName}`}
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked)}
                size="small"
                disabled={disabled}
                {...props}
              />
            );
          case 'date':
            return (
              <DatePicker
                key={`${rowId}-${fieldName}`}
                value={value ? dayjs(value) : null}
                onChange={(newValue) => onChange(newValue?.format('YYYY-MM-DD'))}
                disabled={disabled}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    disabled,
                    error,
                    ...props
                  }
                }}
              />
            );
          default:
            return (
              <TextField
                key={`${rowId}-${fieldName}`}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                fullWidth
                disabled={disabled}
                error={error}
                {...props}
              />
            );
        }
      })()}
    </Box>
  );

  return error && helperText ? (
    <Tooltip 
      title={helperText}
      arrow
      placement="top"
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'error.main',
            '& .MuiTooltip-arrow': {
              color: 'error.main',
            },
          },
        },
      }}
    >
      {field}
    </Tooltip>
  ) : field;
};

const DragHandle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'grab',
  color: theme.palette.text.secondary,
  width: '32px',
  '&:hover': {
    color: theme.palette.text.primary,
  },
  '&:active': {
    cursor: 'grabbing',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  '&.drag-handle-cell': {
    width: 32,
    minWidth: 32,
    maxWidth: 32,
    padding: 0,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  '&.checkbox-cell': {
    width: 48,
    minWidth: 48,
    maxWidth: 48,
    padding: theme.spacing(0, 1),
    '& .MuiCheckbox-root': {
      padding: theme.spacing(0.5),
    }
  },
  '&.flex-cell': {
    width: '100%',
  }
}));

const DraggableRow = styled(TableRow)<{ isDragging?: boolean }>(({ theme, isDragging }) => ({
  backgroundColor: isDragging ? theme.palette.action.hover : 'inherit',
  width: '100%',
  display: 'table-row',
  tableLayout: 'fixed',
  '& td': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    width: 'inherit',
  },
}));

const GridToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: '48px !important',
  padding: theme.spacing(1, 2),
  gap: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ScrollContainer = styled('div')({
  flex: 1,
  position: 'relative',
  '& table': {
    width: '100%',
    tableLayout: 'fixed',
  }
});

const TableWrapper = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'auto',
  border: '1px solid #e0e0e0'
});

// 添加一个带有选中状态的删除按钮组件
const DeleteButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'hasSelected'
})<{ hasSelected?: boolean }>(({ theme, hasSelected }) => ({
  color: hasSelected ? theme.palette.error.main : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: hasSelected 
      ? theme.palette.error.light 
      : theme.palette.action.hover,
  },
  '& .MuiSvgIcon-root': {
    color: 'inherit'
  },
}));

// 修改列标题组件样式
const ColumnHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  color: theme.palette.text.primary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

// 修改必填标记样式
const RequiredMark = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: 4,
  fontSize: '1.2em',
  lineHeight: 1,
  fontWeight: 'bold',
}));

// 修改表头单元格样式
const HeaderCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderBottom: `2px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5, 1),
  '&.drag-handle-cell': {
    backgroundColor: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.divider}`,
    width: 32,
    minWidth: 32,
    maxWidth: 32,
    padding: 0,
  },
  '&.checkbox-cell': {
    backgroundColor: theme.palette.background.default,
    width: 48,
    minWidth: 48,
    maxWidth: 48,
    padding: theme.spacing(0, 1),
    '& .MuiCheckbox-root': {
      padding: theme.spacing(0.5),
    }
  }
}));

export default function PowerEditGrid({ 
  fields, 
  data: initialData, 
  features = {},
  mode = 'normal',
  onValidate,
  onValueChange,
  selectedRowIds = [],
  onSelectedChange
}: PowerEditGridProps) {
  const [data, setData] = useState<any[]>(initialData);
  const [selectedRows, setSelectedRows] = useState<string[]>(mode === 'pick' ? selectedRowIds : []);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Determine current mode
  const isReadonly = mode === 'readonly';
  const isPick = mode === 'pick';
  const isNormal = mode === 'normal';

  useEffect(() => {
    if (isPick) {
      setSelectedRows(selectedRowIds);
    }
  }, [selectedRowIds, isPick]);

  const handleCellChange = (id: string, field: string, value: any) => {
    if (isReadonly) return;
    
    const oldValue = data.find(row => row.id === id)?.[field];
    const newData = data.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    );
    setData(newData);

    // Real-time validation
    const errors = validateGrid(newData, fields);
    setValidationErrors(errors);
    onValidate?.(errors);
    
    // Trigger data change callback
    onValueChange?.({
      type: 'edit',
      data: newData,
      validation: errors,
      changes: {
        rowId: id,
        field,
        oldValue,
        newValue: value
      }
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const reorderedData = Array.from(data);
    const [removed] = reorderedData.splice(result.source.index, 1);
    reorderedData.splice(result.destination.index, 0, removed);
    
    setData(reorderedData);
    
    // 校验
    const errors = validateGrid(reorderedData, fields);
    setValidationErrors(errors);
    
    // 触发数据变化回调
    onValueChange?.({
      type: 'reorder',
      data: reorderedData,
      validation: errors,
      changes: {
        rowId: removed.id,
        oldValue: result.source.index,
        newValue: result.destination.index
      }
    });
  };

  const handleAddRow = () => {
    const newRow: RowData = {
      id: `new-${Date.now()}`,
      ...fields.reduce((acc, field) => ({
        ...acc,
        [field.name]: field.type === 'checkbox' ? false : ''
      }), {})
    };
    const newData = [...data, newRow];
    setData(newData);

    // 校验
    const errors = validateGrid(newData, fields);
    setValidationErrors(errors);
    
    // 触发数据变化回调
    onValueChange?.({
      type: 'add',
      data: newData,
      validation: errors,
      changes: {
        rowId: newRow.id
      }
    });
  };

  const handleDeleteRows = () => {
    const deletedIds = [...selectedRows];
    const newData = data.filter(row => !selectedRows.includes(row.id));
    setData(newData);
    setSelectedRows([]);

    // 校验
    const errors = validateGrid(newData, fields);
    setValidationErrors(errors);
    
    // 触发数据变化回调
    onValueChange?.({
      type: 'delete',
      data: newData,
      validation: errors,
      changes: {
        rowId: deletedIds.join(',')
      }
    });
  };

  const handleExport = () => {
    const headers = fields.map(f => f.label).join(',');
    const rows = data.map(row => 
      fields.map(field => row[field.name]).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'export.csv';
    link.click();
  };

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedRows(newSelection);
    onSelectedChange?.(newSelection);
  };

  const fixedWidth = fields.reduce((sum, field) => {
    if (field.width && field.width !== '*') {
      return sum + (typeof field.width === 'number' ? field.width : parseInt(field.width));
    }
    return sum;
  }, 80);

  const flexColumns = fields.filter(field => field.width === '*').length;

  // 获取字段的错误信息
  const getFieldError = (rowId: string, fieldName: string) => {
    return validationErrors.find(
      error => error.rowId === rowId && error.field === fieldName
    )?.message;
  };

  // 渲染单元格内容
  const renderCell = (row: RowData, field: FieldConfig) => {
    const error = getFieldError(row.id, field.name);
    
    return (
      <ErrorCell>
        <CustomField
          type={field.type}
          value={row[field.name]}
          onChange={(value: any) => handleCellChange(row.id, field.name, value)}
          options={field.options}
          disabled={mode === 'pick' && !selectedRows.includes(row.id)}
          error={!!error}
          helperText={error}
          rowId={row.id}
          fieldName={field.name}
        />
      </ErrorCell>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ height: '100%', width: '100%' }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar - Hide in readonly mode */}
          {!isReadonly || features.add || features.delete && (
            <GridToolbar>
              {isNormal && features.add && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddRow}
                >
                  Add Row
                </Button>
              )}
              {isNormal && features.delete && (
                <Tooltip title={selectedRows.length === 0 ? 'Select rows to delete' : ''}>
                  <span>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeleteRows}
                      color="error"
                      disabled={selectedRows.length === 0}
                    >
                      Delete ({selectedRows.length})
                    </Button>
                  </span>
                </Tooltip>
              )}
              <Box sx={{ flex: 1 }} />
              {features.export && (
                <IconButton
                  size="small"
                  onClick={handleExport}
                  title="Export to Excel"
                >
                  <FileDownloadIcon />
                </IconButton>
              )}
            </GridToolbar>
          )}

          <ScrollContainer>
            {features.drag && !isReadonly ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="table-body">
                  {(provided) => (
                    <TableWrapper>
                      <Table stickyHeader >
                        <TableHead>
                          <TableRow>
                            {features.drag && <HeaderCell className="drag-handle-cell" />}
                            {!isReadonly && (
                              <HeaderCell className="checkbox-cell" padding="checkbox">
                                <Checkbox
                                  size="small"
                                  indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                                  checked={selectedRows.length === data.length}
                                  onChange={(e) => {
                                    const newSelection = e.target.checked ? data.map(row => row.id) : [];
                                    handleSelectionChange(newSelection);
                                  }}
                                />
                              </HeaderCell>
                            )}
                            {fields.map((field) => (
                              <HeaderCell 
                                key={field.name}
                                className={field.width === '*' ? 'flex-cell' : undefined}
                                sx={{
                                  width: field.width === '*' ? `calc((100% - ${fixedWidth}px) / ${flexColumns})` : field.width,
                                  minWidth: field.width === '*' ? 150 : field.width,
                                }}
                              >
                                <ColumnHeader>
                                  {field.label}
                                  {field.required && <RequiredMark>*</RequiredMark>}
                                </ColumnHeader>
                              </HeaderCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                          {data.map((row, index) => (
                            <Draggable key={row.id} draggableId={row.id} index={index}>
                              {(provided, snapshot) => (
                                <DraggableRow
                                  ref={provided.innerRef}
                                  key={row.id}
                                  {...provided.draggableProps}
                                  isDragging={snapshot.isDragging}
                                  selected={selectedRows.includes(row.id)}
                                >
                                  {features.drag && (
                                    <StyledTableCell 
                                      className="drag-handle-cell"
                                      {...provided.dragHandleProps}
                                    >
                                      <DragHandle>
                                        <DragIndicatorIcon />
                                      </DragHandle>
                                    </StyledTableCell>
                                  )}
                                  {!isReadonly && (
                                    <StyledTableCell className="checkbox-cell" padding="checkbox">
                                      <Checkbox
                                        size="small"
                                        checked={selectedRows.includes(row.id)}
                                        onChange={(e) => {
                                          const newSelection = e.target.checked 
                                            ? [...selectedRows, row.id]
                                            : selectedRows.filter(id => id !== row.id);
                                          handleSelectionChange(newSelection);
                                        }}
                                      />
                                    </StyledTableCell>
                                  )}
                                  {fields.map((field) => (
                                    <StyledTableCell 
                                      key={field.name}
                                      className={field.width === '*' ? 'flex-cell' : undefined}
                                      sx={{
                                        width: field.width === '*' ? `calc((100% - ${fixedWidth}px) / ${flexColumns})` : field.width,
                                        minWidth: field.width === '*' ? 150 : field.width,
                                      }}
                                    >
                                      <CustomField
                                        type={field.type}
                                        value={row[field.name]}
                                        onChange={(value: any) => handleCellChange(row.id, field.name, value)}
                                        options={field.options}
                                        disabled={isReadonly || (isPick && !selectedRows.includes(row.id))}
                                        error={!!getFieldError(row.id, field.name)}
                                        helperText={getFieldError(row.id, field.name)}
                                        rowId={row.id}
                                        fieldName={field.name}
                                      />
                                    </StyledTableCell>
                                  ))}
                                </DraggableRow>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </TableBody>
                      </Table>
                    </TableWrapper>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <TableWrapper>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {!isReadonly && (
                        <HeaderCell className="checkbox-cell" padding="checkbox">
                          <Checkbox
                            size="small"
                            indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                            checked={selectedRows.length === data.length}
                            onChange={(e) => {
                              const newSelection = e.target.checked ? data.map(row => row.id) : [];
                              handleSelectionChange(newSelection);
                            }}
                          />
                        </HeaderCell>
                      )}
                      {fields.map((field) => (
                        <HeaderCell 
                          key={field.name}
                          className={field.width === '*' ? 'flex-cell' : undefined}
                          sx={{
                            width: field.width === '*' ? `calc((100% - ${fixedWidth}px) / ${flexColumns})` : field.width,
                            minWidth: field.width === '*' ? 150 : field.width,
                          }}
                        >
                          <ColumnHeader>
                            {field.label}
                            {field.required && <RequiredMark>*</RequiredMark>}
                          </ColumnHeader>
                        </HeaderCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow
                        key={row.id}
                        selected={selectedRows.includes(row.id)}
                      >
                        {!isReadonly && (
                          <StyledTableCell className="checkbox-cell" padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={selectedRows.includes(row.id)}
                              onChange={(e) => {
                                const newSelection = e.target.checked 
                                  ? [...selectedRows, row.id]
                                  : selectedRows.filter(id => id !== row.id);
                                handleSelectionChange(newSelection);
                              }}
                            />
                          </StyledTableCell>
                        )}
                        {fields.map((field) => (
                          <StyledTableCell 
                            key={field.name}
                            className={field.width === '*' ? 'flex-cell' : undefined}
                            sx={{
                              width: field.width === '*' ? `calc((100% - ${fixedWidth}px) / ${flexColumns})` : field.width,
                              minWidth: field.width === '*' ? 150 : field.width,
                            }}
                          >
                            <CustomField
                              type={field.type}
                              value={row[field.name]}
                              onChange={(value: any) => handleCellChange(row.id, field.name, value)}
                              options={field.options}
                              disabled={isReadonly || (isPick && !selectedRows.includes(row.id))}
                              error={!!getFieldError(row.id, field.name)}
                              helperText={getFieldError(row.id, field.name)}
                              rowId={row.id}
                              fieldName={field.name}
                            />
                          </StyledTableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            )}
          </ScrollContainer>
        </Box>
      </Box>
    </LocalizationProvider>
  );
} 