import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// REMPLACE 'nom-de-ton-repo' par le nom exact de ton dépôt GitHub
// Ex: si ton repo s'appelle 'le-thermometre', mets '/le-thermometre/'
export default defineConfig({
  plugins: [react()],
  base: '/nom-de-ton-repo/', 
})
