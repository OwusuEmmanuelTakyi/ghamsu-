// Uploads two copies of an image to the public media bucket:
//   <path>          full image, at most 2000 px wide
//   thumbs/<path>   thumbnail, at most 800 px wide
import { supabase } from '../../../lib/supabase'
import { thumbPath } from '../../../lib/media'
import { checkImageFile, makeImageCopies } from '../../../lib/imageResize'

const MAX_SOURCE_BYTES = 50 * 1024 * 1024

export interface UploadedImage {
  path: string
  width: number
  height: number
}

export function validateImageFile(file: File): string | null {
  return checkImageFile(file, MAX_SOURCE_BYTES)
}

/** Uploads already-resized copies (also used when approving a submission). */
export async function uploadCopies(full: Blob, thumb: Blob, contentType: string, path: string) {
  if (!supabase) throw new Error('The site is not connected to its database.')
  const options = { contentType, cacheControl: '31536000', upsert: false }
  const storage = supabase.storage.from('media')
  const fullResult = await storage.upload(path, full, options)
  if (fullResult.error) throw fullResult.error
  const thumbResult = await storage.upload(thumbPath(path), thumb, options)
  if (thumbResult.error) {
    // Do not leave a full image without its thumbnail.
    await storage.remove([path])
    throw thumbResult.error
  }
}

export function newImagePath(folder: string, extension: string) {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${folder}/${now.getFullYear()}/${month}/${crypto.randomUUID()}.${extension}`
}

export async function uploadImage(file: File, folder = 'uploads'): Promise<UploadedImage> {
  const problem = validateImageFile(file)
  if (problem) throw new Error(problem)
  const copies = await makeImageCopies(file)
  const path = newImagePath(folder, copies.extension)
  await uploadCopies(copies.full.blob, copies.thumb.blob, copies.contentType, path)
  return { path, width: copies.full.width, height: copies.full.height }
}
