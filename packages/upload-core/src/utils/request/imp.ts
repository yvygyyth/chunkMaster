import type { UnifiedRequestor } from '@net-vert/core'

interface UnifiedConfig {
    url: string
    baseURL?: string
    headers?: Record<string, any>
    data?: any
    timeout?: number
    onUploadProgress?: (progressEvent: ProgressEvent) => void
    signal?: AbortSignal
}

function uploadFile(uploadFileObj: UnifiedConfig): Promise<{ status: number; data: any }> {
    return new Promise((resolve, reject) => {
        // 处理完整请求路径
        const fullURL = new URL(
            uploadFileObj.url || '',
            uploadFileObj.baseURL || window.location.origin
        )

        const xhr = new XMLHttpRequest()

        // 初始化请求
        xhr.open('POST', fullURL.toString())

        // 设置请求头
        if (uploadFileObj.headers) {
            Object.entries(uploadFileObj.headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value)
            })
        }

        // 设置超时
        if (uploadFileObj.timeout) {
            xhr.timeout = uploadFileObj.timeout
            xhr.ontimeout = () => {
                reject(new Error(`Request timed out after ${uploadFileObj.timeout}ms`))
            }
        }

        // 上传进度处理
        if (uploadFileObj.onUploadProgress) {
            xhr.upload.addEventListener('progress', uploadFileObj.onUploadProgress)
        }

        // 请求完成处理
        xhr.onload = () => {
            const response = {
                status: xhr.status,
                data: xhr.response
            }
            xhr.status >= 200 && xhr.status < 300
                ? resolve(response)
                : reject(response)
        }

        // 错误处理
        xhr.onerror = () => reject(new Error('Network Error'))
        xhr.onabort = () => reject(new Error('Request aborted'))

        // 取消请求处理
        if (uploadFileObj.signal) {
            uploadFileObj.signal.addEventListener('abort', () => {
                xhr.abort()
            })
        }

        // 发送请求体
        xhr.send(uploadFileObj.data)
    })
}


export const request: UnifiedRequestor = (config) =>{
    return uploadFile(config).then(res=>res.data)
}