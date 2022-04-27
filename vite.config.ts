import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import viteStylelint from '@amatlash/vite-plugin-stylelint';
import { resolve } from 'path';
import configureIdPlugin from './tools/vite-cid-plugin';
import project from './tools/project-info';

export default defineConfig({
  plugins: [eslintPlugin({ cache: false }), viteStylelint(), configureIdPlugin()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    'import.meta.env.APP_INFO': `'${JSON.stringify(project)}'`
  },
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: project.description,
      fileName: (format) => project.getJSName(format)
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
        /** Rename the css to [project.name].css */
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) throw new Error('Invalid file');
          if (assetInfo.name == 'style.css') return project.getCSSName();
          return assetInfo.name;
        }
      }
    }
  }
});
