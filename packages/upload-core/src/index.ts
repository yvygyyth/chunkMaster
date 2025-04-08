import { UPLOAD_CONFIG, config } from '@/config'
import SimpleFileUploader from './uploader/simpleFileUploader'
import BigFileUploader from './uploader/bigFileUploader'
function createFileUploader(file: File) {
  if (file.size > UPLOAD_CONFIG.maxSize) {
    return new BigFileUploader(file)
  } else {
    return new SimpleFileUploader(file)
  }
}

export {
  config,
  createFileUploader
}
