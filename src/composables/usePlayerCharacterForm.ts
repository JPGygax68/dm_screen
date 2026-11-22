import { computed, ref } from "vue";
import {
  createPlayerCharacterFormState,
  snapshotFormState,
  formStateChanged,
  type PlayerCharacterFormState,
} from "@/generated/composables/usePlayerCharacterForm.generated";
import type { PlayerCharacter } from "@/generated/models/data.schema";

/**
 * Composable for managing PlayerCharacter form state.
 * 
 * Generated base (from schema) handles:
 * - Form state shape and defaults
 * - Change tracking
 * - Type definitions
 * 
 * Handwritten logic adds:
 * - Visibility rules (which fields are shown when)
 * - Computed properties (derived state)
 * - Validation beyond schema constraints
 * - Domain-specific business logic
 */
export function usePlayerCharacterForm() {
  const form = ref<PlayerCharacterFormState>(createPlayerCharacterFormState());
  const originalSnapshot = ref(snapshotFormState(form.value));

  // ===== GENERATED MECHANICS (from base) =====
  const hasChanges = computed(() =>
    formStateChanged(snapshotFormState(form.value), originalSnapshot.value)
  );

  // ===== HANDWRITTEN DOMAIN LOGIC BELOW =====

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

  function resetForm(character?: PlayerCharacter): void {
    form.value = createPlayerCharacterFormState(character);
    originalSnapshot.value = snapshotFormState(form.value);
  }

  return {
    form,
    hasChanges,
    resetForm,
    // Handwritten visibility and validation computed properties
    isVersatilitySkillVisible,
    isAncestryVisible,
    isCustomBackgroundDetailsVisible,
  };
}

