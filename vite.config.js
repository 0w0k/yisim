import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import pkg from './package.json';

const DEPLOY_ENV = process.env.DEPLOY_ENV;

export default defineConfig({
  plugins: [
    react(),
  ],
  base: DEPLOY_ENV === 'githubpages' ? '/yisim' : '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  worker: {
    format: 'esm'
  }
})
