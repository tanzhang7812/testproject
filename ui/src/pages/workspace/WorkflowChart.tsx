import React, { useState, useCallback, DragEvent, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  XYPosition,
  Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowChartContainer, WorkflowHeader, WorkflowContent } from './styled';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CustomNode from './CustomNode';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import SaveIcon from '@mui/icons-material/Save';

const generateRandomString = (length: number = 5) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
};
let nodeId = 0;
const getId = (group: string, name: string) => `${group}_${name}_${generateRandomString(5)}_${generateRandomString(3)}_${nodeId++}`;

const nodeTypes = {
  default: CustomNode,
};

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

interface WorkflowChartProps {
  onNodeSelect?: (node: Node | null) => void;
  defaultNodes: Node[];
  defaultEdges: Edge[];
  defaultViewport: Viewport;
  onChange?: () => void;
  hasUnsavedChanges: boolean;
}

function Flow({ onNodeSelect, defaultNodes, defaultEdges, defaultViewport,onChange,hasUnsavedChanges }: WorkflowChartProps) {
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [edges, setEdges] = useState<Edge[]>(defaultEdges);
  const [selectedElements, setSelectedElements] = useState<{ nodes: Node[]; edges: Edge[]; }>({ nodes: [], edges: [] });
  const { project, getNodes, getEdges, getViewport } = useReactFlow();

  const [history, setHistory] = useState<HistoryState[]>([{
    nodes: cloneDeep(defaultNodes),
    edges: cloneDeep(defaultEdges)
  }]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const saveHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    // 先进行变化检测
    const lastState = history[currentHistoryIndex];
    const hasChanged = !isEqual(lastState.nodes, newNodes) ||
      !isEqual(lastState.edges, newEdges);

    if (!hasChanged) return; // 如果没有变化，直接返回
    onChange?.();
    setHistory(prev => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1).map((state, index) => {
        if (index === currentHistoryIndex) {
          return {
            nodes: cloneDeep(state.nodes),
            edges: cloneDeep(state.edges)
          };
        }
        return state;
      });
      if (newHistory.length >= 50) {
        newHistory.shift();
      }
      // 直接使用当前状态，不需要深拷贝
      return [...newHistory, {
        nodes: newNodes,
        edges: newEdges
      }];
    });

    // 确实发生变化时才更新索引
    setCurrentHistoryIndex(prev =>
      prev + 1 >= 50 ? 49 : prev + 1
    );
  }, [currentHistoryIndex, onChange]);

  // 添加防抖以减少历史记录的保存频率
  const debouncedSaveHistory = useCallback(
    debounce((nodes: Node[], edges: Edge[]) => {
      saveHistory(nodes, edges);
    }, 300),
    [saveHistory]
  );


  // 在需要频繁保存历史的地方使用 debouncedSaveHistory
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);

      const hasNonSelectChange = changes.some(change =>
        change.type === 'add' ||
        change.type === 'remove'
      );

      if (hasNonSelectChange) {
        debouncedSaveHistory(newNodes, edges);
      }
    },
    [nodes, edges, debouncedSaveHistory]
  );

  // 清理防抖函数
  useEffect(() => {
    return () => {
      debouncedSaveHistory.cancel();
    };
  }, [debouncedSaveHistory]);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);

      const hasNonSelectChange = changes.some(change =>
        change.type === 'add' ||
        change.type === 'remove'
      );

      if (hasNonSelectChange) {
        debouncedSaveHistory(nodes, newEdges);
      }
    },
    [nodes, edges, debouncedSaveHistory, onChange]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      debouncedSaveHistory(nodes, newEdges);
    },
    [nodes, edges, debouncedSaveHistory]
  );

  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const historyState = history[newIndex];
      setNodes(cloneDeep(historyState.nodes));
      setEdges(cloneDeep(historyState.edges));
      setCurrentHistoryIndex(newIndex);
    }
  }, [currentHistoryIndex, history]);

  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const historyState = history[newIndex];
      setNodes(cloneDeep(historyState.nodes));
      setEdges(cloneDeep(historyState.edges));
      setCurrentHistoryIndex(newIndex);
    }
  }, [currentHistoryIndex, history]);

  const onSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[]; }) => {
      setSelectedElements(params);
    },
    []
  );

  const handleDeleteSelected = () => {
    if (selectedElements.nodes.length > 0) {
      const selectedNodeIds = selectedElements.nodes.map(node => node.id);
      setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));
    }

    if (selectedElements.edges.length > 0) {
      const selectedEdgeIds = selectedElements.edges.map(edge => edge.id);
      setEdges((eds) => eds.filter((edge) => !selectedEdgeIds.includes(edge.id)));
    }

    if (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0) {
      const newNodes = nodes.filter(node => !selectedElements.nodes.includes(node));
      const newEdges = edges.filter(edge => !selectedElements.edges.includes(edge));
      debouncedSaveHistory(newNodes, newEdges);
    }
  };

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const name = event.dataTransfer.getData('application/nodeName');
      const label = event.dataTransfer.getData('application/nodeLabel');
      const group = event.dataTransfer.getData('application/nodeGroup');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }) as XYPosition;

      const newNode: Node = {
        id: getId(group, name),
        type,
        position,
        data: {
          name: name,
          label: label,
          group: group,
          props: {}
        },
        selected: true,
      };

      const newNodes = nodes.map(node => ({ ...node, selected: false }));
      setNodes([...newNodes, newNode]);
      debouncedSaveHistory([...newNodes, newNode], edges);

      if (onNodeSelect) {
        onNodeSelect(newNode);
      }
    },
    [project, nodes, edges, debouncedSaveHistory, onNodeSelect, onChange]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  }, [onNodeSelect]);

  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  const handleExport = () => {
    const flowData = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: getViewport()
    };

    // 创建 Blob 对象
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow.json';

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    const flowData = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: getViewport()
    };
    // 这里你可以添加保存逻辑，比如调用API等
    console.log('Saving workflow:', flowData);
  };


  return (
    <WorkflowChartContainer>
      <WorkflowHeader>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleUndo}
            disabled={currentHistoryIndex <= 0}
            sx={{ color: 'text.secondary' }}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleRedo}
            disabled={currentHistoryIndex >= history.length - 1}
            sx={{ color: 'text.secondary' }}
          >
            <RedoIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDeleteSelected}
            disabled={selectedElements.nodes.length === 0 && selectedElements.edges.length === 0}
            sx={{
              color: selectedElements.nodes.length === 0 && selectedElements.edges.length === 0
                ? 'text.disabled'
                : 'error.main',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleExport}
            sx={{ color: 'primary.main' }}
          >
            <FileDownloadIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleSave}
            sx={{ 
              color: hasUnsavedChanges ? 'primary.main' : 'text.disabled',
              transition: 'color 0.2s'
            }}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
        </Box>
      </WorkflowHeader>
      <WorkflowContent>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          defaultViewport={defaultViewport}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          attributionPosition="bottom-right"
          defaultEdgeOptions={{
            style: { strokeWidth: 2 },
            type: 'smoothstep',
            animated: false,
          }}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Control', 'Meta']}
          selectionKeyCode={['Shift']}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background gap={16} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </WorkflowContent>
    </WorkflowChartContainer>
  );
}

export default function WorkflowChart({ onNodeSelect, defaultNodes, defaultEdges, defaultViewport,onChange,hasUnsavedChanges }: WorkflowChartProps) {
  return (
    <ReactFlowProvider>
      <Flow onNodeSelect={onNodeSelect} defaultNodes={defaultNodes} defaultEdges={defaultEdges} defaultViewport={defaultViewport} onChange={onChange} hasUnsavedChanges={hasUnsavedChanges} />
    </ReactFlowProvider>
  );
} 