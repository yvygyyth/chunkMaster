import { UPLOAD_CONFIG } from '@/config'
import { createChunksWithWorkers } from '../utils/worker'
import type { SetTask } from '@/types/index'

export const sliceFile = async (
    file: File,
    start: number,
    end: number,
    setTask: SetTask
) => {
    const chunkParams = {
        file,
        start,
        end,
        chunkSize: UPLOAD_CONFIG.chunkSize
    }

    if (UPLOAD_CONFIG.hashApi && UPLOAD_CONFIG.multiThread) {
        return createChunksWithWorkers(chunkParams, setTask)
    } else {
        return UPLOAD_CONFIG.sliceFile(chunkParams, setTask)
    }
}