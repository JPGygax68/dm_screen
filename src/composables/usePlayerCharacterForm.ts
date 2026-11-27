/** @format */

import { computed, ref } from "vue";
import type { Ref } from "vue";
import {
  createPlayerCharacterFormState,
  snapshotFormState,
  formStateChanged,
  type PlayerCharacterFormState,
} from "@/generated/composables/usePlayerCharacterForm.generated";
import type { PlayerCharacter } from "@/generated/models/data.schema";
import type { AbilityKey } from "@/lib/dnd2024/base.ts";
import { abilityKeys } from "@/lib/dnd2024/base.ts";
import { classes } from "@/lib/dnd2024/classFeatures.ts";
import type { BackgroundDef } from "@/lib/dnd2024/backgrounds.ts";
import { backgrounds, freeBackgrounds } from "@/lib/dnd2024/backgrounds.ts";
import { speciesList } from "@/lib/dnd2024/species.ts";

/**
 * Composable for managing PlayerCharacter form state and all derived computations.
 *
 * Generated base (from schema) handles:
 * - Form state shape and defaults
 * - Change tracking
 * - Type definitions
 *
 * Handwritten logic adds:
 * - Visibility rules (which fields are shown when)
 * - Ability score calculations and validations
 * - Background and class-specific logic
 * - Display formatting for UI
 * - All domain-specific business logic
 */
export function usePlayerCharacterForm() {
  const form = ref<PlayerCharacterFormState>(createPlayerCharacterFormState());
  const originalSnapshot = ref(snapshotFormState(form.value));

  // ===== GENERATED MECHANICS (from base) =====

  /**
   * Reset the form to defaults or hydrate from a character.
   */
  function resetForm(character?: PlayerCharacter): void {
    form.value = createPlayerCharacterFormState(character);
    originalSnapshot.value = snapshotFormState(form.value);
  }

  const hasChanges = computed(() =>
    formStateChanged(snapshotFormState(form.value), originalSnapshot.value),
  );

  // ===== VISIBILITY RULES =====

  /**
   * Whether ancestry selection should be visible (dragonborn only).
   */
  const isAncestryVisible = computed(() => form.value.species === "dragonborn");

  /**
   * Whether custom background details should be shown.
   */
  const isCustomBackgroundDetailsVisible = computed(() => form.value.backgroundId === "custom");

  /**
   * Whether character has the versatility trait (checks species data).
   */
  const hasVersatilityTrait = computed(() => {
    const speciesData = speciesList.find((s) => s.id === form.value.species);
    return speciesData?.traits?.includes("versatility") ?? false;
  });

  // ===== IDENTITY & DISPLAY FORMATTING =====

  /**
   * Display name of the character's primary class.
   */
  const identityClassName = computed(
    () => classes.find((classItem) => classItem.id === form.value.pcClass)?.name,
  );

  /**
   * Display name of the character's species.
   */
  const identitySpeciesName = computed(
    () => speciesList.find((speciesItem) => speciesItem.id === form.value.species)?.name_en,
  );

  /**
   * Display of the character's gender.
   */
  const identityGenderName = computed(() => (form.value.gender ? form.value.gender : ""));

  /**
   * Gender icon (♂, ♀, or empty).
   */
  const identityGenderIcon = computed(() => {
    switch (form.value.gender) {
      case "male":
        return "♂";
      case "female":
        return "♀";
      default:
        return "";
    }
  });

  /**
   * Full background name, handling custom backgrounds.
   */
  const identityBackground = computed(() => {
    if (form.value.backgroundId === "custom") {
      return form.value.customBackgroundName ?? "(Undefined Custom)";
    }
    return backgrounds.find((bg) => bg.id === form.value.backgroundId)?.name_en ?? "";
  });

  /**
   * Background name (same as identityBackground, for consistency).
   */
  const backgroundName = computed(() => {
    return (
      backgrounds.find((bg) => bg.id === form.value.backgroundId)?.name_en ??
      `(?${form.value.backgroundId})`
    );
  });

  /**
   * List of skills granted by the current background.
   */
  const backgroundSkills = computed(() => {
    const bgId = form.value.backgroundId;
    if (bgId === "custom") {
      return form.value.customBackgroundSkills ?? [];
    }
    return backgrounds.find((bg) => bg.id === bgId)?.skills ?? [];
  });

  const allSkills = computed(() => {
    const skills: string[] = [];
    if (hasVersatilityTrait.value && form.value.versatilitySkill) {
      skills.push(form.value.versatilitySkill);
    }
    if (form.value.backgroundId === "custom") {
      skills.push(...(form.value.customBackgroundSkills ?? []));
    } else {
      skills.push(...(backgroundSkills.value ?? []));
    }
    return skills;
  });

  // ===== ABILITY SCORE CALCULATIONS & VALIDATIONS =====

  /**
   * Primary ability scores for the character's class.
   */
  const primaryClassAbilities: Ref<AbilityKey[]> = computed(() => {
    const cls = classes.find((c) => c.id === form.value.pcClass);
    if (!cls) {
      //console.error("Class not found:", form.value.pcClass);
      return [];
    }
    return Array.isArray(cls.primary_ability)
      ? cls.primary_ability.map((a) => a.toLowerCase() as AbilityKey)
      : [cls.primary_ability.toLowerCase() as AbilityKey];
  });

  /**
   * Sum of all base ability scores.
   */
  const baseAbilityScoresTotal = computed(() => {
    return Object.values(form.value.abilityScores).reduce((sum, val) => sum + val, 0);
  });

  /**
   * Sum of all ability bonuses.
   */
  const abilityBonusesTotal = computed(() => {
    return Object.values(form.value.abilityBonuses).reduce((sum, val) => sum + val, 0);
  });

  /**
   * Remaining points available for base ability scores (72 point buy system).
   */
  const availableBaseAbilityScorePoints = computed(() => {
    return 72 - baseAbilityScoresTotal.value;
  });

  /**
   * Remaining points available for ability bonuses (usually 3 points).
   */
  const availableAbilityBonusPoints = computed(() => {
    return 3 - abilityBonusesTotal.value;
  });

  /**
   * Final ability scores after applying bonuses.
   */
  const finalAbilityScores = computed(() => {
    const scores: Record<AbilityKey, number> = {} as Record<AbilityKey, number>;
    (Object.keys(form.value.abilityScores) as AbilityKey[]).forEach((key) => {
      scores[key] = form.value.abilityScores[key] + (form.value.abilityBonuses[key] ?? 0);
    });
    return scores;
  });

  /**
   * Ability modifiers derived from final scores ((score - 10) / 2).
   */
  const abilityModifiers = computed(() => {
    const modifiers: Record<AbilityKey, number> = {} as Record<AbilityKey, number>;
    (Object.keys(finalAbilityScores.value) as AbilityKey[]).forEach((key) => {
      modifiers[key] = Math.floor((finalAbilityScores.value[key] - 10) / 2);
    });
    return modifiers;
  });

  /**
   * Ability modifiers formatted as text (e.g., "+2", "-1", "").
   */
  const abilityModifiersAsText = computed(() => {
    const modifiersText: Record<AbilityKey, string> = {} as Record<AbilityKey, string>;
    (Object.keys(abilityModifiers.value) as AbilityKey[]).forEach((key) => {
      const value = abilityModifiers.value[key];
      modifiersText[key] = value === 0 ? "" : value >= 0 ? `+${value}` : `${value}`;
    });
    return modifiersText;
  });

  /**
   * UI properties for each ability score (warnings, highlights).
   */
  const baseAbilityScoreUiProps = computed(() => {
    const props: Record<AbilityKey, { isLowest: boolean; isHighest: boolean; warning: string }> =
      {} as any;
    let lowest = 99;
    let highest = -99;
    (Object.keys(form.value.abilityScores) as AbilityKey[]).forEach((key) => {
      const value = form.value.abilityScores[key];
      if (value < lowest) lowest = value;
      if (value > highest) highest = value;
    });
    let highestScoreIsOneOfPrimaries = false;
    (Object.keys(form.value.abilityScores) as AbilityKey[]).forEach((key) => {
      const value = form.value.abilityScores[key];
      const isPrimary = primaryClassAbilities.value.includes(key);
      if (isPrimary && value === highest) {
        highestScoreIsOneOfPrimaries = true;
      }
      props[key] = {
        isLowest: value === lowest,
        isHighest: value === highest,
        warning: (() => {
          if (isPrimary && value < highest && !highestScoreIsOneOfPrimaries) {
            return "One of the primary abilities should be the highest";
          }
          if (isPrimary && Math.floor((value - 10) / 2) <= 0) {
            return "A primary ability score should be high enough to confer a bonus without modifiers, i.e. be 12 or higher";
          }
          return "";
        })(),
      };
    });
    return props;
  });

  // const customBackgroundSkillStates = computed(() => {
  //   console.log(form.value.customBackgroundSkills)
  //   return form.value.customBackgroundSkills.map((skill, index) => {
  //     const isLast = index === form.value.customBackgroundSkills.length - 1;
  //     return {
  //       enabled: isLast,
  //     };
  //   });
  // });

  // ===== CLASS & BACKGROUND FEATURES =====

  /**
   * Saving throw proficiencies for the character's class.
   */
  const savingThrows = computed(() => {
    const result: Record<AbilityKey, boolean> = {} as Record<AbilityKey, boolean>;
    const classData = classes.find((c) => c.id === form.value.pcClass);
    if (!classData) {
      //console.error("Class not found:", form.value.pcClass);
      return result;
    }
    abilityKeys.values().forEach((key) => {
      result[key] = classData.saving_throws.includes(key.toUpperCase());
    });
    return result;
  });

  /**
   * Which abilities can be boosted by the current background.
   */
  const backgroundAllowsBoosting = computed(() => {
    const result: Record<AbilityKey, boolean> = {} as Record<AbilityKey, boolean>;
    if (form.value.backgroundId === "custom") {
      for (const key of Object.keys(finalAbilityScores.value) as AbilityKey[]) {
        result[key] = true;
      }
      return result;
    }
    const backgroundData = backgrounds.find((b) => b.id === form.value.backgroundId);
    if (!backgroundData) return result;
    (Object.keys(finalAbilityScores.value) as AbilityKey[]).forEach((key) => {
      result[key] = backgroundData.boostableAbilityScores?.includes(key) ?? false;
    });
    return result;
  });

  const availableBackgrounds: Ref<BackgroundDef[]> = ref([
    ...freeBackgrounds,
    { id: "custom", name_en: "Custom" },
  ]);

  // ===== HELPER FUNCTIONS =====

  /**
   * Check if a character has a specific species trait.
   */
  const pcHasTrait = computed(() => {
    const item = speciesList.find((speciesItem) => speciesItem.id === form.value.species);
    return (trait: string): boolean => item?.traits.includes(trait) ?? false;
  });

  /**
   * Extract editable fields from form state for persistence.
   * Optional text fields are left out when empty, as the schema rejects empty strings.
   */
  function editableFields(): Partial<PlayerCharacter> {
    const fields: Partial<PlayerCharacter> = {
      name: form.value.name.trim(),
      abilityScores: { ...form.value.abilityScores },
      abilityBonuses: { ...form.value.abilityBonuses },
    };
    const trimmedSurname = form.value.surname.trim();
    const trimmedGender = form.value.gender.trim();
    if (trimmedSurname) fields.surname = trimmedSurname;
    if (form.value.pcClass) fields.classes = [form.value.pcClass];
    if (form.value.species) fields.species = form.value.species;
    if (form.value.versatilitySkill) fields.versatilitySkill = form.value.versatilitySkill;
    if (form.value.ancestry) fields.ancestry = form.value.ancestry;
    if (trimmedGender) fields.gender = trimmedGender;
    if (form.value.backgroundId) fields.backgroundId = form.value.backgroundId;
    if (form.value.customBackgroundName)
      fields.customBackgroundName = form.value.customBackgroundName;
    if (form.value.customBackgroundSkills?.length)
      fields.customBackgroundSkills = [...form.value.customBackgroundSkills];
    if (form.value.originStory) fields.originStory = form.value.originStory;
    return fields;
  }

  return {
    // State
    form,

    // Core computeds
    hasChanges,

    // Visibility rules
    isAncestryVisible,
    isCustomBackgroundDetailsVisible,
    hasVersatilityTrait,

    // Identity & display formatting
    identityClassName,
    identitySpeciesName,
    identityGenderName,
    identityGenderIcon,
    identityBackground,
    backgroundName,
    backgroundSkills,

    // Ability score calculations
    primaryClassAbilities,
    baseAbilityScoresTotal,
    abilityBonusesTotal,
    availableBaseAbilityScorePoints,
    availableAbilityBonusPoints,
    finalAbilityScores,
    abilityModifiers,
    abilityModifiersAsText,
    baseAbilityScoreUiProps,

    // Class & background features
    savingThrows,
    backgroundAllowsBoosting,
    availableBackgrounds,

    // Miscellaneous
    allSkills,

    // Functions
    pcHasTrait,
    resetForm,
    editableFields,
  };
}
