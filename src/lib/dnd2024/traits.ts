/** @format */

export type Trait = {
  id: string;
  name_en: string;
  description_en: string;
};

/** Species traits defined in D&D 2024 source material.
 * Caution: a few of the traits are shared across multiple species.
 */
export const traits: readonly Trait[] = [
  /* Dwarf Traits */
  {
    id: "darkvision_120ft",
    name_en: "Darkvision 120ft",
    description_en: "You can see in darkness up to 120 feet as if it were dim light.",
  },
  {
    id: "dwarven_resilience",
    name_en: "Dwarven Resilience",
    description_en:
      "You have advantage on saving throws against poison and resistance against poison damage.",
  },
  {
    id: "dwarven_toughness",
    name_en: "Dwarven Toughness",
    description_en: "Your hit point maximum increases by 1 for every level you have.",
  },
  {
    id: "stonecunning",
    name_en: "Stonecunning",
    description_en:
      "You have a deep understanding of stonework and can identify stone structures and materials.",
  },
  /* Elf Traits */
  {
    id: "darkvision",
    name_en: "Darkvision",
    description_en: "You can see in darkness as if it were dim light.",
  },
  {
    id: "elven_lineage",
    name_en: "Elven Lineage",
    description_en:
      "You have a strong connection to your elven heritage, granting you abilities related to elves.",
  },
  {
    id: "keen_senses",
    name_en: "Keen Senses",
    description_en: "You have heightened senses, allowing you to notice details others might miss.",
  },
  {
    id: "fey_ancestry",
    name_en: "Fey Ancestry",
    description_en:
      "You have a mystical connection to the fey, granting you resistance to charm effects.",
  },
  {
    id: "trance",
    name_en: "Trance",
    description_en:
      "You can enter a meditative state instead of sleeping, remaining semi-conscious.",
  },
  /* Dragonborn Traits */
  {
    id: "breath_weapon",
    name_en: "Breath Weapon",
    description_en:
      "You can exhale destructive energy, dealing damage to creatures in a specific area.",
  },
  {
    id: "draconic_ancestry",
    name_en: "Draconic Ancestry",
    description_en: "You have a draconic heritage, granting you abilities related to dragons.",
  },
  {
    id: "damage_resistance",
    name_en: "Damage Resistance",
    description_en: "You have resistance to certain types of damage, reducing the damage you take.",
  },
  {
    id: "draconic_flight",
    name_en: "Draconic Flight",
    description_en: "You have the ability to fly, gaining a flying speed equal to your walking speed.",
  },
  /* Gnome Traits. Also standard darkvision (60ft) */
  {
    id: "gnomish_lineage",
    name_en: "Gnomish Lineage",
    description_en:
      "You have a strong connection to your gnomish heritage, granting you abilities related to gnomes.",
  },
  {
    id: "gnomish_cunning",
    name_en: "Gnomish Cunning",
    description_en:
      "You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.",
  },
  /* Goliath Traits */
  {
    id: "giant_ancestry",
    name_en: "Giant Ancestry",
    description_en:
      "You have a strong connection to your giant lineage, granting you abilities related to that lineage.",
  },
  {
    id: "powerful_build",
    name_en: "Powerful Build",
    description_en:
      "You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.",
  },
  {
    id: "large_form",
    name_en: "Large Form",
    description_en: "Bonus action to become Large-sized, increasing your speed and damage.",
  },
  /* Halfling Traits */
  {
    id: "lucky",
    name_en: "Lucky",
    description_en:
      "You have extraordinary luck on your side. Reroll any natural 1 on an attack roll, ability check, or saving throw",
  },
  {
    id: "brave",
    name_en: "Brave",
    description_en: "You have courage and are willing to face danger.",
  },
  {
    id: "halfling_nimbleness",
    name_en: "Halfling Nimbleness",
    description_en:
      "You can move through the space of any creature that is of a size larger than yours.",
  },
  {
    id: "naturally_stealthy",
    name_en: "Naturally Stealthy",
    description_en:
      "You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you.",
  },
  /* Human Traits */
  {
    id: "resourceful",
    name_en: "Resourceful",
    description_en: "You are able to find solutions and adapt to various situations.",
  },
  {
    id: "skillful",
    name_en: "Skillful",
    description_en: "You have proficiency in multiple skills.",
  },
  {
    id: "versatile",
    name_en: "Versatile",
    description_en: "You can adapt to a wide range of situations and challenges.",
  },
  /* Orc Traits: + improved darkvision (120 ft) */
  {
    id: "adrenaline_rush",
    name_en: "Adrenaline Rush",
    description_en: "Bonus action Dash that gives you temporary hit points",
  },
  {
    id: "relentless_endurance",
    name_en: "Relentless Endurance",
    description_en: "When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead.",
  },
  /* Tiefling Traits */
  {
    id: "fiendish_legacy",
    name_en: "Fiendish Legacy",
    description_en: "Choose Abyssal, Chthonic, or Infernal to unlock specific elemental resistance and innate spells.",
  },
  {
    id: "otherworldly_presence",
    name_en: "Otherworldly Presence",
    description_en: "You can cast Thaumaturgy as a cantrip.",
  }
];
