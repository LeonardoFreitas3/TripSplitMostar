import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' gera caminhos relativos, por isso funciona em
// https://utilizador.github.io/nome-do-repo/ sem configurar nada.
export default defineConfig({
  plugins: [react()],
  base: './',
})
