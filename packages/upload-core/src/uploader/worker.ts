import { useConfig } from './index'
import { createChunkCommon, createChunkHash } from './createChunk'
import type { UploadChunk } from '../types/index'

type SetTask = (chunk: UploadChunk, index: number) => void
const THREAD_COUNT = navigator.hardwareConcurrency || 4

export const sliceFile = async (
  file: File,
  tasksCount: number,
  totalChunks: number,
  setTask: SetTask
) => {
  const config = useConfig()
  if (config.hashApi) {
    return createChunksWithWorkers(file, tasksCount, totalChunks, setTask)
  } else {
    return cutFile(file, tasksCount, totalChunks, setTask)
  }
}

export const createChunksWithWorkers = async (
  file: File,
  tasksCount: number,
  totalChunks: number,
  setTask: SetTask
) => {
  return new Promise((resolve, reject) => {
    // 每个线程分配的任务数量
    const threadChunkConut = Math.ceil((totalChunks - tasksCount) / THREAD_COUNT)
    if (threadChunkConut === 0) {
      resolve([])
    } else {
      const config = useConfig()
      const result: UploadChunk[] = []

      let finishCount = 0
      for (let i = 0; i < THREAD_COUNT; i++) {
        const start = tasksCount + i * threadChunkConut
        const end = Math.min(start + threadChunkConut, totalChunks)

        if (start >= end) break

        const worker = new Worker(new URL('./worker.ts', import.meta.url), {
          type: 'module'
        })

        worker.postMessage({
          file,
          start,
          end,
          chunk_size: config.maxSize
        })

        worker.onmessage = (event) => {
          const chunks = event.data
          chunks.forEach((chunk: UploadChunk) => {
            result[chunk.index] = chunk
            setTask(chunk, chunk.index)
          })
          worker.terminate()
          finishCount++
          if (finishCount === Math.min(THREAD_COUNT, totalChunks - tasksCount)) {
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

export const cutFile = async (
  file: File,
  start: number,
  end: number,
  setTask: SetTask,
  createChunk = createChunkCommon
): Promise<void> => {
  const config = useConfig()
  return new Promise(async (resolve, reject) => {
    for (let i = start; i < end; i++) {
      try {
        const chunk = await createChunk(file, i, config.maxSize)
        setTask(chunk, i)
      } catch (error) {
        console.error('Error creating chunk:', error)
        reject(error)
      }
    }
    resolve()
  })
}

onmessage = async (event) => {
  const { file, start, end, chunk_size } = event.data

  const prom = []
  for (let i = start; i < end; i++) {
    prom.push(createChunkHash(file, i, chunk_size))
  }
  const chunks = await Promise.all(prom)

  postMessage(chunks)
}
