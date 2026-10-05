import type { AbilityKey } from "./base.ts";
import type { Ref } from "vue";
import { ref } from "vue";

export type Background = {
  name: string;
  description?: string;
  boostableAbilityScores?: AbilityKey[];
  feats?: { [key: string]: string }[];
  skills?: string[];
  tools?: string[];
  startingEquipmentOptions?: string[][];
};

// SRD 5.2 Free-to-use sample backgrounds
const criminalBackground: Background = {
  name: "Criminal",
  description: "A life of crime and underworld connections.",
  feats: [{ criminal_contact: "Criminal Contact" }],
  tools: ["Thieves' Tools"],
};

const sageBackground: Background = {
  name: "Sage",
  description: "A scholarly background with extensive knowledge.",
  boostableAbilityScores: ["int", "wis"] as AbilityKey[],
  tools: ["Calligrapher's Supplies"],
};

const soldierBackground: Background = {
  name: "Soldier",
  description: "A background of military service and discipline.",
  boostableAbilityScores: ["str", "dex", "con"] as AbilityKey[],
  feats: [{ savage_attack: "Savage Attacker" }],
  skills: ["Athletics", "Intimidation"],
  tools: ["Gaming Set"],
};

export const freeBackgrounds = [criminalBackground, sageBackground, soldierBackground];
