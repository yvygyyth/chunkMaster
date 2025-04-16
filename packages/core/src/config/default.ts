
export const fileUploadConfig = {
    maxSize: 5 * 1024 * 1024,
    chunkSize: 5 * 1024 * 1024,
    multiThread: true,
    uploadMethod:'post'
}

export const poolConfig = {
    parallelCount: 3,
    retries:0
}