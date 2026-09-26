/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base lets one build run from a domain root or a sub-path (GitHub Pages).
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
