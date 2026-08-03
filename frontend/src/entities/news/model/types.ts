export type NewsStatus = 'draft' | 'published'

export interface NewsAuthor {
  _id: string
  email: string
}

export interface News {
  _id: string
  title: string
  content: string
  author: NewsAuthor
  status: NewsStatus
  imageUrl: string | null
  attachments: string[]
  publishAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedNews {
  data: News[]
  total: number
  page: number
  totalPages: number
}
