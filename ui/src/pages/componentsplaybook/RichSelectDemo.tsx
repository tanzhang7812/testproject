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
    id: 'full',
    title: 'Full Join',
    image: 'src/assets/img/full_join.png',
  },
  {
    id: 'inner',
    title: 'Inner Join',
    image: 'src/assets/img/inner_join.png',
  },
  {
    id: 'left',
    title: 'Left Join',
    image: 'src/assets/img/left_join.png',
  },
  {
    id: 'right',
    title: 'Right Join',
    image: 'src/assets/img/right_join.png',
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
          columns={8}
          gap={1}
          width={90}
          height={90}
          titleAlign='center'
          imageStyle={{ width: '50px', height: '50px', '& img': {
            width: 'auto',
            height: 'auto',
          } }}
        />
      </Paper>
    </Box>
  );
} 