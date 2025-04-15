import type { UploadConfig, Pool } from './libConfig'
import type { UnifiedRequestor } from '@net-vert/core'
export interface PoolConfig {
  /** 并发上传的切片数量 */
  parallelCount?: number

  /** 每个分片上传失败后的最大重试次数 */
  retries?: number

  /** 自定义并发池 */
  pool?: Pool
}

// 2. 请求相关配置
export type UserRequestConfig = {
  /** 接口 请求体 */
  request:UnifiedRequestor

  /** 自定义文件切片 */
  sliceFile?:(
    e:{file:File, start:number, end:number, chunkSize:number}, 
    callBack:(blob:Blob)=>void
  ) => Promise<void>
}

export type UserConfig<R extends any = any> = UploadConfig<number, R> & UserRequestConfig & PoolConfig