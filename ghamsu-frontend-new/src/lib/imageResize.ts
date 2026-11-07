// Resizes images in the browser before upload. Shared by the admin and the
// public executive profile form.

const QUALITY = 0.8

export interface ResizedImage {
  blob: Blob
  width: number
  height: number
}

export interface ImageCopies {
  full: ResizedImage
  thumb: ResizedImage
  /** 'webp' normally; 'jpg' on browsers that cannot encode WebP (Safari). */
  extension: 'webp' | 'jpg'
  contentType: 'image/webp' | 'image/jpeg'
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    // Applies the camera's EXIF rotation, so phone photos are upright.
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
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

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY))
}

async function resize(source: ImageBitmap | HTMLImageElement, maxWidth: number, type: string): Promise<ResizedImage> {
  const width = Math.min(maxWidth, source.width)
  const height = Math.round((source.height * width) / source.width)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot process images.')
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, width, height)
  const blob = await toBlob(canvas, type)
  if (!blob) throw new Error('This browser could not convert the image.')
  return { blob, width, height }
}

/** A full copy (at most fullWidth) and a thumbnail (at most thumbWidth). */
export async function makeImageCopies(file: File, fullWidth = 2000, thumbWidth = 800): Promise<ImageCopies> {
  const source = await decode(file)
  try {
    let full = await resize(source, fullWidth, 'image/webp')
    let contentType: ImageCopies['contentType'] = 'image/webp'
    if (full.blob.type !== 'image/webp') {
      // Safari silently produces PNG when asked for WebP; use JPEG instead.
      full = await resize(source, fullWidth, 'image/jpeg')
      contentType = 'image/jpeg'
    }
    const thumb = await resize(source, thumbWidth, contentType)
    return { full, thumb, extension: contentType === 'image/webp' ? 'webp' : 'jpg', contentType }
  } finally {
    if ('close' in source) source.close()
  }
}

/** Checks the original file. maxBytes applies before resizing. */
export function checkImageFile(file: File, maxBytes: number): string | null {
  if (!file.type.startsWith('image/')) return 'Please choose an image file (JPEG, PNG or WebP).'
  if (file.type === 'image/svg+xml') return "SVG images aren't allowed. Please use a JPEG, PNG or WebP image."
  if (file.size > maxBytes) return `That image is larger than ${Math.round(maxBytes / 1048576)} MB. Please choose a smaller one.`
  return null
}
