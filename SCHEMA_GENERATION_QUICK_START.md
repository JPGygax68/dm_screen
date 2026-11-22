# Quick Start: Schema-Driven Form Generation

## For Normal Development

### When you change the schema:

```bash
# 1. Edit src/models/data.schema.yaml
nano src/models/data.schema.yaml

# 2. Regenerate everything
npm run generate

# 3. TypeScript will show errors if handwritten code is out of sync
# Fix them in src/composables/usePlayerCharacterForm.ts

# 4. Verify it works
npm test

# 5. Commit
git add -A
git commit -m "schema: add new field X"
```

## For Adding New Forms

### Example: Create a form for `Encounter`

#### Step 1: Update the generator script

Edit `scripts/generate-form-composables.mjs`:

```javascript
// Add this function (copy from generatePlayerCharacterForm and adapt)
function generateEncounterForm() {
  const outDir = path.join(repoRoot, 'src', 'generated', 'composables');
  const outFile = path.join(outDir, 'useEncounterForm.generated.ts');

  fs.mkdirSync(outDir, { recursive: true });

  const content = `
/**
 * @generated from src/models/data.schema.yaml
 * DO NOT EDIT MANUALLY
 * Run: npm run generate:forms
 */

import type { Encounter } from '@/generated/models/data.schema';

export interface EncounterFormState {
  title: string;
  location: string;
  sessionTag: string;
  status: 'Creating' | 'Active' | 'Ending' | 'Completed';
  // ... all other fields from schema
}

export function createEncounterFormState(encounter?: Encounter): EncounterFormState {
  return {
    title: encounter?.title ?? '',
    location: encounter?.location ?? '',
    sessionTag: encounter?.sessionTag ?? '',
    status: encounter?.status ?? 'Creating',
    // ... all schema fields
  };
}

export function snapshotFormState(form: EncounterFormState): string {
  return JSON.stringify(form);
}

export function formStateChanged(current: string, original: string): boolean {
  return current !== original;
}
  `;

  fs.writeFileSync(outFile, content, 'utf8');
  console.log(\`Wrote \${path.relative(repoRoot, outFile)}\`);
}

// At the end, add the call:
generateEncounterForm();  // ← Add this
```

#### Step 2: Create the handwritten wrapper

Create `src/composables/useEncounterForm.ts`:

```typescript
import { computed, ref } from "vue";
import {
  createEncounterFormState,
  snapshotFormState,
  formStateChanged,
  type EncounterFormState,
} from "@/generated/composables/useEncounterForm.generated";
import type { Encounter } from "@/generated/models/data.schema";

export function useEncounterForm() {
  const form = ref<EncounterFormState>(createEncounterFormState());
  const originalSnapshot = ref(snapshotFormState(form.value));

  // Generated utilities for change tracking
  const hasChanges = computed(() =>
    formStateChanged(snapshotFormState(form.value), originalSnapshot.value)
  );

  // ADD YOUR DOMAIN LOGIC HERE
  // Example: visibility rules, computed properties, validation

  function resetForm(encounter?: Encounter): void {
    form.value = createEncounterFormState(encounter);
    originalSnapshot.value = snapshotFormState(form.value);
  }

  return {
    form,
    hasChanges,
    resetForm,
    // ... add your computed properties here
  };
}
```

#### Step 3: Generate and verify

```bash
npm run generate:forms
npm test
git add -A
git commit -m "feat: add schema-driven form for Encounter"
```

## Understanding Generated vs Handwritten

### Generated Files (`src/generated/`)
- **Created by**: `npm run generate:forms`
- **Edited by**: Nobody (never manually edit)
- **Marked with**: `@generated` comment at top
- **Content**: Form state interface, create function, utilities
- **Regenerated when**: Schema changes

### Handwritten Files (`src/composables/`)
- **Created by**: You
- **Edited by**: You
- **Content**: Domain logic, visibility rules, validation
- **Never regenerated**: Safe to customize
- **Imports from**: Generated files

## Troubleshooting

### "Cannot find module '@/generated/composables/...'"
You haven't generated yet. Run:
```bash
npm run generate:forms
```

### "Type 'FormState' missing property 'X'"
Schema was updated. The generated file now has a new field. Update your handwritten code to handle it.

### Generated file looks wrong
Make sure the schema is valid YAML:
```bash
node -e "import('./scripts/generate-form-composables.mjs')"
```

If still broken, regenerate:
```bash
rm -rf src/generated/
npm run generate
```

## Key Files

- `scripts/generate-form-composables.mjs` — The generator script
- `src/generated/composables/*.generated.ts` — Generated form bases (never edit!)
- `src/composables/*.ts` — Your handwritten wrappers (always edit here)
- `src/models/data.schema.yaml` — The source of truth

## Next Steps

See `SCHEMA_GENERATION.md` for:
- Detailed architecture explanation
- Full workflow documentation
- Best practices
- Future enhancements (UI metadata, generated tests, etc)
