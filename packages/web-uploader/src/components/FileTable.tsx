import { defineComponent, computed, type PropType } from 'vue'
import { extname, fileSize } from './utils/file'
import type { Uploader, FileExt } from './utils/uploader/types'
import { uploadStatus } from './utils/uploader/types/http'
import { Table, Tag, Progress, Button, Space } from '@arco-design/web-vue'
import type { TableColumnData, TableData } from '@arco-design/web-vue'
import { STATUS } from './utils/uploader/types/http'
import styles from './style.module.scss'

export default defineComponent({
  name: 'FileTable',
  props: {
    files: {
      type: Array as PropType<Uploader[]>,
      default: () => []
    }
  },
  emits: ['start', 'pause', 'delete'],
  setup(props, { emit }) {
    const columns = [
      {
        title: '名字',
        render: ({ record }: { record: Uploader }) => {
          return record.file.name
        }
      },
      {
        title: '类型',
        render: ({ record }: { record: Uploader }) => {
          return extname(record.file.name)
        }
      },
      {
        title: '大小',
        render: ({ record }: { record: Uploader }) => {
          return fileSize(record.file.size)
        }
      },
      {
        title: '状态',
        render: ({ record }: { record: Uploader }) => {
          if (record.status === STATUS.UPLOADING || record.status === STATUS.SUCCESS) {
            return <Progress percent={truncateToTwoDecimal(record.progressInfo.progress)} />
          }
          return (
            <Tag color={uploadStatus[record.status].color}>{uploadStatus[record.status].text}</Tag>
          )
        }
      },
      {
        title: '操作',
        render: ({ record }: { record: TableData }) => {
          return (
            <Space>
              <Button
                type="primary"
                onClick={() => emit('start', record)}
                disabled={record.status === STATUS.UPLOADING}
              >
                开始
              </Button>
              <Button
                type="primary"
                onClick={() => emit('pause', record)}
                disabled={record.status !== STATUS.UPLOADING}
              >
                暂停
              </Button>
              <Button type="primary" onClick={() => emit('delete', record)}>
                删除
              </Button>
            </Space>
          )
        }
      }
    ]
    const totalSize = computed(() =>
      fileSize(props.files.reduce((s, it) => (s += it.file.size), 0))
    )
    const uploadedNumber = computed(
      () => props.files.filter((f) => f.status === STATUS.SUCCESS).length
    )
    return () => <Table columns={columns as TableColumnData[]} data={props.files}></Table>
  }
})

function truncateToTwoDecimal(num: number): number {
  return parseFloat(num.toFixed(4))
}
