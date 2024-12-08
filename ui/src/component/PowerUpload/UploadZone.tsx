import React from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { styled } from '@mui/material/styles'

const StyledUploadZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s',
  backgroundColor: theme.palette.background.default,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  gap: theme.spacing(1.5),
  '&:hover:not(.uploading)': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
    '& .upload-icon': {
      transform: 'scale(1.1)',
      color: theme.palette.primary.main,
    }
  },
  '&.dragover:not(.uploading)': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    '& .upload-icon': {
      transform: 'scale(1.2)',
      color: theme.palette.primary.main,
    }
  },
  '&.uploading': {
    cursor: 'not-allowed',
    opacity: 0.7,
    '& .upload-icon': {
      opacity: 0.5
    }
  }
}))

interface UploadZoneProps {
  accept: string
  maxSize: number
  isDragOver: boolean
  uploading: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  accept,
  maxSize,
  isDragOver,
  uploading,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    if (!uploading) {
      onDragOver(e)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!uploading) {
      onDragLeave(e)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!uploading) {
      onDrop(e)
    }
  }

  return (
    <StyledUploadZone
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${isDragOver ? 'dragover' : ''} ${uploading ? 'uploading' : ''}`}
    >
      <CloudUploadIcon 
        className="upload-icon"
        sx={{ 
          fontSize: 40,
          color: 'primary.light',
          transition: 'all 0.3s',
          opacity: 0.8,
          '&:hover': {
            opacity: uploading ? 0.5 : 1
          }
        }} 
      />
      
      <Box sx={{ textAlign: 'center', maxWidth: '100%' }}>
        {accept !== '*' && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              display: 'block',
              mb: 0.5
            }}
          >
            Support: {accept.split(',').join(', ')}
          </Typography>
        )}
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            display: 'block'
          }}
        >
          {uploading ? 'Uploading in progress...' : `Max file size: ${maxSize}MB`}
        </Typography>
      </Box>

      {uploading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 1 
          }}
        >
          <CircularProgress size={32} />
          <Typography variant="caption" color="primary">
            Uploading...
          </Typography>
        </Box>
      )}
    </StyledUploadZone>
  )
} 