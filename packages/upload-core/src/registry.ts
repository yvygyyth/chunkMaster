import type { UploadProps } from './types/index'

let uploadConfig: UploadProps
const config = (config: UploadProps) => {
  uploadConfig = config
}

function useConfig(): UploadProps {
  return uploadConfig
}

export { config, useConfig }