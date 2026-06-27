import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ⚠️ ATTENTION : Si ton repo GitHub s'appelle autrement, modifie cette ligne !
  base: '/le-thermometre/', 
})
