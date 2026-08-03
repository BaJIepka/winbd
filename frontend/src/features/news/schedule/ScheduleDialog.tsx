import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'

import { useScheduleNews } from './useScheduleNews'

export function ScheduleDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [publishAt, setPublishAt] = useState('')
  const { mutate, isPending } = useScheduleNews()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!publishAt) return
    mutate(
      { id, publishAt: new Date(publishAt).toISOString() },
      { onSuccess: () => setOpen(false) },
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          Запланировать
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">Запланировать публикацию</Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="publishAt">Дата и время</Label>
              <Input
                id="publishAt"
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" size="sm" type="button">
                  Отмена
                </Button>
              </Dialog.Close>
              <Button size="sm" type="submit" disabled={isPending}>
                {isPending ? 'Сохранение...' : 'Запланировать'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
