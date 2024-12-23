import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Node, Edge, Viewport } from 'reactflow';
import { NodeData } from '../WorkflowConstants';
import { ReactFlowProvider } from 'reactflow';
import { NodeTimestamp, PreviewData, previewDB } from '../services/previewDB';

// 变更类型枚举
export enum ChangeType {
    NODE = 'node',
    EDGE = 'edge',
    NAME = 'name',
    PROPS = 'props',
    WORKFLOW = 'workflow',
    SCHEMA = 'schema',
}

// 操作类型枚举
export enum OperationType {
    ADD = 'add',
    UPDATE = 'update',
    DELETE = 'delete'
}

// 变更项接口
export interface ChangeItem {
    type: ChangeType;
    operation: OperationType;
    id: string;
    previousValue: any;
    currentValue: any;
}


interface HistoryGroup {
    id: string;
    changes: ChangeItem[];
    timestamp: number;
    type: 'move' | 'others';
}

// 操作相关的类型定义
export interface WorkflowActionsType {
    saveHistory: (changes: ChangeItem[]) => void;
    undo: () => void;
    redo: () => void;
    setNodes: (nodes: Node<NodeData>[]) => void;
    setEdges: (edges: Edge[]) => void;
    getPreview: (nodeId: string) => Promise<PreviewData>;
    setSelectedNode: (node: Node<NodeData> | null) => void;
    save: () => Promise<void>;
    clearSaveQueue: () => void;
    getSaveQueue: () => SaveQueueItem[];
    resetSaveState: () => void;
}

// 状态相关的类型定义
export interface WorkflowStateType {
    nodes: Node<NodeData>[];
    edges: Edge[];
    canUndo: boolean;
    canRedo: boolean;
    viewport: Viewport;
    errors: WorkflowError;
    selectedNode: Node<NodeData> | null;
    hasUnsavedChanges: boolean;
    isSaving: boolean;
}

interface WorkflowProviderProps {
    children: React.ReactNode;
    defaultNodes: Node<NodeData>[];
    defaultEdges: Edge[];
    defaultViewport: Viewport;
    initialNodeTimestamps: NodeTimestamp;
}

export interface WorkflowError {
    [key: string]: WorkflowErrorItem[];
}

export interface WorkflowErrorItem {
    nodeId: string;
    name: string;
    status: 'error' | 'warning';
    message: string;
    time: string;
}

const getReverseOperation = (operation: OperationType): OperationType => {
    switch (operation) {
        case OperationType.ADD:
            return OperationType.DELETE;
        case OperationType.DELETE:
            return OperationType.ADD;
        case OperationType.UPDATE:
            return OperationType.UPDATE;  // UPDATE 的反向操作还是 UPDATE
        default:
            return operation;
    }
};

// 添加新的类型定义
interface SaveQueueItem extends HistoryGroup {
    // 继承 HistoryGroup 的所有属性
    // 可以添加额外的保存相关属性
    saveTimestamp?: number;
}

const WorkflowActionsContext = createContext<WorkflowActionsType | undefined>(undefined);
const WorkflowStateContext = createContext<WorkflowStateType | undefined>(undefined);

export function WorkflowProvider({ children, defaultNodes, defaultEdges, defaultViewport, initialNodeTimestamps }: WorkflowProviderProps) {

    const [nodes, setNodes] = useState<Node<NodeData>[]>(defaultNodes);
    const [edges, setEdges] = useState<Edge[]>(defaultEdges);
    const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

    const historyRef = useRef<HistoryGroup[]>([]);
    const [nodeTimestamps, setNodeTimestamps] = useState<NodeTimestamp>(initialNodeTimestamps);
    const [errors, setErrors] = useState<WorkflowError>({
        'source_Fileuploader_6RImp_luG_1': [{ nodeId: 'source_Fileuploader_6RImp_luG_1', name: 'Fileuploader', status: 'error', message: 'No file uploaded', time: '2024-12-17 10:00:00' }, { nodeId: 'source_Fileuploader_6RImp_luG_1', name: 'Fileuploader', status: 'error', message: 'No ouput', time: '2024-12-17 10:00:00' }],
        'source_CSVReader_BrfcO_kNk_0': [{ nodeId: 'source_CSVReader_BrfcO_kNk_0', name: 'CSVReader', status: 'error', message: 'No file input', time: '2024-12-17 10:00:00' }, { nodeId: 'source_CSVReader_BrfcO_kNk_0', name: 'CSVReader', status: 'error', message: 'No ouput', time: '2024-12-17 10:00:00' }]
    });
    const currentHistoryIndexRef = useRef<number>(-1);
    // 添加保存队列的 ref
    const saveQueueRef = useRef<SaveQueueItem[]>([]);
    // 添加保存队列的起始历史索引引用
    const saveQueueStartIndexRef = useRef<number>(-1);

     // 添加一个标记来追踪是否正在保存
     const [isSaving, setIsSaving] = useState(false);
     // 添加一个引用来存储保存过程中的新操作
     const pendingSaveQueueRef = useRef<SaveQueueItem[]>([]);

    // 添加未保存更改状态
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

    // 修改添加到保存队列的方法
    const addToSaveQueue = useCallback((group: HistoryGroup) => {
        const queueItem: SaveQueueItem = {
            ...group,
            saveTimestamp: Date.now()
        };
        // 如果正在保存，添加到临时队列
        if (isSaving) {
            pendingSaveQueueRef.current = [...pendingSaveQueueRef.current, queueItem];
        } else {
            saveQueueRef.current = [...saveQueueRef.current, queueItem];
        }
        setHasUnsavedChanges(true);
    }, []);

    // 修改从保存队列中移除的方法
    const removeFromSaveQueue = useCallback((group: HistoryGroup) => {
        // 从队列尾部开始查找匹配的组
        const queue = saveQueueRef.current;
        for (let i = queue.length - 1; i >= 0; i--) {
            if (queue[i].id === group.id) {
                queue.splice(i, 1);
                break;
            }
        }
        setHasUnsavedChanges(queue.length > 0);
    }, []);

    // 判断是否是节点移动操作
    const isNodeMovement = (changes: ChangeItem[]): boolean => {
        return changes.every(change =>
            change.type === ChangeType.NODE &&
            change.operation === OperationType.UPDATE &&
            // 可以通过检查 currentValue 和 previousValue 中的 position 属性来确保是移动操作
            'position' in change.currentValue &&
            'position' in change.previousValue
        );
    };

    // 2. 限制历史记录数量
    const MAX_HISTORY = 50;


    // 直接保存历史记录
    const saveHistory = useCallback((changes: ChangeItem[]) => {
        if (changes.length === 0) return;

        const history = historyRef.current;
        const now = Date.now();

        // 判断当前操作是否是移动操作
        const isMove = isNodeMovement(changes);

        // 如果是移动操作，尝试与上一个移动操作合并
        if (isMove && currentHistoryIndexRef.current > -1) {
            const currentGroup = history[currentHistoryIndexRef.current];

            if (currentGroup.type === 'move') {
                // 确保是同一个节点的移动
                const canMerge = currentGroup.changes.every(groupChange =>
                    changes.some(change => change.id === groupChange.id)
                );

                if (canMerge) {
                    // 合并移动操作，只保留最新的位置
                    const mergedGroup = {
                        ...currentGroup,
                        changes: currentGroup.changes.map(groupChange => ({
                            ...groupChange,
                            currentValue: changes.find(c => c.id === groupChange.id)?.currentValue || groupChange.currentValue
                        })),
                        timestamp: now
                    };

                    history[currentHistoryIndexRef.current] = mergedGroup;
                    historyRef.current = history;
                    // 更新保存队列中对应的组
                    const queueIndex = saveQueueRef.current.findIndex(item => item.id === currentGroup.id);
                    if (queueIndex !== -1) {
                        saveQueueRef.current[queueIndex] = {
                            ...mergedGroup,
                            saveTimestamp: Date.now()
                        };
                    } else {
                        addToSaveQueue(mergedGroup);
                    }
                    return;
                }
            }
        }

         // 创建新的历史组
         const newGroup: HistoryGroup = {
            id: generateId(),
            changes,
            timestamp: now,
            type: isMove ? 'move' : 'others'
        };

        // 如果不能合并，创建新的历史记录
        const newHistory = history.slice(0, currentHistoryIndexRef.current + 1);
        if (newHistory.length >= MAX_HISTORY) {
            newHistory.shift();
        }

        currentHistoryIndexRef.current = newHistory.length;
        newHistory.push(newGroup);

        historyRef.current = newHistory;
        // 添加到保存队列
        addToSaveQueue(newGroup);
    }, []);

    // 添加清空保存队列的方法
    const clearSaveQueue = useCallback(() => {
        if (!isSaving) {
            saveQueueRef.current = [];
            pendingSaveQueueRef.current = [];
        } else {
            // 如果正在保存，只清空主队列，保留临时队列
            saveQueueRef.current = [];
        }
        setHasUnsavedChanges(false);
    }, [isSaving]);

    
    // 添加一个辅助函数来检查两个操作是否相反
    const areOperationsOpposite = useCallback((op1: ChangeItem, op2: ChangeItem): boolean => {
        // 首先检查是否是同一个元素的操作
        if (op1.id !== op2.id || op1.type !== op2.type) {
            return false;
        }

        // 检查操作类型是否相反
        if (
            (op1.operation === OperationType.ADD && op2.operation === OperationType.DELETE) ||
            (op1.operation === OperationType.DELETE && op2.operation === OperationType.ADD)
        ) {
            return true;
        }

        // 对于 UPDATE 操作，检查值是否回到了原始状态
        if (op1.operation === OperationType.UPDATE && op2.operation === OperationType.UPDATE) {
            return JSON.stringify(op1.currentValue) === JSON.stringify(op2.previousValue);
        }

        return false;
    }, []);

     // 添加一个辅助函数来处理操作抵消
     const processChangesForSave = useCallback((changes: SaveQueueItem[]): SaveQueueItem[] => {
        const processedChanges: SaveQueueItem[] = [];
        
        changes.forEach(item => {
            const existingItemIndex = processedChanges.findIndex(
                existing => existing.id === item.id
            );

            if (existingItemIndex === -1) {
                // 如果没有找到相关操作，直接添加
                processedChanges.push(item);
            } else {
                const existingItem = processedChanges[existingItemIndex];
                // 检查是否有相反的操作
                const hasOppositeOp = existingItem.changes.some(existingChange =>
                    item.changes.some(newChange => 
                        areOperationsOpposite(existingChange, newChange)
                    )
                );

                if (hasOppositeOp) {
                    // 如果找到相反操作，移除已存在的操作
                    processedChanges.splice(existingItemIndex, 1);
                } else {
                    // 如果不是相反操作，添加新操作
                    processedChanges.push(item);
                }
            }
        });

        return processedChanges;
    }, [areOperationsOpposite]);
    
     // 更新 save 方法
     const save = useCallback(async () => {
        if (saveQueueRef.current.length === 0) {
            return;
        }

        // 保存当前的历史索引和保存队列
        const previousSaveIndex = saveQueueStartIndexRef.current;
        const currentSaveQueue = [...saveQueueRef.current];

        try {
            // 设置保存状态
            setIsSaving(true);
            // 清空临时队列
            pendingSaveQueueRef.current = [];

            // 处理操作抵消
            const processedChanges = processChangesForSave(currentSaveQueue);

            // 如果所有操作都被抵消，直接返回
            if (processedChanges.length === 0) {
                clearSaveQueue();
                setHasUnsavedChanges(false);
                return;
            }

            const saveData = {
                nodes,
                edges,
                viewport: defaultViewport,
                changes: processedChanges,
                timestamp: Date.now()
            };

            console.log('Saving with processed changes:', processedChanges);
            await mockSaveWorkflow(saveData);

            // 保存成功后更新保存队列的起始索引
            saveQueueStartIndexRef.current = currentHistoryIndexRef.current;
            
            // 清空当前保存队列，但保留保存过程中的新操作
            saveQueueRef.current = pendingSaveQueueRef.current;
            
            // 更新未保存状态
            setHasUnsavedChanges(pendingSaveQueueRef.current.length > 0);
            
        } catch (error) {
            // 保存失败时恢复之前的保存点
            saveQueueStartIndexRef.current = previousSaveIndex;
            console.error('Failed to save workflow:', error);
            throw error;
        } finally {
            setIsSaving(false);
            // 清空临时队列
            pendingSaveQueueRef.current = [];
        }
    }, [nodes, edges, defaultViewport, processChangesForSave]);

    // 应用操作的辅助函数
    const applyChange = useCallback((change: ChangeItem) => {
        switch (change.type) {
            case ChangeType.NODE:
                if (change.operation === OperationType.ADD) {
                    setNodes(nodes => [...nodes, change.currentValue]);
                } else if (change.operation === OperationType.DELETE) {
                    setNodes(nodes => nodes.filter(n => n.id !== change.id));
                } else if (change.operation === OperationType.UPDATE) {
                    setNodes(nodes =>
                        nodes.map(n => n.id === change.id ? change.currentValue : n)
                    );
                }
                break;

            case ChangeType.EDGE:
                if (change.operation === OperationType.ADD) {
                    setEdges(edges => [...edges, change.currentValue]);
                } else if (change.operation === OperationType.DELETE) {
                    setEdges(edges => edges.filter(e => e.id !== change.id));
                } else if (change.operation === OperationType.UPDATE) {
                    setEdges(edges =>
                        edges.map(e => e.id === change.id ? change.currentValue : e)
                    );
                }
                break;

            case ChangeType.PROPS:
                if (change.operation === OperationType.UPDATE) {
                    setNodes(nodes =>
                        nodes.map(n => n.id === change.id 
                            ? { ...n, data: { ...n.data, props: change.currentValue } }
                            : n
                        )
                    );
                }
                break;
        }
    }, []);

     // 更新 undo 方法
     const undo = useCallback(() => {
        if (currentHistoryIndexRef.current > -1) {
            const currentGroup = historyRef.current[currentHistoryIndexRef.current];
            
            // 创建反向操作组
            const reverseGroup: HistoryGroup = {
                id: currentGroup.id,
                changes: currentGroup.changes.map(change => ({
                    id: change.id,
                    type: change.type,
                    operation: getReverseOperation(change.operation),
                    previousValue: change.currentValue,
                    currentValue: change.previousValue
                })),
                timestamp: Date.now(),
                type: currentGroup.type
            };

            // 按照原始操作的相反顺序应用反向操作
            for (let i = reverseGroup.changes.length - 1; i >= 0; i--) {
                applyChange(reverseGroup.changes[i]);
            }

            // 尝试从保存队列中移除原操作组
            removeFromSaveQueue(currentGroup);

            // 如果撤销的是已保存的操作，则添加反向操作到保存队列
            if (currentHistoryIndexRef.current <= saveQueueStartIndexRef.current) {
                addToSaveQueue(reverseGroup);
            }
            
            currentHistoryIndexRef.current -= 1;

            // 如果撤销到了保存点之前，更新保存队列起始索引
            if (currentHistoryIndexRef.current < saveQueueStartIndexRef.current) {
                saveQueueStartIndexRef.current = currentHistoryIndexRef.current;
            }
        }
    }, [applyChange, addToSaveQueue, removeFromSaveQueue]);

    // 更新 redo 方法
    const redo = useCallback(() => {
        if (currentHistoryIndexRef.current < historyRef.current.length - 1) {
            const newIndex = currentHistoryIndexRef.current + 1;
            const nextGroup = historyRef.current[newIndex];
            
            // 按照原始操作的顺序应用操作
            nextGroup.changes.forEach(change => {
                applyChange(change);
            });

            // 添加到保存队列
            addToSaveQueue(nextGroup);
            
            currentHistoryIndexRef.current = newIndex;

            // 如果重做超过了保存点，更新保存队列起始索引
            if (saveQueueStartIndexRef.current !== -1 &&currentHistoryIndexRef.current > saveQueueStartIndexRef.current) {
                saveQueueStartIndexRef.current = currentHistoryIndexRef.current;
            }
        }
    }, [applyChange, addToSaveQueue]);

     // 添加获取保存队列的方法（用于调试或显示）
     const getSaveQueue = useCallback(() => {
        return [...saveQueueRef.current];
    }, []);

    // 添加重置保存状态的方法
    const resetSaveState = useCallback(() => {
        saveQueueStartIndexRef.current = currentHistoryIndexRef.current;
        clearSaveQueue();
    }, [clearSaveQueue]);


    // 初始化时设置保存队列起始索引
    useEffect(() => {
        saveQueueStartIndexRef.current = -1;
    }, []);



    // 更新 getPreview 方法
    const getPreview = useCallback(async (nodeId: string): Promise<PreviewData> => {
        const latestTimestamp = nodeTimestamps[nodeId] || 0;
        const storedPreview = await previewDB.getPreview(nodeId);

        // 如果没有存储的数据或者存储的数据已过期
        if (!storedPreview || storedPreview.timestamp < latestTimestamp) {
            try {
                // 从后台获取数据
                const response = await fetchPreviewFromBackend(nodeId);

                // 获取当前时间作为新的时间戳
                const newTimestamp = Date.now();

                const newPreviewData: PreviewData = {
                    id: nodeId,
                    data: response.data,
                    schema: response.schema,
                    timestamp: newTimestamp
                };

                // 保存到 IndexedDB
                await previewDB.savePreview(newPreviewData);

                // 更新 nodeTimestamps
                setNodeTimestamps(prev => ({
                    ...prev,
                    [nodeId]: newTimestamp
                }));

                return newPreviewData;
            } catch (error) {
                console.error('Failed to fetch preview data:', error);
                if (storedPreview) return storedPreview;
                throw error;
            }
        }

        return storedPreview;
    }, [nodeTimestamps]);

    // Actions context value
    const actions = useMemo(() => ({
        saveHistory,
        undo,
        redo,
        setNodes,
        setEdges,
        getPreview,
        setErrors,
        setSelectedNode,
        save,
        clearSaveQueue,
        getSaveQueue,
        resetSaveState
    }), [saveHistory, undo, redo, getPreview, setErrors, setSelectedNode, save, clearSaveQueue, getSaveQueue, resetSaveState]);

    // State context value
    const state = useMemo(() => ({
        nodes,
        edges,
        viewport: defaultViewport,
        canUndo: currentHistoryIndexRef.current > -1,
        canRedo: currentHistoryIndexRef.current < historyRef.current.length - 1,
        errors,
        selectedNode,
        hasUnsavedChanges,
        isSaving
    }), [nodes, edges, historyRef.current.length, errors, selectedNode, hasUnsavedChanges, isSaving ]);

    return (
        <ReactFlowProvider>
            <WorkflowActionsContext.Provider value={actions}>
                <WorkflowStateContext.Provider value={state}>
                    {children}
                </WorkflowStateContext.Provider>
            </WorkflowActionsContext.Provider>
        </ReactFlowProvider>
    );
}

// Custom hooks
export function useWorkflowActions() {
    const context = useContext(WorkflowActionsContext);
    if (!context) {
        throw new Error('useWorkflowActions must be used within WorkflowProvider');
    }
    return context;
}

export function useWorkflowState() {
    const context = useContext(WorkflowStateContext);
    if (!context) {
        throw new Error('useWorkflowState must be used within WorkflowProvider');
    }
    return context;
}



// 组合 hook，如果需要同时使用 actions 和 state
export function useWorkflow(): WorkflowActionsType & WorkflowStateType {
    const actions = useWorkflowActions();
    const state = useWorkflowState();
    return { ...actions, ...state };
}

// 添加自定义 hook 来访问保存队列相关方法
export const useSaveQueue = () => {
    const actions = useWorkflowActions();
    return {
        save: actions.save,
        clearSaveQueue: actions.clearSaveQueue,
        getSaveQueue: actions.getSaveQueue,
        resetSaveState: actions.resetSaveState
    };
};

// 生成唯一ID的辅助函数
function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}

// 模拟后台保存函数
const mockSaveWorkflow = async (saveData: any): Promise<void> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 模拟随机失败（20%的概率）
    // if (Math.random() < 0.2) {
    //     throw new Error('Save failed: Network error');
    // }
    
    // 模拟保存成功
    console.log('Saved workflow data:', saveData);
};