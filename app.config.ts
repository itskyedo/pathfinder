import { defineConfig } from '@solidjs/start/config';

export default defineConfig({
  vite: {
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
});
