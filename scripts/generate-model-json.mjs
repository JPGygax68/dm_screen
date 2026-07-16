import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Convert all YAML model files to JSON and write them to the "generated" directory

const yamlSchemaFiles = [
  'dmscreen.uischema',
  'campaign.schema',
  'campaign.uischema'
];

const schemas = await parseYamlSchemaFiles(yamlSchemaFiles, path.join(repoRoot, 'src', 'models'));
console.log(`Schemas: ${Object.keys(schemas).join(', ')}`);
await writeSchemasAsJson(schemas, path.join(repoRoot, 'src', 'generated', 'models'));

const schema = schemas['campaign.schema'];
const uiSchema = schemas['campaign.uischema'];

const campaignRootSchema = schema?.$defs?.Campaign ?? schema;
const campaignFormWarnings = [];

function decodeJsonPointerToken(token) {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

function resolveJsonPointer(target, pointer) {
  if (!pointer || pointer === '/') {
    return target;
  }

  const tokens = pointer
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)
    .map(decodeJsonPointerToken);

  let current = target;
  for (const token of tokens) {
    if (current == null || typeof current !== 'object' || !(token in current)) {
      return undefined;
    }
    current = current[token];
  }

  return current;
}

function scopeToPointer(scope) {
  if (typeof scope !== 'string') {
    return null;
  }

  if (scope.startsWith('#/')) {
    return scope.slice(1);
  }

  if (scope.startsWith('/')) {
    return scope;
  }

  return null;
}

function scopeToDataPath(scope) {
  const pointer = scopeToPointer(scope);
  if (!pointer) {
    return null;
  }

  const tokens = pointer
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)
    .map(decodeJsonPointerToken)
    .filter((token) => token !== 'properties');

  return tokens.join('.');
}

function normalizeControl(controlElement, index) {
  const pointer = scopeToPointer(controlElement.scope);
  const dataPath = scopeToDataPath(controlElement.scope);
  const schemaNode = pointer ? resolveJsonPointer(campaignRootSchema, pointer) : undefined;

  if (!schemaNode) {
    campaignFormWarnings.push(
      `Control at index ${index} references missing scope ${String(controlElement.scope)}`
    );
  }

  const label = controlElement.label ?? schemaNode?.title ?? schemaNode?.description ?? null;
  const placeholder = controlElement.description ?? schemaNode?.description ?? '';

  return {
    kind: 'field',
    uiType: 'Control',
    scope: controlElement.scope ?? null,
    pointer,
    path: dataPath,
    schemaType: schemaNode?.type ?? null,
    required:
      typeof dataPath === 'string' && dataPath
        ? Boolean(campaignRootSchema?.required?.includes(dataPath.split('.').slice(-1)[0]))
        : false,
    label,
    placeholder,
    options: controlElement.options ?? {}
  };
}

function normalizeUiElement(uiElement, indexPath = []) {
  if (!uiElement || typeof uiElement !== 'object') {
    return null;
  }

  const type = uiElement.type;
  const currentPath = indexPath.join('.');

  if (type === 'Control') {
    return normalizeControl(uiElement, currentPath || 0);
  }

  if (Array.isArray(uiElement.elements)) {
    return {
      kind: 'layout',
      uiType: type ?? 'Layout',
      label: uiElement.label ?? null,
      options: uiElement.options ?? {},
      elements: uiElement.elements
        .map((child, childIndex) => normalizeUiElement(child, [...indexPath, childIndex]))
        .filter(Boolean)
    };
  }

  campaignFormWarnings.push(
    `Unsupported UI schema element type ${String(type)} at index ${currentPath || 0}`
  );

  return null;
}

function collectFields(node, acc = []) {
  if (!node || typeof node !== 'object') {
    return acc;
  }

  if (node.kind === 'field') {
    acc.push(node);
  }

  if (Array.isArray(node.elements)) {
    for (const child of node.elements) {
      collectFields(child, acc);
    }
  }

  return acc;
}

const normalizedRoot = normalizeUiElement(uiSchema, []);
const fieldList = collectFields(normalizedRoot);

const campaignFormSpec = {
  $schema: 'https://dm-screen.local/schema/form-spec.schema.json',
  $id: 'https://dm-screen.local/generated/forms/campaign.form-spec.json',
  version: 1,
  source: {
    dataSchemaId: schema?.$id ?? null,
    uiSchemaId: uiSchema?.$id ?? null,
    modelRoot: '#/$defs/Campaign'
  },
  form: normalizedRoot,
  fieldsByPath: Object.fromEntries(
    fieldList
      .filter((field) => typeof field.path === 'string' && field.path.length > 0)
      .map((field) => [
        field.path,
        {
          scope: field.scope,
          pointer: field.pointer,
          schemaType: field.schemaType,
          required: field.required,
          label: field.label,
          placeholder: field.placeholder,
          options: field.options,
        }
      ])
  ),
  warnings: campaignFormWarnings
};

const formSpecOutput = path.join(repoRoot, 'src/generated/forms/campaign.form-spec.json');
fs.mkdirSync(path.dirname(formSpecOutput), { recursive: true });
fs.writeFileSync(formSpecOutput, `${JSON.stringify(campaignFormSpec, null, 2)}\n`, 'utf8');
console.log(`Generated ${path.relative(repoRoot, formSpecOutput)}`);

function escapeForPugText(value) {
  return String(value ?? '').replace(/\n/g, ' ').trim();
}

function jsString(value) {
  return JSON.stringify(String(value ?? ''));
}

function renderGeneratedNode(node, depth = 0) {
  const indent = '  '.repeat(depth);
  const lines = [];

  if (!node || typeof node !== 'object') {
    return lines;
  }

  if (node.kind === 'layout') {
    if (node.uiType === 'Group') {
      lines.push(`${indent}ion-card.form-spec-group`);
      if (node.label) {
        lines.push(`${indent}  ion-card-header`);
        lines.push(`${indent}    ion-card-title ${escapeForPugText(node.label)}`);
      }
      lines.push(`${indent}  ion-card-content`);
      for (const child of node.elements || []) {
        lines.push(...renderGeneratedNode(child, depth + 2));
      }
      return lines;
    }

    lines.push(`${indent}div.form-spec-layout`);
    for (const child of node.elements || []) {
      lines.push(...renderGeneratedNode(child, depth + 1));
    }
    return lines;
  }

  if (node.kind === 'field') {
    const path = jsString(node.path || '');
    const label = escapeForPugText(node.label || node.path || 'Field');
    const placeholder = jsString(node.placeholder || '');
    const rowCount = Number(node.options?.rows || 3);
    const isMultiline = Boolean(node.options?.multi);

    lines.push(`${indent}ion-item.form-spec-field(lines="none")`);
    lines.push(`${indent}  ion-label(position="stacked") ${label}`);
    if (isMultiline) {
      lines.push(
        `${indent}  ion-textarea(:value='getValueAtPath(data, ${path})' :rows='${rowCount}' :placeholder='${placeholder}' @ionInput='(event) => emitFieldUpdate(${path}, event)')`
      );
    } else {
      lines.push(
        `${indent}  ion-input(:value='getValueAtPath(data, ${path})' :placeholder='${placeholder}' @ionInput='(event) => emitFieldUpdate(${path}, event)')`
      );
    }
    lines.push(`${indent}ion-note.form-spec-error(v-if='errorByPath[${path}]' color="danger") {{ errorByPath[${path}] }}`);
    return lines;
  }

  lines.push(`${indent}ion-note(color="warning") Unsupported form node: ${escapeForPugText(node.uiType || 'unknown')}`);
  return lines;
}

const generatedTemplateLines = renderGeneratedNode(campaignFormSpec.form, 0);
const generatedVueComponent = `<template lang="pug">\n${generatedTemplateLines.join('\n')}\n</template>\n\n<script setup>\nimport {\n  IonCard,\n  IonCardContent,\n  IonCardHeader,\n  IonCardTitle,\n  IonInput,\n  IonItem,\n  IonLabel,\n  IonNote,\n  IonTextarea\n} from '@ionic/vue';\n\nconst props = defineProps({\n  data: {\n    type: Object,\n    required: true\n  },\n  errorByPath: {\n    type: Object,\n    default: () => ({})\n  }\n});\n\nconst emit = defineEmits(['update-field']);\n\nfunction emitFieldUpdate(path, event) {\n  emit('update-field', {\n    path,\n    value: event?.detail?.value ?? ''\n  });\n}\n\nfunction getValueAtPath(target, dataPath) {\n  if (!dataPath || typeof dataPath !== 'string') {\n    return '';\n  }\n\n  const segments = dataPath.split('.').filter(Boolean);\n  let current = target;\n\n  for (const segment of segments) {\n    if (current == null || typeof current !== 'object') {\n      return '';\n    }\n    current = current[segment];\n  }\n\n  return current == null ? '' : current;\n}\n</script>\n`;

const generatedComponentOutput = path.join(
  repoRoot,
  'src/generated/forms/CampaignForm.generated.vue'
);
fs.mkdirSync(path.dirname(generatedComponentOutput), { recursive: true });
fs.writeFileSync(generatedComponentOutput, generatedVueComponent, 'utf8');
console.log(`Generated ${path.relative(repoRoot, generatedComponentOutput)}`);

if (campaignFormWarnings.length > 0) {
  console.warn('Form spec warnings:');
  for (const warning of campaignFormWarnings) {
    console.warn(`- ${warning}`);
  }
}

// Main functions (some async)

// async function parseAndConvertYamlSchemaFiles(schemaFiles) {
//   const schemas = await parseYamlSchemaFiles(schemaFiles);
//   const destBaseDir = path.join(repoRoot, 'src', 'generated', 'models');
//   await writeSchemasAsJson(schemas, destBaseDir);
//   return schemas;
// }

// Helper functions

async function parseYamlSchemaFiles(schemaFiles, sourceBaseDir) {
  const pairs = schemaFiles.map(async (file) => {
    const sourcePath = path.join(sourceBaseDir, `${file}.yaml`);
    if (!fs.existsSync(sourcePath)) {
      console.error(`Source model file not found: ${sourcePath}`);
      process.exit(1);
    }
    const raw = await fs.promises.readFile(sourcePath, 'utf8').catch((err) => {
      console.error(`Error reading source model file: ${sourcePath}`, err);
      process.exit(1);
    });
    const parsed = YAML.parse(raw);
    return [file, parsed];
  });
  return Object.fromEntries(await Promise.all(pairs));
}

async function writeSchemasAsJson(schemas, destBaseDir) {
  const pairs = Object.entries(schemas).map(async ([file, parsed]) => {
    const destinationPath = path.join(destBaseDir, `${file}.json`);
    if (!fs.existsSync(path.dirname(destinationPath))) {
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    }
    await fs.promises.writeFile(destinationPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8').catch((err) => {
      console.error(`Error writing generated model file: ${destinationPath}`, err);
      process.exit(1);
    });
    console.log(`Generated ${path.relative(repoRoot, destinationPath)}`);
    return { file, parsed };
  });
  return Promise.all(pairs);
}