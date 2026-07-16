import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configFile = fileURLToPath(import.meta.url);
const repoRoot = path.dirname(configFile);
const modelsDir = path.join(repoRoot, 'src', 'models');

function generateModels() {
  execFileSync(process.execPath, [path.join('scripts', 'generate-model-json.mjs')], {
    cwd: repoRoot,
    stdio: 'inherit'
  });
}

function regenerateOnYamlChange() {
  let queued = null;

  return {
    name: 'regenerate-models-on-yaml-change',
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
            generateModels();
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
  plugins: [vue(), regenerateOnYamlChange()],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
