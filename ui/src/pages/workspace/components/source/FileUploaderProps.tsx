import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PowerUpload from '../../../../component/PowerUpload';
import { UploadFile } from '../../../../component/PowerUpload/types';
import { CommonComponentPropsProps } from '../../WorkflowConstants';

const FileUploaderProps: React.FC<CommonComponentPropsProps> = ({ form,id,props,description,onChange }) => {
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const handleDelete = (file: UploadFile) => {
        setFileList(prev => prev.filter(f => f.id !== file.id));
    };
  return (
    <Box sx={{height:'100%',p:2}}>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
        <PowerUpload
          uploadUrl="/api/upload"
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          multiple={true}
          maxSize={10}
          height={'100%'}
          headers={{
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }}
          fileList={fileList}
          onFileListChange={setFileList}
          onDelete={handleDelete}
        />
    </Box>
  );
};

export default FileUploaderProps; 