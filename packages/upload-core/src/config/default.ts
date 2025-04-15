
export const fileUploadConfig = {
    exts: ['.jpg', '.png', '.pdf'],
    maxSize: 5 * 1024 * 1024,
    chunkSize: 5 * 1024 * 1024,
    multiThread: true
}

export const poolConfig = {
    parallelCount: 3,
    retries:0
}