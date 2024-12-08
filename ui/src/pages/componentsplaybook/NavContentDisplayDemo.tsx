import React from 'react';
import Box from '@mui/material/Box';
import NavContentDisplay from '../../component/NavContentDisplay';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const generateLoremIpsum = () => {
  return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`.repeat(3);
};

const groups = [
  {
    id: 'basic',
    title: 'Basic',
  },
  {
    id: 'advanced',
    title: 'Advanced',
  }
];

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    group: 'basic',
    content: (
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography>
          {generateLoremIpsum()}
        </Typography>
      </Paper>
    ),
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    group: 'basic',
    content: (
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography>
          {generateLoremIpsum()}
        </Typography>
      </Paper>
    ),
  },
  {
    id: 'features',
    title: 'Features',
    group: 'advanced',
    content: (
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography>
          {generateLoremIpsum()}
        </Typography>
      </Paper>
    ),
  },
  {
    id: 'examples',
    title: 'Examples',
    group: 'advanced',
    content: (
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography>
          {generateLoremIpsum()}
        </Typography>
      </Paper>
    ),
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    content: (
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography>
          {generateLoremIpsum()}
        </Typography>
      </Paper>
    ),
  },
];

export default function NavContentDisplayDemo() {
  return (
    <Box sx={{ height: '100%', overflow: 'hidden' }}>
      <NavContentDisplay sections={sections} groups={groups} />
    </Box>
  );
} 