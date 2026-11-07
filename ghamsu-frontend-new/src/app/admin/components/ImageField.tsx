import { useRef, useState, type MouseEvent } from 'react'
import { ImagePlus, Loader2, RefreshCw, Trash2, Crosshair } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { mediaUrl, thumbUrl, fallbackToFull } from '../../../lib/media'
import type { ImageFocus } from '../../../types/types'
import { uploadImage } from '../lib/images'
import { friendlyError } from '../lib/errors'

export interface ImageValue {
  path: string | null
  alt: string | null
  caption?: string | null
  focus?: ImageFocus | null
  /** An external image URL (older seeded content). Uploading replaces it. */
  url?: string | null
}

interface Props {
  id: string
  label: string
  value: ImageValue
  onChange: (value: ImageValue) => void
  withCaption?: boolean
  withFocus?: boolean
  required?: boolean
  error?: string
}

export function ImageField({ id, label, value, onChange, withCaption = true, withFocus = true, required, error }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const hasImage = Boolean(value.path || value.url)
  const fullSrc = value.path ? mediaUrl(value.path) : value.url ?? ''
  const previewSrc = value.path ? thumbUrl(value.path) : value.url ?? ''
  const spot = value.focus?.hotspot

  const pick = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const uploaded = await uploadImage(file)
      // A new image gets a centred focus point and drops any old crop.
      onChange({ ...value, path: uploaded.path, url: null, focus: null })
      toast.success('Image uploaded. Remember to add alt text and save.')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const setFocus = (event: MouseEvent<HTMLImageElement>) => {
    if (!withFocus) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    const round = (n: number) => Math.round(n * 1000) / 1000
    onChange({ ...value, focus: { ...(value.focus ?? {}), hotspot: { x: round(x), y: round(y), width: 1, height: 1 } } })
  }

  return (
    <div className="space-y-3">
      <Label htmlFor={`${id}-alt`}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => pick(event.target.files?.[0])}
      />

      {hasImage ? (
        <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-3">
          <div className="flex justify-center">
            <div className="relative inline-block">
              <img
                src={previewSrc}
                onError={fallbackToFull(fullSrc)}
                alt={value.alt || 'Preview'}
                onClick={setFocus}
                className={`block max-h-72 max-w-full w-auto h-auto rounded ${withFocus && value.path ? 'cursor-crosshair' : ''}`}
              />
              {withFocus && spot && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent/70 shadow"
                  style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
                />
              )}
            </div>
          </div>
          {withFocus && value.path && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
              Click the picture to choose the point that should stay visible when it is cropped.
            </p>
          )}
          {!value.path && value.url && (
            <p className="text-xs text-muted-foreground">This image is hosted on another website. Upload a file to store it here instead.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ path: null, alt: null, caption: null, focus: null, url: null })}
              disabled={uploading}
            >
              <Trash2 /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-28 w-full flex-col border-dashed"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {uploading ? 'Resizing and uploading…' : 'Choose an image'}
        </Button>
      )}

      {hasImage && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-alt`} className="text-xs">
              Alt text <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${id}-alt`}
              value={value.alt ?? ''}
              onChange={(event) => onChange({ ...value, alt: event.target.value })}
              placeholder="Describe the image for people who cannot see it"
              aria-invalid={Boolean(error) || undefined}
            />
          </div>
          {withCaption && (
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-caption`} className="text-xs">Caption (optional)</Label>
              <Input
                id={`${id}-caption`}
                value={value.caption ?? ''}
                onChange={(event) => onChange({ ...value, caption: event.target.value })}
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
