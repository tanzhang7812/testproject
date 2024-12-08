import React from 'react'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import AudioFileIcon from '@mui/icons-material/AudioFile'
import FolderZipIcon from '@mui/icons-material/FolderZip'

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const getFileIcon = (fileType: string): JSX.Element => {
  const iconProps = { sx: { fontSize: 20 } }

  if (fileType.startsWith('image/')) {
    return React.createElement(ImageIcon, { ...iconProps, sx: { color: '#4CAF50' } })
  }
  if (fileType === 'application/pdf') {
    return React.createElement(PictureAsPdfIcon, { ...iconProps, sx: { color: '#F44336' } })
  }
  if (fileType.includes('word') || fileType.includes('msword')) {
    return React.createElement(DescriptionIcon, { ...iconProps, sx: { color: '#2196F3' } })
  }
  if (fileType.includes('text/') || fileType === 'application/json') {
    return React.createElement(TextSnippetIcon, { ...iconProps, sx: { color: '#9E9E9E' } })
  }
  if (fileType.startsWith('video/')) {
    return React.createElement(VideoFileIcon, { ...iconProps, sx: { color: '#FF9800' } })
  }
  if (fileType.startsWith('audio/')) {
    return React.createElement(AudioFileIcon, { ...iconProps, sx: { color: '#9C27B0' } })
  }
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
    return React.createElement(FolderZipIcon, { ...iconProps, sx: { color: '#795548' } })
  }
  return React.createElement(InsertDriveFileIcon, { ...iconProps, sx: { color: '#607D8B' } })
} 