import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { NEWS_LIST_KEY, newsApi } from '@/entities/news'

import { getErrorMessage } from '@/shared/lib/getErrorMessage'

export function useScheduleNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, publishAt }: { id: string; publishAt: string }) =>
      newsApi.schedule(id, publishAt),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [NEWS_LIST_KEY] })
      toast.success('Публикация запланирована')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Не удалось запланировать публикацию'))
    },
  })
}
