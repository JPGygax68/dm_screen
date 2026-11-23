<!-- @format -->

<script setup lang="ts">
import type { Ref } from "vue";
import { ref, computed, watch, nextTick, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import NumberStepper from "@/components/NumberStepper.vue";
import VuSlider from "@/components/VuSlider.vue";
import type { Campaign, PlayerCharacter } from "@/generated/models/data.schema";
import type { AbilityKey } from "@/lib/dnd2024/base.ts";
import { abilityKeys, abilityNamesMap_en } from "@/lib/dnd2024/base.ts";
import { classes } from "@/lib/dnd2024/classFeatures.ts";
import { BackgroundDef } from "@/lib/dnd2024/backgrounds.ts";
import { backgrounds, freeBackgrounds } from "@/lib/dnd2024/backgrounds.ts";
import { draconicAncestries, speciesList } from "@/lib/dnd2024/species.ts";
import { useDataStore } from "@/stores/data-store.ts";
import { useSkills } from "@/lib/dnd2024/skills";
import { usePlayerCharacterForm } from "@/composables/usePlayerCharacterForm";

const route = useRoute();
const router = useRouter();
const store = useDataStore();
const { roots } = storeToRefs(store);
const { skillNamesMap_en, skillsByAbility } = useSkills();

//#region Form state

const {
  form,
  resetForm,
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
  pcHasTrait,
} = usePlayerCharacterForm();

function hydrateEditor(): void {
  isEditorReady.value = false;
  isLoading.value = true;
  errorMessage.value = "";
  if (isNew.value) {
    resetForm();
    currentSection.value = "identity";
    isEditorReady.value = !!campaign.value;
    isLoading.value = false;
    return;
  }
  const character = playerCharacter.value;
  if (character) {
    resetForm(character);
    isEditorReady.value = true;
  }
  isLoading.value = false;
}

//#endregion

//#region View state

const isEditorReady = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref("");

const isDiscarding = ref(false);

const currentSection = ref("");

function onToggleDetails(event: Event): void {
  const target = event.target as HTMLDetailsElement;
  if (target.open) {
    //console.log(`Toggled open section: ${target.id}`);
    currentSection.value = target.id;
  } else {
    //console.log(`Toggled closed section: ${target.id}`);
  }
}

//#endregion

//#region Computed properties (route-dependent only)

const campaignId = computed(() => String(route.params.campaignId ?? ""));
const playerCharacterId = computed(() => String(route.params.playerCharacterId ?? ""));
const campaign = computed(() =>
  ((roots.value.campaigns ?? []) as Campaign[]).find((item) => item.id === campaignId.value),
);
const isNew = computed(() => !playerCharacterId.value);
const playerCharacter = computed(() =>
  campaign.value?.party.find((member) => member.id === playerCharacterId.value),
);

/**
 * Combines form state's hasChanges with editor ready state.
 * Shows unsaved changes only when editor is actively displayed.
 */
const hasUnsavedChanges = computed(
  () => isEditorReady.value && hasChanges.value,
);

//#endregion Computed properties

//#region Lifecycle hooks

watch([campaignId, playerCharacterId, () => roots.value.campaigns], hydrateEditor, {
  immediate: true,
});

const nameInput = useTemplateRef<HTMLInputElement>("nameInput");

// The form is rendered only once the editor is ready, so focus after it appears.
watch(
  isEditorReady,
  async (ready) => {
    if (!ready || !isNew.value) return;
    await nextTick();
    nameInput.value?.focus();
  },
  { immediate: true, flush: "post" },
);

onBeforeRouteLeave(confirmDiscard);
onBeforeRouteUpdate((to, from) => {
  if (to.params.playerCharacterId === from.params.playerCharacterId) return true;
  return confirmDiscard();
});

//#endregion Lifecycle hooks

//#region Methods

//#region Persistence Methods

// Optional text fields are left out when empty, as the schema rejects empty strings.
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
  if (form.value.customBackgroundName) fields.customBackgroundName = form.value.customBackgroundName;
  if (form.value.customBackgroundSkills?.length) fields.customBackgroundSkills = [...form.value.customBackgroundSkills];
  if (form.value.originStory) fields.originStory = form.value.originStory;
  return fields;
}

async function createPlayerCharacter(): Promise<void> {
  const parent = campaign.value;
  if (!parent || isSaving.value) return;

  isSaving.value = true;
  errorMessage.value = "";
  let draftId: string | undefined;
  try {
    draftId = store.beginDraft("PlayerCharacter", editableFields());
    await store.commitDraft(draftId, "PlayerCharacter", {
      type: "Campaign",
      id: parent.id,
      field: "party",
      collection: parent.party,
    });
    draftId = undefined;
    await cancelEditing();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to add player character.";
  } finally {
    if (draftId) store.cancelDraft(draftId);
    isSaving.value = false;
  }
}

async function savePlayerCharacter(): Promise<void> {
  if (isNew.value) return createPlayerCharacter();
  const current = playerCharacter.value;
  if (!current || isSaving.value) return;

  const updated: PlayerCharacter = { ...current, ...editableFields() };
  console.log;
  isSaving.value = true;
  errorMessage.value = "";
  try {
    await store.updateEntity("PlayerCharacter", updated);
    Object.assign(current, updated);
    await cancelEditing();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to save player character.";
  } finally {
    isSaving.value = false;
  }
}

async function deletePlayerCharacter(): Promise<void> {
  const parent = campaign.value;
  const current = playerCharacter.value;
  if (!parent || !current || isSaving.value) return;
  if (!window.confirm(`Delete ${current.name}? This cannot be undone.`)) return;

  isSaving.value = true;
  errorMessage.value = "";
  try {
    isDiscarding.value = true;
    await store.removeChild("PlayerCharacter", current.id, {
      type: "Campaign",
      id: parent.id,
      field: "party",
      collection: parent.party,
    });
    await cancelEditing();
  } catch (error) {
    isDiscarding.value = false;
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to delete player character.";
  } finally {
    isSaving.value = false;
  }
}

async function cancelEditing(): Promise<void> {
  isDiscarding.value = true;
  await router.push({
    name: "campaign-detail",
    params: { campaignId: campaignId.value },
  });
}

const availableBackgrounds: Ref<BackgroundDef[]> = ref([
  ...freeBackgrounds,
  { id: "custom", name_en: "Custom" },
]);

//#endregion Methods

// #region Dialogs

function confirmDiscard(): boolean {
  return (
    isDiscarding.value ||
    !hasUnsavedChanges.value ||
    window.confirm("Discard unsaved character changes?")
  );
}

// #endregion Dialogs
</script>

<template>
  <div class="h-full text-ink/65 overflow-y-auto scroll-shadow">
    <form v-if="isEditorReady" @submit.prevent="savePlayerCharacter" class="">
      <BetterDetails
        id="identity"
        group="player-character"
        :open="currentSection === 'identity'"
        @toggle="onToggleDetails"
      >
        <template #summary>
          <span>
            <span v-if="isNew">(New): </span>
            <span class="font-bold shrink">
              {{ form.name }}
              <span v-if="form.surname" class="hidden sm:inline">{{ form.surname }}</span>
            </span>
            <span v-if="identityClassName">&nbsp;· {{ identityClassName }}</span>
            <span v-if="identitySpeciesName">&nbsp;· {{ identitySpeciesName }}</span>
            <span v-if="identityGenderName">&nbsp;· {{ identityGenderName }}</span>
            <span v-if="identityBackground">&nbsp;· {{ identityBackground }}</span>
          </span>
        </template>
        <section
          class="grid grid-cols-[min-content_1fr] items-baseline gap-x-2 gap-y-2 py-3 sm:grid-cols-[min-content_1fr_min-content_1fr] [&>label]:justify-self-end [&>select>option]:box-border_p-0"
        >
          <label for="character-name">Name</label>
          <input id="character-name" ref="nameInput" type="text" v-model="form.name" />
          <label for="character-surname">Surname</label>
          <input id="character-surname" type="text" v-model="form.surname" />
          <label for="character-class">Class</label>
          <select id="character-class" v-model="form.pcClass">
            <option disabled value="">Select class</option>
            <option v-for="classItem in classes" :key="classItem.id" :value="classItem.id">
              {{ classItem.name }}
            </option>
          </select>
          <!-- Commented out for now: Subclass selection comes at level 3
          <label for="character-subclass">Subclass</label>
          <select
            id="character-subclass"
            class="select"
            v-model="characterSubclass"
          >
            <option disabled value="">Select subclass</option>
            <option>Champion</option>
            <option>Berserker</option>
            <option>Evocation</option>
            <option>Divination</option>
          </select> -->
          <label for="character-species" class="col-start-1">Species</label>
          <select
            id="character-species"
            v-model="form.species"
            placeholder="Select species"
            class="select"
          >
            <option disabled value="">Select species</option>
            <option
              v-for="speciesItem in speciesList"
              :key="speciesItem.id"
              :value="speciesItem.id"
            >
              {{ speciesItem.name_en }}
            </option>
          </select>
          <template v-if="form.species === 'dragonborn'">
            <label for="character-draconic-ancestry">Ancestry</label>
            <select
              id="character-draconic-ancestry"
              v-model="form.ancestry"
              placeholder="Select draconic ancestry"
              hint="Draconic Ancestry"
              class="select"
            >
              <option disabled value="">Select draconic ancestry</option>
              <option
                v-for="ancestry in draconicAncestries"
                :key="ancestry.id"
                :value="ancestry.id"
              >
                {{ ancestry.name_en }}
              </option>
            </select>
          </template>
          <label for="character-gender">Gender</label>
          <input id="character-gender" v-model="form.gender" list="character-gender-options" />
          <datalist id="character-gender-options">
            <option id="male" value="Male" />
            <option id="female" value="Female" />
            <option id="other" value="Other" />
          </datalist>
          <label for="character-background" class="col-start-1">Background</label>
          <select
            id="character-background"
            v-model="form.backgroundId"
            placeholder="Select background"
            class="select"
          >
            <option disabled value="">Select background</option>
            <option
              v-for="background in availableBackgrounds"
              :key="background.id"
              :value="background.id"
            >
              {{ background.name_en }}
            </option>
          </select>
          <template v-if="form.backgroundId === 'custom'">
            <label for="custom-background-name">↳ Name</label>
            <input id="custom-background-name" v-model="form.customBackgroundName" />
          </template>
        </section>
        <div v-if="!isNew" class="flex justify-end">
          <!-- TODO: color-code or even disable if background not selected -->
          <input
            type="button"
            class="button align-right"
            value="Next"
            @click="currentSection = 'combat-stats'"
          />
        </div>
      </BetterDetails>
      <BetterDetails
        id="combat-stats"
        v-if="!isNew"
        group="player-character"
        :open="currentSection === 'combat-stats'"
        @toggle="onToggleDetails"
        class="p-2 w-full"
      >
        <template #summary>
          <div class="w-full">
            <div class="group-open:hidden text-[80%] flex flex-row flex-wrap gap-x-2 gap-y-1">
              <span v-if="!form.pcClass">(No class selected yet ⟶ no primary abilities)</span>
              <span
                v-else
                v-for="(key, _) in abilityKeys"
                :key="key"
                class="shrink-0 border rounded-md py-0 after:not-last:content-[','] px-1 hidden sm:inline"
                :class="{
                  inline: !!abilityModifiers[key] || savingThrows[key],
                  'border-dashed': abilityModifiers[key] < 0,
                }"
              >
                <span
                  :class="{
                    'font-weight': primaryClassAbilities.includes(key) ? 'font-bold' : '',
                  }"
                  >{{ key.toUpperCase() }}
                </span>
                <!-- We only display the ability score on wider screens -->
                <span class="hidden sm:inline"
                  >: {{ form.abilityScores[key] }}
                  <!-- ... and the modifier (if any) is displayed in parentheses-->
                  <span v-if="!!abilityModifiers[key]">
                    (<span
                      :style="{
                        'font-weight': 400 + 150 * abilityModifiers[key],
                      }"
                      >{{ abilityModifiersAsText[key] }}</span
                    >)
                  </span>
                </span>
                <!-- On really small screens, we only display the modifier, without parentheses -->
                <span
                  id="modifier"
                  class="inline sm:hidden"
                  :style="{
                    'font-weight': 400 + 150 * abilityModifiers[key],
                  }"
                >
                  {{ " " + abilityModifiersAsText[key] + " " }}
                </span>
                <!-- We always display the saving throw icon if applicable -->
                <span v-if="savingThrows[key]">
                  <img
                    src="/assets/tw-dnd/icons/dice/roll.svg"
                    alt="Saving Throw"
                    class="w-4 inline opacity-50"
                  />
                </span>
              </span>
            </div>
            <div class="hidden group-open:block font-bold">Ability Scores</div>
          </div>
        </template>
        <table
          id="ability-scores"
          class="w-[calc(100%+1rem)] max-w-none table-fixed border-separate border-spacing-x-2 border-spacing-y-1 -mx-2 overflow-x-auto"
        >
          <thead>
            <tr class="*:overflow-x-hidden *:text-ellipsis">
              <th class="w-6/48 text-left">Ability</th>
              <th class="w-10/24 hidden sm:table-cell">Score</th>
              <th class="w-4/24"><div class="w-full sm:hidden">Base</div></th>
              <th class="w-4/48 text-center">
                <svg viewBox="0 0 110 110" class="h-5 w-5 inline fill-current stroke-current">
                  <use :href="`/assets/tw-dnd/icons/attribute/bonus.svg`" />
                </svg>
              </th>
              <th class="w-2/24 text-center">Final</th>
              <th class="w-2/24 text-center">Modifier</th>
              <th class="w-1/24 text-center">
                <svg viewBox="0 0 100 100" class="h-5 w-5 inline fill-current stroke-current">
                  <use :href="`/assets/tw-dnd/icons/dice/roll.svg`" />
                </svg>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in form.abilityScores" :key="key" class="align-baseline">
              <td
                class="align-baseline flex flex-row justify-between mr-1"
                :class="{ 'font-bold': primaryClassAbilities.includes(key) }"
              >
                <span class="inline">{{ key.charAt(0).toUpperCase() + key.slice(1) }}&nbsp;</span>
                <svg viewBox="0 0 100 100" class="h-5 w-5 inline fill-current stroke-current">
                  <use :href="`/assets/tw-dnd/icons/ability/${abilityNamesMap_en[key]}.svg`" />
                </svg>
              </td>
              <td class="hidden sm:table-cell align-middle">
                <VuSlider
                  v-model="form.abilityScores[key]"
                  :bonus="form.abilityBonuses[key]"
                  :min="8"
                  :max="20"
                  :cell-count="13"
                />
              </td>
              <td>
                <NumberStepper
                  :id="key"
                  v-model="form.abilityScores[key]"
                  :label="`${key} ability score`"
                  :min="8"
                  :max="18"
                  :step="1"
                  :digits="2"
                  :height="7"
                  :warning="baseAbilityScoreUiProps[key].warning"
                  :bg-classes="!!baseAbilityScoreUiProps[key].warning ? 'bg-warning-light' : ''"
                />
              </td>
              <td ability-bonus align="center">
                <NumberStepper
                  v-if="backgroundAllowsBoosting[key]"
                  :id="key + '-bonus'"
                  v-model="form.abilityBonuses[key]"
                  :label="`${key} ability bonus`"
                  :min="0"
                  :max="2"
                  :step="1"
                  :digits="1"
                  :height="7"
                  class=""
                />
                <input
                  v-else
                  type="number"
                  disabled
                  readonly
                  :value="form.abilityBonuses[key]"
                  class="w-[3ch]"
                />
              </td>
              <td class="text-center">
                <input
                  type="number"
                  readonly
                  tabindex="-1"
                  :value="finalAbilityScores[key]"
                  class="score-field"
                />
              </td>
              <td class="text-center">
                <input
                  type="text"
                  readonly
                  tabindex="-1"
                  disabled
                  :value="abilityModifiersAsText[key] || '-'"
                  class="w-[5ch] text-center"
                  :class="{
                    thick: !!abilityModifiers[key],
                    'border-dashed': abilityModifiers[key] < 0,
                  }"
                />
              </td>
              <td align="center">
                <input type="checkbox" disabled :checked="savingThrows[key]" />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="text-left overflow-visible">Available</td>
              <td class="hidden sm:table-cell"></td>
              <td>
                <div class="w-full flex flex-row justify-center">
                  <input
                    type="number"
                    readonly
                    :value="availableBaseAbilityScorePoints"
                    :class="{
                      success: availableBaseAbilityScorePoints == 0,
                      error: availableBaseAbilityScorePoints < 0,
                      warning: availableBaseAbilityScorePoints > 0,
                    }"
                    class="w-[4ch]"
                  />
                </div>
              </td>
              <td bonus-points>
                <input
                  type="number"
                  readonly
                  :value="availableAbilityBonusPoints"
                  :class="{
                    success: availableAbilityBonusPoints == 0,
                    error: availableAbilityBonusPoints < 0,
                    warning: availableAbilityBonusPoints > 0,
                  }"
                  class="w-[3ch]"
                />
              </td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <div class="flex justify-end">
          <input
            type="button"
            class="button align-right"
            value="Next"
            @click="currentSection = 'skills'"
          />
        </div>
      </BetterDetails>
      <BetterDetails
        v-if="!isNew"
        id="skills"
        group="player-character"
        :open="currentSection === 'skills'"
        @toggle="onToggleDetails"
      >
        <template #summary>
          <span class="font-bold">Skills</span>
          <span class="hidden group-open:inline">&nbsp;(TODO: Skill List)</span>
        </template>
        <div
          class="grid w-full grid-cols-[minmax(5rem,auto)_minmax(120px,auto)_minmax(100px,auto)] items-baseline gap-1"
        >
          <template v-if="hasVersatilityTrait">
            <label for="versatility-skill" class="mt-1 -mb-1">Versatility</label>
            <select id="versatility-skill" v-model="form.versatilitySkill" class="truncate">
              <optgroup
                v-for="attr in abilityKeys.filter((a) => skillsByAbility[a].length > 0)"
                :key="attr"
                :label="abilityNamesMap_en[attr]"
                class="capitalize"
              >
                <option v-for="skillId in skillsByAbility[attr]" :key="skillId" :value="skillId">
                  {{ skillNamesMap_en[skillId] }}
                </option>
              </optgroup>
            </select>
          </template>
          <template v-if="!form.backgroundId">
            <label class="mt-1 -mb-1 break-before-column col-start-1 col-span-full"
              >No Background selected yet</label
            >
          </template>
          <template v-else-if="form.backgroundId === 'custom'">
            <template v-if="!form.customBackgroundName">
              <!-- TODO: link to custom background name input -->
              <label class="mt-1 -mb-1 break-before-column col-start-1 col-span-full"
                >Custom background (not yet named):</label
              >
            </template>
            <template v-else>
              <label class="mt-1 -mb-1 break-before-column col-start-1"
                >{{ form.customBackgroundName }} (custom)</label
              >
            </template>
            <div class="mt-2 text-sm text-ink/70 col-span-full">
              TODO: Implement custom background skills selection here.
            </div>
          </template>
          <template v-else>
            <label class="mt-1 -mb-1 break-before-column col-start-1"
              >BG:&nbsp;{{ backgroundName }}</label
            >
            <input
              v-for="skillId in backgroundSkills"
              :key="skillId"
              :value="skillNamesMap_en[skillId]"
              readonly
            />
          </template>
        </div>
        <div v-if="!isNew" class="flex justify-end">
          <input
            type="button"
            class="button align-right"
            value="Next"
            @click="currentSection = 'origin'"
          />
        </div>
      </BetterDetails>
      <BetterDetails
        id="origin"
        group="player-character"
        :open="currentSection === 'origin'"
        @toggle="onToggleDetails"
        class="p-2 w-full"
      >
        <template #summary>
          <div class="w-full">
            <span class="font-bold"
              >Origin
              <span class="font-light"
                >({{ form.customBackgroundName || "yet unnamed background" }})</span
              ></span
            >
          </div>
        </template>
        <section>
          <label class="mt-1 -mb-1"
            >Story</label
          >
          <textarea
            v-model="form.originStory"
            class="w-full border border-ink/20 rounded-md p-2"
            rows="4"
          ></textarea>
        </section>
      </BetterDetails>
      <div id="action-buttons" class="mx-auto flex max-w-3xl justify-end gap-3 px-2 py-6 lg:px-10">
        <button
          v-if="!isNew"
          type="button"
          class="mr-auto bg-error-dark px-4 py-3 font-bold text-white transition hover:bg-error disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isSaving"
          @click="deletePlayerCharacter"
        >
          Delete
        </button>
        <button
          type="button"
          class="px-4 py-3 font-bold text-ink/70 transition hover:text-ink"
          @click="cancelEditing"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="bg-moss-dark px-4 py-3 font-bold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isSaving || !hasUnsavedChanges || !form.name.trim()"
        >
          {{ isSaving ? "Saving..." : isNew ? "Add to party" : "Save character" }}
        </button>
      </div>
    </form>
    <p v-else-if="isLoading" class="mx-auto max-w-3xl px-6 py-8 text-ink/60">
      Loading character...
    </p>
    <section id="not_found" v-else class="mx-auto max-w-3xl px-6 py-8">
      <p class="text-ink/70">Player character not found.</p>
      <button type="button" class="mt-4 text-moss-dark underline" @click="cancelEditing">
        Back to campaign
      </button>
    </section>
    <p
      id="error_message"
      v-if="errorMessage"
      class="mx-auto max-w-3xl px-6 pb-8 text-red-700"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<style scoped lang="css">

@reference "@/styles/tailwind.css";

table tr > *[bonus-points] {
  @apply text-center justify-center;
}

input:not([type="checkbox"]) {
  @apply border border-ink/20 rounded-md px-2;
}

input[type="checkbox"] {
  @apply appearance-none h-4 w-4 rounded border-2 border-ink/80 bg-white 
         checked:bg-ink/60 checked:border-ink/20 
         focus:outline-none focus:ring-2 focus:ring-ink/40 focus:ring-offset-2
         transition-all duration-150 cursor-pointer;
}

input[type="checkbox"]:disabled {
  @apply border-ink/20;
}

input[type="number"] {
  /* @apply h-7; */
}

input {
  &.score-field {
    @apply h-7;
    @apply w-[4ch];
  }
  &[readonly] {
    @apply bg-ink/10;
  }
  &.success {
    @apply bg-success-light border-success text-success-dark;
  }
  &.warning {
    @apply bg-warning-light border-warning text-warning-dark;
  }
  &.error {
    @apply bg-error-light border-error text-error-dark;
  }
  &.thick {
    @apply border-3 border-ink/60 font-bold;
  }
}

select {
  @apply h-7 px-1 py-0 border-transparent border-r-4 outline-1 outline-ink/20 rounded-md pr-2;
}
</style>
