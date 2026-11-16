import assert from "node:assert/strict";
import { useSkills } from "../src/lib/dnd2024/skills.ts";

const { skillDefs, skillNamesMap_en, skillsByAbility } = useSkills();

for (const skill of skillDefs) {
  assert.ok(skillsByAbility[skill.ability].includes(skill.id));
  assert.ok(skillNamesMap_en[skill.id]);
}
assert.equal(Object.values(skillsByAbility).flat().length, skillDefs.length);
assert.deepEqual(skillsByAbility.con, []);

console.log("Skill composable tests passed.");
