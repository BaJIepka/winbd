import { cn } from '@/shared/lib/cn'

import type { NewsStatus } from '../model/types'

const labels: Record<NewsStatus, string> = {
  draft: 'Черновик',
  published: 'Опубликовано',
}

const styles: Record<NewsStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
}

export function NewsStatusBadge({ status }: { status: NewsStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  )
}
