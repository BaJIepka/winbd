import * as Dialog from '@radix-ui/react-dialog'
import { Paperclip, X } from 'lucide-react'

import { sanitizeHtml } from '@/shared/lib/sanitizeHtml'
import { Button } from '@/shared/ui/Button'
import { TiptapContent } from '@/shared/ui/TiptapContent'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  coverUrl: string | null
  contentHtml: string
  existingAttachmentUrls: string[]
  newFileNames: string[]
}

export function PreviewModal({
  open,
  onOpenChange,
  title,
  coverUrl,
  contentHtml,
  existingAttachmentUrls,
  newFileNames,
}: Props) {
  const cleanHtml = sanitizeHtml(contentHtml)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-input px-6 py-4">
            <Dialog.Title className="text-base font-semibold text-muted-foreground">
              Предпросмотр
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Закрыть">
                <X size={16} />
              </Button>
            </Dialog.Close>
          </div>

          <div className="overflow-y-auto px-8 py-6">
            {coverUrl && (
              <img
                src={coverUrl}
                alt="Обложка"
                className="mb-6 max-h-64 w-full rounded-md object-cover"
              />
            )}

            <h1 className="mb-6 text-3xl font-bold leading-tight">
              {title || <span className="text-muted-foreground italic">Без заголовка</span>}
            </h1>

            {cleanHtml ? (
              <TiptapContent className="prose max-w-none" html={cleanHtml} />
            ) : (
              <p className="text-muted-foreground italic">Содержимое пустое</p>
            )}

            {(existingAttachmentUrls.length > 0 || newFileNames.length > 0) && (
              <div className="mt-8 border-t border-input pt-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Вложения</p>
                <ul className="flex flex-col gap-1">
                  {existingAttachmentUrls.map((url) => (
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
                  {newFileNames.map((name) => (
                    <li
                      key={name}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Paperclip size={14} className="shrink-0" />
                      <span className="truncate">{name}</span>
                      <span className="shrink-0 text-xs italic">(новый, ещё не сохранён)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
