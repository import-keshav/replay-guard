// Unpacked build into dist/.
import { build } from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await build({
  entryPoints: ['src/content.ts'],
  outdir: 'dist',
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  legalComments: 'none',
  logLevel: 'warning',
});
await copyFile('src/content.css', 'dist/content.css');
await copyFile('manifest.json', 'dist/manifest.json');
console.log('Built extension in dist/');
