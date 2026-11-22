# Schema-Driven Form Generation

This document explains the schema-driven form generation system and how to maintain it.

## Overview

The DM Screen project uses a **hybrid generation + handwriting** approach:

- **Generated code** (`src/generated/*`): Mechanical transformations from schema → TypeScript
  - Form state shapes and defaults
  - Type definitions
  - Utility functions for change tracking
  - **Never manually edited**; regenerate on schema changes

- **Handwritten code** (`src/composables/*`, `src/views/*`): Domain logic and UI behavior
  - Visibility rules (which fields show when)
  - Computed properties (derived state from external data)
  - Validation beyond schema constraints
  - **Never regenerated**; enhanced with business logic

## File Structure

```
src/
├── generated/              # 100% generated from schema
│   ├── models/
│   │   ├── data.schema.d.ts        # TypeScript types from schema
│   │   └── data.schema.json        # JSON representation
│   └── composables/
│       └── usePlayerCharacterForm.generated.ts  # Generated form base
│
├── composables/            # Handwritten, uses generated
│   └── usePlayerCharacterForm.ts   # Extends generated with domain logic
│
└── views/                  # Handwritten UI
    └── PlayerCharacterView.vue     # Uses visibility computed properties from composable
```

## Workflow: Schema → Code

### 1. Schema Changes

Edit `src/models/data.schema.yaml`:

```yaml
PlayerCharacter:
  properties:
    name: { type: string, minLength: 1 }
    level: { type: integer, minimum: 1, maximum: 20 }  # NEW FIELD
```

### 2. Regenerate

```bash
npm run generate
# or
npm run generate:forms
```

Generated file `src/generated/composables/usePlayerCharacterForm.generated.ts` now includes:

```typescript
export interface PlayerCharacterFormState {
  name: string;
  // ... other fields
  level: number;  // NEW FIELD
}

export function createPlayerCharacterFormState(char?: PlayerCharacter) {
  return {
    // ... other fields
    level: character?.level ?? 1,  // NEW FIELD DEFAULT
  };
}
```

### 3. TypeScript Catches Issues

Your handwritten code breaks:

```typescript
// src/composables/usePlayerCharacterForm.ts
const form = ref<PlayerCharacterFormState>(createPlayerCharacterFormState());
// ✗ Type 'PlayerCharacterFormState' missing property 'level'
```

### 4. Developer Fixes

Add handling for the new field in handwritten code:

```typescript
function resetForm(character?: PlayerCharacter): void {
  form.value = {
    ...createPlayerCharacterFormState(character),
    // Handle new field if needed
  };
}
```

### 5. Test & Commit

```bash
npm test
git add -A
git commit
```

## Example: PlayerCharacter Form

### Generated Base

**File**: `src/generated/composables/usePlayerCharacterForm.generated.ts`

```typescript
export interface PlayerCharacterFormState {
  name: string;
  species: string;
  abilityScores: AbilityScores;
  // ... all schema fields
}

export function createPlayerCharacterFormState(
  character?: PlayerCharacter
): PlayerCharacterFormState {
  return {
    name: character?.name ?? "",
    species: character?.species ?? "",
    abilityScores: { /* defaults */ },
    // ... all schema fields with defaults
  };
}

export function snapshotFormState(form: PlayerCharacterFormState): string {
  return JSON.stringify(form);
}

export function formStateChanged(current: string, original: string): boolean {
  return current !== original;
}
```

### Handwritten Logic

**File**: `src/composables/usePlayerCharacterForm.ts`

```typescript
import {
  createPlayerCharacterFormState,
  snapshotFormState,
  formStateChanged,
  type PlayerCharacterFormState,
} from "@/generated/composables/usePlayerCharacterForm.generated";

export function usePlayerCharacterForm() {
  const form = ref<PlayerCharacterFormState>(createPlayerCharacterFormState());
  const originalSnapshot = ref(snapshotFormState(form.value));

  // Use generated utilities
  const hasChanges = computed(() =>
    formStateChanged(snapshotFormState(form.value), originalSnapshot.value)
  );

  // ADD HANDWRITTEN DOMAIN LOGIC HERE
  const isVersatilitySkillVisible = computed(() => form.value.species === "human");
  const isAncestryVisible = computed(() => form.value.species === "dragonborn");
  const isCustomBackgroundDetailsVisible = computed(
    () => form.value.backgroundId === "custom"
  );

  function resetForm(character?: PlayerCharacter): void {
    form.value = createPlayerCharacterFormState(character);
    originalSnapshot.value = snapshotFormState(form.value);
  }

  return {
    form,
    hasChanges,
    resetForm,
    isVersatilitySkillVisible,     // ← handwritten
    isAncestryVisible,              // ← handwritten
    isCustomBackgroundDetailsVisible, // ← handwritten
  };
}
```

### View Usage

**File**: `src/views/PlayerCharacterView.vue`

```vue
<script setup>
const { form, hasChanges, isVersatilitySkillVisible } = usePlayerCharacterForm();
</script>

<template>
  <!-- Show versatility skill field only for humans -->
  <input v-if="isVersatilitySkillVisible" v-model="form.versatilitySkill" />
</template>
```

## Adding New Forms

To add auto-generated form for a new entity (e.g., `Encounter`):

### 1. Update Generator Script

Edit `scripts/generate-form-composables.mjs`:

```javascript
export function generateEncounterForm() {
  const outDir = path.join(repoRoot, 'src', 'generated', 'composables');
  const outFile = path.join(outDir, 'useEncounterForm.generated.ts');
  
  const content = `
    // Generated from schema
    export interface EncounterFormState { ... }
    export function createEncounterFormState(encounter?: Encounter) { ... }
  `;
  
  fs.writeFileSync(outFile, content, 'utf8');
  console.log(\`Wrote \${path.relative(repoRoot, outFile)}\`);
}

// Add to main execution:
generateEncounterForm();
```

### 2. Create Handwritten Wrapper

Create `src/composables/useEncounterForm.ts`:

```typescript
import { createEncounterFormState, type EncounterFormState } from "@/generated/composables/useEncounterForm.generated";
import type { Encounter } from "@/generated/models/data.schema";

export function useEncounterForm() {
  const form = ref<EncounterFormState>(createEncounterFormState());
  
  // Add handwritten logic
  const isParticipantsVisible = computed(() => form.value.status === "Active");
  
  return { form, isParticipantsVisible };
}
```

### 3. Run Generation

```bash
npm run generate:forms
```

## Synchronization Guarantees

### Type Safety (Compile-Time)

If schema changes, TypeScript will complain about missing or changed types in handwritten code. This is by design — it **forces** you to acknowledge schema changes.

### Testing (Runtime)

Add tests to verify handwritten code handles all schema fields:

```typescript
// scripts/test-player-character-form.ts
import { createPlayerCharacterFormState } from "@/generated/composables/usePlayerCharacterForm.generated";
import { usePlayerCharacterForm } from "@/composables/usePlayerCharacterForm";

describe("usePlayerCharacterForm", () => {
  it("should hydrate all schema fields", () => {
    const { form } = usePlayerCharacterForm();
    
    expect(form.value).toHaveProperty("name");
    expect(form.value).toHaveProperty("species");
    expect(form.value).toHaveProperty("abilityScores");
    // ... check all fields
  });

  it("should respect schema defaults", () => {
    const { form } = usePlayerCharacterForm();
    expect(form.value.abilityScores).toEqual({
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    });
  });
});
```

### CI/CD Hook

Pre-commit hook runs generation and type-checking:

```bash
npm run generate && npm run typecheck
```

## Best Practices

1. **Never manually edit files in `src/generated/`**
   - They are regenerated on schema changes
   - Edits will be overwritten

2. **Always import types from generated files**
   ```typescript
   import type { PlayerCharacterFormState } from "@/generated/composables/usePlayerCharacterForm.generated";
   ```

3. **Keep handwritten code focused on domain logic**
   - Visibility rules, validation, computed properties
   - Complex interactions, business rules
   - Not mechanical transformations

4. **Mark generation boundaries clearly**
   - Generated files have `@generated` comment
   - Handwritten files import and extend generated

5. **Test the contract**
   - Verify handwritten code handles all schema fields
   - Use TypeScript to catch mismatches
   - Run tests on every schema change

## Troubleshooting

### "Cannot find module '@/generated/composables/usePlayerCharacterForm.generated'"

You haven't run generation yet. Run:
```bash
npm run generate
```

### "Type 'PlayerCharacterFormState' missing property 'X'"

Schema was updated with a new field. Generated types changed. Update handwritten code to handle the new field.

### Generated file looks wrong

Check if schema YAML is valid:
```bash
node -e "import('./scripts/generate-form-composables.mjs')"
```

If still broken, regenerate:
```bash
rm -rf src/generated/
npm run generate
```

## Future Enhancements

- [ ] Add UI metadata to schema (`x-ui` fields) for auto-generating visibility rules
- [ ] Generate form component skeletons
- [ ] Generate validation logic from schema constraints
- [ ] Type-check visibility expressions against form state
- [ ] Auto-generate tests for form handling
