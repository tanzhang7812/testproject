import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import RichSelect from '../../component/form/RichSelect';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

const options = [
  {
    id: 1,
    title: 'Basic Plan',
    description: 'Perfect for small projects Perfect for small projects Perfect for small projects Perfect for small projects Perfect for small projects',
    
  },
  {
    id: 2,
    title: 'Pro Plan',
    description: 'Best for professional use',
    content: (
      <Stack spacing={1}>
        <Chip label="20 Users" size="small" color="primary" />
        <Chip label="50GB Storage" size="small" color="primary" />
        <Chip label="Priority Support" size="small" color="primary" />
      </Stack>
    ),
  },
  {
    id: 3,
    title: 'Enterprise Plan',
    description: 'For large organizations',
    content: (
      <Stack spacing={1}>   
        <Chip label="Unlimited Users" size="small" color="secondary" />
        <Chip label="500GB Storage" size="small" color="secondary" />
        <Chip label="24/7 Support" size="small" color="secondary" />
      </Stack>
    ),
  },
];

const imageOptions = [
  {
    id: 'light',
    title: 'Light Theme',
    image: 'https://via.placeholder.com/300x200/ffffff/000000?text=Light+Theme',
    description: 'Clean and bright interface',
  },
  {
    id: 'dark',
    title: 'Dark Theme',
    image: 'https://via.placeholder.com/300x200/000000/ffffff?text=Dark+Theme',
    description: 'Easy on the eyes',
  },
  {
    id: 'custom',
    title: 'Custom Theme',
    image: 'https://via.placeholder.com/300x200/2196f3/ffffff?text=Custom+Theme',
    description: 'Personalized experience',
  },
];

export default function RichSelectDemo() {
  const [singleValue, setSingleValue] = useState<string | number>(1);
  const [multipleValue, setMultipleValue] = useState<(string | number)[]>([]);
  const [showMultiple, setShowMultiple] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Rich Select Demo
        </Typography>
        <Typography sx={{ mb: 2 }}>
          A flexible selection component that supports both single and multiple selection with rich content.
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showMultiple}
              onChange={(e) => setShowMultiple(e.target.checked)}
            />
          }
          label="Multiple Selection"
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Plan Selection
        </Typography>
        <RichSelect
          options={options}
          value={showMultiple ? multipleValue : singleValue}
          onChange={showMultiple ? setMultipleValue : setSingleValue}
          multiple={showMultiple}
          columns={3}
          gap={1}
          height={200}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Theme Selection
        </Typography>
        <RichSelect
          options={imageOptions}
          value={showMultiple ? multipleValue : singleValue}
          onChange={showMultiple ? setMultipleValue : setSingleValue}
          multiple={showMultiple}
          columns={3}
          gap={2}
        />
      </Paper>
    </Box>
  );
} 