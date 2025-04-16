import type { PropType } from 'vue'

export const props = {
  maxSize: { type: Number, default: 1024 * 512 * 1 },
  exts: {
    type: Array as PropType<string[]>,
    default: () => ['.jpg', '.jpeg', '.png', '.ppt', '.pdf', '.docx', '.doc', '.xls', '.xlsx']
  },
  // uploadApi: { type: String, required: true },
  // mergeApi: { type: String },
  // hashApi: { type: String }
} as const
