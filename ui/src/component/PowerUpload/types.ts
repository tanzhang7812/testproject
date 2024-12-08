export interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadTime: string
}

export interface UploadError {
  fileName: string
  message: string
}

export interface PowerUploadProps {
  uploadUrl: string
  accept?: string
  multiple?: boolean
  maxSize?: number
  height?: number | string
  headers?: Record<string, string>
  fileList: UploadFile[]
  onFileListChange: (files: UploadFile[]) => void
  onDelete?: (file: UploadFile) => Promise<void>
  layout?: 'vertical' | 'horizontal'
} 