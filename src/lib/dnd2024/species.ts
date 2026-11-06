/** @format */

import { creatureSizes } from "@/lib/dnd2024/base";

export type CreatureSize = (typeof creatureSizes)[number];

export type Species = {
  id: string;
  name_en: string;
  size: CreatureSize;
  traits: readonly string[];
  variants?: readonly string[];
};

/**
 * All the 9 core species covered by the free Basic Rules of DnD 2024.
 */
export const species: readonly Species[] = [
  { id: "human", name_en: "Human", size: "medium", traits: ["resourceful", "skillful", "versatility"] },
  { id: "elf", name_en: "Elf", size: "medium", traits: ["darkvision", "keen_senses", "fey_ancestry", "trance"] },
  {
    id: "dwarf",
    name_en: "Dwarf",
    size: "medium",
    traits: ["darkvision_120ft", "dwarven_resilience", "dwarven_toughness", "stonecunning"],
  },
  {
    id: "halfling",
    name_en: "Halfling",
    size: "small",
    traits: ["lucky", "brave", "halfling_nimbleness", "naturally_stealthy"],
  },
  {
    id: "orc",
    name_en: "Orc",
    size: "medium",
    traits: ["darkvision", "menacing", "relentless_endurance", "savager"],
  },
  { id: "gnome", name_en: "Gnome", size: "small", traits: ["darkvision_60ft", "gnome_cunning"] },
  {
    id: "dragonborn",
    name_en: "Dragonborn",
    size: "medium",
    traits: ["draconic_ancestry", "breath_weapon", "darkvision"],
    variants: [
      "black",
      "blue",
      "brass",
      "bronze",
      "copper",
      "gold",
      "green",
      "red",
      "silver",
      "white",
    ],
  },
  {
    id: "tiefling",
    name_en: "Tiefling",
    size: "medium",
    traits: ["darkvision", "hellish_resistance", "infernal_legacy"],
  },
] as const;

export const draconicAncestries: readonly Species[] = [
  { id: "black", name_en: "Black", size: "medium", traits: [] },
  { id: "blue", name_en: "Blue", size: "medium", traits: [] },
  { id: "brass", name_en: "Brass", size: "medium", traits: [] },
  { id: "bronze", name_en: "Bronze", size: "medium", traits: [] },
  { id: "copper", name_en: "Copper", size: "medium", traits: [] },
  { id: "gold", name_en: "Gold", size: "medium", traits: [] },
  { id: "green", name_en: "Green", size: "medium", traits: [] },
  { id: "red", name_en: "Red", size: "medium", traits: [] },
  { id: "silver", name_en: "Silver", size: "medium", traits: [] },
  { id: "white", name_en: "White", size: "medium", traits: [] },
] as const;
