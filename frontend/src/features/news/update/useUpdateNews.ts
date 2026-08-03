import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { NEWS_KEY, NEWS_LIST_KEY, newsApi } from '@/entities/news'

import { getErrorMessage } from '@/shared/lib/getErrorMessage'

export function useUpdateNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      newsApi.update(id, formData),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [NEWS_LIST_KEY] })
      void qc.invalidateQueries({ queryKey: [NEWS_KEY, id] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Не удалось сохранить статью'))
    },
  })
}
