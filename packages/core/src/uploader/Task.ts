import { TASK_STATUS } from '@/types/http'
import type { UploadTask, UploadChunk, Uploader } from '@/types/upload'
import { progressDefault } from '@/types/http'
import { UPLOAD_CONFIG } from '@/config'
import throttle from 'lodash.throttle'
import { createFormData } from '@/utils'
export default class Task implements UploadTask {
  // 实例属性
  id: string
  controller: AbortController = new AbortController()
  private responseInterval: number = 1000
  // 内部进度数据与代理，更新时自动调用防抖回调
  // private _progressInfo: Ref<ProgressInfo> = ref({ ...progressDefault })
  // progressInfo: Readonly<Ref<ProgressInfo>> = refDebounced(this._progressInfo, 100)
  progressInfo
  status = TASK_STATUS.PENDING
  promise = new Promise(() => {})
  // 构造函数
  constructor(
    public metadata: UploadChunk,
    public uploader: Uploader
  ) {
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
  private async request() {
    const data = UPLOAD_CONFIG.beforeUpload
    ? await UPLOAD_CONFIG.beforeUpload(this.metadata, this.uploader)
    : createFormData(this.metadata)
    
    return UPLOAD_CONFIG.requestor.post(
      UPLOAD_CONFIG.uploadUrl,
      data,
      {
        signal: this.controller.signal,
        onUploadProgress: this.updateProgressThrottle.bind(this)
      }
    )
  }

  // 执行任务，添加到并发控制池中
  execute() {
    this.promise = this.request.call(this)
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
    UPLOAD_CONFIG.pool.remove(this.id)
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
    const { loaded, total } = progressEvent
    this.progressInfo = {
      loaded,
      total,
      progress: loaded / total
    }
  }
}
