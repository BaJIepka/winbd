import { Link, useParams } from 'react-router-dom'
import { Paperclip, Pencil } from 'lucide-react'

import { Header } from '@/widgets/header'

import { NewsStatusBadge, useNewsQuery } from '@/entities/news'

import { formatDate } from '@/shared/lib/formatDate'
import { sanitizeHtml } from '@/shared/lib/sanitizeHtml'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { TiptapContent } from '@/shared/ui/TiptapContent'

export default function NewsViewPage() {
  const { id } = useParams<{ id: string }>()
  const { data: news, isLoading, isError } = useNewsQuery(id ?? '')

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError || !news ? (
          <p className="text-sm text-destructive">
            Не удалось загрузить статью.{' '}
            <Link to="/" className="underline">
              Вернуться к списку
            </Link>
          </p>
        ) : (
          <article className="space-y-6">
            <div className="flex items-start justify-between gap-2">
              <NewsStatusBadge status={news.status} />
              <Button variant="outline" size="sm" asChild>
                <Link to={`/news/${news._id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Редактировать
                </Link>
              </Button>
            </div>

            {news.imageUrl && (
              <img
                src={news.imageUrl}
                alt={news.title}
                className="max-h-96 w-full rounded-md object-cover"
              />
            )}

            <h1 className="text-3xl font-bold leading-tight">{news.title}</h1>

            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Автор: {news.author.email}</p>
              <p>Создана: {formatDate(news.createdAt)}</p>
              {news.publishedAt && <p>Опубликована: {formatDate(news.publishedAt)}</p>}
              {news.publishAt && news.status === 'draft' && (
                <p>Запланирована: {formatDate(news.publishAt)}</p>
              )}
            </div>

            <TiptapContent className="prose max-w-none" html={sanitizeHtml(news.content)} />

            {news.attachments.length > 0 && (
              <div className="border-t border-input pt-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Вложения</p>
                <ul className="flex flex-col gap-1">
                  {news.attachments.map((url) => (
                    <li key={url} className="flex items-center gap-2 text-sm">
                      <Paperclip size={14} className="shrink-0 text-muted-foreground" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="truncate text-primary underline hover:no-underline"
                      >
                        {url.split('/').pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        )}
      </main>
    </div>
  )
}
