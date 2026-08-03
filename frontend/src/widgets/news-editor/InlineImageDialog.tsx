import { type FormEvent, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { Editor } from '@tiptap/react'
import { ImageIcon } from 'lucide-react'

import { uploadsApi } from '@/entities/news'

import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'

interface Props {
  editor: Editor | null
}

export function InlineImageDialog({ editor }: Props) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpenChange(o: boolean) {
    setOpen(o)
    if (!o) setFile(null)
  }

  async function handleInsert(e: FormEvent) {
    e.preventDefault()
    if (!file || !editor) return
    setIsUploading(true)
    try {
      const { url } = await uploadsApi.uploadImage(file)
      editor.chain().focus().setImage({ src: url }).run()
      setOpen(false)
      setFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          title="Вставить изображение"
          aria-label="Вставить изображение"
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted"
        >
          <ImageIcon size={16} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">Вставить изображение</Dialog.Title>
          <form onSubmit={handleInsert} className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label>Файл изображения</Label>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full rounded-md border border-dashed border-input px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                {file ? file.name : 'Выбрать файл…'}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm">
                  Отмена
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={!file || isUploading}>
                {isUploading ? 'Загрузка...' : 'Вставить'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
