import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { ComponentSettingContainer } from './styled';
import { Typography } from '@mui/material';
import { ComponentSettingContent, ComponentSettingHeader } from './styled';
import { IconButton } from '@mui/material';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Node } from 'reactflow';
import { NodeData, etlComponents } from './WorkflowConstants';
import WorkflowProps from './components/WorkflowProps';
import { alpha } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import PreviewIcon from '@mui/icons-material/Preview';
import { useWorkflowState } from './context/WorkflowContext';
// interface ComponentSettingProps {
//   workflowInfo: {
//     id: string;
//     name: string;
//     description: string;
//     parameters: { key: string; value: string; }[];
//   };
//   onWorkflowInfoChange?: (info: any) => void;
//   onNodeChange?: (nodeId: string, props: any) => void;
// }

const ComponentSetting = ({}) => {
  const [settingExpanded, setSettingExpanded] = useState(false);
  const { selectedNode } = useWorkflowState();
  // 根据选中的节点找到对应的组件
  const renderComponent = () => {
    if (!selectedNode) {
      return (
        <WorkflowProps/>
      );
    }

    // 在 etlComponents 中查找对应的组件
    const group = etlComponents.find(g => g.name === selectedNode.data.group);
    if (!group) return null;

    const componentConfig = group.components.find(c => c.name === selectedNode.data.name);
    if (!componentConfig) return null;

    const Component = componentConfig.component;
    return <Component
      form={componentConfig.form}
      key={selectedNode.id}
      description={componentConfig.description}
      id={selectedNode.id}
    />;
  };

  return (
    <ComponentSettingContainer expanded={settingExpanded}>
      <ComponentSettingHeader>
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          overflow: 'hidden',
        }}>
          <SettingsIcon
            sx={{
              color: 'primary.main',
              animation: 'spin 10s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              flex: 1,
              minWidth: 0,
              fontWeight: 600,
              background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {selectedNode ? selectedNode.data.label : 'Workflow Properties'}
          </Typography>

          {selectedNode && (
            <>
              <Button
                size="small"
                startIcon={<PreviewIcon />}
                onClick={() => {
                  console.log('Preview node:', selectedNode);
                }}
                sx={{
                  textTransform: 'none',
                  minWidth: 'auto',
                }}
              >
                Preview
              </Button>
            </>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={() => setSettingExpanded(!settingExpanded)}
          sx={{
            color: 'text.secondary',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              color: 'primary.main',
              transform: 'scale(1.1)',
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
            },
            ml: 1,
          }}
        >
          {settingExpanded ? (
            <CloseFullscreenIcon fontSize="small" />
          ) : (
            <OpenInFullIcon fontSize="small" />
          )}
        </IconButton>
      </ComponentSettingHeader>
      <ComponentSettingContent>
        {renderComponent()}
      </ComponentSettingContent>
    </ComponentSettingContainer>
  );
};

export default ComponentSetting;