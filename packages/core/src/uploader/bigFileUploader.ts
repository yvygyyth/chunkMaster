import Task from './Task'
import type { Uploader, UploadTask, UploadChunk } from '@/types/upload'
import { TASK_STATUS, STATUS } from '@/types/http'
import { UPLOAD_CONFIG } from '@/config'
import { sliceFile } from './sliceFile'
import { createChunk } from '@/utils/tool'
import { reactive } from 'vue'
export default class BigFileUploader implements Uploader {
  private _status = STATUS.PREPARING
  public tasks: UploadTask[] = []
  public totalChunks: number
  public fileInfo: any | null = null
  constructor(public file: File) {
    this.totalChunks = Math.ceil(this.file.size / UPLOAD_CONFIG.chunkSize)
    if(UPLOAD_CONFIG.prepareFileInfo){
      UPLOAD_CONFIG.prepareFileInfo(this.file).then(res=>{
        this.fileInfo = res
        this._status = STATUS.PENDING
      }).catch(err=>{
        this._status = STATUS.PREPARE_FAILED
        throw err
      })
    }else{
      this._status = STATUS.PENDING
    }
  }
  // 这里可以实现大文件的分片上传逻辑
  async start() {
    try {
      this._status = STATUS.UPLOADING
      const result = await this.uploadFile()
      this.mergeChunks(result)

      this._status = STATUS.SUCCESS
    } catch (e: any) {
      if(this._status = STATUS.PAUSE){
        return e
      }else{
        throw e
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

    const taskPromises = this.tasks.map((task) => {
      return task.promise
    })

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
    const task = reactive(new Task(chunk, this))
    this.tasks[index] = task
    if (this.status === STATUS.UPLOADING) {
      task.execute()
    }
  }

  private mergeChunks(result: any[]) {
    const mergeApi = UPLOAD_CONFIG.mergeApi as Function
    return mergeApi(
      result,
      this
    )
  }

  pause() {
    this._status = STATUS.PAUSE
    this.tasks.forEach((task) => {
      if (task.status !== TASK_STATUS.SUCCESS) {
        task.pause()
      }
    })
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

    const accumulatedLoaded = this.tasks.reduce((acc, cur: UploadTask) => {
      const progress = cur.progressInfo
      return acc + progress.loaded
    }, 0)

    // 计算全局进度（考虑总分片数）
    const globalProgress = Math.min(accumulatedLoaded, this.file.size) / this.file.size || 0

    return {
      total: this.file.size,
      loaded: accumulatedLoaded,
      progress: globalProgress
    }
  }

  get status() {
    return this._status
  }
}
