import Task from './Task'
import type { Uploader, UploadTask } from '@/types/upload'
import { STATUS, progressDefault } from '@/types/http'
import { UPLOAD_CONFIG } from '@/config'
import { reactive } from 'vue'
export default class SimpleFileUploader implements Uploader {
  private _status = STATUS.PREPARING
  public tasks: UploadTask[] = []
  public fileInfo: any | null = null
  constructor(public file: File) {
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
  async start() {
    try {
      this._status = STATUS.UPLOADING
      if (this.tasks.length) {
        const [task] = this.tasks
        await task.execute()
      } else {
        await this.uploadFile()
      }
      this._status = STATUS.SUCCESS
    } catch (e: any) {
      if(this._status = STATUS.PAUSE){
        return e
      }else{
        throw e
      }
    }
  }

  private async uploadFile() {
    const task = reactive(
      new Task({
        index: 0,
        start: 0,
        end: this.file.size,
        size: this.file.size,
        chunk: this.file
      })
    )
    this.tasks.push(task)
    await task.execute()
  }
  pause() {
    const [task] = this.tasks
    this._status = STATUS.PAUSE
    task.pause()
  }

  cancel() {
    const [task] = this.tasks
    task.cancel()
    this.tasks = []
  }

  get progressInfo() {
    const [task] = this.tasks
    return task
      ? task.progressInfo
      : {
          ...progressDefault,
          total: this.file.size
        }
  }

  get status() {
    return this._status
  }
}
