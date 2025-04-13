// src/api/file_upload.ts
import axios from './axios';

export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);                  // the actual file
  formData.append('filename', file.name);         // explicitly add filename

  return axios.post('/api/file_upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
