import * as AlertDialog from '@radix-ui/react-alert-dialog'

import { Button } from '@/shared/ui/Button'

import { useDeleteNews } from './useDeleteNews'

interface Props {
  id: string
  title: string
}

export function DeleteButton({ id, title }: Props) {
  const { mutate, isPending } = useDeleteNews()

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="destructive" size="sm">
          Удалить
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg">
          <AlertDialog.Title className="text-lg font-semibold">Удалить статью?</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            «{title}» будет удалена безвозвратно.
          </AlertDialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" size="sm">
                Отмена
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => mutate(id)}
              >
                {isPending ? 'Удаление...' : 'Удалить'}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
