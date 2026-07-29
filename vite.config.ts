import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      // The HMR socket needs its own port. Override it via HMR_PORT when another
      // Vite project already holds the default (24678) — otherwise hot reload
      // fails silently and edits stop appearing in the browser.
      hmr:
        process.env.DISABLE_HMR === 'true'
          ? false
          : process.env.HMR_PORT
            ? { port: Number(process.env.HMR_PORT) }
            : true,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
