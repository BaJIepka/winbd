import { useQuery } from '@tanstack/react-query'

import { newsApi } from '../api/newsApi'

export const NEWS_KEY = 'news'

export function useNewsQuery(id: string) {
  return useQuery({
    queryKey: [NEWS_KEY, id],
    queryFn: () => newsApi.getById(id),
    enabled: !!id,
  })
}
