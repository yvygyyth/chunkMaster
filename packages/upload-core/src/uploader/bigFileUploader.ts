import Task from './Task'
import type { FileUploader, UploadTask, UploadChunk } from '../types/index'
import { TASK_STATUS, STATUS } from '../types/http'
import { UPLOAD_CONFIG } from '@/config'
import { sliceFile } from './worker'
import { createChunk } from './createChunk'
import { reactive } from 'vue'
export default class BigFileUploader implements FileUploader {
  private _status = STATUS.PENDING
  public tasks: UploadTask[] = []
  public totalChunks: number
  constructor(public file: File) {
    this.totalChunks = Math.ceil(this.file.size / UPLOAD_CONFIG.chunkSize)
  }
  // 这里可以实现大文件的分片上传逻辑
  async start() {
    try {
      this._status = STATUS.UPLOADING
      const result = await this.uploadFile()
      this.mergeChunks(result)

      this._status = STATUS.SUCCESS
    } catch (e: any) {
      if (e.code !== 'ERR_CANCELED') {
        this._status = STATUS.FAIL
        console.error(e)
      }
    }
  }
  private async preupload() {
    const chunk = await createChunk(this.file, 0, UPLOAD_CONFIG.chunkSize)
    this.setTask(chunk, 0)
  }
  private async uploadFile() {
    let start = this.tasks.length
    if (this.tasks.length === 0) {
      this.preupload()
      start++
    } else {
      this.uploadChunks()
    }
    await sliceFile(this.file, start, this.totalChunks, this.setTask.bind(this))
    console.log('切片完成', this.tasks)
    const taskPromises = this.tasks.map((task) => {
      return task.promise
    })
    console.log('获取全部promise', taskPromises)
    return Promise.all(taskPromises)
  }

  private uploadChunks() {
    for (const task of this.tasks) {
      if (task.status !== TASK_STATUS.SUCCESS) {
        task.execute()
      }
    }
  }

  setTask(chunk: UploadChunk, index: number) {
    console.log('设置任务', chunk, index)
    console.log('任务环境', this)
    const task = reactive(new Task(chunk))
    this.tasks.push(task)
    if (this.status === STATUS.UPLOADING) {
      task.execute()
    }
  }

  private mergeChunks(result: any[]) {
    console.log('执行合并分片', result)
  }

  pause() {
    console.log('暂停大文件上传', this.tasks)
    this.tasks.forEach((task) => {
      if (task.status !== TASK_STATUS.SUCCESS && task.status !== TASK_STATUS.FAIL) {
        task.pause()
      }
    })
    this._status = STATUS.PAUSE
  }

  cancel() {
    this.tasks.forEach((task) => {
      if (task.status !== TASK_STATUS.SUCCESS) {
        task.cancel()
      }
    })
    this.tasks = []
  }

  get progressInfo() {
    const initial = {
      loaded: 0
    }

    const accumulated = this.tasks.reduce((acc, cur: UploadTask): typeof initial => {
      const progress = cur.progressInfo
      return {
        loaded: acc.loaded + progress.loaded
      }
    }, initial)

    // 计算全局进度（考虑总分片数）
    const globalProgress = Math.min(accumulated.loaded, this.file.size) / this.file.size || 0

    return {
      total: this.file.size,
      ...accumulated,
      progress: globalProgress
    }
  }

  get status() {
    return this._status
  }
}
