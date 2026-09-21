import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const source = path.join(repoRoot, 'src', 'models', 'data.schema.yaml');
const outDir = path.join(repoRoot, 'src', 'generated', 'models');
const outFile = path.join(outDir, 'data.schema.json');

const schema = YAML.parse(fs.readFileSync(source, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(repoRoot, outFile)}`);
