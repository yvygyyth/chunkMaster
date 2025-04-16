export enum STATUS {
  PREPARING = 'preparing', //准备中,可能有增强文件信息需要异步获取
  PREPARE_FAILED = 'prepare_failed', // 准备失败状态
  PENDING = 'pending', //上传前，没点击开始上传
  PAUSE = 'pause', //上传暂停
  UPLOADING = 'uploading', //上传中
  SUCCESS = 'success', //上传成功
  FAIL = 'fail' //上传失败
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
