import api from '@/shared/api/axiosInstance'

import type { News, NewsStatus, PaginatedNews } from '../model/types'

export interface GetNewsListParams {
  page?: number
  limit?: number
  status?: NewsStatus
}

export const newsApi = {
  getAll(params: GetNewsListParams = {}): Promise<PaginatedNews> {
    return api.get<PaginatedNews>('/api/news', { params }).then((r) => r.data)
  },

  getById(id: string): Promise<News> {
    return api.get<News>(`/api/news/${id}`).then((r) => r.data)
  },

  create(formData: FormData): Promise<News> {
    return api
      .post<News>('/api/news', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },

  update(id: string, formData: FormData): Promise<News> {
    return api
      .put<News>(`/api/news/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  delete(id: string): Promise<void> {
    return api.delete(`/api/news/${id}`).then(() => undefined)
  },

  publish(id: string): Promise<News> {
    return api.post<News>(`/api/news/${id}/publish`).then((r) => r.data)
  },

  schedule(id: string, publishAt: string): Promise<News> {
    return api.post<News>(`/api/news/${id}/schedule`, { publishAt }).then((r) => r.data)
  },
}
