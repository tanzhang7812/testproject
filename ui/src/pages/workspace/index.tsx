import React, { useState, useCallback } from 'react';
import { Node } from 'reactflow';
import Box from '@mui/material/Box';
import WSHeader from './WSHeader';
import 'react-resizable/css/styles.css';

import WorkflowChart from './WorkflowChart';
import { WorkspaceContainer, WSDesignContainer, WorkflowDesigner, WorkflowResultContainer, StyledResizableBox, DesignerContainer, WorkflowChartContainer } from './styled';
import { UnfoldMore } from '@mui/icons-material';
import ComponentListGroup from './ComponentListGroup';
import { NodeData } from './constants';
import ComponentSetting from './ComponentSetting';
import WorkflowResult from './WorkflowResult';

interface WorkflowConfigProps {
  id: string;
  name: string;
  description: string;
  parameters: Array<{
    key: string;
    value: string;
  }>;
}

const defaultWorkflowInfo: WorkflowConfigProps = {
  id: '123',
  name: 'test',
  description: 'test',
  parameters: [
    { key: 'db_process_id', value: '<db_process_id>' },
    { key: 'smb_process_id', value: 'test456' },
    { key: 'current_day', value: 'current_day()' },
  ]
};

const defaultComponents={
  "nodes": [
    {
      "id": "source_CSVReader_BrfcO_kNk_0",
      "type": "default",
      "position": {
        "x": 270,
        "y": 180
      },
      "data": {
        "name": "CSVReader",
        "label": "CSV Reader",
        "group": "source",
        "props":{
          "delimiter":"\t",
          "hasHeader":true
        }
      },
      "selected": false,
      "width": 42,
      "height": 42,
      "positionAbsolute": {
        "x": 270,
        "y": 180
      },
      "dragging": false
    },
    {
      "id": "source_Fileuploader_6RImp_luG_1",
      "type": "default",
      "position": {
        "x": 90,
        "y": 150
      },
      "data": {
        "name": "Fileuploader",
        "label": "File Uploader",
        "group": "source"
      },
      "selected": false,
      "width": 42,
      "height": 42,
      "positionAbsolute": {
        "x": 90,
        "y": 150
      }
    }
  ],
  "edges": [
    {
      "style": {
        "strokeWidth": 2
      },
      "type": "smoothstep",
      "animated": false,
      "source": "source_Fileuploader_6RImp_luG_1",
      "sourceHandle": null,
      "target": "source_CSVReader_BrfcO_kNk_0",
      "targetHandle": null,
      "id": "reactflow__edge-source_Fileuploader_6RImp_luG_1-source_CSVReader_BrfcO_kNk_0",
      "selected": false
    }
  ],
  "viewport": {
    "x": 0,
    "y": 0,
    "zoom": 1
  }
}

export default function Workspace({workflowInfo=defaultWorkflowInfo,components=defaultComponents}) {
  // 计算初始高度和最小高度
  const containerHeight = window.innerHeight - 50; // 减去 header 高度
  const initialHeight = containerHeight * 0.6; // 初始高度 60%
  const minHeight = containerHeight * 0.4; // 最小高度 40%
  const maxHeight = containerHeight * 0.8; // 最大高度 80%

  const [height, setHeight] = useState(initialHeight);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [workflowInfoState, setWorkflowInfoState] = useState(workflowInfo);
  const [componentsState, setComponentsState] = useState(components);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const onResize = (e: React.SyntheticEvent, { size }: { size: { width: number; height: number } }) => {
    setHeight(size.height);
  };

  const handleNodeSelect = useCallback((node: Node<NodeData> | null) => {
    setSelectedNode(node);
  }, []);

  const handleWorkflowInfoChange = useCallback((newInfo: WorkflowConfigProps) => {
    setWorkflowInfoState(newInfo);
    setHasUnsavedChanges(true);
  }, []);

   // 处理流程图变更（新增/删除节点、连线等）
   const handleFlowChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);
  
  const handleNodeChange = useCallback((nodeId: string, props: any) => {
    setHasUnsavedChanges(true);
  }, []);

  return (
    <WorkspaceContainer>
      <WSHeader />
      <WSDesignContainer>
        <StyledResizableBox
          width={Infinity}
          height={height}
          onResize={onResize}
          resizeHandles={['s']}
          minConstraints={[Infinity, minHeight]}
          maxConstraints={[Infinity, maxHeight]}
          handle={
            <Box className="react-resizable-handle">
              <UnfoldMore />
            </Box>
          }
        >
          <WorkflowDesigner>
            <DesignerContainer>
              <ComponentListGroup />
              <WorkflowChartContainer>
                <WorkflowChart 
                  onNodeSelect={handleNodeSelect} 
                  defaultNodes={componentsState.nodes} 
                  defaultEdges={componentsState.edges} 
                  defaultViewport={componentsState.viewport}
                  onChange={handleFlowChange}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
                <ComponentSetting 
                  selectedNode={selectedNode} 
                  workflowInfo={workflowInfoState}
                  onWorkflowInfoChange={handleWorkflowInfoChange}
                  onNodeChange={handleNodeChange}
                />
              </WorkflowChartContainer>
            </DesignerContainer>
          </WorkflowDesigner>
        </StyledResizableBox>
        <WorkflowResultContainer>
          <WorkflowResult />
        </WorkflowResultContainer>
      </WSDesignContainer>
    </WorkspaceContainer>
  );
}
