import React from 'react'
import { 
  Paper, 
  Typography, 
  Box, 
  List, 
  Divider 
} from '@mui/material'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { UploadingItem } from './UploadingItem'
import { FileItem } from './FileItem'
import { UploadFile } from './types'

interface FileListProps {
  uploadProgress: { [key: string]: number }
  uploadingFiles: { [key: string]: string }
  uploadErrors: { [key: string]: string }
  onRemoveError: (fileId: string) => void
  fileList: UploadFile[]
  onDelete: (file: UploadFile) => Promise<void>
  layout?: 'vertical' | 'horizontal'
}

export const FileList: React.FC<FileListProps> = ({
  uploadProgress,
  uploadingFiles,
  uploadErrors,
  onRemoveError,
  fileList,
  onDelete,
  layout
}) => {
  return (
    <Paper 
      sx={{ 
        width: layout === 'vertical' ? '100%' : '60%',
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        overscrollBehavior: 'contain',
        boxShadow: 'none',
        bgcolor: 'transparent',
        height: '100%'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1
      }}>
        <Typography 
          variant="subtitle1"
          sx={{ 
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Uploaded Files
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            bgcolor: 'action.hover',
            px: 1.5,
            py: 0.5,
            borderRadius: 1
          }}
        >
          Total: {fileList.length} files
        </Typography>
      </Box>
      <Divider />
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 48px)'
        }}
      >
        <List 
          sx={{ 
            flex: 1,
            overflow: 'auto',
            overflowY: 'auto',
            scrollbarGutter: 'stable',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '3px',
              display: 'block'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '1.5px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.2)'
              }
            },
            pr: 1,
            mt: 1
          }}
        >
          {Object.entries(uploadingFiles).map(([fileId, fileName]) => (
            <UploadingItem
              key={fileId}
              fileId={fileId}
              fileName={fileName}
              progress={uploadProgress[fileId] || 0}
              error={uploadErrors[fileId]}
              onRemove={() => onRemoveError(fileId)}
            />
          ))}
          {fileList.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={onDelete}
            />
          ))}
          {fileList.length === 0 && !Object.keys(uploadProgress).length && (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 6,
                color: 'text.disabled',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}
            >
              <InsertDriveFileIcon sx={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant="body1">
                No files
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Paper>
  )
} 