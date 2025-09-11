import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react()]
  /*server: {
    host: true, 
    allowedHosts: [
      'fmco9c-ip-181-165-14-167.tunnelmole.net' 
      // El host para correrlo con Tunnelmole
      // Tener en cuenta que varia cada vez que se inicia el túnel.

    ]
  } 
  */
})