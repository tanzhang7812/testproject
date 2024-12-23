import React, { useState } from 'react';
import { VerticalTabs } from './styled';
import { TabPanel } from './styled';
import { ResultContainer } from './styled';
import { Box, Tab } from '@mui/material';
import MessageGrid from './MessageGrid';
import MessageIcon from '@mui/icons-material/Message';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import DataDisplay from './DataDisplay';
import { GridColDef } from '@mui/x-data-grid';
import { useWorkflowState, WorkflowError } from './context/WorkflowContext';

interface WorkflowResultProps {
  nodeId: string;
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  inputSchema: any[];
  outputSchema: any[];
  inputData: any[];
  outputData: any[];
  dataView: 'schema' | 'data';
  onDataViewChange: (view: 'schema' | 'data') => void;
  schemaColumns: GridColDef[];
  dataColumns: GridColDef[];
}

const WorkflowResult = ({ tabValue, onTabChange, inputSchema, outputSchema, inputData, outputData, dataView, onDataViewChange, schemaColumns, dataColumns }: WorkflowResultProps) => {
  const { errors, selectedNode } = useWorkflowState();  
  const nodeId = selectedNode?.id;
  const nodeErrors = nodeId ? errors[nodeId]?.map((error,index)=>({...error,id:index})) : Object.values(errors).flat().map((error,index)=>({...error,id:index}));
  return (<ResultContainer>
    <VerticalTabs
      orientation="vertical"
      value={tabValue}
      onChange={onTabChange}
      aria-label="Result tabs"
      sx={{
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <Tab
        icon={<MessageIcon />}
        label="Messages"
        sx={{
          fontSize: '0.75rem',
          '&.Mui-selected': {
            color: 'primary.main',
          },
        }}
      />
      <Tab
        icon={<InputIcon />}
        label="Input"
        sx={{
          fontSize: '0.75rem',
          '&.Mui-selected': {
            color: 'primary.main',
          },
        }}
      />
      <Tab
        icon={<OutputIcon />}
        label="Output"
        sx={{
          fontSize: '0.75rem',
          '&.Mui-selected': {
            color: 'primary.main',
          },
        }}
      />
    </VerticalTabs>
    <Box sx={{ 
        flex: 1,  // 关键：让内容区域填充剩余空间
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'  // 防止内容溢出
      }}>
    <TabPanel hidden={tabValue !== 0}>
      <Box sx={{ height: '100%' }}>
        <MessageGrid errors={nodeErrors} />
      </Box>
    </TabPanel>
    <TabPanel hidden={tabValue !== 1}>
      <Box sx={{ height: '100%' }}>
        <DataDisplay 
          schema={inputSchema} 
          data={inputData}
          view={dataView}
          onViewChange={onDataViewChange}
          schemaColumns={schemaColumns}
          dataColumns={dataColumns}
        />
      </Box>
    </TabPanel>
    <TabPanel hidden={tabValue !== 2}>
      <Box sx={{ height: '100%' }}>
        <DataDisplay 
          schema={outputSchema} 
          data={outputData}
          view={dataView}
          onViewChange={onDataViewChange}
          schemaColumns={schemaColumns}
          dataColumns={dataColumns}
        />
      </Box>
    </TabPanel>
    </Box>
  </ResultContainer>);
};

export default WorkflowResult;