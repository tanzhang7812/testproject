import React, { useState } from 'react';
import { ComponentItem, ComponentNav, NavDivider, Search, SearchIconWrapper, StyledInputBase, StyledAccordion, ToggleButton } from './styled';
import { AccordionDetails, Box, List, ListItemText, Typography } from '@mui/material';
import { etlComponents, iconColors } from './constants';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccordionSummary from '@mui/material/AccordionSummary';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const ComponentListGroup = ({  }) => {
const [searchText, setSearchText] = useState('');
const [navCollapsed, setNavCollapsed] = useState(false);

const [expanded, setExpanded] = useState<string[]>(() => 
  etlComponents.map(group => group.name)
);

 // 过滤组件的函数
 const getFilteredComponents = (group: typeof etlComponents[0]) => {
    return {
      ...group,
      components: group.components.filter(component =>
        component.name.toLowerCase().includes(searchText.toLowerCase())
      ),
    };
  };

  // 检查组是否有匹配的组件
  const hasMatchingComponents = (group: typeof etlComponents[0]) => {
    return getFilteredComponents(group).components.length > 0;
  };

  
  const handleAccordionChange = (group: string) => {
    setExpanded(prev => {
      if (prev.includes(group)) {
        return prev.filter(item => item !== group);
      }
      return [...prev, group];
    });
  };


  return (<ComponentNav collapsed={navCollapsed}>
    <Box sx={{ 
      opacity: navCollapsed ? 0 : 1, 
      transition: 'opacity 0.2s ease',
      visibility: navCollapsed ? 'hidden' : 'visible',
      height: '100%',
      overflow: 'auto',
    }}>
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search components..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Search>
      <Box>
        {etlComponents.map((group) => {
          // 只有当组中有匹配的组件时才显示该组
          if (!hasMatchingComponents(group)) return null;
          
          const filteredGroup = getFilteredComponents(group);
          return (
            <StyledAccordion
              key={group.name}
              expanded={expanded.includes(group.name)}
              onChange={() => handleAccordionChange(group.name)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  },
                }}
              >
                <Typography>{group.label}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List component="div" disablePadding>
                  {filteredGroup.components.map((component) => {
                    const Icon = component.icon;
                    return (
                      <ComponentItem 
                        key={component.name}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData('application/reactflow', 'default');
                          event.dataTransfer.setData('application/nodeName', component.name);
                          event.dataTransfer.setData('application/nodeLabel', component.label);
                          event.dataTransfer.setData('application/nodeGroup', group.name);
                          event.dataTransfer.effectAllowed = 'move';
                        }}
                        sx={{
                          cursor: 'grab',
                          '&:active': {
                            cursor: 'grabbing',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Icon 
                            fontSize="small" 
                            sx={{ 
                              color: iconColors[group.name as keyof typeof iconColors],
                              transition: 'transform 0.2s ease',
                              '.MuiListItemButton-root:hover &': {
                                transform: 'scale(1.1)',
                              },
                            }} 
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={component.name}
                          primaryTypographyProps={{
                            variant: 'caption',
                            sx: {
                              fontWeight: 400,
                              lineHeight: 1.2,
                            }
                          }}
                        />
                      </ComponentItem>
                    );
                  })}
                </List>
              </AccordionDetails>
            </StyledAccordion>
          );
        })}
      </Box>
    </Box>
    <NavDivider />
    <ToggleButton onClick={() => setNavCollapsed(!navCollapsed)}>
      {navCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
    </ToggleButton>
  </ComponentNav>);
};

export default ComponentListGroup;