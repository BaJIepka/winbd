import { useEffect, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import CharacterCount from '@tiptap/extension-character-count'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { X } from 'lucide-react'
import { toast } from 'sonner'

import { useCreateNews } from '@/features/news/create'
import { useUpdateNews } from '@/features/news/update'

import { newsApi } from '@/entities/news'

import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { Button } from '@/shared/ui/Button'
import { FileUpload } from '@/shared/ui/FileUpload'
import { ImageUpload } from '@/shared/ui/ImageUpload'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'

import { EditorToolbar } from './EditorToolbar'
import { PreviewModal } from './PreviewModal'
import { ScheduleEditorDialog } from './ScheduleEditorDialog'

const lowlight = createLowlight(common)

const EDITOR_EXTENSIONS = [
  StarterKit.configure({ codeBlock: false }),
  Underline,
  CodeBlockLowlight.configure({ lowlight }),
  Image,
  Placeholder.configure({ placeholder: 'Начните писать статью...' }),
  CharacterCount,
]

interface Props {
  newsId?: string
  initialTitle?: string
  initialContent?: string
  initialImageUrl?: string | null
  initialAttachments?: string[]
}

export function NewsEditorWidget({
  newsId,
  initialTitle = '',
  initialContent = '',
  initialImageUrl = null,
  initialAttachments = [],
}: Props) {
  const navigate = useNavigate()
  const { mutateAsync: createNews } = useCreateNews()
  const { mutateAsync: updateNews } = useUpdateNews()

  const [title, setTitle] = useState(initialTitle)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(initialImageUrl)
  const [existingAttachments, setExistingAttachments] = useState<string[]>(initialAttachments)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: initialContent,
    immediatelyRender: false,
    onUpdate: () => setIsDirty(true),
  })

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('Есть несохранённые изменения. Уйти со страницы?')) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])

  function buildFormData() {
    const fd = new FormData()
    fd.append('title', title)
    fd.append('content', editor?.getHTML() ?? '')
    if (coverFile) {
      fd.append('image', coverFile)
    } else if (newsId && coverUrl === null && initialImageUrl) {
      fd.append('removeImage', 'true')
    }
    existingAttachments.forEach((url) => fd.append('keepAttachments', url))
    newFiles.forEach((f) => fd.append('files', f))
    return fd
  }

  async function handleSave(): Promise<string> {
    const fd = buildFormData()
    if (newsId) {
      const news = await updateNews({ id: newsId, formData: fd })
      return news._id
    }
    const news = await createNews(fd)
    return news._id
  }

  async function onSaveDraft() {
    setIsSaving(true)
    try {
      await handleSave()
      setIsDirty(false)
      toast.success('Статья сохранена')
      navigate('/')
    } catch {
      // toast shown by mutation onError
    } finally {
      setIsSaving(false)
    }
  }

  async function onPublish() {
    setIsSaving(true)
    try {
      let id: string
      try {
        id = await handleSave()
      } catch {
        return // toast shown by mutation onError
      }
      try {
        await newsApi.publish(id)
        setIsDirty(false)
        toast.success('Статья опубликована')
        navigate('/')
      } catch (error) {
        toast.error(getErrorMessage(error, 'Не удалось опубликовать статью'))
      }
    } finally {
      setIsSaving(false)
    }
  }

  function handleCoverChange(file: File | null) {
    setCoverFile(file)
    if (!file) setCoverUrl(null)
    setIsDirty(true)
  }

  function removeExistingAttachment(url: string) {
    setExistingAttachments((prev) => prev.filter((a) => a !== url))
    setIsDirty(true)
  }

  function handleNewFilesChange(files: File[]) {
    setNewFiles(files)
    setIsDirty(true)
  }

  const isDisabled = isSaving || !title.trim()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="title">Заголовок</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setIsDirty(true)
          }}
          placeholder="Заголовок статьи"
          maxLength={500}
        />
      </div>

      <div className="space-y-1">
        <Label>Обложка</Label>
        <ImageUpload value={coverFile} onChange={handleCoverChange} previewUrl={coverUrl} />
      </div>

      <div className="space-y-1">
        <Label>Содержимое</Label>
        <div className="rounded-md border border-input">
          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} className="tiptap-content min-h-[300px] p-4" />
          {editor && (
            <div className="border-t border-input px-4 py-1 text-xs text-muted-foreground">
              {editor.storage.characterCount.characters() as number} символов
            </div>
          )}
        </div>
      </div>

      {existingAttachments.length > 0 && (
        <div className="space-y-1">
          <Label>Прикреплённые файлы</Label>
          <ul className="flex flex-col gap-1">
            {existingAttachments.map((url) => (
              <li
                key={url}
                className="flex items-center justify-between rounded bg-muted px-3 py-1 text-sm"
              >
                <span className="truncate">{url.split('/').pop()}</span>
                <button
                  type="button"
                  onClick={() => removeExistingAttachment(url)}
                  aria-label={`Удалить вложение ${url.split('/').pop()}`}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-1">
        <Label>Добавить вложения</Label>
        <FileUpload files={newFiles} onChange={handleNewFilesChange} />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-input pt-4">
        <Button onClick={onSaveDraft} disabled={isDisabled}>
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
        <Button variant="outline" onClick={onPublish} disabled={isDisabled}>
          Опубликовать
        </Button>
        <ScheduleEditorDialog
          disabled={isDisabled}
          onSchedule={async (publishAt) => {
            setIsSaving(true)
            try {
              let id: string
              try {
                id = await handleSave()
              } catch {
                return // toast shown by mutation onError
              }
              try {
                await newsApi.schedule(id, publishAt)
                setIsDirty(false)
                toast.success('Публикация запланирована')
                navigate('/')
              } catch (error) {
                toast.error(getErrorMessage(error, 'Не удалось запланировать публикацию'))
              }
            } finally {
              setIsSaving(false)
            }
          }}
        />
        <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
          Предпросмотр
        </Button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground"
        >
          Отмена
        </button>
      </div>

      <PreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={title}
        coverUrl={coverFile ? URL.createObjectURL(coverFile) : coverUrl}
        contentHtml={editor?.getHTML() ?? ''}
        attachmentUrls={[...existingAttachments, ...newFiles.map((f) => f.name)]}
      />
    </div>
  )
}
