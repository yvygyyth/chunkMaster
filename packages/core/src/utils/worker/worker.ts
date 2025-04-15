import type { ChunkParams } from '@/types/index'
import { UPLOAD_CONFIG } from '@/config'

/**
 * Web Worker 入口
 * 职责：仅负责接收消息、处理切片、返回结果
 */
onmessage = async (event) => {
    const data = event.data as ChunkParams
    try {
        const chunks = await UPLOAD_CONFIG.sliceFile(data, ()=>{})
        // 返回处理结果
        postMessage(chunks)
    } catch (error: any) {
        // 向主线程报告错误
        postMessage({ error: error.message })
    }
}