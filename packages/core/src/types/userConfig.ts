import type { UploadConfig } from './libConfig'
import type { UnifiedRequestor } from '@net-vert/core'

export interface PoolConfig {
  /** 并发上传的切片数量 */
  parallelCount?: number

  /** 每个分片上传失败后的最大重试次数 */
  retries?: number
}

// 2. 请求相关配置
export type UserRequestConfig = {
  /** 接口 请求体 */
  request:UnifiedRequestor

  uploadUrl: string
}

export type UserConfig<R extends any = any> = UserRequestConfig & PoolConfig & Partial<UploadConfig<number, R>>