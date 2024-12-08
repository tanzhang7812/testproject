import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { styled, useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
  group?: string;
}

interface SectionGroup {
  id: string;
  title: string;
}

interface NavContentDisplayProps {
  sections: Section[];
  groups: SectionGroup[];
}

const NavContainer = styled(Box)(({ theme }) => ({
  width: '240px',
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflowY: 'auto',
  padding: theme.spacing(3, 2),
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(0,0,0,0.3)',
    },
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  height: '100vh',
  overflowY: 'auto',
  '& section': {
    marginBottom: theme.spacing(4),
  },
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(0,0,0,0.3)',
    },
  },
}));

const GroupTitle = styled(ListItemText)(({ theme }) => ({
  '& .MuiTypography-root': {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: theme.spacing(2, 2, 1),
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: theme.spacing(2),
      right: theme.spacing(2),
      height: '1px',
      background: 'linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)',
    }
  }
}));

const StyledListItem = styled(ListItemButton)<{ active?: boolean }>(({ theme, active }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  padding: theme.spacing(0.8, 1.5),
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
  '&:hover': {
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.action.hover, 0.04),
  },
  '& .MuiListItemText-primary': {
    color: active ? 'grey.200' : theme.palette.text.primary,
    fontWeight: active ? 700 : 400,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    transition: 'all 0.2s',
  },
  transition: theme.transitions.create(['background-color', 'color', 'transform'], {
    duration: 200,
  }),
  '&:hover .MuiListItemText-primary': {
    transform: 'translateX(3px)',
  },
  '& .MuiListItemText-primary': {
    display: 'block',
    transition: 'transform 0.2s',
  }
}));

export default function NavContentDisplay({ sections, groups }: NavContentDisplayProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id);
  const theme = useTheme();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const container = document.querySelector('.content-container');
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({
        top: relativeTop - 20,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (!e.target.classList.contains('content-container')) return;

      const sectionElements = sections.map(section => 
        document.getElementById(section.id)
      );

      const currentSection = sectionElements.reduce((nearest, section) => {
        if (!section) return nearest;
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) return section;
        return nearest;
      }, null as HTMLElement | null);

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    const contentContainer = document.querySelector('.content-container');
    if (contentContainer) {
      contentContainer.addEventListener('scroll', handleScroll);
      return () => contentContainer.removeEventListener('scroll', handleScroll);
    }
  }, [sections]);

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 3,
      height: '100%',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.default,
    }}>
      <NavContainer>
        <List sx={{ p: 0 }}>
          {groups.map(group => {
            const groupSections = sections.filter(section => section.group === group.id);
            if (groupSections.length === 0) return null;
            
            return (
              <React.Fragment key={group.id}>
                <GroupTitle primary={group.title} />
                <Box sx={{ mb: 2 }}>
                  {groupSections.map(section => (
                    <StyledListItem
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      active={activeSection === section.id}
                    >
                      <ListItemText primary={section.title} />
                    </StyledListItem>
                  ))}
                </Box>
              </React.Fragment>
            );
          })}
          {sections
            .filter(section => !section.group)
            .map(section => (
              <StyledListItem
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                active={activeSection === section.id}
              >
                <ListItemText primary={section.title} />
              </StyledListItem>
            ))}
        </List>
      </NavContainer>
      <ContentContainer className="content-container">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            {section.content}
          </section>
        ))}
      </ContentContainer>
    </Box>
  );
} 