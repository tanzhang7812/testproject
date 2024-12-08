import React, { useEffect, useState } from 'react';
import { Box, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Select from '../form/Select';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

// Types
export interface Field {
  value: string;
  dataType: 'string' | 'number' | 'date' | 'time' | 'datetime';
  header: string;
}

export interface Operation {
  label: string;
  value: string;
  type: 'text' | 'date' | 'number' | 'field' | 'oneof' | 'between' | 'none';
  category: string;
}

export interface Condition {
  field: string;
  funcfield: string;
  operate: string;
  value: (string | number)[];
}

export interface ConditionGroup {
  type: 'orgroup' | 'andgroup' | 'and' | 'or' | '';
  group?: Condition[];
}

interface FilterAssembleProps {
  fields: Field[];
  operations: Operation[];
  conditions: ConditionGroup[];
  onChange: (conditions: ConditionGroup[]) => void;
  triggerInitValidate?: boolean;
}

// Styled components
const FilterRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 2fr 140px',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  alignItems: 'center',
  paddingLeft: theme.spacing(2),
  '& .MuiTextField-root, & .MuiAutocomplete-root': {
    width: '100%'
  }
}));

const FilterGroup = styled(Box)<{ grouptype?: string }>(({ theme, grouptype }) => ({
  position: 'relative',
  marginBottom: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  '&::before': {
    content: grouptype === 'orgroup' || grouptype === 'andgroup' ? '""' : 'none',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '5px',
    borderLeft: `1px solid ${grouptype === 'orgroup' ? theme.palette.secondary.main : theme.palette.primary.main}`,
    borderTop: `1px solid ${grouptype === 'orgroup' ? theme.palette.secondary.main : theme.palette.primary.main}`,
    borderBottom: `1px solid ${grouptype === 'orgroup' ? theme.palette.secondary.main : theme.palette.primary.main}`,
  }
}));

const GroupLabel = styled(Box)<{ grouptype?: string }>(({ theme, grouptype }) => ({
  position: 'absolute',
  left: grouptype === 'orgroup' ? theme.spacing(-1) : theme.spacing(-1.6),
  top: '50%',
  transform: 'translateY(-50%)',
  color: grouptype === 'orgroup' ? theme.palette.secondary.main : theme.palette.primary.main,
  fontWeight: 'bold',
  fontSize: '0.875rem',
  backgroundColor: theme.palette.background.paper,
}));

const OperationButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  justifyContent: 'flex-end',
  width: '100%',
  '& .MuiButton-root': {
    minWidth: '40px',
    padding: '2px 8px',
  }
}));

const FilterAssemble: React.FC<FilterAssembleProps> = ({
  fields,
  operations,
  conditions,
  onChange,
  triggerInitValidate = false,
}) => {
  const [localConditions, setLocalConditions] = useState<ConditionGroup[]>(conditions);
  const [validationErrors, setValidationErrors] = useState<boolean>(false);

  // Validation function
  const validateConditions = (conditionsToValidate: ConditionGroup[]) => {
    if (!conditionsToValidate || conditionsToValidate.length === 0) {
      return true;
    }

    for (const group of conditionsToValidate) {
      if (!group.group) continue;
      
      for (const condition of group.group) {
        if (!condition.field || !condition.operate) {
          return false;
        }
        
        // Check if value is required based on operation type
        const operation = operations.find(op => op.value === condition.operate);
        if (operation && operation.type !== 'none' && (!condition.value || condition.value.length === 0)) {
          return false;
        }
      }
    }
    return true;
  };

  // Initial validation effect
  useEffect(() => {
    if (triggerInitValidate && conditions && conditions.length > 0) {
      const isValid = validateConditions(conditions);
      setValidationErrors(!isValid);
    }
  }, [triggerInitValidate, conditions]);

  useEffect(() => {
    if (conditions.length === 0) {
      setLocalConditions([{ type: '', group: [{ field: '', funcfield: '', operate: '', value: [] }] }]);
    } else {
      setLocalConditions(conditions);
      // Validate when conditions change and there are values
      const isValid = validateConditions(conditions);
      setValidationErrors(!isValid);
    }
  }, [conditions]);

  const handleFieldChange = (rowIndex: number, groupIndex: number, value: string) => {
    const newConditions = [...localConditions];
    const group = newConditions[groupIndex].group;
    if (group) {
      group[rowIndex] = {
        ...group[rowIndex],
        field: value,
        funcfield: value,
        operate: '', // Reset operation when field changes
        value: [], // Reset value when field changes
      };
    }
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const handleOperateChange = (rowIndex: number, groupIndex: number, value: string) => {
    const newConditions = [...localConditions];
    const group = newConditions[groupIndex].group;
    if (group) {
      group[rowIndex] = {
        ...group[rowIndex],
        operate: value,
        value: [], // Reset value when operation changes
      };
    }
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const handleValueChange = (rowIndex: number, groupIndex: number, valueIndex: number, value: string | number) => {
    const newConditions = [...localConditions];
    const group = newConditions[groupIndex].group;
    if (group) {
      const newValue = [...group[rowIndex].value];
      newValue[valueIndex] = value;
      group[rowIndex] = {
        ...group[rowIndex],
        value: newValue,
      };
    }
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const handleDelete = (rowIndex: number, groupIndex: number) => {
    const newConditions = [...localConditions];
    const currentGroup = newConditions[groupIndex];
    
    if (currentGroup.group) {
      currentGroup.group.splice(rowIndex, 1);
      
      // If group has only one condition left, convert to empty type
      if (currentGroup.group.length === 1) {
        currentGroup.type = '';
        
        // Check if we can merge with adjacent groups
        const prevGroup = groupIndex > 1 ? newConditions[groupIndex - 2] : null;
        const nextGroup = groupIndex < newConditions.length - 2 ? newConditions[groupIndex + 2] : null;
        const prevSeparator = groupIndex > 0 ? newConditions[groupIndex - 1] : null;
        const nextSeparator = groupIndex < newConditions.length - 1 ? newConditions[groupIndex + 1] : null;
        
        // Check if we can merge with both prev and next groups
        if (prevGroup && nextGroup && 
            prevSeparator?.type === 'and' && nextSeparator?.type === 'and' &&
            (prevGroup.type === '' || prevGroup.type === 'andgroup') &&
            (nextGroup.type === '' || nextGroup.type === 'andgroup')) {
          // Merge all three groups
          const mergedGroup: ConditionGroup = {
            type: prevGroup.group!.length + currentGroup.group.length + nextGroup.group!.length > 1 ? 'andgroup' : '',
            group: [...prevGroup.group!, ...currentGroup.group, ...nextGroup.group!]
          };
          newConditions.splice(groupIndex - 2, 5, mergedGroup);
        }
        // Check if we can merge with prev group
        else if (prevGroup && prevSeparator?.type === 'and' &&
                 (prevGroup.type === '' || prevGroup.type === 'andgroup')) {
          // Merge with prev group
          const mergedGroup: ConditionGroup = {
            type: prevGroup.group!.length + currentGroup.group.length > 1 ? 'andgroup' : '',
            group: [...prevGroup.group!, ...currentGroup.group]
          };
          newConditions.splice(groupIndex - 2, 3, mergedGroup);
        }
        // Check if we can merge with next group
        else if (nextGroup && nextSeparator?.type === 'and' &&
                 (nextGroup.type === '' || nextGroup.type === 'andgroup')) {
          // Merge with next group
          const mergedGroup: ConditionGroup = {
            type: currentGroup.group.length + nextGroup.group!.length > 1 ? 'andgroup' : '',
            group: [...currentGroup.group, ...nextGroup.group!]
          };
          newConditions.splice(groupIndex, 3, mergedGroup);
        }
      }
      
      // If group is empty, remove it and its separator
      if (currentGroup.group.length === 0) {
        if (groupIndex > 0 && (newConditions[groupIndex - 1].type === 'and' || newConditions[groupIndex - 1].type === 'or')) {
          newConditions.splice(groupIndex - 1, 2);
        } else {
          newConditions.splice(groupIndex, 1);
        }
      }
    }
    
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const handleAddOr = (rowIndex: number, groupIndex: number) => {
    const newConditions = [...localConditions];
    const currentGroup = newConditions[groupIndex];
    
    if (currentGroup.type === '') {
      // Add new condition to current group and convert to orgroup
      currentGroup.type = 'orgroup';
      currentGroup.group!.push({ field: '', funcfield: '', operate: '', value: [] });
    } else if (currentGroup.type === 'orgroup') {
      // Add to existing or group
      currentGroup.group!.push({ field: '', funcfield: '', operate: '', value: [] });
    } else if (currentGroup.type === 'andgroup') {
      const conditions = currentGroup.group!;
      const beforeConditions = conditions.slice(0, rowIndex);
      const afterConditions = conditions.slice(rowIndex + 1);
      
      // Create new groups
      const updates: ConditionGroup[] = [];
      
      // Add before conditions as empty type group if exists
      if (beforeConditions.length === 1) {
        updates.push({
          type: '',
          group: beforeConditions
        });
      } else if (beforeConditions.length > 1) {
        updates.push({
          type: 'andgroup',
          group: beforeConditions
        });
      }
      
      // Add AND separator if there were before conditions
      if (beforeConditions.length > 0) {
        updates.push({ type: 'and' });
      }
      
      // Add new orgroup
      updates.push({
        type: 'orgroup',
        group: [
          conditions[rowIndex],
          { field: '', funcfield: '', operate: '', value: [] }
        ]
      });
      
      // Add AND separator if there are after conditions
      if (afterConditions.length > 0) {
        updates.push({ type: 'and' });
      }
      
      // Add after conditions as empty type group if exists
      if (afterConditions.length === 1) {
        updates.push({
          type: '',
          group: afterConditions
        });
      } else if (afterConditions.length > 1) {
        updates.push({
          type: 'andgroup',
          group: afterConditions
        });
      }
      
      // Replace current group with new groups
      newConditions.splice(groupIndex, 1, ...updates);
    }
    
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const handleAddAnd = (rowIndex: number, groupIndex: number) => {
    const newConditions = [...localConditions];
    const currentGroup = newConditions[groupIndex];
    const nextGroup = newConditions[groupIndex + 1];
    const nextNextGroup = newConditions[groupIndex + 2];
    
    if (currentGroup.type === '') {
      // Add new condition to current group and convert to andgroup
      currentGroup.type = 'andgroup';
      currentGroup.group!.push({ field: '', funcfield: '', operate: '', value: [] });
    } else if (currentGroup.type === 'andgroup') {
      // Add to existing and group
      currentGroup.group!.push({ field: '', funcfield: '', operate: '', value: [] });
    } else if (currentGroup.type === 'orgroup') {
      // Check if we can merge with next group
      if (nextGroup?.type === 'and' && nextNextGroup) {
        if (nextNextGroup.type === '' || nextNextGroup.type === 'andgroup') {
          // Can merge with next group
          if (nextNextGroup.type === '') {
            // Convert empty group to andgroup
            nextNextGroup.type = 'andgroup';
          }
          // Add new condition to next group
          nextNextGroup.group!.push({ field: '', funcfield: '', operate: '', value: [] });
        } else {
          // Create new empty group
          const newEmptyGroup: ConditionGroup = {
            type: '',
            group: [{ field: '', funcfield: '', operate: '', value: [] }]
          };
          newConditions.splice(groupIndex + 1, 0, { type: 'and' });
          newConditions.splice(groupIndex + 2, 0, newEmptyGroup);
        }
      } else {
        // Create new empty group
        const newEmptyGroup: ConditionGroup = {
          type: '',
          group: [{ field: '', funcfield: '', operate: '', value: [] }]
        };
        newConditions.splice(groupIndex + 1, 0, { type: 'and' });
        newConditions.splice(groupIndex + 2, 0, newEmptyGroup);
      }
    }
    
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const handleAddNewCriteria = () => {
    const newConditions = [...localConditions];
    // Remove the visual divider if it exists (last item)
    if (newConditions.length > 0) {
      // Add real OR separator and new empty group
      newConditions.push(
        { type: 'or' },
        { 
          type: '', 
          group: [{ field: '', funcfield: '', operate: '', value: [] }] 
        }
      );
    } else {
      // First criteria
      newConditions.push({ 
        type: '', 
        group: [{ field: '', funcfield: '', operate: '', value: [] }] 
      });
    }
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const renderValueInput = (operation: Operation | undefined, condition: Condition, rowIndex: number, groupIndex: number) => {
    const selectedField = fields.find(f => f.value === condition.field);

    if (!operation || !operation.type) {
      return (
        <TextField
          size="small"
          disabled
          placeholder="Value"
          type={selectedField?.dataType === 'number' ? 'number' : 
                selectedField?.dataType === 'date' ? 'date' : 
                selectedField?.dataType === 'time' ? 'time' :
                selectedField?.dataType === 'datetime' ? 'datetime-local' : 'text'}
          inputProps={{
            step: (selectedField?.dataType === 'time' || selectedField?.dataType === 'datetime') ? 1 : undefined // Allow seconds in time and datetime input
          }}
        />
      );
    }

    switch (operation.type) {
      case 'text':
        return (
          <TextField
            size="small"
            type={selectedField?.dataType === 'number' ? 'number' : 
                  selectedField?.dataType === 'date' ? 'date' : 
                  selectedField?.dataType === 'time' ? 'time' :
                  selectedField?.dataType === 'datetime' ? 'datetime-local' : 'text'}
            value={condition.value[0] || ''}
            onChange={(e) => handleValueChange(rowIndex, groupIndex, 0, e.target.value)}
            inputProps={{
              step: (selectedField?.dataType === 'time' || selectedField?.dataType === 'datetime') ? 1 : undefined // Allow seconds in time and datetime input
            }}
          />
        );
      case 'number':
        return (
          <TextField
            size="small"
            type="number"
            value={condition.value[0] || ''}
            onChange={(e) => handleValueChange(rowIndex, groupIndex, 0, Number(e.target.value))}
          />
        );
      case 'date':
        return (
          <TextField
            size="small"
            type={selectedField?.dataType === 'time' ? 'time' :
                  selectedField?.dataType === 'datetime' ? 'datetime-local' : 'date'}
            value={condition.value[0] || ''}
            onChange={(e) => handleValueChange(rowIndex, groupIndex, 0, e.target.value)}
            inputProps={{
              step: (selectedField?.dataType === 'time' || selectedField?.dataType === 'datetime') ? 1 : undefined // Allow seconds in time and datetime input
            }}
          />
        );
      case 'field':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Select
              options={fields.map(f => ({ label: f.header, value: f.value }))}
              value={condition.value[0] || ''}
              onChange={(value) => handleValueChange(rowIndex, groupIndex, 0, value || '')}
            />
            <TextField
              size="small"
              value={condition.value[0] || ''}
              disabled
            />
          </Box>
        );
      case 'oneof':
        return (
          <TextField
            size="small"
            value={condition.value[0] || ''}
            onChange={(e) => handleValueChange(rowIndex, groupIndex, 0, e.target.value)}
            placeholder="Separate values with commas"
          />
        );
      case 'between':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              type={selectedField?.dataType === 'time' ? 'time' :
                    selectedField?.dataType === 'datetime' ? 'datetime-local' :
                    selectedField?.dataType === 'date' ? 'date' : 'number'}
              value={condition.value[0] || ''}
              onChange={(e) => handleValueChange(rowIndex, groupIndex, 0, selectedField?.dataType === 'date' || 
                                                                        selectedField?.dataType === 'time' || 
                                                                        selectedField?.dataType === 'datetime' ? 
                                                                        e.target.value : Number(e.target.value))}
              inputProps={{
                step: (selectedField?.dataType === 'time' || selectedField?.dataType === 'datetime') ? 1 : undefined // Allow seconds in time and datetime input
              }}
            />
            <TextField
              size="small"
              type={selectedField?.dataType === 'time' ? 'time' :
                    selectedField?.dataType === 'datetime' ? 'datetime-local' :
                    selectedField?.dataType === 'date' ? 'date' : 'number'}
              value={condition.value[1] || ''}
              onChange={(e) => handleValueChange(rowIndex, groupIndex, 1, selectedField?.dataType === 'date' || 
                                                                        selectedField?.dataType === 'time' || 
                                                                        selectedField?.dataType === 'datetime' ? 
                                                                        e.target.value : Number(e.target.value))}
              inputProps={{
                step: (selectedField?.dataType === 'time' || selectedField?.dataType === 'datetime') ? 1 : undefined // Allow seconds in time and datetime input
              }}
            />
          </Box>
        );
      case 'none':
        return <Box sx={{ width: '100%' }} />;
      default:
        return (
          <TextField
            size="small"
            disabled
            placeholder="Value"
          />
        );
    }
  };

  const renderCondition = (condition: Condition, rowIndex: number, groupIndex: number, groupType: string) => {
    const selectedField = fields.find(f => f.value === condition.field);
    const availableOperations = operations.filter(op => 
      op.category.includes(selectedField?.dataType || '')
    );
    const selectedOperation = operations.find(op => op.value === condition.operate);
    const currentGroup = localConditions[groupIndex];
    const isLastRow = rowIndex === (currentGroup.group?.length || 0) - 1;

    return (
      <FilterRow key={rowIndex}>
        <Select
          options={fields.map(f => ({ label: f.header, value: f.value }))}
          value={condition.field}
          onChange={(value) => handleFieldChange(rowIndex, groupIndex, value || '')}
        />
        <TextField
          size="small"
          value={condition.funcfield}
          disabled
        />
        <Select
          options={availableOperations.map(op => ({ label: op.label, value: op.value }))}
          value={condition.operate}
          onChange={(value) => handleOperateChange(rowIndex, groupIndex, value || '')}
        />
        <Box sx={{ width: '100%' }}>
          {renderValueInput(selectedOperation, condition, rowIndex, groupIndex)}
        </Box>
        <OperationButtons>
          <IconButton 
            size="small" 
            onClick={() => handleDelete(rowIndex, groupIndex)}
            sx={{ 
              color: 'error.main',
              padding: '2px'
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          {groupType === '' && rowIndex === 0 && (
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleAddOr(rowIndex, groupIndex)}
                color="secondary"
              >
                OR
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleAddAnd(rowIndex, groupIndex)}
                color="primary"
              >
                AND
              </Button>
            </>
          )}
          {groupType !== '' && (
            <>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleAddOr(rowIndex, groupIndex)}
                color="secondary"
              >
                OR
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleAddAnd(rowIndex, groupIndex)}
                color="primary"
                disabled={groupType === 'orgroup' && !isLastRow}
              >
                AND
              </Button>
            </>
          )}
        </OperationButtons>
      </FilterRow>
    );
  };

  return (
    <Box>
      {validationErrors && (
        <Box sx={{ 
          color: 'error.main', 
          mb: 2, 
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1 
        }}>
          <span>⚠️</span>
          <span>Please complete all required fields, all fields are required.</span>
        </Box>
      )}
      {localConditions.map((conditionGroup, groupIndex) => {
        // If this is a separator (type is "or" or "and" without group), just render the separator
        if ((conditionGroup.type === 'or' || conditionGroup.type === 'and') && !conditionGroup.group) {
          return (
            <Box 
              key={groupIndex}
              sx={{ 
                textAlign: 'left', 
                my: 1,
                pl: 1,
                color: conditionGroup.type === 'or' ? theme => theme.palette.secondary.main : theme => theme.palette.primary.main,
                fontWeight: 'bold'
              }}
            >
              {conditionGroup.type === 'or' ? 'OR' : 'AND'}
            </Box>
          );
        }

        // Otherwise render the group with its conditions
        return (
          <Box key={groupIndex}>
            {/* Add criteria header if this is the first group or after an OR separator */}
            {(groupIndex === 0 || (groupIndex > 0 && localConditions[groupIndex - 1].type === 'or')) && (
              <Box sx={{ 
                mb: 1,
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}>
                All of these conditions must be met
              </Box>
            )}
            <FilterGroup grouptype={conditionGroup.type}>
              {(conditionGroup.type === 'orgroup' || conditionGroup.type === 'andgroup') && (
                <GroupLabel grouptype={conditionGroup.type}>
                  {conditionGroup.type === 'orgroup' ? 'OR' : 'AND'}
                </GroupLabel>
              )}
              {conditionGroup.group?.map((condition, rowIndex) => 
                renderCondition(condition, rowIndex, groupIndex, conditionGroup.type)
              )}
            </FilterGroup>
          </Box>
        );
      })}
      {localConditions.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleAddNewCriteria}
          >
            New Criteria
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            position: 'relative',
            mt: 3,
            mb: 2,
            height: '1px',
            bgcolor: 'divider',
            '&::after': {
              content: '"OR"',
              position: 'absolute',
              top: '50%',
              left: '5%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              px: 2,
              color: 'text.secondary',
              fontSize: '0.875rem'
            }
          }} />
          <Box sx={{ textAlign: 'left' }}>
            <Button
              variant="outlined"
              onClick={handleAddNewCriteria}
              sx={{ ml: 1 }}
            >
              New Criteria
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default FilterAssemble; 