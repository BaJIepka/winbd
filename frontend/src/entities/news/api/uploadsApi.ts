import api from '@/shared/api/axiosInstance'

export const uploadsApi = {
  uploadImage(file: File): Promise<{ url: string }> {
    const fd = new FormData()
    fd.append('image', file)
    return api
      .post<{ url: string }>('/api/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
