import type { FileUploadConfig, RequestConfig, Pool, UploadAdvancedConfig } from './libConfig'
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
export type UserRequestConfig <R extends any> = {
  /** 接口 请求体 */
  request:UnifiedRequestor
} & RequestConfig<R>

export type UserConfig<R extends any = any> = FileUploadConfig & UserRequestConfig<R> & UploadAdvancedConfig & PoolConfig