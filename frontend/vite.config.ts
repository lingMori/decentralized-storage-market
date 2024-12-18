// import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import IconResolver from 'unplugin-icons/resolver'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/group-storage',
  plugins: [
    vue(),
    Icons(),
    Components({
      resolvers: [
        IconResolver({
          enabledCollections: ['mdi', 'ri']
        })
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  // build:{
  //   rollupOptions:{
  //     output: {
  //       manualChunks(id) {
  //         if (id.includes('node_modules')) {
  //           return id
  //             .toString()
  //             .split('node_modules/')[1]
  //             .split('/')[0]
  //             .toString()
  //         }
  //       }
  //     }
  //   }
  // }
})
