import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';

import pkg from './package.json';

const DEPLOY_ENV = process.env.DEPLOY_ENV;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'engine',
          dest: ''
        }
      ]
    })
  ],
  base: DEPLOY_ENV === 'githubpages' ? '/yisim' : '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
