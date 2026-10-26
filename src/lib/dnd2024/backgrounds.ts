import type { AbilityKey } from "./base.ts";
import type { Skill, SkillId } from "@/lib/dnd2024/skills.ts";
import type { Ref } from "vue";
import { ref } from "vue";

export type Background = {
  name: string;
  description?: string;
  boostableAbilityScores?: AbilityKey[];
  feats?: { [key: string]: string }[];
  skills?: SkillId[];
  tools?: string[];
  startingEquipmentOptions?: string[][];
};

// SRD 5.2 Free-to-use sample backgrounds
const criminalBackground: Background = {
  name: "Criminal",
  description: "A life of crime and underworld connections.",
  feats: [{ criminal_contact: "Criminal Contact" }],
  skills: ["deception", "stealth"],
  tools: ["Thieves' Tools"],
};

const sageBackground: Background = {
  name: "Sage",
  description: "A scholarly background with extensive knowledge.",
  boostableAbilityScores: ["int", "wis"] as AbilityKey[],
  skills: ["arcana", "history"],
  tools: ["Calligrapher's Supplies"],
};

const soldierBackground: Background = {
  name: "Soldier",
  description: "A background of military service and discipline.",
  boostableAbilityScores: ["str", "dex", "con"] as AbilityKey[],
  feats: [{ savage_attack: "Savage Attacker" }],
  skills: ["athletics", "intimidation"],
  tools: ["Gaming Set"],
};

export const freeBackgrounds = [criminalBackground, sageBackground, soldierBackground];
