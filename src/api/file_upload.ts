// src/api/file_upload.ts
import axios from './axios'

export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  return axios.post('/api/file_upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
