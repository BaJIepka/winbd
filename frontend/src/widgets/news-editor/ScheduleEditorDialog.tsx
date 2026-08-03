import { type FormEvent, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'

interface Props {
  disabled: boolean
  onSchedule: (publishAt: string) => Promise<void>
}

export function ScheduleEditorDialog({ disabled, onSchedule }: Props) {
  const [open, setOpen] = useState(false)
  const [publishAt, setPublishAt] = useState('')
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!publishAt) return
    setIsPending(true)
    try {
      await onSchedule(new Date(publishAt).toISOString())
      setOpen(false)
      setPublishAt('')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" disabled={disabled}>
          Запланировать
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">Запланировать публикацию</Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="scheduleAt">Дата и время</Label>
              <Input
                id="scheduleAt"
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm">
                  Отмена
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? 'Сохранение...' : 'Запланировать'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
