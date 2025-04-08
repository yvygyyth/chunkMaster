import type { PropType } from 'vue'
import type { FileExt } from './utils/uploader/types/index'

export const props = {
  maxSize: { type: Number, default: 1024 * 512 * 1 },
  concurrency: { type: Number, default: 3 },
  exts: {
    type: Array as PropType<FileExt[]>,
    default: () => ['.jpg', '.jpeg', '.png', '.ppt', '.pdf', '.docx', '.doc', '.xls', '.xlsx']
  },
  uploadApi: { type: String, required: true },
  mergeApi: { type: String },
  hashApi: { type: String }
} as const
