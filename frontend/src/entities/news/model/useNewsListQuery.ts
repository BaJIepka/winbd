import { useQuery } from '@tanstack/react-query'

import { type GetNewsListParams, newsApi } from '../api/newsApi'

export const NEWS_LIST_KEY = 'news-list'

export function useNewsListQuery(params: GetNewsListParams) {
  return useQuery({
    queryKey: [NEWS_LIST_KEY, params],
    queryFn: () => newsApi.getAll({ limit: 5, ...params }),
  })
}
