import type { UploadChunk, ChunkParams, SliceFile } from '@/types/index'

const THREAD_COUNT = navigator.hardwareConcurrency || 4

export const createChunksWithWorkers:SliceFile = async (
    chunkParams,
    setTask
) => {
    const { file, start, end, chunkSize } = chunkParams
    return new Promise((resolve, reject) => {
        // 每个线程分配的任务数量
        const threadChunkConut = Math.ceil((end - start) / THREAD_COUNT)
        if (threadChunkConut === 0) {
            resolve([])
        } else {
            const result: UploadChunk[] = []
            let finishCount = 0
            for (let i = 0; i < THREAD_COUNT; i++) {
                const curStart = start + i * threadChunkConut
                const curend = Math.min(curStart + threadChunkConut, end)

                if (curStart >= curend) break

                const worker = new Worker(new URL('./worker.ts', __dirname), {
                    type: 'module'
                })

                worker.postMessage({
                    file,
                    start:curStart,
                    end:curend,
                    chunkSize
                } as ChunkParams)

                worker.onmessage = (event) => {
                    const chunks = event.data
                    chunks.forEach((chunk: UploadChunk) => {
                        result[chunk.index] = chunk
                        setTask(chunk, chunk.index)
                    })
                    worker.terminate()
                    finishCount++
                    if (finishCount === Math.min(THREAD_COUNT, end - start)) {
                        resolve(result)
                    }
                }

                worker.onerror = (err) => {
                    worker.terminate()
                    reject(err)
                }
            }
        }
    })
}
