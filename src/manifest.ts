import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'
import { isDev, port, r } from '../scripts/utils'

export async function getManifest() {
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType


  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    action: {
      default_icon: './assets/logo.png',
    },
    background: {
      service_worker: './dist/background/index.mjs',
    },
    icons: {
      16: './assets/logo.png',
      48: './assets/logo.png',
      128: './assets/logo.png',
    },
    permissions: [
      'tabs',
      'storage',
      'activeTab',
    ],
    host_permissions: ['<all_urls>'],
    content_scripts: [
      {
        "matches": ["*://twitter.com/*", "*://test1.step1matrix.io/*"],
        js: ['./dist/contentScripts/index.global.js'],
        css: ['./dist/contentScripts/style.css'],
        run_at: 'document_end',
        all_frames: true,
      },
    ],
    content_security_policy: {
      extension_pages: isDev
        ? `script-src 'self' http://localhost:${port}; object-src 'self' http://localhost:${port}`
        : 'script-src \'self\'; object-src \'self\'',
    },
    web_accessible_resources: [
      {
        resources: ['dist/contentScripts/style.css', 'dist/app/index.html', 'dist/airdrop/index.html', 'dist/connectwallet/index.html','dist/activity/index.html'],
        matches: ['<all_urls>'],
      },
    ],

  }

  if (isDev)
    manifest.permissions?.push('webNavigation')

  return manifest
}
