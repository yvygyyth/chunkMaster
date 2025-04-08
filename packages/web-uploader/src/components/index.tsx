import { defineComponent, ref, type PropType } from 'vue'
import DragArea from './DragArea.vue'
import FileTable from './FileTable'
import styles from './style.module.scss'
import { Button } from '@arco-design/web-vue'
import { useUpload } from './utils/useUpload'
import { extname, fileSize } from './utils/file.js'
import { inject } from './utils/uploader/index'
import { props } from './props'
// 扩展 InputHTMLAttributes 类型
declare module 'vue' {
  interface HTMLAttributes {
    webkitdirectory?: boolean
  }
}

export default defineComponent({
  name: 'UploadComponent',
  components: {
    DragArea,
    FileTable
  },
  props,
  setup(props) {
    inject(props)

    const { uploaders, addFiles, deleteFiles, startUpload, pauseUpload, pendingFiles, upload } =
      useUpload([], props.exts)

    const filterFiles = (files: File[]) => {
      const isValidExt = (ext: string): ext is `.${string}` => ext.startsWith('.')
      const usableFiles = files.filter((f: File) => {
        const ext = extname(f.name)
        return isValidExt(ext) && props.exts.includes(ext)
      })
      if (props.mergeApi) {
        return usableFiles
      } else {
        return usableFiles.filter((f: File) => f.size <= props.maxSize)
      }
    }

    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.files) {
        addFiles(...filterFiles(Array.from(target.files)))
      }
    }

    return () => (
      <div class={[styles['container']]}>
        <DragArea
          exts={props.exts}
          fileSize={props.maxSize}
          onDrop={(event: any) => addFiles(...event)}
        ></DragArea>
        <div class={[styles['operation']]}>
          <Button type="primary">
            选择文件
            <input type="file" multiple onChange={handleFileChange} />
          </Button>
          <Button type="primary">
            选择文件夹
            <input type="file" webkitdirectory onChange={handleFileChange} />
          </Button>
        </div>
        <FileTable
          files={uploaders.value}
          onDelete={deleteFiles}
          onPause={pauseUpload}
          onStart={startUpload}
        ></FileTable>
        <div class="operation">
          <Button disabled={pendingFiles.value.length === 0} type="primary" onClick={upload}>
            开始上传
          </Button>
        </div>
      </div>
    )
  }
})
