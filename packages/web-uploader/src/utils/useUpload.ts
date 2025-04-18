import { computed, ref } from 'vue'

import { STATUS, createFileUploader } from '@chunk-master/core'
import type { Uploader } from '@chunk-master/core'
export function useUpload(initFiles: File[] = []) {
  const uploaders = ref<Uploader[]>([...initFiles.map(createFileUploader)])

  const addFiles = (...args: File[]) => {
    uploaders.value.push(...args.map(createFileUploader))
    console.log(uploaders.value)
  }

  const startUpload = (uploader: Uploader) => {
    uploader.start.call(uploader)
  }

  const pauseUpload = (uploader: Uploader) => {
    uploader.pause()
  }

  const deleteFiles = (...args: Uploader[]) => {
    for (const uploader of args) {
      const i = uploaders.value.indexOf(uploader)
      uploaders.value.splice(i, 1)
      if (uploader.status === STATUS.UPLOADING) {
        uploader.cancel()
      }
    }
  }

  const pendingFiles = computed(() =>
    uploaders.value.filter((uploader) => uploader.status === STATUS.PENDING)
  )

  const upload = () => {
    pendingFiles.value.forEach((uploader) => {
      uploader.start()
    })
  }
  return {
    uploaders,
    addFiles,
    deleteFiles,
    startUpload,
    pauseUpload,
    pendingFiles,
    upload
  }
}
