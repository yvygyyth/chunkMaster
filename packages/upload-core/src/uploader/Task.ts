import { TASK_STATUS } from '../types/http'
import { pool } from '../concurrentPool'
import type { UploadTask, UploadChunk } from '../types'
import { progressDefault } from '../types/http'
import { useConfig } from '@/registry'
import { requestExtender } from '@net-vert/core'
import { createFormData } from '@/utils'
import throttle from 'lodash.throttle'
export const useTaskConfig = () => {
  const globalConfig = useConfig()
  const taskConcurrency = new pool(globalConfig.concurrency)
  return {
    globalConfig,
    taskConcurrency
  }
}

export default class Task implements UploadTask {
  // 实例属性
  id: string
  controller: AbortController = new AbortController()
  private useTaskConfig = useTaskConfig()
  private responseInterval: number = 1000
  // 内部进度数据与代理，更新时自动调用防抖回调
  // private _progressInfo: Ref<ProgressInfo> = ref({ ...progressDefault })
  // progressInfo: Readonly<Ref<ProgressInfo>> = refDebounced(this._progressInfo, 100)
  progressInfo
  status = TASK_STATUS.PENDING
  promise = new Promise(() => {})
  // 构造函数
  constructor(public metadata: UploadChunk) {
    this.metadata = metadata
    if (this.metadata.hash) {
      this.id = this.metadata.hash
    } else {
      this.id = `${Date.now()}_${Math.random().toString().slice(2, 8)}_${this.metadata.index}`
    }
    this.progressInfo = {
      ...progressDefault,
      total: this.metadata.chunk.size
    }
  }

  // 发送请求的方法
  private request() {
    return request.post(
      this.useTaskConfig.globalConfig.uploadApi,
      createFormData({
        ...this.metadata,
        file: this.metadata.chunk,
        name: 'file',
        chunk: null
      }),
      {
        signal: this.controller.signal,
        onUploadProgress: this.updateProgressThrottle.bind(this),
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  // 执行任务，添加到并发控制池中
  execute() {
    this.promise = this.useTaskConfig.taskConcurrency.add(this.id, this.request.bind(this))
    return this.promise
      .then((res) => {
        // console.log('taskexecute文件上传成功', res)
        this.status = TASK_STATUS.SUCCESS
        return res
      })
      .catch((err) => {
        // console.log('taskexecute文件上传失败', err)
        this.status = TASK_STATUS.FAIL
        return err
      })
  }

  // 取消任务，根据不同状态进行相应处理
  cancel() {
    this.useTaskConfig.taskConcurrency.remove(this.id)
    this.controller.abort()
  }

  // 暂停任务：取消当前任务、重置状态和控制器
  pause() {
    this.cancel()
    this.controller = new AbortController()
    this.updateProgressThrottle.cancel()
    this.progressInfo = {
      ...progressDefault,
      total: this.metadata.chunk.size
    }
  }

  // 节流更新进度，防止过于频繁更新
  private updateProgressThrottle = throttle(this.updateProgress, this.responseInterval)
  private updateProgress(progressEvent: ProgressEvent) {
    this.progressInfo = {
      ...progressEvent,
      progress: progressEvent.loaded / progressEvent.total
    }
  }
}
