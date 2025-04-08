<template>
  <div
    class="drag-area"
    :class="{
      draging: isDraging,
    }"
    @dragenter="dragInHandler"
    @dragover="dragInHandler"
    @drop="dropHandler"
    @dragleave="dragLeaveHandler"
  >
    <slot>
      <p class="section">
        <i class="iconfont i-shangchuan"></i>
        <span>将目录或多个文件拖拽到此进行扫描</span>
      </p>
      <p class="section">支持的文件类型：{{ supports }}</p>
      <p>每个文件允许的最大尺寸：{{ maxSize }}</p>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { fileSize, extname } from './utils/file';

// 定义 props 的类型
interface Props {
  exts?: string[]; // 支持的文件扩展名
  fileSize?: number; // 文件大小限制（单位：字节）
}

const props = withDefaults(defineProps<Props>(), {
  exts: () => ['.jpg', '.jpeg', '.png', '.ppt', '.pdf', '.docx', '.doc', '.xls', '.xlsx'],
  fileSize: 1024 * 1024, // 默认 1MB
});

// 定义 emit 的类型
interface Emit {
  (event: 'drop', files: File[]): void; // drop 事件，传递文件列表
}

const emit = defineEmits<Emit>();

// 计算属性：支持的文件类型
const supports = computed(() => props.exts.join('、'));

// 计算属性：文件大小限制（格式化显示）
const maxSize = computed(() => fileSize(props.fileSize));

// 拖拽状态
const isDraging = ref(false);

// 拖拽进入事件处理函数
const dragInHandler = (e: DragEvent) => {
  if (!e.dataTransfer?.types.includes('Files')) {
    return;
  }
  e.preventDefault();
  isDraging.value = true;
};

// 拖拽离开事件处理函数
const dragLeaveHandler = (e: DragEvent) => {
  e.preventDefault();
  isDraging.value = false;
};

// 拖拽放下事件处理函数
const dropHandler = async (e: DragEvent) => {
  e.preventDefault();
  isDraging.value = false;

  if (!e.dataTransfer?.items) {
    return;
  }

  // 处理拖拽的文件或目录
  const results = await Promise.all(
    [...e.dataTransfer.items].map((item) => handleEntry(item.webkitGetAsEntry()))
  );

  // 扁平化结果并过滤有效文件
  const validFiles = results
    .flat(Infinity)
    .filter((f): f is File => f instanceof File && validExt(f.name) && validSize(f.size));
  console.log('validFiles',validFiles)
  // 触发 drop 事件
  emit('drop', validFiles);
};

// 校验文件扩展名
const validExt = (name: string) => props.exts.includes(extname(name));

// 校验文件大小
const validSize = (size: number) => size <= props.fileSize;

// 处理文件或目录
const handleEntry = (entry: FileSystemEntry | null): Promise<File | File[]> => {
  return new Promise((resolve) => {
    if (!entry) {
      resolve([]);
      return;
    }

    if (entry.isFile) {
      (entry as FileSystemFileEntry).file(resolve);
      return;
    }

    const dirReader = (entry as FileSystemDirectoryEntry).createReader();
    dirReader.readEntries(async (entries) => {
      const files = await Promise.all(entries.map(handleEntry));
      resolve(files.flat());
    });
  });
};
</script>

<style scoped>
.drag-area {
  width: 100%;
  line-height: 30px;
  color: #888;
  border: 1px dashed #dedede;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1em 0;
}
.draging {
  border-color: #2565c1;
  background: #eee;
}
.section {
  display: flex;
  justify-content: center;
  column-gap: 1em;
  align-items: center;
}
.i-shangchuan {
  font-size: 3em;
}
</style>
