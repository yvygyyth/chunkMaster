import type { UploadChunk } from './upload'

export type FileExt = `.${string}`

type Task = () => Promise<any>

// 1. 文件相关配置
export interface FileUploadConfig<N extends Number = number> {
  /** 允许上传的扩展名，如 ['jpg', 'png', 'pdf'] */
  exts: FileExt[]

  /** 最大允许上传的文件大小（单位：字节）, 若开启 mergeApi, 超过会走大文件上传 */
  maxSize: N

  /** 切片大小（单位：字节），默认建议 1~10MB, 不填使用默认值同maxSize */
  chunkSize: N | number
}

// hash 配置
export interface HashConfig {
  /** hash 接口URL（可选） */
  hashApi: ({hash}:{hash:string})=>Promise<boolean>

  /** 自定义hash计算函数 */
  hashcalculation: (blob: Blob) => string | Promise<string>
}

type UnHashConfig = {
  hashApi?: never;
  hashcalculation?: never;
};

// 2. 请求相关配置
export type RequestConfig <R extends any> = {
    /** 上传接口 URL */
    uploadApi: ((file:UploadChunk) => Promise<R>)

    /** 合并切片接口 URL（可选） */
    mergeApi?: ((res:R[]) => Promise<R>)
} & (HashConfig | UnHashConfig);

export type Pool = {
  add: (id: string, task: Task) => Promise<any>
  remove: (id: string) => void
} & Record<string, any>

export interface PoolConfig {
  /** 自定义并发池 */
  pool: Pool
}

// 3. 其他辅助配置
export interface UploadAdvancedConfig{
  /** 上传进度回调（按切片调用） */
  onProgress?: (percent: number, file: File, chunkIndex?: number) => void

  /** 上传完成回调 */
  onSuccess?: (file: File, serverResponse: any) => void

  /** 上传失败回调 */
  onError?: (file: File, error: any) => void
}


export type UploadConfig<R extends any = any> = FileUploadConfig & RequestConfig<R> & UploadAdvancedConfig & PoolConfig