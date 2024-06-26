/// <reference types="vitest" />

import { dirname, relative } from 'path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import replace from '@rollup/plugin-replace'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { isDev, port, r } from './scripts/utils'
import { MV3Hmr } from './vite-mv3-hmr'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export const sharedConfig: UserConfig = {
  root: r('src'),
  resolve: {
    alias: {
      '~/': `${r('src')}/`,
    },
  },

  plugins: [
    Vue({
      template: { transformAssetUrls }
    }),
    nodePolyfills({
      protocolImports: true,
    }),
    AutoImport({
      imports: [
        'vue',
        {
          'webextension-polyfill': [
            ['*', 'browser'],
          ],
        }
      ],
      dts: r('src/auto-imports.d.ts'),
      resolvers: [ElementPlusResolver()]
    }),
    vuetify({ autoImport: true, styles: 'sass' }),

    Components({
      dirs: [r('src/components')],
      dts: r('src/components.d.ts'),
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          componentPrefix: '',
        }),
      ],
    }),
    Icons(),
    UnoCSS(),
    replace({
      '__DEV__': JSON.stringify(isDev),
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      '__VUE_OPTIONS_API__': JSON.stringify(true),
      '__VUE_PROD_DEVTOOLS__': JSON.stringify(false),
    }),

    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(/"\/assets\//g, `"${relative(dirname(path), '/assets')}/`)
      },
    },
  ],
  optimizeDeps: {
    include: [
      'vue',
      '@vueuse/core',
      'webextension-polyfill',
    ],
    exclude: [
      'vue-demi',
    ],
  },
}

export default defineConfig(({ command }) => ({
  ...sharedConfig,

  base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    port,
    hmr: {
      host: 'localhost',
    },
  },
  build: {
    outDir: r('extension/dist'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
    terserOptions: {
      mangle: false,
    },
    rollupOptions: {
      input: {
        options: r('src/options/index.html'),
        app: r('src/app/index.html'),
        airdrop: r('src/airdrop/index.html'),
        activity: r('src/activity/index.html'),
        connectwallet: r('src/connectwallet/index.html')

      },
    },
  },
  plugins: [
    ...sharedConfig.plugins!,

    MV3Hmr(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
}))
