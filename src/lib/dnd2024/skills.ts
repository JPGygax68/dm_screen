import type { AbilityKey } from "@/lib/dnd2024/base.ts";

export interface Skill {
    id: string;
    ability: AbilityKey;
}

export const skills: Skill[] = [
    { id: "acrobatics", ability: "dex" },
    { id: "animal_handling", ability: "wis" },
    { id: "arcana", ability: "int" },
    { id: "athletics", ability: "str" },
    { id: "deception", ability: "cha" },
    { id: "history", ability: "int" },
    { id: "insight", ability: "wis" },
    { id: "intimidation", ability: "cha" },
    { id: "investigation", ability: "int" },
    { id: "medicine", ability: "wis" },
    { id: "nature", ability: "int" },
    { id: "perception", ability: "wis" },
    { id: "performance", ability: "cha" },
    { id: "persuasion", ability: "cha" },
    { id: "religion", ability: "int" },
    { id: "sleight_of_hand", ability: "dex" },
    { id: "stealth", ability: "dex" },
    { id: "survival", ability: "wis" }
] as const;

export const skillNamesMap_en: Record<string, string> = {
    acrobatics: "Acrobatics",
    animal_handling: "Animal Handling",
    arcana: "Arcana",
    athletics: "Athletics",
    deception: "Deception",
    history: "History",
    insight: "Insight",
    intimidation: "Intimidation",
    investigation: "Investigation",
    medicine: "Medicine",
    nature: "Nature",
    perception: "Perception",
    performance: "Performance",
    persuasion: "Persuasion",
    religion: "Religion",
    sleight_of_hand: "Sleight of Hand",
    stealth: "Stealth",
    survival: "Survival"
};