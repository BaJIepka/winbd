import type { ChangeEvent } from 'react'
import { useRef } from 'react'

interface ImageUploadProps {
  value?: File | null
  onChange: (file: File | null) => void
  previewUrl?: string | null
  label?: string
}

export function ImageUpload({
  value,
  onChange,
  previewUrl,
  label = 'Загрузить изображение',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = value ? URL.createObjectURL(value) : previewUrl

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.files?.[0] ?? null)
  }

  return (
    <div className="flex flex-col gap-2">
      {preview && (
        <img src={preview} alt="preview" className="h-40 w-full rounded-md object-cover" />
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-dashed border-input px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          {label}
        </button>
        {(value ?? previewUrl) && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            Удалить
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
