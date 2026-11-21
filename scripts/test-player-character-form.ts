import assert from "node:assert/strict";
import { reactive } from "vue";
import type { PlayerCharacter } from "../src/generated/models/data.schema";
import { usePlayerCharacterForm } from "../src/composables/usePlayerCharacterForm.ts";

const character: PlayerCharacter = reactive({
  id: "character-1",
  name: "Ada",
  classes: ["wizard", "evoker"],
  customBackgroundSkills: ["arcana"],
  abilityScores: { str: 10, dex: 12, con: 10, int: 16, wis: 10, cha: 10 },
  abilityBonuses: { str: 0, dex: 0, con: 0, int: 2, wis: 0, cha: 0 },
});

const { form, hasChanges, resetForm } = usePlayerCharacterForm();
resetForm(character);
assert.equal(form.value.pcClass, "wizard");
assert.equal(form.value.subclass, "evoker");
assert.equal(hasChanges.value, false);

form.value.name = "Mira";
form.value.abilityScores.int = 18;
form.value.abilityBonuses.int = 1;
form.value.customBackgroundSkills.push("history");
assert.equal(hasChanges.value, true);
assert.equal(character.name, "Ada");
assert.equal(character.abilityScores?.int, 16);
assert.equal(character.abilityBonuses?.int, 2);
assert.deepEqual(character.customBackgroundSkills, ["arcana"]);

resetForm(character);
assert.equal(hasChanges.value, false);
assert.equal(form.value.name, "Ada");
form.value.name = "Mira";
form.value.name = "Ada";
assert.equal(hasChanges.value, false);

resetForm({ id: "character-2", name: "Bryn" });
assert.equal(form.value.abilityScores.int, 10);
assert.equal(form.value.abilityBonuses.int, 0);
assert.deepEqual(form.value.customBackgroundSkills, []);
assert.equal(hasChanges.value, false);

resetForm();
assert.equal(form.value.name, "");
assert.equal(form.value.pcClass, "");
assert.equal(hasChanges.value, false);

console.log("Player character form tests passed.");
