import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { NEWS_LIST_KEY, newsApi } from '@/entities/news'

import { getErrorMessage } from '@/shared/lib/getErrorMessage'

export function useDeleteNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => newsApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [NEWS_LIST_KEY] })
      toast.success('Статья удалена')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Не удалось удалить статью'))
    },
  })
}
