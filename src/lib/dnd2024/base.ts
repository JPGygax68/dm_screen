export const AbilityKeys = ["str", "dex", "con", "int", "wis", "cha"];

export type AbilityKey = typeof AbilityKeys[number];

export namespace AbilityKey {
  export function values(): AbilityKey[] {
    return ["str", "dex", "con", "int", "wis", "cha"];
  }
}

export type AbilityScores = Record<AbilityKey, number>;

export type AbilityBonuses = Record<AbilityKey, number>;

export const abilityNamesMap_en: { [k in AbilityKey]: string } = {
  str: "strength",
  dex: "dexterity",
  con: "constitution",
  int: "intelligence",
  wis: "wisdom",
  cha: "charisma",
};