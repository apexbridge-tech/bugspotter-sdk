import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/browser.spec.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    server: {
      deps: {
        inline: ['rrweb', 'rrweb-snapshot', '@rrweb/types'],
      },
    },
  },
});
