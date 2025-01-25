import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    Node, Edge, Viewport, applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
    Connection,
} from 'reactflow';
import { NodeData } from '../WorkflowConstants';
import { ReactFlowProvider } from 'reactflow';
import { NodeTimestamp, PreviewData, previewDB } from '../services/previewDB';
import { getReverseOperation, HistoryGroup, HistoryGroupType, OperationType, SaveQueueItem, useSaveHistory } from '../hooks/SaveHistoryHooks';
import { ChangeItem } from '../hooks/SaveHistoryHooks';
import { ChangeType } from '../hooks/SaveHistoryHooks';
import { useFlowStore } from '../flowStore';
import { useFlowChart } from '../hooks/FlowChartHooks';
import { usePropsChange } from '../hooks/PropsHooks';
import { WorkflowConfigProps, Variables, ComponentsProps, WorkflowView } from '../WorkflowConstants';


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
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    onSelectionChange: (selection: Selection) => void;
    handleDeleteSelected: () => void;
    handleWorkflowPropsChange: (id: string, props: any) => void;
}

// 状态相关的类型定义
export interface WorkflowStateType {
    nodes: Node<NodeData>[];
    edges: Edge[];
    canUndo: boolean;
    canRedo: boolean;
    errors: WorkflowError;
    selectedNode: Node<NodeData> | null;
    hasUnsavedChanges: boolean;
    isSaving: boolean;
    selectedElements: { nodes: Node[]; edges: Edge[]; };
    workflowInfoProps: WorkflowConfigProps;
    variablesProps: { variables: Variables[] };
    componentsPropsProps: ComponentsProps;
    targetTab: { [key: string]: number };
}

interface WorkflowProviderProps {
    children: React.ReactNode;
    defaultNodes: Node<NodeData>[];
    defaultEdges: Edge[];
    initialNodeTimestamps: NodeTimestamp;
    workflowInfo: WorkflowConfigProps;
    variables: Variables[];
    componentsProps: ComponentsProps;
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



const WorkflowActionsContext = createContext<WorkflowActionsType | undefined>(undefined);
const WorkflowStateContext = createContext<WorkflowStateType | undefined>(undefined);

export function WorkflowProvider({ children, defaultNodes, defaultEdges, workflowInfo, variables, componentsProps, initialNodeTimestamps }: WorkflowProviderProps) {

   
    

    const { setNodeStatus, clearAllStatus } = useFlowStore();
    




    const [nodeTimestamps, setNodeTimestamps] = useState<NodeTimestamp>(initialNodeTimestamps);
    const [errors, setErrors] = useState<WorkflowError>({
        'source_Fileuploader_6RImp_luG_1': [{ nodeId: 'source_Fileuploader_6RImp_luG_1', name: 'Fileuploader', status: 'error', message: 'No file uploaded', time: '2024-12-17 10:00:00' }, { nodeId: 'source_Fileuploader_6RImp_luG_1', name: 'Fileuploader', status: 'error', message: 'No ouput', time: '2024-12-17 10:00:00' }],
        'source_CSVReader_BrfcO_kNk_0': [{ nodeId: 'source_CSVReader_BrfcO_kNk_0', name: 'CSVReader', status: 'error', message: 'No file input', time: '2024-12-17 10:00:00' }, { nodeId: 'source_CSVReader_BrfcO_kNk_0', name: 'CSVReader', status: 'error', message: 'No ouput', time: '2024-12-17 10:00:00' }]
    });

    const { saveHistory, clearSaveQueue, getSaveQueue, resetSaveState, save,
        hasUnsavedChanges, isSaving, addToSaveQueue, removeFromSaveQueue,
        getCurrentHistoryIndex, setCurrentHistoryIndex, getQueueStartIndex, setQueueStartIndex,
        getCurrentSaveQueue, getHistory } = useSaveHistory();   

    const { workflowInfoProps, variablesProps, componentsPropsProps, targetTab, handleWorkflowPropsChange, handlePropsReset } = usePropsChange({workflowInfo, variables, componentsProps,saveHistory});

    const { nodes, edges, setNodes, setEdges,selectedNode,selectedElements, setSelectedNode, onNodesChange, onEdgesChange, onConnect, onSelectionChange, handleDeleteSelected } = useFlowChart({ defaultNodes, defaultEdges, saveHistory });


    const applySelectedNodeChange=useCallback((id: string|null,node:Node<NodeData>|null)=>{
       if((id===null && selectedNode===null)||(id===selectedNode?.id)){
        return
       }
       if(id===null){
        setSelectedNode(null)
        setNodes(nodes=>nodes.map(node=>({...node,selected:false})))
       }else{
        if(node){
            setSelectedNode(node)
        }else{
            setSelectedNode(nodes.find(node=>node.id===id) as Node<NodeData>)
        }
        setNodes(nodes=>nodes.map(node=>({...node,selected:node.id===id})))
       }
    },[setSelectedNode,selectedNode,setNodes,nodes])
    // 应用操作的辅助函数
    const applyChange = useCallback((change: ChangeItem) => {
        switch (change.type) {
            case ChangeType.NODE:
                if (change.operation === OperationType.ADD) {
                    setNodes(nodes => [...nodes, change.currentValue]);
                    applySelectedNodeChange(change.id,change.currentValue)
                } else if (change.operation === OperationType.DELETE) {
                    setNodes(nodes => nodes.filter(n => n.id !== change.id));
                    applySelectedNodeChange(null)
                } else if (change.operation === OperationType.MOVE || change.operation === OperationType.UPDATE) {
                    setNodes(nodes =>
                        nodes.map(n => n.id === change.id ? change.currentValue : n)
                    );
                    applySelectedNodeChange(change.id)
                }
                
                break;

            case ChangeType.EDGE:
                if (change.operation === OperationType.ADD) {
                    setEdges((edges: Edge[]) => [...edges, change.currentValue]);
                } else if (change.operation === OperationType.DELETE) {
                    setEdges((edges: Edge[]) => edges.filter(e => e.id !== change.id));
                } else if (change.operation === OperationType.UPDATE) {
                    setEdges((edges: Edge[]) =>
                        edges.map(e => e.id === change.id ? change.currentValue : e)
                    );
                }
                break;

            case ChangeType.WORKFLOW:
                if (change.operation === OperationType.UPDATE) {
                    handlePropsReset('workflowInfo', change.currentValue);
                    applySelectedNodeChange(null)
                }
                break;

            case ChangeType.VARIABLES:
                if (change.operation === OperationType.UPDATE) {
                    handlePropsReset('variables', change.currentValue);
                    applySelectedNodeChange(null)
                }
                break;

            case ChangeType.PROPS:
                if (change.operation === OperationType.UPDATE) {
                    handlePropsReset(change.id, change.currentValue);
                    applySelectedNodeChange(change.id)
                }
                break;
        }
    }, [setSelectedNode,selectedNode,setNodes,nodes]);

    // 更新 undo 方法
    const undo = useCallback(() => {
        const currentHistoryIndex = getCurrentHistoryIndex();
        if (currentHistoryIndex > -1) {
            const currentGroup = getHistory()[currentHistoryIndex];

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
                type: HistoryGroupType.UNDO
            };

            // 按照原始操作的相反顺序应用反向操作
            for (let i = reverseGroup.changes.length - 1; i >= 0; i--) {
                applyChange(reverseGroup.changes[i]);
            }

            // 尝试从保存队列中移除原操作组
            removeFromSaveQueue(currentGroup);

            // 在保存过程中或撤销已保存的操作时，添加反向操作到队列
            if (isSaving || currentHistoryIndex <= getQueueStartIndex()) {
                addToSaveQueue(reverseGroup);
            }

            // 更新当前历史索引
            setCurrentHistoryIndex(currentHistoryIndex - 1);

            // 如果撤销到了保存点之前，更新保存队列起始索引
            if (currentHistoryIndex < getQueueStartIndex()) {
                setQueueStartIndex(currentHistoryIndex);
            }
        }
    }, [applyChange, addToSaveQueue, removeFromSaveQueue, isSaving,applySelectedNodeChange]);

    // 更新 redo 方法
    const redo = useCallback(() => {
        const currentHistoryIndex = getCurrentHistoryIndex();
        if (currentHistoryIndex < getHistory().length - 1) {
            const newIndex = currentHistoryIndex + 1;
            const nextGroup = getHistory()[newIndex];

            // 创建新的操作组，设置 type 为 REDO
            const redoGroup: HistoryGroup = {
                ...nextGroup,
                type: HistoryGroupType.REDO,
                timestamp: Date.now()
            };

            // 按照原始操作的顺序应用操作
            redoGroup.changes.forEach(change => {
                applyChange(change);
            });

            // 检查是否在撤销 undo 操作
            const queue = getCurrentSaveQueue();
            const undoOperation = queue.find(item =>
                item.id === redoGroup.id && item.type === HistoryGroupType.UNDO
            );
            const saveQueueStartIndex = getQueueStartIndex();
            if (undoOperation) {
                // 如果找到对应的 undo 操作，从队列中移除
                removeFromSaveQueue(undoOperation);
            } else if (saveQueueStartIndex === -1 || newIndex > saveQueueStartIndex) {
                // 如果不是撤销 undo，且需要保存，则添加到队列
                addToSaveQueue(redoGroup);
            }

            setCurrentHistoryIndex(newIndex);

            // 如果重做超过了保存点，更新保存队列起始索引
            // if (saveQueueStartIndexRef.current !== -1 && currentHistoryIndexRef.current > saveQueueStartIndexRef.current) {
            //     saveQueueStartIndexRef.current = currentHistoryIndexRef.current;
            // }
        }
    }, [applyChange, addToSaveQueue, removeFromSaveQueue, isSaving]);





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
        save,
        clearSaveQueue,
        getSaveQueue,
        resetSaveState,
        setNodeStatus,
        clearAllStatus,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onSelectionChange,
        handleDeleteSelected,
        setSelectedNode,
        handleWorkflowPropsChange   
    }), [saveHistory, undo, redo, getPreview, setErrors, save, clearSaveQueue, getSaveQueue, resetSaveState, setNodeStatus, clearAllStatus,onNodesChange,onEdgesChange,onConnect,onSelectionChange,handleDeleteSelected,setSelectedNode,handleWorkflowPropsChange]);

    const currentHistoryIndex = getCurrentHistoryIndex();
    // State context value
    const state = useMemo(() => ({
        nodes,
        edges,
        canUndo: currentHistoryIndex > -1,
        canRedo: currentHistoryIndex < getHistory().length - 1,
        errors,
        selectedNode,
        selectedElements,
        hasUnsavedChanges,
        isSaving,
        workflowInfoProps,
        variablesProps,
        componentsPropsProps,
        targetTab
    }), [nodes, edges, getHistory().length, errors, selectedNode, selectedElements, hasUnsavedChanges, isSaving, workflowInfoProps, variablesProps, componentsPropsProps,targetTab]);

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

