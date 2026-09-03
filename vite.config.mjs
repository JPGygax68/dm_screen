import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import Components from 'unplugin-vue-components/vite';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configFile = fileURLToPath(import.meta.url);
const repoRoot = path.dirname(configFile);
const modelsDir = path.join(repoRoot, 'src', 'models');

/** Equivalent to the "generate:models" NPM script, but runs automatically when a model YAML file changes during development.
 */
function regenerateModels() {
  let queued = null;

  return {
    name: 'regenerate-models',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(path.join(modelsDir, '**/*.yaml'));

      const scheduleRegenerate = () => {
        if (queued) {
          clearTimeout(queued);
        }

        queued = setTimeout(() => {
          queued = null;

          try {
            execFileSync(process.execPath, [path.join('scripts', 'generate-model-json.mjs')], {
              cwd: repoRoot,
              stdio: 'inherit'
            });
            server.ws.send({ type: 'full-reload' });
          } catch (error) {
            console.error('[vite] Failed to regenerate model artifacts:', error);
          }
        }, 30);
      };

      const handleWatcherEvent = (filePath) => {
        const isYaml = filePath.endsWith('.yaml');
        const isModelFile = filePath.startsWith(modelsDir);
        if (isYaml && isModelFile) {
          scheduleRegenerate();
        }
      };

      server.watcher.on('add', handleWatcherEvent);
      server.watcher.on('change', handleWatcherEvent);
      server.watcher.on('unlink', handleWatcherEvent);
    }
  };
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  resolve: {
    alias: {
      '@': path.join(repoRoot, 'src'),
      events: 'events/events.js'
    }
  },
  plugins: [
    vue(),
    tailwindcss(),
    regenerateModels(),
    // Automates your component registry passes cleanly
    Components({
      // Tell the plugin to scan your local project folder arrays automatically
      dirs: ['./components', './views'],
      // Control extension parameters so it looks for regular Vue layouts
      extensions: ['vue'],
      dts: true,
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
