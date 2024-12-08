import React, { useCallback, useState } from 'react'
import { Box, Snackbar, Alert } from '@mui/material'
import { UploadZone } from './UploadZone'
import { FileList } from './FileList'
import { PowerUploadProps, UploadFile, UploadError } from './types'

const PowerUpload: React.FC<PowerUploadProps> = ({
  uploadUrl,
  accept = '*',
  multiple = true,
  maxSize = 10,
  height = 150,
  headers = {},
  fileList,
  layout = 'vertical',
  onFileListChange,
  onDelete
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: string }>({})
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({})

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const uploadFiles = async (files: File[]) => {
    const validFiles = Array.from(files).filter(file => {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        const fileId = Math.random().toString(36).substring(7)
        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: file.name
        }))
        setUploadErrors(prev => ({
          ...prev,
          [fileId]: `File size exceeds ${maxSize}MB limit`
        }))
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)

    const uploadTasks = validFiles.map(file => {
      const fileId = Math.random().toString(36).substring(7)
      const formData = new FormData()
      formData.append('file', file)

      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: file.name
      }))

      return {
        fileId,
        promise: new Promise<UploadFile>((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded * 100) / event.total)
              setUploadProgress(prev => ({
                ...prev,
                [fileId]: progress
              }))
            }
          })

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const result = JSON.parse(xhr.responseText)
                const newFile: UploadFile = {
                  id: result.id,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url: result.url,
                  uploadTime: new Date().toLocaleString()
                }
                setUploadProgress(prev => {
                  const newProgress = { ...prev }
                  delete newProgress[fileId]
                  return newProgress
                })
                setUploadingFiles(prev => {
                  const newFiles = { ...prev }
                  delete newFiles[fileId]
                  return newFiles
                })
                resolve(newFile)
              } catch (error) {
                reject(new Error('Invalid server response'))
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
            }
          })

          xhr.addEventListener('error', () => {
            reject(new Error('Network error, upload failed'))
          })

          xhr.open('POST', uploadUrl)
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value)
          })
          xhr.send(formData)
        })
      }
    })

    try {
      const results = await Promise.allSettled(uploadTasks.map(task => task.promise))
      const newFiles: UploadFile[] = []

      results.forEach((result, index) => {
        const { fileId } = uploadTasks[index]
        if (result.status === 'fulfilled') {
          newFiles.push(result.value)
        } else {
          setUploadErrors(prev => ({
            ...prev,
            [fileId]: result.reason.message
          }))
        }
      })

      if (newFiles.length > 0) {
        const updatedFileList = [...fileList]
        newFiles.forEach(newFile => {
          const existingFileIndex = updatedFileList.findIndex(
            existingFile => existingFile.name === newFile.name
          )
          if (existingFileIndex !== -1) {
            updatedFileList[existingFileIndex] = newFile
          } else {
            updatedFileList.push(newFile)
          }
        })
        onFileListChange(updatedFileList)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = (files: FileList) => {
    uploadFiles(Array.from(files))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleDelete = async (file: UploadFile) => {
    try {
      await onDelete?.(file)
      onFileListChange(fileList.filter(f => f.id !== file.id))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleRemoveErrorItem = (fileId: string) => {
    setUploadingFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[fileId]
      return newFiles
    })
    setUploadErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fileId]
      return newErrors
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap: 2,
        height
      }}
    >
      <Box sx={{ width: layout === 'vertical' ? '100%' : '40%', height: '100%' }}>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          id="file-upload"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload" style={{ display: 'block', height: '100%' }}>
          <UploadZone
            accept={accept}
            maxSize={maxSize}
            isDragOver={isDragOver}
            uploading={uploading}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        </label>
      </Box>

      <FileList
        uploadProgress={uploadProgress}
        uploadingFiles={uploadingFiles}
        uploadErrors={uploadErrors}
        onRemoveError={handleRemoveErrorItem}
        fileList={fileList}
        onDelete={handleDelete}
        layout={layout}
      />
    </Box>
  )
}

export default PowerUpload 