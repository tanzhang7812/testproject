import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, Node, useReactFlow } from 'reactflow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import StorageIcon from '@mui/icons-material/Storage';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import MergeIcon from '@mui/icons-material/Merge';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { NodeData, NodeStatus } from './WorkflowConstants';
import { useFlowStore } from './flowStore';
import { useWorkflowActions } from './context/WorkflowContext';
import { OperationType } from './hooks/SaveHistoryHooks';
import { ChangeType } from './hooks/SaveHistoryHooks';
interface RuntimeNodeState {
  [nodeId: string]: {
    status?: NodeStatus;
  }
}

const iconMap = {
  'CSVReader': StorageIcon,
  'SharedFolder': FolderSharedIcon,
  'SFTP': CloudSyncIcon,
  'Fileuploader': UploadFileIcon,
  'Filter': FilterAltIcon,
  'Join': MergeIcon,
  'Select': ListAltIcon,
  'Group': GroupWorkIcon,
  'Union': CallMergeIcon,
  'ExcelWriter': StorageIcon,
  'CsvWriter': StorageIcon,
};

// Components that only have source handle (right side)
const sourceOnlyComponents = ['SharedFolder', 'SFTP', 'Fileuploader'];

// Components that only have target handle (left side)
const targetOnlyComponents = ['SFTP', 'SharedFolder'];

// Components that have both handles
const bothHandlesComponents = [
  'CSVReader',
  'Filter',
  'Join',
  'Select',
  'Group',
  'Union',
  'ExcelWriter',
  'CsvWriter'
];

const NodeContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'group'
})<{ group?: string }>(({ theme, group }) => {
  const getColor = () => {
    switch (group) {
      case 'source':
        return theme.palette.info.main;
      case 'datatransform':
        return theme.palette.success.main;
      case 'output':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const color = getColor();

  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.625),
    '&.selected': {
      boxShadow: `0 0 0 2px ${color}`,
    },
  };
});

const HandleStyled = styled(Handle)(({ theme }) => ({
  width: 8,
  height: 8,
  backgroundColor: theme.palette.primary.main,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'group'
})<{ group?: string }>(({ theme, group }) => {
  const getColor = () => {
    switch (group) {
      case 'source':
        return theme.palette.info.main;
      case 'datatransform':
        return theme.palette.success.main;
      case 'output':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return {
    color: getColor(),
    fontSize: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
});

const NodeNameInput = styled(InputBase)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(0.2, 0.2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  width: 120,
  '& input': {
    textAlign: 'center',
    fontSize: '0.65rem',
    padding: 0,
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
  },
}));

const NodeName = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: theme.spacing(0.5),
  fontSize: '0.65rem',
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.2, 0.2),
  borderRadius: theme.shape.borderRadius,
}));

const StatusIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status'
})<{ status?: NodeStatus }>(({ theme, status }) => {
  const getColor = () => {
    switch (status) {
      case 'SUCCESS':
        return theme.palette.success.main;
      case 'FAIL':
        return theme.palette.error.main;
      case 'WARNING':
        return theme.palette.warning.main;
      case 'RUNNING':
        return theme.palette.success.main;
      default:
        return 'transparent';
    }
  };

  return {
    position: 'absolute',
    top: -15,
    right: -15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: getColor(),
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
  };
});

const CustomNode = ({ data, selected, id }: NodeProps) => {
  const [nodeLabel, setNodeLabel] = useState(data.label || '');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = iconMap[data.name as keyof typeof iconMap] || StorageIcon;
  const { onNodesChange,saveHistory } = useWorkflowActions();
  const { nodes, setNodes } = useFlowStore();

// 使用 useFlowStore 获取运行时状态
  //const nodeStatus = useFlowStore((state) => state.runtimeNodeStates[id]?.status);
  const nodeStatus = 'WARNING';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNodeLabel(event.target.value);
  }, []);

  const handleNameSubmit = useCallback(() => {
    if (nodeLabel.trim()!==data.label) {
      // 更新节点数据
      let newNode;
      let oldNode;
      const updateNode = (node: Node<NodeData>) => {
        if (node.id === id) {
          oldNode=node;
          node.data = {
            ...node.data,
            label: nodeLabel.trim(),
          };
        }
        newNode=node;
        return node;
      };
      // 通知 React Flow 更新节点
        //onNodesChange([{type: 'update', id, data: {label: nodeLabel.trim()}}]);
        setNodes((nodes: Node[]) => nodes.map(updateNode));
        saveHistory([{
          type: ChangeType.NODE,
          id: id,
          operation: OperationType.UPDATE,  
          previousValue: oldNode,
          currentValue: newNode
        }])
    }
    setIsEditing(false);
  }, [nodeLabel, id]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleNameSubmit();
    }
  }, [handleNameSubmit]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const renderHandles = () => {
    // For Output group's SFTP and SharedFolder - only target handle
    if (data.group === 'output' && targetOnlyComponents.includes(data.name)) {
      return <HandleStyled type="target" position={Position.Left} />;
    }
    
    // For Source group's special components - only source handle
    if (data.group === 'source' && sourceOnlyComponents.includes(data.name)) {
      return <HandleStyled type="source" position={Position.Right} />;
    }
    
    // For components that need both handles
    if (bothHandlesComponents.includes(data.name)) {
      return (
        <>
          <HandleStyled type="target" position={Position.Left} />
          <HandleStyled type="source" position={Position.Right} />
        </>
      );
    }

    return null;
  };

  return (
    <NodeContainer 
      group={data.group} 
      className={selected ? 'selected' : ''} 
      onDoubleClick={handleDoubleClick}
      sx={{ position: 'relative' }}
    >
      {renderHandles()}
      <IconWrapper group={data.group}>
        <Icon sx={{ fontSize: '50px' }} />
      </IconWrapper>
      {nodeStatus && (
        <StatusIndicator status={nodeStatus}>
          {nodeStatus === 'SUCCESS' ? <CheckCircleIcon /> : nodeStatus === 'FAIL' ? <ErrorIcon /> : nodeStatus === 'WARNING' ? <ErrorIcon /> : nodeStatus === 'RUNNING' ? <ChangeCircleIcon /> : null}
        </StatusIndicator>
      )}
      {isEditing ? (
        <NodeNameInput
          inputRef={inputRef}
          value={nodeLabel}
          onChange={handleNameChange}
          onBlur={handleNameSubmit}
          onKeyPress={handleKeyPress}
          placeholder={data.label}
        />
      ) : (
        <NodeName>
          {data.label}
        </NodeName>
      )}
    </NodeContainer>
  );
};

export default memo(CustomNode); 