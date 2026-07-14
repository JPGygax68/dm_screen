import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const jobs = [
  {
    source: path.join(repoRoot, 'src/models/campaign.schema.yaml'),
    output: path.join(repoRoot, 'src/generated/models/campaign.schema.json')
  },
  {
    source: path.join(repoRoot, 'src/models/campaign.uischema.yaml'),
    output: path.join(repoRoot, 'src/generated/models/campaign.uischema.json')
  }
];

for (const job of jobs) {
  const raw = fs.readFileSync(job.source, 'utf8');
  const parsed = YAML.parse(raw);

  fs.mkdirSync(path.dirname(job.output), { recursive: true });
  fs.writeFileSync(job.output, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
  console.log(`Generated ${path.relative(repoRoot, job.output)}`);
}
