import type { FileUploadConfig } from '@/types/libConfig'

export const fileUploadConfig:FileUploadConfig = {
    exts: ['.jpg', '.png', '.pdf'],
    maxSize: 5 * 1024 * 1024,
    chunkSize: 5 * 1024 * 1024
}

export const poolConfig = {
    parallelCount: 3,
    retries:0
}