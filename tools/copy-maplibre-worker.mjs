import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workerSource = resolve(projectRoot, 'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs');
const publicDirectory = resolve(projectRoot, 'public');

mkdirSync(publicDirectory, { recursive: true });
copyFileSync(workerSource, resolve(publicDirectory, 'maplibre-gl-worker.mjs'));
