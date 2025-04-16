import { defineComponent } from 'vue'
import DragArea from './DragArea.vue'
import FileTable from './FileTable'
import './style.scss'
import { Button } from '@arco-design/web-vue'
import { useUpload } from '@/utils/useUpload'
import { extname } from '@/utils/file'
import { config } from '@chunk-master/core'

import { props } from './props'
import { xhrRequestor } from '@/utils/request'
// 扩展 InputHTMLAttributes 类型

export default defineComponent({
  name: 'UploadComponent',
  components: {
    DragArea,
    FileTable
  },
  props,
  setup(props) {
    config({
      request: xhrRequestor,
      uploadUrl:'/loc/upload',
      maxSize: props.maxSize,
      chunkSize: props.maxSize,
      mergeUrl: '/loc/data',
      parallelCount:2,
      beforeMerge(results) {
        return results.map((r) => r.data)
      },
    })

    const { uploaders, addFiles, deleteFiles, startUpload, pauseUpload, pendingFiles, upload } =
      useUpload([])

    const filterFiles = (files: File[]) => {
      const isValidExt = (ext: string): ext is `.${string}` => ext.startsWith('.')
      const usableFiles = files.filter((f: File) => {
        const ext = extname(f.name)
        return isValidExt(ext) && props.exts.includes(ext)
      })

      return usableFiles
    }

    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.files) {
        addFiles(...filterFiles(Array.from(target.files)))
      }
    }

    return () => (
      <div class='container'>
        <DragArea
          exts={props.exts}
          fileSize={props.maxSize}
          onDrop={(event: any) => addFiles(...event)}
        ></DragArea>
        <div class='operation'>
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
