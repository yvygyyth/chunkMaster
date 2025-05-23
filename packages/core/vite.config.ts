import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import dts from 'vite-plugin-dts'
import vue from '@vitejs/plugin-vue'

// 获取所有外部依赖
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const externalDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
]

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    lib: {
      entry: {
        'index': path.resolve(__dirname, 'src/index.ts'),
        // 'types': path.resolve(__dirname, 'src/types/index.ts')
      },
      fileName: (format, entryName) => `${entryName}.js`,
      formats: ['es']
    },
    rollupOptions: {
      external: (id) => {
        // 排除所有依赖和 Node 内置模块
        return externalDeps.some(pkg => 
          id === pkg || 
          id.startsWith(`${pkg}/`) || 
          id.startsWith('node:')
        )
      },
      output: {
        globals: Object.fromEntries(
          externalDeps.map(pkg => [pkg, pkg])
        )
      }
    }
  },
  plugins: [
    vue(),
    dts({ 
      tsconfigPath: './tsconfig.json',
      exclude: ['**/node_modules'],
      copyDtsFiles: true,
      rollupTypes: true
    })
  ],
})