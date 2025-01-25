import React, { useState, useCallback, useMemo } from 'react';
import { Node } from 'reactflow';
import Box from '@mui/material/Box';
import WSHeader from './WSHeader';
import 'react-resizable/css/styles.css';

import WorkflowChart from './WorkflowChart';
import { WorkspaceContainer, WSDesignContainer, WorkflowDesigner, WorkflowResultContainer, StyledResizableBox, DesignerContainer, WorkflowChartContainer } from './styled';
import { UnfoldMore } from '@mui/icons-material';
import ComponentListGroup from './ComponentListGroup';
import { NodeData, WorkflowConfigProps, Variables, ComponentsProps, WorkflowView } from './WorkflowConstants';
import ComponentSetting from './ComponentSetting';
import WorkflowResult from './WorkflowResult';
import { WorkflowProvider } from './context/WorkflowContext';
import { GridColDef } from '@mui/x-data-grid';


const defaultWorkflowInfo: WorkflowConfigProps = {
  id: '123',
  name: 'test',
  description: 'test'
};

const defaultVariables: Variables[] = [
  { key: 'db_process_id', value: '<db_process_id>' },
  { key: 'smb_process_id', value: 'test456' },
  { key: 'current_day', value: 'current_day()' },
];

const defaultComponentsProps: ComponentsProps = {
  "source_CSVReader_BrfcO_kNk_0":{
    "delimiter":"\t",
    "skip":0,
    "hasHeader":true
  },
  "source_Fileuploader_6RImp_luG_1":{}
}

const defaultWorkflow: WorkflowView = {
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
        "group": "source"
      },
      "selected": false,
      "width": 60,
      "height": 60,
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
      "width": 60,
      "height": 60,
      "positionAbsolute": {
        "x": 90,
        "y": 150
      }
    },
    {
      "id": "datatransform_Join_nWdYr_rn5_1",
      "type": "default",
      "position": {
        "x": 345,
        "y": 360
      },
      "data": {
        "name": "Join",
        "label": "Join",
        "group": "datatransform"
      },
      "selected": false,
      "width": 60,
      "height": 60,
      "positionAbsolute": {
        "x": 345,
        "y": 360
      }
    },
    {
      "id": "datatransform_Select_WZZxh_ubQ_2",
      "type": "default",
      "position": {
        "x": 555,
        "y": 225
      },
      "data": {
        "name": "Select",
        "label": "Select",
        "group": "datatransform"
      },
      "selected": false,
      "width": 60,
      "height": 60,
      "positionAbsolute": {
        "x": 555,
        "y": 225
      }
    },
    {
      "id": "datatransform_Group_U56Q9_Z12_3",
      "type": "default",
      "position": {
        "x": 705,
        "y": 405
      },
      "data": {
        "name": "Group",
        "label": "Group",
        "group": "datatransform"
      },
      "selected": false,
      "width": 60,
      "height": 60,
      "positionAbsolute": {
        "x": 705,
        "y": 405
      }
    },
    {
      "id": "datatransform_Union_j3FWw_hB0_4",
      "type": "default",
      "position": {
        "x": 540,
        "y": 510
      },
      "data": {
        "name": "Union",
        "label": "Union",
        "group": "datatransform"
      },
      "selected": false,
      "width": 60,
      "height": 60,
      "positionAbsolute": {
        "x": 540,
        "y": 510
      }
    },
    {
      "id": "output_ExcelWriter_TKWJe_A5U_5",
      "type": "default",
      "position": {
        "x": 840,
        "y": 225
      },
      "data": {
        "name": "ExcelWriter",
        "label": "Excel Writer",
        "group": "output"
      },
      "selected": false,
      "width": 60,
      "height": 60,
      "positionAbsolute": {
        "x": 840,
        "y": 225
      }
    },
    {
      "id": "output_CsvWriter_YWUyE_iG9_6",
      "type": "default",
      "position": {
        "x": 960,
        "y": 420
      },
      "data": {
        "name": "CsvWriter",
        "label": "Csv Writer",
        "group": "output"
      },
      "selected": false,
      "width": 60,
      "height": 60,
      "positionAbsolute": {
        "x": 960,
        "y": 420
      }
    },
    {
      "id": "output_SFTP_7nRtZ_Nwg_7",
      "type": "default",
      "position": {
        "x": 840,
        "y": 570
      },
      "data": {
        "name": "SFTP",
        "label": "SFTP",
        "group": "output"
      },
      "selected": false,
      "width": 60,
      "height": 60,
      "positionAbsolute": {
        "x": 840,
        "y": 570
      }
    },
    {
      "id": "output_SharedFolder_Na6up_KRb_8",
      "type": "default",
      "position": {
        "x": 1050,
        "y": 585
      },
      "data": {
        "name": "SharedFolder",
        "label": "Shared Folder",
        "group": "output"
      },
      "selected": true,
      "width": 60,
      "height": 60,
      "positionAbsolute": {
        "x": 1050,
        "y": 585
      },
      "dragging": false
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
  ]
}

export default function Workspace({workflowInfo=defaultWorkflowInfo,variables=defaultVariables,workflowView=defaultWorkflow,componentsProps=defaultComponentsProps}:{workflowInfo:WorkflowConfigProps,variables:Variables[],workflowView:WorkflowView,componentsProps:ComponentsProps}) {
  // 计算初始高度和最小高度
  const containerHeight = window.innerHeight - 50; // 减去 header 高度
  const initialHeight = containerHeight * 0.6; // 初始高度 60%
  const minHeight = containerHeight * 0.4; // 最小高度 40%
  const maxHeight = containerHeight * 0.8; // 最大高度 80%

  const [height, setHeight] = useState(initialHeight);

  const onResize = (e: React.SyntheticEvent, { size }: { size: { width: number; height: number } }) => {
    setHeight(size.height);
  };

  // const handleNodeSelect = useCallback((node: Node<NodeData> | null) => {
  //   setSelectedNode(node);
  // }, []);

  // const handleWorkflowInfoChange = useCallback((newInfo: WorkflowConfigProps) => {
  //   setWorkflowInfoState(newInfo);
  //   setHasUnsavedChanges(true);
  // }, []);

   // 处理流程图变更（新增/删除节点、连线等）
  //  const handleFlowChange = useCallback(() => {
  //   setHasUnsavedChanges(true);
  // }, []);
  
  // const handleNodeChange = useCallback((nodeId: string, props: any) => {
  //   setHasUnsavedChanges(true);
  // }, []);

  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 数据视图状态控制
  const [dataView, setDataView] = useState<'schema' | 'data'>('data');
  const handleDataViewChange = (newView: 'schema' | 'data') => {
    setDataView(newView);
  };

  // 示例数据
  const inputSchema = [
    { name: "name", header: "Name", dataType: "string" },
    { name: "age", header: "Age", dataType: "number" },
    { name: "email", header: "Email Address", dataType: "string" },
    { name: "status", header: "Status", dataType: "string" }
  ];
  
  const outputSchema = [
    { name: "status", header: "Status", dataType: "string" },
    { name: "code", header: "Code", dataType: "number" },
    { name: "message", header: "Message", dataType: "string" },
    { name: "timestamp", header: "Timestamp", dataType: "string" }
  ];
  
  const inputData = [
    { name: "John Doe", age: 30, email: "john@example.com" },
    { name: "Jane Smith", age: 25, email: "jane@example.com" },
    { name: "Bob Johnson", age: 35, email: "bob@example.com" }
  ];
  
  const outputData = [
    { name: "John Doe", age: 30, email: "john@example.com",status: "Success" },
    { name: "Jane Smith", age: 25, email: "jane@example.com",status: "Warning" },
    { name: "Bob Johnson", age: 35, email: "bob@example.com",status: "Error" }
  ];
   // Schema 列定义
   const schemaColumns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      description: 'Field name in the data structure',
      filterable: true,
    },
    { 
      field: 'header', 
      headerName: 'Header', 
      flex: 1,
      description: 'Display name for the field',
      filterable: true,
    },
    { 
      field: 'dataType', 
      headerName: 'Data Type', 
      flex: 1,
      description: 'Type of the data field',
      filterable: true,
    },
  ];

  // Data 列定义
  const dataColumns: GridColDef[] = useMemo(() => {
    return inputSchema.map(item => ({
      field: item.name,
      headerName: item.header,
      flex: 1,
      type: item.dataType === 'number' ? 'number' : 'string',
      filterable: true,
    }));
  }, [inputSchema]);

  return (
    <WorkflowProvider defaultNodes={workflowView.nodes} defaultEdges={workflowView.edges} workflowInfo={workflowInfo} variables={variables} componentsProps={componentsProps} initialNodeTimestamps={{}} >
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
                <WorkflowChart/>
                <ComponentSetting/>
              </WorkflowChartContainer>
            </DesignerContainer>
          </WorkflowDesigner>
        </StyledResizableBox>
        <WorkflowResultContainer>
          <WorkflowResult
            tabValue={tabValue}
            onTabChange={handleTabChange}
            inputSchema={inputSchema}
            outputSchema={outputSchema}
            inputData={inputData}
            outputData={outputData}
            dataView={dataView}
            onDataViewChange={handleDataViewChange}
            schemaColumns={schemaColumns}
            dataColumns={dataColumns}
          />
        </WorkflowResultContainer>
      </WSDesignContainer>
    </WorkspaceContainer>
    </WorkflowProvider>
  );
}
