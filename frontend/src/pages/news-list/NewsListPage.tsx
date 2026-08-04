import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

import { Header } from '@/widgets/header'

import type { NewsStatus } from '@/entities/news'
import { NewsCard, useNewsListQuery } from '@/entities/news'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'

type FilterValue = NewsStatus | 'all'

const SKELETON_COUNT = 3

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Черновики', value: 'draft' },
  { label: 'Опубликовано', value: 'published' },
]

export default function NewsListPage() {
  const [filter, setFilter] = useState<FilterValue>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useNewsListQuery({
    page,
    status: filter === 'all' ? undefined : filter,
  })

  function handleFilterChange(value: FilterValue) {
    setFilter(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Статьи</h1>
          <Button asChild>
            <Link to="/news/new">
              <Plus className="h-4 w-4" />
              Создать
            </Link>
          </Button>
        </div>

        <div className="flex gap-1 border-b">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilterChange(f.value)}
              aria-pressed={filter === f.value}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                filter === f.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 flex-1 max-w-sm" />
                  <Skeleton className="h-5 w-20 shrink-0" />
                </div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">Ошибка загрузки. Попробуйте обновить страницу.</p>
        )}

        {data && (
          <>
            {data.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет статей.</p>
            ) : (
              <div className="space-y-3">
                {data.data.map((news) => (
                  <NewsCard key={news._id} news={news} />
                ))}
              </div>
            )}

            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Назад
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Вперёд →
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
