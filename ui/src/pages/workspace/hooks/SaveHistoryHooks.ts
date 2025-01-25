import { useCallback, useEffect, useRef, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '../WorkflowConstants';


// 变更类型枚举
export enum ChangeType {
    NODE = 'node',
    EDGE = 'edge',
    NAME = 'name',
    PROPS = 'props',
    WORKFLOW = 'workflow',
    SCHEMA = 'schema',
    VARIABLES = 'variables',
}

// 操作类型枚举
export enum OperationType {
    ADD = 'add',
    UPDATE = 'update',
    DELETE = 'delete',
    MOVE = 'move'
}

// 变更项接口
export interface ChangeItem {
    type: ChangeType;
    operation: OperationType;
    id: string;
    previousValue: any;
    currentValue: any;
}

export enum HistoryGroupType {
    MOVE = 'move',
    UNDO = 'undo',
    REDO = 'redo',
    OTHERS = 'others',
    BATCH = 'batch'
}

export interface HistoryGroup {
    id: string;
    changes: ChangeItem[];
    timestamp: number;
    type: HistoryGroupType | ChangeType;
}


interface UseSaveHistoryProps {
    nodes: Node<NodeData>[];
    setNodes: (nodes: Node<NodeData>[]) => void;
    edges: Edge[];
    setEdges: (edges: Edge[]) => void;
}


// 添加新的类型定义
export interface SaveQueueItem extends HistoryGroup {
    // 继承 HistoryGroup 的所有属性
    // 可以添加额外的保存相关属性
    saveTimestamp?: number;
}

export const getReverseOperation = (operation: OperationType): OperationType => {
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

interface UseSaveHistoryReturn {
    saveHistory: (changes: ChangeItem[]) => void;
    clearSaveQueue: () => void;
    getSaveQueue: () => SaveQueueItem[];
    resetSaveState: () => void;
    save: () => Promise<void>;
    addToSaveQueue: (group: HistoryGroup) => void;
    removeFromSaveQueue: (group: HistoryGroup) => void;
    hasUnsavedChanges: boolean;
    isSaving: boolean;
    canUndo: boolean;
    canRedo: boolean;
    getCurrentHistoryIndex: () => number;
    setCurrentHistoryIndex: (index: number) => void;
    getQueueStartIndex: () => number;
    setQueueStartIndex: (index: number) => void;
    getCurrentSaveQueue: () => SaveQueueItem[];
    getHistory: () => HistoryGroup[];
}

  // 2. 限制历史记录数量
  const MAX_HISTORY = 50;

export const useSaveHistory = ({maxHistory = MAX_HISTORY}: {maxHistory?: number} = {}): UseSaveHistoryReturn => {
    const historyRef = useRef<HistoryGroup[]>([]);

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
    }, [isSaving]);

    // 修改从保存队列中移除的方法
    const removeFromSaveQueue = useCallback((group: HistoryGroup) => {
        if (isSaving) {
            // 如果正在保存，从临时队列中移除
            pendingSaveQueueRef.current = pendingSaveQueueRef.current.filter(
                item => item.id !== group.id
            );
            setHasUnsavedChanges(pendingSaveQueueRef.current.length > 0);
        } else {
            // 从主队列中移除
            saveQueueRef.current = saveQueueRef.current.filter(
                item => item.id !== group.id
            );
            setHasUnsavedChanges(saveQueueRef.current.length > 0);
        }
    }, [isSaving]);

    // 判断是否是节点移动操作
    const isNodeMovement = (changes: ChangeItem[]): boolean => {
        return changes.every(change =>
            change.type === ChangeType.NODE &&
            change.operation === OperationType.MOVE
        );
    };

  

    // 直接保存历史记录
    const saveHistory = useCallback((changes: ChangeItem[]) => {
        if (changes.length === 0) return;

        const history = historyRef.current;
        const now = Date.now();
    
        // 检查是否所有changes都是同一类型且ID一致
        const allSameTypeAndId = changes.every(change => 
            change.type === changes[0].type && 
            change.id === changes[0].id
        );
    
        // 如果不是同一类型且ID一致，直接创建新的历史记录
        if (!allSameTypeAndId) {
            const newGroup: HistoryGroup = {
                id: generateId(),
                changes,
                timestamp: now,
                type: HistoryGroupType.BATCH
            };
    
            const newHistory = history.slice(0, currentHistoryIndexRef.current + 1);
            if (newHistory.length >= maxHistory) {
                newHistory.shift();
            }
            currentHistoryIndexRef.current = newHistory.length;
            newHistory.push(newGroup);
            historyRef.current = newHistory;
            addToSaveQueue(newGroup);
            return;
        }
    
        // 获取统一的变更类型和ID
        const changeType = changes[0].type;
        const changeId = changes[0].id;
    
        // 检查是否可以与上一个历史记录合并
        if (currentHistoryIndexRef.current > -1) {
            const currentGroup = history[currentHistoryIndexRef.current];
            const currentChanges = currentGroup.changes;
    
            // 检查上一个历史记录是否也是同一类型且ID一致的变更
            const canMerge = currentChanges.length > 0 && 
                            currentChanges.every(change => 
                                change.type === changeType && 
                                change.id === changeId
                            ) &&
                            (
                                // 节点移动操作的合并逻辑
                                (changeType === ChangeType.NODE && isNodeMovement(changes)) ||
                                // 其他可合并类型的逻辑
                                [ChangeType.WORKFLOW, ChangeType.VARIABLES, ChangeType.PROPS].includes(changeType)
                            );
    
            if (canMerge) {
                // 合并操作，只保留最新的值
                const mergedGroup = {
                    ...currentGroup,
                    changes: currentChanges.map(groupChange => ({
                        ...groupChange,
                        currentValue: changes[0].currentValue
                    })),
                    timestamp: now
                };
    
                history[currentHistoryIndexRef.current] = mergedGroup;
                historyRef.current = history;
    
                // 更新保存队列
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
    
        // 如果不能合并，创建新的历史记录
        const newGroup: HistoryGroup = {
            id: generateId(),
            changes,
            timestamp: now,
            type: changeType
        };
    
        const newHistory = history.slice(0, currentHistoryIndexRef.current + 1);
        if (newHistory.length >= maxHistory) {
            newHistory.shift();
        }
        currentHistoryIndexRef.current = newHistory.length;
        newHistory.push(newGroup);
        historyRef.current = newHistory;
        addToSaveQueue(newGroup);
    }, [addToSaveQueue,isSaving]);

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


    // 更新 save 方法
    const save = useCallback(async () => {
        if (saveQueueRef.current.length === 0) {
            return;
        }

        // 保存当前的历史索引和保存队列
        const previousSaveIndex = saveQueueStartIndexRef.current;
        const currentSaveQueue = [...saveQueueRef.current];
        const currentHistoryIndex = currentHistoryIndexRef.current; // 在开始保存时记录当前历史索引
        try {
            // 设置保存状态
            setIsSaving(true);
            // 清空临时队列
            pendingSaveQueueRef.current = [];

            // 处理操作抵消
            // const processedChanges = processChangesForSave(currentSaveQueue);

            // // 如果所有操作都被抵消，直接返回
            // if (processedChanges.length === 0) {
            //     clearSaveQueue();
            //     setHasUnsavedChanges(false);
            //     return;
            // }

            const saveData = {
                changes: currentSaveQueue
            };

            console.log('Saving with processed changes:', saveData);
            await mockSaveWorkflow(saveData);

            // 保存成功后更新保存队列的起始索引
            saveQueueStartIndexRef.current = currentHistoryIndex;

            // 清空当前保存队列，但保留保存过程中的新操作
            saveQueueRef.current = pendingSaveQueueRef.current;

            // 更新未保存状态
            console.log('pendingSaveQueueRef.current.length:', pendingSaveQueueRef.current.length);
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
    }, []);

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

    const getCurrentHistoryIndex = useCallback(() => {
        return currentHistoryIndexRef.current;
    }, [currentHistoryIndexRef]);

    const setCurrentHistoryIndex = useCallback((index: number) => {
        currentHistoryIndexRef.current = index;
    }, [currentHistoryIndexRef]);

    const getQueueStartIndex = useCallback(() => {
        return saveQueueStartIndexRef.current;
    }, [saveQueueStartIndexRef]);
    
    const setQueueStartIndex = useCallback((index: number) => {
        saveQueueStartIndexRef.current = index;
    }, [saveQueueStartIndexRef]);

    const getCurrentSaveQueue = useCallback(() => {
        return isSaving? pendingSaveQueueRef.current : saveQueueRef.current;
    }, [isSaving, pendingSaveQueueRef, saveQueueRef]);

    const getHistory = useCallback(() => {
        return historyRef.current;
    }, [historyRef]);
    

    return {
        saveHistory,
        clearSaveQueue,
        getSaveQueue,
        resetSaveState,
        save,
        addToSaveQueue,
        removeFromSaveQueue,
        hasUnsavedChanges,
        isSaving,
        canUndo: currentHistoryIndexRef.current > -1,
        canRedo: currentHistoryIndexRef.current < historyRef.current.length - 1,
        getCurrentHistoryIndex,
        setCurrentHistoryIndex,
        getQueueStartIndex,
        setQueueStartIndex,
        getCurrentSaveQueue,
        getHistory
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