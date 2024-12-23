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
import { ChangeType, OperationType, useWorkflow, useWorkflowActions, useWorkflowState } from './context/WorkflowContext';
import { ComponentDefaultProps } from './WorkflowConstants';



const generateRandomString = (length: number = 5) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
};
let nodeId = 0;
const getId = (group: string, name: string) => `${group}_${name}_${generateRandomString(5)}_${generateRandomString(3)}_${nodeId++}`;

const nodeTypes = {
  default: CustomNode,
};


interface WorkflowChartProps {
  onChange?: () => void;
}

function Flow({onChange }: WorkflowChartProps) {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    setSelectedNode,
    viewport,
    hasUnsavedChanges,
    save,
    isSaving,
    clearSaveQueue,
    getSaveQueue,
    resetSaveState
  } = useWorkflow();
  const [selectedElements, setSelectedElements] = useState<{ nodes: Node[]; edges: Edge[]; }>({ nodes: [], edges: [] });
  const { project, getNodes, getEdges, getViewport } = useReactFlow();


  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      console.log('Node changes:', changes);

      // 过滤和处理变更
      const significantChanges = changes.filter(change => {
        // dimensions 变更不需要触发 onChange
        if (change.type === 'dimensions') {
          return false;
        }
        if (change.type === 'select') {
          return false;
        }
        // 对于 position 变更，只在实际位置改变时触发
        if (change.type === 'position') {
          const oldNode = nodes.find(n => n.id === change.id);
          const newNode = applyNodeChanges([change], nodes).find(n => n.id === change.id);
          return oldNode && newNode && (
            oldNode.position.x !== newNode.position.x ||
            oldNode.position.y !== newNode.position.y
          );
        }

        return true;
      }).map(change => {
        // 根据变更类型构造 ChangeItem
        const changeItem = {
          type: ChangeType.NODE,
          id: change.type === 'add' ? change.item.id : change.id,
          operation: change.type === 'add' ? OperationType.ADD :
            change.type === 'remove' ? OperationType.DELETE :
              OperationType.UPDATE,
          previousValue: change.type === 'add' ? null :
            nodes.find(n => n.id === change.id),
          currentValue: change.type === 'add' ? change.item :
            change.type === 'remove' ? null :
              applyNodeChanges([change], nodes).find(n => n.id === change.id)
        };
        return changeItem;
      });

      // 应用所有变更
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);

      // 保存重要变更到历史记录
      if (significantChanges.length > 0) {
        console.log('saving significantChanges',significantChanges);
        saveHistory(significantChanges);
        if (onChange) onChange();
      }
    },
    [nodes, onChange, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const significantChanges = changes.filter(change => change.type !== 'select').map(change => ({
        type: ChangeType.EDGE,
        id: change.id,
        operation: change.type === 'add' ? OperationType.ADD :
          change.type === 'remove' ? OperationType.DELETE :
            OperationType.UPDATE,
        previousValue: edges.find(e => e.id === change.id),
        currentValue: change.type === 'remove' ? null :
          applyEdgeChanges([change], edges).find(e => e.id === change.id)
      }));

      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);

      if (significantChanges.length > 0) {
        saveHistory(significantChanges);
        if (onChange) onChange();
      }
    },
    [edges, onChange, setEdges, saveHistory]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
    },
    [nodes, edges]
  );


  const onSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[]; }) => {
      setSelectedElements(params);
    },
    []
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
      return;
    }

    // 使用 onNodesChange 删除节点
    if (selectedElements.nodes.length > 0) {
      const nodesToRemove = selectedElements.nodes.map(node => ({
        type: 'remove' as const,
        id: node.id,
      }));
      onNodesChange(nodesToRemove);

      // 找出需要删除的边（连接到被删除节点的边）
      const selectedNodeIds = selectedElements.nodes.map(node => node.id);
      const edgesToRemove = edges.filter(
        edge => selectedNodeIds.includes(edge.source) || selectedNodeIds.includes(edge.target)
      ).map(edge => ({
        type: 'remove' as const,
        id: edge.id,
      }));

      if (edgesToRemove.length > 0) {
        onEdgesChange(edgesToRemove);
      }
    }

    // 使用 onEdgesChange 删除独立选中的边
    if (selectedElements.edges.length > 0) {
      const edgesToRemove = selectedElements.edges.map(edge => ({
        type: 'remove' as const,
        id: edge.id,
      }));
      onEdgesChange(edgesToRemove);
    }
  }, [selectedElements, onNodesChange, onEdgesChange, edges]);


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
          props: {...ComponentDefaultProps[name]}
        },
        selected: true,
      };

      // const newNodes = nodes.map(node => ({ ...node, selected: false }));
      // setNodes([...newNodes, newNode]);
      onNodesChange([
        // 先取消所有节点的选中状态
        ...nodes.map(node => ({
          type: 'select' as const,
          id: node.id,
          selected: false
        })),
        // 添加新节点
        {
          type: 'add' as const,
          item: newNode
        }
      ]);

      setSelectedNode(newNode);
    },
    [project, nodes, edges, onChange, setSelectedNode]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

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

  const handleSave = async () => {
    // const flowData = {
    //   nodes: getNodes(),
    //   edges: getEdges(),
    //   viewport: getViewport()
    // };
    await save();
  };


  return (
    <WorkflowChartContainer>
      <WorkflowHeader>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={undo}
            disabled={!canUndo}
            sx={{ color: 'text.secondary' }}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={redo}
            disabled={!canRedo}
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
            disabled={isSaving}
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
          defaultViewport={viewport}
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

export default function WorkflowChart({ onChange }: WorkflowChartProps) {
  return (
    <ReactFlowProvider>
      <Flow onChange={onChange} />
    </ReactFlowProvider>
  );
} 