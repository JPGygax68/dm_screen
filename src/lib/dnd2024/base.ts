import type { AbilityScores } from "@/generated/models/data.schema";

export type AbilityKey = keyof AbilityScores;

export const abilityKeys: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"] as const;

export const abilityNamesMap_en: { [k in AbilityKey]: string } = {
  str: "strength",
  dex: "dexterity",
  con: "constitution",
  int: "intelligence",
  wis: "wisdom",
  cha: "charisma",
} as const;