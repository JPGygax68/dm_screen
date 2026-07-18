import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { slugify } from '#lib/slugify.mjs';
import { generateFormSpec } from './generate-form-spec.mjs';
import { renderGeneratedNode } from './render-generated-node.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Convert all YAML model files to JSON and write them to the "generated" directory

const yamlSchemaFiles = [
  'data.schema',
  'campaign.uischema'
];

const schemas = await parseYamlSchemaFiles(yamlSchemaFiles, path.join(repoRoot, 'src', 'models'));
console.log(`Schemas: ${Object.keys(schemas).join(', ')}`);
await writeSchemasAsJson(schemas, path.join(repoRoot, 'src', 'generated', 'models'));

const schema = schemas['dmscreen.schema'];
const uiSchema = schemas['campaign.uischema'];

const rootSchema = schema?.$defs?.Campaign ?? schema;
const formWarnings = [];


const normalizedRoot = normalizeUiElement(uiSchema, []);
const fieldList = collectFields(normalizedRoot);

const formName = 'Campaign';

const formSpec = generateFormSpec(formName, schema, uiSchema, normalizedRoot, fieldList, formWarnings);
writeFormSpecToFile(formName, formSpec);

const generatedVueComponent = generateVueComponent(formName, formSpec);
writeComponentSourceToFile(`${formName}Form`, generatedVueComponent, formWarnings);

// Main functions -----------------------------------

function writeFormSpecToFile(formName, formSpec) {
  console.log(`Writing generated form spec for form "${formName}"...`);
  const formSpecOutput = path.join(repoRoot, `src/generated/forms/${slugify(formName)}.form-spec.json`);
  fs.mkdirSync(path.dirname(formSpecOutput), { recursive: true });
  fs.writeFileSync(formSpecOutput, `${JSON.stringify(formSpec, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, formSpecOutput)}`);
}

/**
 * Generates a Vue component based on the provided form specification.
 * @param {Object} formSpec - The form specification object.
 * @returns {string} - The generated Vue component source code.
 */
function generateVueComponent(formName, formSpec) {
  const { schema, uiSchema, normalizedRoot, fieldList, formWarnings } = formSpec;

  const templateLines = renderGeneratedNode(formSpec.form, 0);
  const componentSource = `
  <template lang="pug">${templateLines.join('\n')}
  </template>
  <script setup>
  import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonTextarea
  } from '@ionic/vue';
  
  const props = defineProps({
    data: {
      type: Object,
      required: true
    },
    errorByPath: {
      type: Object,
      default: () => ({})
    }
  });
  
  const emit = defineEmits(['update-field']);
  
  function emitFieldUpdate(path, event) {
    emit('update-field', {
      path,
      value: event?.detail?.value ?? ''
    });
  }
    
  function getValueAtPath(target, dataPath) {
    if (!dataPath || typeof dataPath !== 'string') {
      return '';
    }
      
    const segments = dataPath.split('.').filter(Boolean);
    let current = target;
    for (const segment of segments) {
      if (current == null || typeof current !== 'object') {
        return '';
      }
      current = current[segment];
    }
      
    return current == null ? '' : current;
  }
</script>
`;

  return componentSource;
}

/**
 * Writes (Vue) component source code to a file.
 * @param {string} fileName - The name of the form file (without extension).
 * @param {string} generatedVueComponent - The generated Vue component source code.
 * @param {string[]} formWarnings - Array of form warnings to display.
 */
function writeComponentSourceToFile(fileName, generatedVueComponent, formWarnings) {
  console.log(`Writing generated component source to file "${fileName}"...`);

  const generatedComponentOutput = path.join(
    repoRoot,
    `src/generated/forms/${fileName}.vue`
  );
  fs.mkdirSync(path.dirname(generatedComponentOutput), { recursive: true });
  fs.writeFileSync(generatedComponentOutput, generatedVueComponent, 'utf8');
  console.log(`Generated ${path.relative(repoRoot, generatedComponentOutput)}`);

  if (formWarnings.length > 0) {
    console.warn('Form spec warnings:');
    for (const warning of formWarnings) {
      console.warn(`- ${warning}`);
    }
  }
}

// Helper functions -------------------------------------------------------

/**
 * Parses YAML schema files into JavaScript objects.
 * @param {string[]} schemaFiles - Array of schema file names (without extension).
 * @param {string} sourceDir - Base directory where the YAML schema files are located.
 * @returns {Promise<Object>} - A promise that resolves to an object mapping schema names 
 * of the form "<schema name>.<'schema' | 'uischema'>" to parsed schemas.
 */
async function parseYamlSchemaFiles(schemaFiles, sourceDir) {
  const pairs = schemaFiles.map(async (file) => {
    const sourcePath = path.join(sourceDir, `${file}.yaml`);
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
  const resolvedPairs = await Promise.all(pairs);
  return Object.fromEntries(resolvedPairs);
}

/**
 * 
 * @param {Object.<string, Object>} schemas - An object mapping schema names to parsed schema objects.
 * @param {string} destinationDir - Base directory where the JSON schema files should be written.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of objects containing the file name and parsed schema.
 */
async function writeSchemasAsJson(schemas, destinationDir) {
  const pairs = Object.entries(schemas).map(async ([file, parsed]) => {
    const destinationPath = path.join(destinationDir, `${file}.json`);
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
  const schemaNode = pointer ? resolveJsonPointer(rootSchema, pointer) : undefined;

  if (!schemaNode) {
    formWarnings.push(
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
        ? Boolean(rootSchema?.required?.includes(dataPath.split('.').slice(-1)[0]))
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

  formWarnings.push(
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
