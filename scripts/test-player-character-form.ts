import assert from "node:assert/strict";
import { computed, reactive, ref } from "vue";
import type { PlayerCharacter } from "../src/generated/models/data.schema";
import { usePlayerCharacterForm } from "../src/composables/usePlayerCharacterForm.ts";
import { useArrayItems } from "../src/composables/useArrayItems.ts";

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

const items = ref<string[]>([]);
const slotCount = ref(2);
const arrayInput = useArrayItems(items, slotCount);
assert.deepEqual(
  arrayInput.slots.value.map(({ canAdd, canRemove, canEdit }) => [
    canAdd,
    canRemove,
    canEdit,
  ]),
  [
    [true, false, true],
    [false, false, false],
  ],
);
assert.throws(() => arrayInput.addOrUpdate(1, "history"), RangeError);
const emptyItems = items.value;
arrayInput.addOrUpdate(0, "arcana");
assert.deepEqual(emptyItems, []);
assert.deepEqual(items.value, ["arcana"]);
assert.equal(arrayInput.slots.value[0].canRemove, true);
assert.equal(arrayInput.slots.value[1].canAdd, true);
arrayInput.addOrUpdate(1, "history");
assert.throws(() => arrayInput.remove(0), RangeError);
arrayInput.addOrUpdate(0, "religion");
assert.deepEqual(items.value, ["religion", "history"]);
assert.throws(() => arrayInput.addOrUpdate(2, "nature"), RangeError);
arrayInput.remove(1);
arrayInput.remove(0);
assert.deepEqual(items.value, []);

items.value = ["arcana", "history", "nature"];
assert.equal(arrayInput.slots.value[1].canRemove, false);
assert.throws(() => arrayInput.remove(1), RangeError);
arrayInput.addOrUpdate(0, "religion");
assert.deepEqual(items.value, ["religion", "history", "nature"]);
slotCount.value = 3;
arrayInput.remove(2);
assert.deepEqual(items.value, ["religion", "history"]);
slotCount.value = -1;
assert.throws(() => arrayInput.slots.value, RangeError);

resetForm(character);
const formItems = useArrayItems(
  computed({
    get: () => form.value.customBackgroundSkills,
    set: (value) => {
      form.value.customBackgroundSkills = value;
    },
  }),
  2,
);
formItems.addOrUpdate(1, "history");
assert.equal(hasChanges.value, true);
assert.deepEqual(character.customBackgroundSkills, ["arcana"]);

console.log("Player character form tests passed.");
