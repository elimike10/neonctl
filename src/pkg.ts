import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'),
);
