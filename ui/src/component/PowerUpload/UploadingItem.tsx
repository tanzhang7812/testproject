import React from 'react'
import { 
  ListItem, 
  Box, 
  Typography, 
  CircularProgress, 
  LinearProgress,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

interface UploadingItemProps {
  fileId: string
  fileName: string
  progress: number
  error?: string
  onRemove?: () => void
}

export const UploadingItem: React.FC<UploadingItemProps> = ({
  fileId,
  fileName,
  progress,
  error,
  onRemove
}) => {
  return (
    <ListItem 
      sx={{ 
        py: 1,
        px: 2,
        bgcolor: error ? 'error.lighter' : 'primary.50',
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        mb: 1,
        '&::after': !error && {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'shine 1.5s infinite',
        },
        '@keyframes shine': {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        width: '100%',
        gap: 1
      }}>
        {error ? (
          <ErrorOutlineIcon 
            sx={{ 
              color: 'error.main',
              fontSize: 20,
              flexShrink: 0
            }} 
          />
        ) : (
          <CircularProgress 
            size={16} 
            thickness={5}
            sx={{ 
              color: 'primary.main',
              flexShrink: 0
            }} 
          />
        )}
        <Typography 
          variant="body2" 
          sx={{ 
            color: error ? 'error.main' : 'primary.main',
            fontWeight: 500,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {fileName}
        </Typography>
        {error ? (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'error.main',
              fontWeight: 500,
              flexShrink: 0
            }}
          >
            {error}
          </Typography>
        ) : (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              flexShrink: 0
            }}
          >
            {progress}%
          </Typography>
        )}
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{ 
            p: 0.5,
            color: error ? 'error.main' : 'primary.main',
            opacity: 0.7,
            flexShrink: 0,
            '&:hover': {
              opacity: 1
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {!error && (
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 4,
            borderRadius: 2,
            bgcolor: 'primary.100',
            mt: 1,
            '& .MuiLinearProgress-bar': {
              bgcolor: 'primary.main',
              transition: 'transform 0.2s linear'
            }
          }} 
        />
      )}
    </ListItem>
  )
} 