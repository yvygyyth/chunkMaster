import { UPLOAD_CONFIG } from '@/config'
import type { ChunkParams, SetTask, SliceFile, UploadChunk } from '@/types/upload'
export const createChunk = async (
    file: File,
    index: number,
    chunkSize: number
): Promise<UploadChunk> => {
    const start = index * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const blob = file.slice(start, end)

    const hash = UPLOAD_CONFIG.hashUrl && UPLOAD_CONFIG.hashcalculation
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

export const cutFile: SliceFile = async (
    chunkParams: ChunkParams,
    setTask: SetTask
) => {
    const { file, start, end, chunkSize } = chunkParams
    const chunks: UploadChunk[] = []

    try {
        for (let i = start; i < end; i++) {
            const chunk = await createChunk(file, i, chunkSize)
            chunks.push(chunk)
            setTask(chunk, i)
        }

        return chunks
    } catch (error) {
        console.error('Error creating chunks:', error)
        throw error
    }
}