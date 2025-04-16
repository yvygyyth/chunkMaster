import type { UploadChunk } from './upload'
import type { SliceFile } from '@/types/upload'
import type { Requestor } from '@net-vert/core'

type Task = () => Promise<any>

export type Pool = {
  add: (id: string, task: Task) => Promise<any>
  remove: (id: string) => void
} & Record<string, any>
export interface UploadConfig<
  N extends Number = number,
  R extends any = any
>{
  /** 最大允许上传的文件大小（单位：字节）, 若开启 mergeApi, 超过会走大文件上传 */
  maxSize: N

  /** 
   * 切片大小（单位：字节），默认建议 1~10MB
   * 注意: 当自定义 sliceFile 函数时，应当遵循此处设置的 chunkSize 值进行切片
   * 如果必须使用不同的切片大小，请确保上传逻辑能够正确处理
   */
  chunkSize: N | number

  /** hash 接口URL（可选） */
  hashUrl?: string

  /** 自定义hash计算函数 */
  hashcalculation?: (blob: Blob) => string | Promise<string>

  /** 多线程计算 */
  multiThread: boolean

  /** 请求者 */
  requestor:Requestor

  /** 
   * 上传接口地址
   */
  uploadUrl: string

  /** 
   * 上传前处理钩子
   * 用于处理上传数据，返回最终发送的数据
   * @param chunk 上传块信息
   * @returns 处理后的请求数据
   */
  beforeUpload?: (chunk: UploadChunk) => FormData | Record<string, any> | Promise<FormData | Record<string, any>>

  /** 
   * 合并切片接口地址（可选）
   */
  mergeUrl?: string
  
  /** 
   * 合并前处理钩子（可选）
   * 用于处理合并请求的数据
   * @param results 所有切片上传成功的结果数组
   * @returns 处理后的合并请求数据
   */
  beforeMerge?: (results: R[]) => any | Promise<any>

  /** 
   * 自定义文件切片
   * @param file 要切片的文件
   * @param chunkSize 配置中指定的切片大小，建议遵循此值
   * @param callback 每个切片的回调函数
   */
  sliceFile:SliceFile

  /** 自定义并发池 */
  pool: Pool
}