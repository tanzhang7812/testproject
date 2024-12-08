import React from 'react'
import { 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Box, 
  Typography 
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { getFileIcon } from './utils.ts'
import { UploadFile } from './types'
import { formatFileSize } from './utils.ts'

interface FileItemProps {
  file: UploadFile
  onDelete: (file: UploadFile) => void
}

export const FileItem: React.FC<FileItemProps> = ({ file, onDelete }) => {
  return (
    <ListItem
      sx={{
        py: 0.5,
        px: 2,
        height: 36,
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'translateX(4px)',
          '& .delete-icon': {
            opacity: 1
          }
        },
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none'
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        {getFileIcon(file.type)}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                color: 'text.primary',
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {file.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                flexShrink: 0
              }}
            >
              {formatFileSize(file.size)}
            </Typography>
            <Box 
              component="span" 
              sx={{ 
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: 'text.disabled',
                flexShrink: 0
              }} 
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                flexShrink: 0
              }}
            >
              {file.uploadTime}
            </Typography>
          </Box>
        }
      />
      <IconButton 
        className="delete-icon"
        onClick={() => onDelete(file)}
        sx={{ 
          opacity: 0,
          transition: 'opacity 0.2s',
          color: 'error.light',
          p: 0.5,
          ml: 1,
          flexShrink: 0,
          '&:hover': {
            color: 'error.main',
            bgcolor: 'error.lighter'
          }
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </ListItem>
  )
} 