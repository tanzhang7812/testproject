import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, TextField, Button, IconButton, Tooltip } from '@mui/material';
import FieldDisplay from '../form/FieldDisplay';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';

interface DatasetField {
    name: string;
    dataType: string;
    header: string;
}

interface Dataset {
    [key: string]: DatasetField[];
}

interface UnionOutput {
    [key: string]: string[];
}

interface UnionValue {
    datasets: { [key: string]: string[] }[];
    result: DatasetField[];
    valid?: boolean;
}

interface FieldError {
    index: number;
    message: string;
}

interface UnionAssembleProps {
    datasets: Dataset[];
    value?: UnionValue;
    onChange?: (output: UnionValue) => void;
}

// 生成规范化的 name
const generateName = (header: string, index?: number): string => {
    let name = header
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
    return index !== undefined ? `${name}_${index}` : name;
};

// 校验 value 是否有效
const validateValue = (value: UnionValue | undefined, datasets: Dataset[]): boolean => {
    if (!value) return true;

    // 创建数据集映射以便快速查找
    const datasetMap = new Map<string, DatasetField[]>();
    datasets.forEach(dataset => {
        Object.entries(dataset).forEach(([key, fields]) => {
            datasetMap.set(key, fields);
        });
    });

    // 1. 检查数据集是否一致
    for (const dataset of value.datasets) {
        const datasetName = Object.keys(dataset)[0];
        if (!datasetMap.has(datasetName)) {
            return false;
        }

        const valueFields = dataset[datasetName];
        const actualFields = datasetMap.get(datasetName)!;

        // 检查字段个数和名称是否匹配
        if (valueFields.length !== actualFields.length) {
            return false;
        }

        // 检查字段名称是否匹配
        const actualFieldNames = new Set(actualFields.map(f => f.name));
        if (!valueFields.every(fieldName => actualFieldNames.has(fieldName))) {
            return false;
        }
    }

    // 2. 检查 result 长度是否超过最大数据集长度
    const maxDatasetLength = Math.max(...Array.from(datasetMap.values()).map(fields => fields.length));
    if (value.result.length > maxDatasetLength) {
        return false;
    }

    // 3. 检查类型是否匹配
    // 按照 value.datasets 的顺序重新排列数据集和字段
    const orderedDatasets = value.datasets.map(dataset => {
        const datasetName = Object.keys(dataset)[0];
        const valueFields = dataset[datasetName];
        const originalFields = datasetMap.get(datasetName)!;

        // 创建字段映射以便快速查找
        const fieldMap = new Map(
            originalFields.map(field => [field.name, field])
        );

        // 按照 value 中的字段顺序重新排列字段
        const orderedFields = valueFields.map(fieldName => {
            const field = fieldMap.get(fieldName);
            if (!field) return null;
            return field;
        }).filter((field): field is DatasetField => field !== null);

        return {
            name: datasetName,
            fields: orderedFields
        };
    });

    // 遍历每个输出字段
    for (let i = 0; i < value.result.length; i++) {
        const resultField = value.result[i];
        
        // 获取所有数据集中该位置的字段
        const fieldsAtPosition = orderedDatasets.map(dataset => dataset.fields[i]);
        
        // 如果某个数据集没有这个位置的字段，跳过后续比较
        if (fieldsAtPosition.some(field => !field)) continue;

        // 检查所有数据集中该位置字段的类型是否与 result 中的类型匹配
        for (const field of fieldsAtPosition) {
            if (field.dataType !== resultField.dataType) {
                return false;
            }
        }
    }

    return true;
};

const UnionAssemble: React.FC<UnionAssembleProps> = ({ datasets, value, onChange }) => {
    const [allFields, setAllFields] = useState<DatasetField[]>([]);
    const [datasetFields, setDatasetFields] = useState<{ [key: string]: DatasetField[] }>({});
    const [datasetOrder, setDatasetOrder] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
    const [localHeaders, setLocalHeaders] = useState<{ [key: string]: string }>({});
    const [validationError, setValidationError] = useState<string>('');

    // 验证字段类型和 Header
    const validateFields = (fields: { [key: string]: DatasetField[] }, order: string[], outputFields: DatasetField[]) => {
        const errors: FieldError[] = [];
        const headerMap = new Map<string, number>();
        const nameMap = new Map<string, number>();

        // 检查 Header 重复和 name 冲突
        outputFields.forEach((field, index) => {
            // 检查 Header 重复
            if (headerMap.has(field.header)) {
                errors.push({
                    index,
                    message: `Duplicate header: ${field.header}`
                });
            }
            headerMap.set(field.header, index);

            // 检查 name 冲突
            if (nameMap.has(field.name)) {
                const newName = generateName(field.header, index);
                field.name = newName;
            }
            nameMap.set(field.name, index);
        });

        // 检查类型匹配，只检查已选择的输出列数量
        order.forEach((datasetName, datasetIndex) => {
            const currentFields = fields[datasetName] || [];
            // 只检查与 outputFields 长度相同数量的字段
            for (let i = 0; i < outputFields.length; i++) {
                const currentField = currentFields[i];
                if (!currentField) continue;

                // 跳过第一个数据集，因为它是基准
                if (datasetIndex === 0) continue;

                // 获取第一个数据集中对应位置的字段作为基准
                const baseField = fields[order[0]]?.[i];
                if (!baseField) continue;

                if (currentField.dataType !== baseField.dataType) {
                    errors.push({
                        index: i,
                        message: `Type mismatch: ${order[0]}.${baseField.name}(${baseField.dataType}) vs ${datasetName}.${currentField.name}(${currentField.dataType})`
                    });
                }
            }
        });

        setFieldErrors(errors);
        return errors;
    };

    // 计算输出列
    const calculateOutputColumns = (fields: { [key: string]: DatasetField[] }, order: string[]) => {
        if (order.length === 0 || !fields[order[0]]) return [];

        const outputColumns = new Map<string, DatasetField>();
        
        // 按照数据集顺序处理
        order.forEach(datasetName => {
            const currentFields = fields[datasetName] || [];
            currentFields.forEach(field => {
                // 如果字段还没有被添加过，就添加它
                if (!outputColumns.has(field.header)) {
                    const name = generateName(field.header);
                    outputColumns.set(field.header, {
                        ...field,
                        name
                    });
                }
            });
        });

        const outputFields = Array.from(outputColumns.values());
        validateFields(fields, order, outputFields);
        return outputFields;
    };

    useEffect(() => {
        // 只在组件初始化或 datasets 变化时执行
        const fieldsData: { [key: string]: DatasetField[] } = {};
        let order: string[] = [];
        
        // 初始化数据集字段
        datasets.forEach(dataset => {
            Object.entries(dataset).forEach(([key, fields]) => {
                fieldsData[key] = [...fields];
            });
        });
        
        // 如果有 value，先进行校验
        if (value?.datasets) {
            if (!validateValue(value, datasets)) {
                setValidationError('The dataset structure has changed. Please click the Pull button to reconfigure.');
                order = Object.keys(fieldsData);
                setAllFields([]);
            } else {
                setValidationError('');
                // 设置数据集顺序
                order = value.datasets.map(dataset => Object.keys(dataset)[0]);
                setAllFields(value.result || []);

                // 根据 value 中的字段顺序重排每个数据集的字段
                order.forEach((datasetName, index) => {
                    const valueFields = value.datasets[index][datasetName];
                    if (fieldsData[datasetName]) {
                        // 创建一个映射以快速查找字段
                        const fieldMap = new Map(
                            fieldsData[datasetName].map(field => [field.name, field])
                        );
                        // 按照 value 中的顺序重新排列字段
                        fieldsData[datasetName] = valueFields.map(fieldName => {
                            const field = fieldMap.get(fieldName);
                            if (!field) {
                                // 如果找不到字段，返回一个占位字段
                                return {
                                    name: fieldName,
                                    header: fieldName,
                                    dataType: 'string'
                                };
                            }
                            return field;
                        });
                    }
                });
            }
        } else {
            // 否则使用 datasets 的顺序
            order = Object.keys(fieldsData);
        }
        
        setDatasetFields(fieldsData);
        setDatasetOrder(order);
        
        // 初始验证
        if (order.length > 0) {
            validateFields(fieldsData, order, value?.result || []);
        }
    }, [datasets, value]); // 依赖 datasets 和 value

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === 'dataset') {
            // 处理数据集的拖拽
            const newOrder = Array.from(datasetOrder);
            const [removed] = newOrder.splice(source.index, 1);
            newOrder.splice(destination.index, 0, removed);
            setDatasetOrder(newOrder);
            
            // 验证并触发 onChange
            const errors = validateFields(datasetFields, newOrder, allFields);
            if (onChange) {
                const newDatasets = newOrder.map(name => ({
                    [name]: datasetFields[name].map((field: DatasetField) => field.name)
                }));
                onChange({
                    datasets: newDatasets,
                    result: allFields,
                    valid: errors.length === 0
                });
            }
            return;
        }
        
        // 处理字段的拖拽
        const datasetName = source.droppableId;
        if (source.droppableId !== destination.droppableId) {
            return;
        }

        // 创建字段数组的深拷贝
        const newDatasetFields = { ...datasetFields };
        const fields = [...newDatasetFields[datasetName]];
        const [removed] = fields.splice(source.index, 1);
        fields.splice(destination.index, 0, removed);
        newDatasetFields[datasetName] = fields;
        
        // 更新状态
        setDatasetFields(newDatasetFields);

        // 验证并触发 onChange
        const errors = validateFields(newDatasetFields, datasetOrder, allFields);
        if (onChange) {
            const newDatasets = datasetOrder.map(name => ({
                [name]: newDatasetFields[name].map(field => field.name)
            }));
            onChange({
                datasets: newDatasets,
                result: allFields,
                valid: errors.length === 0
            });
        }
    };

    const handleHeaderChange = (field: DatasetField, newHeader: string) => {
        // 更新本地状态
        setLocalHeaders(prev => ({
            ...prev,
            [field.name]: newHeader
        }));

        // 更新 allFields
        const newFields = allFields.map(f => 
            f.name === field.name ? { ...f, header: newHeader, name: generateName(newHeader) } : f
        );
        setAllFields(newFields);

        // 验证并触发 onChange
        const errors = validateFields(datasetFields, datasetOrder, newFields);
        if (onChange) {
            const newDatasets = datasetOrder.map(name => ({
                [name]: datasetFields[name].map(f => f.name)
            }));
            onChange({
                datasets: newDatasets,
                result: newFields,
                valid: errors.length === 0
            });
        }
    };

    const handleGenerate = () => {
        // 清除错误提示
        setValidationError('');
        
        const outputColumns = calculateOutputColumns(datasetFields, datasetOrder);
        setAllFields(outputColumns);
        
        // 验证并触发 onChange
        const errors = validateFields(datasetFields, datasetOrder, outputColumns);
        if (onChange) {
            const newDatasets = datasetOrder.map(name => ({
                [name]: datasetFields[name].map(field => field.name)
            }));
            onChange({
                datasets: newDatasets,
                result: outputColumns,
                valid: errors.length === 0
            });
        }
    };

    const handleDeleteLast = () => {
        if (allFields.length === 0) return;
        
        const newFields = allFields.slice(0, -1);
        setAllFields(newFields);
        
        // 验证并触发 onChange
        const errors = validateFields(datasetFields, datasetOrder, newFields);
        if (onChange) {
            const newDatasets = datasetOrder.map(name => ({
                [name]: datasetFields[name].map(field => field.name)
            }));
            onChange({
                datasets: newDatasets,
                result: newFields,
                valid: errors.length === 0
            });
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            gap: 2,
            height: '100%',
        }}>
            {/* Left: Selected Columns */}
            <Box sx={{ display: 'flex', flexDirection: 'column',width:190,flexShrink:0 }}>
                <Box sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography variant="subtitle2">Selected Columns</Typography>
                    <Button
                        size="small"
                        onClick={handleGenerate}
                        sx={{ minWidth: 'auto',lineHeight:1 }}
                    >
                        Pull
                    </Button>
                </Box>
                <Box sx={{
                    p: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Typography variant="subtitle2">Output Columns</Typography>
                    {validationError && (
                        <Typography 
                            variant="caption" 
                            color="error" 
                            sx={{ 
                                display: 'block',
                                mt: 1
                            }}
                        >
                            {validationError}
                        </Typography>
                    )}
                </Box>
                <Box sx={{
                    flex: 1,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    p: 1,
                }}>
                    {allFields.map((field, index) => {
                        const error = fieldErrors.find(err => err.index === index);
                        return (
                            <Box
                                key={field.name}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <Box sx={{ width: 'auto' }}>
                                    <FieldDisplay
                                        name=""
                                        dataType={field.dataType}
                                        color={error ? "error" : "black"}
                                    />
                                </Box>
                                <TextField
                                    size="small"
                                    value={localHeaders[field.name] || field.header}
                                    onChange={(e) => handleHeaderChange(field, e.target.value)}
                                    error={!!error}
                                    sx={{
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                            height: 32
                                        }
                                    }}
                                />
                                {error && (
                                    <Tooltip title={error.message}>
                                        <ErrorIcon color="error" fontSize="small" />
                                    </Tooltip>
                                )}
                                {index === allFields.length - 1 && (
                                    <IconButton
                                        size="small"
                                        onClick={handleDeleteLast}
                                        sx={{ p: 0.5 }}
                                    >
                                        <DeleteIcon fontSize="small" color="error"/>
                                    </IconButton>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Right: Datasets */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                flex: 1,
                minWidth: 250,
                overflow: 'hidden' // 防止内容溢出
            }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2">Union Data ({datasets.length})</Typography>
                </Box>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="datasets" direction="horizontal" type="dataset">
                        {(provided) => (
                            <Box
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{
                                    flex: 1,
                                    overflowX: 'auto', // 水平滚动
                                    display: 'flex',
                                }}
                            >
                                {datasetOrder.map((datasetName, index) => (
                                    <Draggable
                                        key={datasetName}
                                        draggableId={datasetName}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <Box
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    width: 200,
                                                    flexShrink: 0, // 防止压缩
                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        p: 1,
                                                        bgcolor: 'background.default',
                                                        borderRadius: 1,
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        cursor: 'grab',
                                                        '&:active': {
                                                            cursor: 'grabbing',
                                                        },
                                                    }}
                                                >
                                                    <Typography variant="subtitle2">{datasetName}</Typography>
                                                </Box>
                                                <Droppable droppableId={datasetName} type="field">
                                                    {(provided) => (
                                                        <Box
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 1,
                                                                minHeight: 100,
                                                                padding: 1,
                                                                bgcolor: theme => theme.palette.action.hover,
                                                                borderRadius: 1,
                                                            }}
                                                        >
                                                            {datasetFields[datasetName]?.map((field, index) => (
                                                                <Draggable
                                                                    key={`${datasetName}-${field.name}-${index}`}
                                                                    draggableId={`${datasetName}-${field.name}-${index}`}
                                                                    index={index}
                                                                >
                                                                    {(provided, snapshot) => (
                                                                        <Box
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            sx={{
                                                                                padding: '3px 8px',
                                                                                bgcolor: 'background.paper',
                                                                                borderRadius: 1,
                                                                                border: '1px solid',
                                                                                borderColor: 'divider',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 1,
                                                                                cursor: 'grab',
                                                                                width: '90%',
                                                                                '&:active': {
                                                                                    cursor: 'grabbing',
                                                                                },
                                                                                ...(snapshot.isDragging && {
                                                                                    opacity: 0.8,
                                                                                    bgcolor: 'action.selected',
                                                                                }),
                                                                            }}
                                                                        >
                                                                            <FieldDisplay
                                                                                name={field.header}
                                                                                dataType={field.dataType}
                                                                                color="black"
                                                                            />
                                                                        </Box>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </Box>
                                                    )}
                                                </Droppable>
                                            </Box>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>
            </Box>
        </Box>
    );
};

export default UnionAssemble;
