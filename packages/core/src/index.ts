import { UPLOAD_CONFIG, config } from '@/config'
import SimpleFileUploader from './uploader/simpleFileUploader'
import BigFileUploader from './uploader/bigFileUploader'
import { STATUS } from '@/types/http'
import type { Uploader } from '@/types'


function createFileUploader(file: File) {
  if (file.size > UPLOAD_CONFIG.maxSize) {
    return new BigFileUploader(file)
  } else {
    return new SimpleFileUploader(file)
  }
}

export {
  config,
  createFileUploader,
  STATUS
}

export {
  Uploader
}