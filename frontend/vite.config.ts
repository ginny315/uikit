import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // 显式列入所有 Mantine 包，保证 dev 预打包一次完成。
    // 否则首次 import 新的 @mantine/* 子包会触发 mid-session 增量优化，
    // 把 @mantine/core 劈成两份 chunk（两个实例），Popover 等 context 组件会静默失效。
    include: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/form',
      '@mantine/dates',
      '@mantine/notifications',
      '@mantine/charts',
      '@mantine/spotlight',
    ],
  },
})
