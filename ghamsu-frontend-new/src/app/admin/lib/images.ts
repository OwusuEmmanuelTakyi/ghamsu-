// Resizes images in the browser and uploads two copies to the media bucket:
//   <path>          full image, at most 2000 px wide
//   thumbs/<path>   thumbnail, at most 800 px wide
import { supabase } from '../../../lib/supabase'
import { thumbPath } from '../../../lib/media'

const FULL_WIDTH = 2000
const THUMB_WIDTH = 800
const QUALITY = 0.8
const MAX_SOURCE_BYTES = 50 * 1024 * 1024

export interface UploadedImage {
  path: string
  width: number
  height: number
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    // Applies the camera's EXIF rotation, so phone photos are upright.
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // Older browsers: fall back to an <img> element.
    const url = URL.createObjectURL(file)
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      return img
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY))
}

/** Draws the image at most maxWidth wide. Safari cannot encode WebP, so it falls back to JPEG. */
async function resize(source: ImageBitmap | HTMLImageElement, maxWidth: number) {
  const width = Math.min(maxWidth, source.width)
  const height = Math.round((source.height * width) / source.width)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot process images.')
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, width, height)

  let blob = await canvasToBlob(canvas, 'image/webp')
  if (!blob || blob.type !== 'image/webp') blob = await canvasToBlob(canvas, 'image/jpeg')
  if (!blob) throw new Error('This browser could not convert the image.')
  return { blob, width, height }
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Please choose an image file.'
  if (file.type === 'image/svg+xml') return "SVG images aren't allowed. Please use a JPEG, PNG or WebP image."
  if (file.size > MAX_SOURCE_BYTES) return 'That image is larger than 50 MB. Please choose a smaller one.'
  return null
}

export async function uploadImage(file: File, folder = 'uploads'): Promise<UploadedImage> {
  if (!supabase) throw new Error('The site is not connected to its database.')
  const problem = validateImageFile(file)
  if (problem) throw new Error(problem)

  const source = await decode(file)
  const full = await resize(source, FULL_WIDTH)
  const thumb = await resize(source, THUMB_WIDTH)
  if ('close' in source) source.close()

  const extension = full.blob.type === 'image/webp' ? 'webp' : 'jpg'
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const path = `${folder}/${now.getFullYear()}/${month}/${crypto.randomUUID()}.${extension}`
  const options = { contentType: full.blob.type, cacheControl: '31536000', upsert: false }

  const storage = supabase.storage.from('media')
  const fullResult = await storage.upload(path, full.blob, options)
  if (fullResult.error) throw fullResult.error

  const thumbResult = await storage.upload(thumbPath(path), thumb.blob, { ...options, contentType: thumb.blob.type })
  if (thumbResult.error) {
    // Do not leave a full image without its thumbnail.
    await storage.remove([path])
    throw thumbResult.error
  }

  return { path, width: full.width, height: full.height }
}
