import type { AbilityKey } from "./base.ts";
import type { Skill, SkillId } from "@/lib/dnd2024/skills.ts";
import type { Ref } from "vue";
import { ref } from "vue";

export type Background = {
  id: string;
  name_en: string;
  description?: string;
  boostableAbilityScores?: AbilityKey[];
  feats?: { [key: string]: string }[];
  skills?: SkillId[];
  tools?: string[];
  startingEquipmentOptions?: string[][];
};

// SRD 5.2 Free-to-use sample backgrounds
const criminalBackground: Background = {
  id: "criminal",
  name_en: "Criminal",
  description: "A life of crime and underworld connections.",
  boostableAbilityScores: ["dex", "int"] as AbilityKey[],
  feats: [{ criminal_contact: "Criminal Contact" }],
  skills: ["deception", "stealth"],
  tools: ["Thieves' Tools"],
};

const sageBackground: Background = {
  id: "sage",
  name_en: "Sage",
  description: "A scholarly background with extensive knowledge.",
  boostableAbilityScores: ["int", "wis"] as AbilityKey[],
  skills: ["arcana", "history"],
  tools: ["Calligrapher's Supplies"],
};

const soldierBackground: Background = {
  id: "soldier",
  name_en: "Soldier",
  description: "A background of military service and discipline.",
  boostableAbilityScores: ["str", "dex", "con"] as AbilityKey[],
  feats: [{ savage_attack: "Savage Attacker" }],
  skills: ["athletics", "intimidation"],
  tools: ["Gaming Set"],
};

export const freeBackgrounds = [criminalBackground, sageBackground, soldierBackground];

// TODO: Add more backgrounds beyond the free-to-use sample backgrounds
export const backgrounds = freeBackgrounds;
