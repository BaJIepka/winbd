import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { NEWS_LIST_KEY, newsApi } from '@/entities/news'

import { getErrorMessage } from '@/shared/lib/getErrorMessage'

export function useCreateNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => newsApi.create(formData),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [NEWS_LIST_KEY] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Не удалось создать статью'))
    },
  })
}
