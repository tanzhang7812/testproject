import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import RichTextEditor from '../../component/RichTextEditor';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const initialContent = `
<h2>Welcome to the Rich Text Editor Demo</h2>
<p>This is a demonstration of our rich text editor component. You can:</p>
<ul>
  <li>Format text with <strong>bold</strong>, <em>italic</em>, and other styles</li>
  <li>Create lists (like this one)</li>
  <li>Insert images and links</li>
  <li>And much more!</li>
</ul>
<p>Try editing this content or create your own!</p>
`;

export default function RichTextEditorDemo() {
  const [content, setContent] = useState(initialContent);
  const [disabled, setDisabled] = useState(false);
  const [showSource, setShowSource] = useState(false);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Rich Text Editor Demo
        </Typography>
        <Typography sx={{ mb: 2 }}>
          A powerful WYSIWYG editor with comprehensive formatting options and features.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
            }
            label="Read Only"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showSource}
                onChange={(e) => setShowSource(e.target.checked)}
              />
            }
            label="Show HTML Source"
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <RichTextEditor
          value={content}
          onChange={handleContentChange}
          height={500}
          disabled={disabled}
        />
        
        {showSource && (
          <Paper 
            sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'grey.100',
              maxHeight: 200,
              overflow: 'auto'
            }}
          >
            <Typography
              component="pre"
              sx={{ 
                m: 0,
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {content}
            </Typography>
          </Paper>
        )}
      </Paper>
    </Box>
  );
} 