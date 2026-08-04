import { Link, useParams } from 'react-router-dom'

import { Header } from '@/widgets/header'
import { NewsEditorWidget } from '@/widgets/news-editor'

import { useNewsQuery } from '@/entities/news'

import { Skeleton } from '@/shared/ui/Skeleton'

export default function NewsEditorPage() {
  const { id } = useParams<{ id?: string }>()
  const { data: news, isLoading, isError } = useNewsQuery(id ?? '')

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-6 text-2xl font-bold">{id ? 'Редактировать статью' : 'Новая статья'}</h1>
        {id && isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : id && isError ? (
          <p className="text-sm text-destructive">
            Не удалось загрузить статью.{' '}
            <Link to="/" className="underline">
              Вернуться к списку
            </Link>
          </p>
        ) : (
          <NewsEditorWidget
            newsId={id}
            initialTitle={news?.title}
            initialContent={news?.content}
            initialImageUrl={news?.imageUrl}
            initialAttachments={news?.attachments}
            isPublished={news?.status === 'published'}
          />
        )}
      </main>
    </div>
  )
}
