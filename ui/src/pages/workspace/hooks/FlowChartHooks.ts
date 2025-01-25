import React, { createContext, useContext, useState, useCallback, DragEvent, useEffect, useRef } from 'react';
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
import { ComponentDefaultProps, NodeData } from '../WorkflowConstants';
import { ChangeItem, ChangeType, OperationType } from '../hooks/SaveHistoryHooks';



export interface FlowChartProps {
    defaultNodes: Node<NodeData>[];
    defaultEdges: Edge[];
    onChange?: () => void;
    saveHistory: (changes: ChangeItem[]) => void;
}

export interface FlowChartReturn {
    nodes: Node<NodeData>[];
    edges: Edge[];
    selectedNode: Node<NodeData> | null;
    selectedElements: { nodes: Node[]; edges: Edge[]; };
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (params: Connection) => void;
    onSelectionChange: (params: { nodes: Node[]; edges: Edge[]; }) => void;
    handleDeleteSelected: () => void;
    setSelectedNode: (node: Node<NodeData> | null) => void;
}

export const useFlowChart = ({defaultNodes,defaultEdges,onChange,saveHistory}: FlowChartProps): FlowChartReturn => {
    const [nodes, setNodes] = useState<Node[]>(defaultNodes);
    const [edges, setEdges] = useState<Edge[]>(defaultEdges);

    const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
    const [selectedElements, setSelectedElements] = useState<{ nodes: Node[]; edges: Edge[]; }>({ nodes: [], edges: [] });

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
          const significantChanges= changes.filter(change => change.type !== 'dimensions' && change.type !== 'select' && (change.type !== 'position' ||  change.dragging)).map(change => {   
            const changeItem = {
                type: ChangeType.NODE,
                id: change.id,
                operation: change.type === 'add' ? OperationType.ADD :
                  change.type === 'remove' ? OperationType.DELETE :
                  change.type === 'position' ? OperationType.MOVE :
                    OperationType.UPDATE,
                previousValue: change.type === 'add' ? null :
                  nodes.find(n => n.id === change.id),
                currentValue: change.type === 'add' ? change.item :
                  change.type === 'remove' ? null :
                    applyNodeChanges([change], nodes).find(n => n.id === change.id)
              };
              return changeItem;
          });
      
          setNodes(applyNodeChanges(changes, nodes));

          if (significantChanges.length > 0) {
            console.log('saving significantChanges', significantChanges);
            saveHistory(significantChanges);
            if (onChange) onChange();
          }
        },
        [nodes, onChange, setNodes,saveHistory]
      )
    
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
          const change = [{
            id: newEdges[newEdges.length - 1].id,
            type: ChangeType.EDGE,
            operation: OperationType.ADD,
            previousValue: null,
            currentValue: newEdges[newEdges.length - 1]
          }];
          setEdges(newEdges)
          saveHistory(change)
        },
        [edges, onEdgesChange]
      );
    
    
      const onSelectionChange = useCallback(
        (params: { nodes: Node[]; edges: Edge[]; }) => {
          console.log('onSelectionChange', params);
          if (params.nodes.length === 0 && params.edges.length === 0) return;
          setSelectedElements(params);
          if (params.nodes.length === 1) {
            setSelectedNode(params.nodes[0]);
          } else {
            setSelectedNode(null);
          }
        },
        []
      );
    
      const handleDeleteSelected = useCallback(() => {
        if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
          return;
        }

        let changes: ChangeItem[] = [];
        let edgesToRemove = new Set<string>();
    
        if (selectedElements.nodes.length > 0) { 
          // Add node deletion changes
          const nodeChanges = selectedElements.nodes.map(node => ({
            type: ChangeType.NODE,
            id: node.id,
            operation: OperationType.DELETE,
            previousValue: node,
            currentValue: null
          }));
          
          // Find edges connected to deleted nodes
          const selectedNodeIds = selectedElements.nodes.map(node => node.id);
          const connectedEdges = edges.filter(
            edge => selectedNodeIds.includes(edge.source) || selectedNodeIds.includes(edge.target)
          );
          
          // Add connected edges deletion changes
          const connectedEdgeChanges = connectedEdges.map(edge => {
            edgesToRemove.add(edge.id);
            return {
              type: ChangeType.EDGE,
              id: edge.id,
              operation: OperationType.DELETE,
              previousValue: edge,
              currentValue: null
            };
          });

          changes = [...nodeChanges, ...connectedEdgeChanges];

          // Apply node deletions
          const nodesToRemove = selectedElements.nodes.map(node => ({
            type: 'remove' as const,
            id: node.id,
          }));
          setNodes(applyNodeChanges(nodesToRemove, nodes));
        }
    
        // Handle independently selected edges
        if (selectedElements.edges.length > 0) {
          const selectedEdgeChanges = selectedElements.edges
            .filter(edge => !edgesToRemove.has(edge.id)) // Avoid duplicates
            .map(edge => {
              edgesToRemove.add(edge.id);
              return {
                type: ChangeType.EDGE,
                id: edge.id,
                operation: OperationType.DELETE,
                previousValue: edge,
                currentValue: null
              };
            });
          
          changes = [...changes, ...selectedEdgeChanges];
        }

        // Apply all edge deletions at once
        setEdges(edges.filter(edge => !edgesToRemove.has(edge.id)));

        // Save batch changes to history
        if (changes.length > 0) {
          saveHistory(changes);
          if (onChange) onChange();
        }
      }, [selectedElements, nodes, edges, setNodes, setEdges, saveHistory, onChange]);
    
    
      

      return {
        nodes,
        edges,
        selectedNode,
        selectedElements,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onSelectionChange,
        handleDeleteSelected,
        setSelectedNode,
      }
}