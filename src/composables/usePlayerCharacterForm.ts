import { computed, ref } from "vue";
import type { AbilityBonuses, AbilityScores, PlayerCharacter } from "@/generated/models/data.schema";

function createForm(character?: PlayerCharacter) {
  const defaultScores: AbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const defaultBonuses: AbilityBonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

  return {
    name: character?.name ?? "",
    surname: character?.surname ?? "",
    pcClass: character?.classes?.[0] ?? "",
    subclass: character?.classes?.[1] ?? "",
    species: character?.species ?? "",
    versatilitySkill: character?.versatilitySkill ?? "",
    ancestry: character?.ancestry ?? "",
    gender: character?.gender ?? "",
    backgroundId: character?.backgroundId ?? "",
    customBackgroundName: character?.customBackgroundName ?? "",
    customBackgroundSkills: [...(character?.customBackgroundSkills ?? [])],
    originStory: character?.originStory ?? "",
    abilityScores: { ...defaultScores, ...character?.abilityScores },
    abilityBonuses: { ...defaultBonuses, ...character?.abilityBonuses },
  };
}

export function usePlayerCharacterForm() {
  const form = ref(createForm());
  const originalSnapshot = ref(JSON.stringify(form.value));
  const hasChanges = computed(() => JSON.stringify(form.value) !== originalSnapshot.value);

  function resetForm(character?: PlayerCharacter): void {
    form.value = createForm(character);
    originalSnapshot.value = JSON.stringify(form.value);
  }

  return { form, hasChanges, resetForm };
}
