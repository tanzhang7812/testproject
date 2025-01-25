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
import { useWorkflow, useWorkflowActions, useWorkflowState } from './context/WorkflowContext';
import { ComponentDefaultProps } from './WorkflowConstants';
import { OperationType } from './hooks/SaveHistoryHooks';
import { ChangeType } from './hooks/SaveHistoryHooks';
import CircularProgress from '@mui/material/CircularProgress';

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

function Flow({ onChange }: WorkflowChartProps) {
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
    selectedNode,
    selectedElements,
    hasUnsavedChanges,
    save,
    isSaving,
    clearSaveQueue,
    getSaveQueue,
    resetSaveState,
    setSelectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    handleDeleteSelected
  } = useWorkflow();
  
  const { project, getNodes, getEdges, getViewport } = useReactFlow();

  

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
          group: group
        },
        selected: true,
      };

      const newNodes = nodes.map(node => ({ ...node, selected: false }));
      setNodes([...newNodes, newNode]);
      saveHistory([{
        type: ChangeType.NODE,
        id: newNode.id,
        operation: OperationType.ADD,  
        previousValue: null,
        currentValue: newNode
      },{
        type: ChangeType.PROPS,
        id: newNode.id,
        operation: OperationType.ADD,  
        previousValue: null,
        currentValue: { ...ComponentDefaultProps[name] }
      }])
      // onNodesChange([
      //   // 先取消所有节点的选中状态
      //   ...nodes.map(node => ({
      //     type: 'select' as const,
      //     id: node.id,
      //     selected: false
      //   })),
      //   // 添加新节点
      //   {
      //     type: 'add' as const,
      //     item: newNode
      //   }
      // ]);

      setSelectedNode(newNode);
    },
    [project, nodes, edges, onChange, setSelectedNode,saveHistory]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    //setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);


  return (
    <WorkflowChartContainer>
      <WorkflowHeader>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={undo}
            disabled={!canUndo || isSaving}
            sx={{ color: 'text.secondary' }}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={redo}
            disabled={!canRedo || isSaving}
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
            disabled={isSaving || !hasUnsavedChanges}
            onClick={handleSave}
            sx={{
              color: hasUnsavedChanges ? 'primary.main' : 'text.disabled',
              transition: 'color 0.2s',
              position: 'relative',
              width: '30px',
              height: '30px',
            }}
          >
            {isSaving ? (
              <CircularProgress
                size={20}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-10px',   // 因为 size 是 20，所以向上移动 10px
                  marginLeft: '-10px',  // 因为 size 是 20，所以向左移动 10px
                  color: 'primary.main'
                }}
              />
            ) : (
              <SaveIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </WorkflowHeader>
      <WorkflowContent>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          defaultViewport={{
            "x": 0,
            "y": 0,
            "zoom": 1
          }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          //onNodeClick={onNodeClick}
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
          deleteKeyCode={['Delete']}
          multiSelectionKeyCode={['Control', 'Meta']}
          selectionKeyCode={['Shift']}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          onKeyDown={(event) => {
            if (event.key === 'Delete') {
              event.preventDefault();
              handleDeleteSelected();
            }
          }}
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