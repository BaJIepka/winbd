import { Link } from 'react-router-dom'
import { Eye, Pencil } from 'lucide-react'

import { DeleteButton } from '@/features/news/delete'
import { usePublishNews } from '@/features/news/publish'
import { ScheduleDialog } from '@/features/news/schedule'

import { formatDate } from '@/shared/lib/formatDate'
import { Button } from '@/shared/ui/Button'

import type { News } from '../model/types'
import { NewsStatusBadge } from './NewsStatusBadge'

export function NewsCard({ news }: { news: News }) {
  const { mutate: publish, isPending: isPublishing } = usePublishNews()

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold text-base line-clamp-2 flex-1">
          <Link to={`/news/${news._id}`} className="hover:underline">
            {news.title}
          </Link>
        </h2>
        <NewsStatusBadge status={news.status} />
      </div>

      {news.imageUrl && (
        <Link to={`/news/${news._id}`}>
          <img src={news.imageUrl} alt={news.title} className="w-full h-32 object-cover rounded" />
        </Link>
      )}

      <div className="text-xs text-muted-foreground space-y-0.5">
        <p>Автор: {news.author.email}</p>
        <p>Создана: {formatDate(news.createdAt)}</p>
        {news.publishedAt && <p>Опубликована: {formatDate(news.publishedAt)}</p>}
        {news.publishAt && news.status === 'draft' && (
          <p>Запланирована: {formatDate(news.publishAt)}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/news/${news._id}`}>
            <Eye className="h-3.5 w-3.5" />
            Просмотреть
          </Link>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link to={`/news/${news._id}/edit`}>
            <Pencil className="h-3.5 w-3.5" />
            Редактировать
          </Link>
        </Button>

        {news.status === 'draft' && (
          <>
            <Button size="sm" disabled={isPublishing} onClick={() => publish(news._id)}>
              {isPublishing ? 'Публикация...' : 'Опубликовать'}
            </Button>
            <ScheduleDialog id={news._id} />
          </>
        )}

        <DeleteButton id={news._id} title={news.title} />
      </div>
    </div>
  )
}
