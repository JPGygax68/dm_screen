import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dataSchema from '../src/generated/models/data.schema.json' with { type: 'json' };
import { createEncounterValidator } from '../src/domain/validation/encounter-validator.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = (name: string) => path.join(scriptDirectory, '..', 'specs', 'fixtures', name);
const readFixture = (name: string) => JSON.parse(fs.readFileSync(fixturePath(name), 'utf8')) as Record<string, any>;

const validateEncounter = createEncounterValidator(dataSchema);
const validEncounter = readFixture('valid-encounter.json');

const validResult = validateEncounter(validEncounter);
assert.equal(validResult.valid, true, JSON.stringify(validResult.issues));
assert.equal(validEncounter.participants[0].name, undefined);

const duplicateLabelEncounter = structuredClone(validEncounter);
duplicateLabelEncounter.participants[1].label = 'goblin_1';
const duplicateLabelResult = validateEncounter(duplicateLabelEncounter);
assert.equal(duplicateLabelResult.valid, false);
assert.ok(duplicateLabelResult.issues.some((issue) => issue.keyword === 'uniqueLabel'));

const unresolvedTurnEncounter = structuredClone(validEncounter);
unresolvedTurnEncounter.rounds[0].turns[0].participantId = '77777777-7777-4777-8777-777777777777';
unresolvedTurnEncounter.activeTurn = undefined;
const unresolvedTurnResult = validateEncounter(unresolvedTurnEncounter);
assert.equal(unresolvedTurnResult.valid, false);
assert.ok(unresolvedTurnResult.issues.some((issue) => issue.keyword === 'reference'));

const invalidLabelResult = validateEncounter(readFixture('invalid-encounter.json'));
assert.equal(invalidLabelResult.valid, false);
assert.ok(invalidLabelResult.issues.some((issue) => issue.keyword === 'pattern'));

const reusedIdResult = validateEncounter(validEncounter, {
  knownIds: new Set([validEncounter.participants[0].id])
});
assert.equal(reusedIdResult.valid, false);
assert.ok(reusedIdResult.issues.some((issue) => issue.keyword === 'uniqueId'));

console.log('Encounter validation fixtures passed.');
