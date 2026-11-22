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
import { backgrounds } from "@/lib/dnd2024/backgrounds.ts";
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
  const hasChanges = computed(() =>
    formStateChanged(snapshotFormState(form.value), originalSnapshot.value)
  );

  // ===== VISIBILITY RULES =====

  /**
   * Whether versatility skill should be visible (humans only).
   */
  const isVersatilitySkillVisible = computed(() => form.value.species === "human");

  /**
   * Whether ancestry selection should be visible (dragonborn only).
   */
  const isAncestryVisible = computed(() => form.value.species === "dragonborn");

  /**
   * Whether custom background details should be shown.
   */
  const isCustomBackgroundDetailsVisible = computed(
    () => form.value.backgroundId === "custom"
  );

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

  // ===== ABILITY SCORE CALCULATIONS & VALIDATIONS =====

  /**
   * Primary ability scores for the character's class.
   */
  const primaryClassAbilities: Ref<AbilityKey[]> = computed(() => {
    const cls = classes.find((c) => c.id === form.value.pcClass);
    if (!cls) {
      console.error("Class not found:", form.value.pcClass);
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

  // ===== CLASS & BACKGROUND FEATURES =====

  /**
   * Saving throw proficiencies for the character's class.
   */
  const savingThrows = computed(() => {
    const result: Record<AbilityKey, boolean> = {} as Record<AbilityKey, boolean>;
    const classData = classes.find((c) => c.id === form.value.pcClass);
    if (!classData) {
      console.error("Class not found:", form.value.pcClass);
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

  // ===== HELPER FUNCTIONS =====

  /**
   * Check if a character has a specific species trait.
   */
  function pcHasTrait(trait: string): boolean {
    const item = speciesList.find((speciesItem) => speciesItem.id === form.value.species);
    return item?.traits.includes(trait) ?? false;
  }

  /**
   * Reset the form to defaults or hydrate from a character.
   */
  function resetForm(character?: PlayerCharacter): void {
    form.value = createPlayerCharacterFormState(character);
    originalSnapshot.value = snapshotFormState(form.value);
  }

  return {
    // State
    form,
    
    // Core computeds
    hasChanges,
    
    // Visibility rules
    isVersatilitySkillVisible,
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
    
    // Functions
    pcHasTrait,
    resetForm,
  };
}


