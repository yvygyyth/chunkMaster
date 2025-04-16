import { STATUS } from '@chunk-master/core'

export const uploadStatus = {
    [STATUS.PENDING]: {
      text: '等待中',
      color: 'blue'
    },
    [STATUS.PAUSE]: {
      text: '已暂停',
      color: 'orange'
    },
    [STATUS.UPLOADING]: {
      text: '上传中',
      color: 'blue'
    },
    [STATUS.SUCCESS]: {
      text: '上传成功',
      color: 'green'
    },
    [STATUS.FAIL]: {
      text: '上传失败',
      color: 'red'
    }
}