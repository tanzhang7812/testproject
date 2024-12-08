import React, { useState } from 'react';
import { VerticalTabs } from './styled';
import { TabPanel } from './styled';
import { ResultContainer } from './styled';
import { Box, Tab } from '@mui/material';
import MessageGrid from './MessageGrid';
import MessageIcon from '@mui/icons-material/Message';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';

const WorkflowResult = () => {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (<ResultContainer>
    <VerticalTabs
      orientation="vertical"
      value={tabValue}
      onChange={handleTabChange}
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
          fontSize: '0.75rem', // 减小文字大小
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
    
    <TabPanel hidden={tabValue !== 0}>
      <Box sx={{ height: '100%' }}>
        <MessageGrid />
      </Box>
    </TabPanel>
    <TabPanel hidden={tabValue !== 1}>
      <Box>
        Input Content
      </Box>
    </TabPanel>
    <TabPanel hidden={tabValue !== 2}>
      <Box>
        Output Content
      </Box>
    </TabPanel>
  </ResultContainer>);
};

export default WorkflowResult;