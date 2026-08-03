import type { ChangeEvent } from 'react'
import { useRef } from 'react'
import { X } from 'lucide-react'

const ACCEPTED = '.pdf,.doc,.docx,.txt,.zip'
const MAX_FILES = 10

interface FileUploadProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function FileUpload({ files, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    onChange([...files, ...selected].slice(0, MAX_FILES))
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {files.length < MAX_FILES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-dashed border-input px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          Прикрепить файлы (PDF, DOC, DOCX, TXT, ZIP) — до {MAX_FILES}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded bg-muted px-3 py-1 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Удалить файл ${file.name}`}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
