/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // necesario para simular el DOM en React
    globals: true, // permite usar expect(), describe(), etc. sin importar
    setupFiles: './src/setupTests.ts', // archivo de configuración global opcional
  },
})
