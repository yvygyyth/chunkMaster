import type { UploadChunk } from '@/types/index'
import { UPLOAD_CONFIG } from '@/config'

export const createChunk = async (
  file: File,
  index: number,
  chunkSize: number
): Promise<UploadChunk> => {
  const start = index * chunkSize
  const end = Math.min(start + chunkSize, file.size)
  const blob = file.slice(start, end)

  const hash = UPLOAD_CONFIG.hashApi && UPLOAD_CONFIG.hashcalculation 
    ? await UPLOAD_CONFIG.hashcalculation(blob)
    : undefined

  return {
    start,
    end,
    index,
    chunk: blob,
    size: end - start,
    hash
  }
}