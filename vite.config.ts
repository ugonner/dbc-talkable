/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import * as fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  server: {
    https: {
      key: fs.readFileSync('./openssl/key.pem'),
      cert: fs.readFileSync('./openssl/cert.pem'),
    },
    host: true, // Allows access from other devices on the network
    port: 8100, // Default port or change as needed
  },
})
