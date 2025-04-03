export enum STATUS {
  PENDING = 'pending', //上传前，没点击开始上传
  PAUSE = 'pause', //上传暂停
  UPLOADING = 'uploading', //上传中
  SUCCESS = 'success', //上传成功
  FAIL = 'fail' //上传失败
}

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

export enum TASK_STATUS {
  PENDING = 'pending', //等待中
  SUCCESS = 'success',
  FAIL = 'fail' //失败
}

export const progressDefault = {
  total: 0,
  loaded: 0,
  progress: 0
}
