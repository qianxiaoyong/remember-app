import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'fixtures/remember-test-pack.zip');
const target = resolve(root, '../../apps/mobile/assets/packs/remember-test-pack.zip');

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
process.stdout.write(`synced ${target}\n`);
