/**
 * Generates form composables from JSON schema.
 * This script creates base form state functions and types for each schema entity.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Generate PlayerCharacter form
generatePlayerCharacterForm();

function generatePlayerCharacterForm() {
  const outDir = path.join(repoRoot, 'src', 'generated', 'composables');
  const outFile = path.join(outDir, 'usePlayerCharacterForm.generated.ts');

  fs.mkdirSync(outDir, { recursive: true });

  const content = `/**
 * @generated from src/models/data.schema.yaml
 * DO NOT EDIT MANUALLY
 * Run: npm run generate:forms
 */

import type { AbilityBonuses, AbilityScores, PlayerCharacter } from '@/generated/models/data.schema';

/**
 * Form state shape for PlayerCharacter.
 * Extracted from the schema for easy binding and change tracking.
 */
export interface PlayerCharacterFormState {
  name: string;
  surname: string;
  pcClass: string;
  subclass: string;
  species: string;
  versatilitySkill: string;
  ancestry: string;
  gender: string;
  backgroundId: string;
  customBackgroundName: string;
  customBackgroundSkills: string[];
  originStory: string;
  portrait: string;
  abilityScores: AbilityScores;
  abilityBonuses: AbilityBonuses;
}

/**
 * Creates an empty form state from defaults, or hydrates from existing character.
 * This is the core mechanical transformation from schema to form state.
 */
export function createPlayerCharacterFormState(
  character?: PlayerCharacter
): PlayerCharacterFormState {
  const defaultScores: AbilityScores = {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  };
  const defaultBonuses: AbilityBonuses = {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  };

  return {
    name: character?.name ?? '',
    surname: character?.surname ?? '',
    pcClass: character?.classes?.[0] ?? '',
    subclass: character?.classes?.[1] ?? '',
    species: character?.species ?? '',
    versatilitySkill: character?.versatilitySkill ?? '',
    ancestry: character?.ancestry ?? '',
    gender: character?.gender ?? '',
    backgroundId: character?.backgroundId ?? '',
    customBackgroundName: character?.customBackgroundName ?? '',
    customBackgroundSkills: [...(character?.customBackgroundSkills ?? [])],
    originStory: character?.originStory ?? '',
    portrait: character?.portrait ?? '',
    abilityScores: { ...defaultScores, ...character?.abilityScores },
    abilityBonuses: { ...defaultBonuses, ...character?.abilityBonuses },
  };
}

/**
 * Utility to create a snapshot for change tracking.
 */
export function snapshotFormState(form: PlayerCharacterFormState): string {
  return JSON.stringify(form);
}

/**
 * Utility to check if form state has changed from original snapshot.
 */
export function formStateChanged(current: string, original: string): boolean {
  return current !== original;
}
`;

  fs.writeFileSync(outFile, content, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, outFile)}`);
}
