<!-- @format -->

<template>
  <div
    class="h-full text-ink/65 overflow-y-auto mask-alpha animate-scroll-fade [scroll-timeline-name:--scroller] [animation-timeline:--scroller] [animation-range:0_10px] [animation-fill-mode:forwards]"
  >
    <form v-if="isEditorReady" @submit.prevent="savePlayerCharacter" class="">
      <BetterDetails id="identity" group="player-character" :open="currentSection === 1">
        <template #summary>
          <span class="text-sm">
            <span class="font-bold shrink">
              {{ characterName }}
              <span v-if="characterSurname" class="hidden sm:inline">{{ characterSurname }}</span>
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
          <label class="text-sm" for="character-name">Name</label>
          <input id="character-name" type="text" v-model="characterName" />
          <label class="text-sm" for="character-surname">Surname</label>
          <input id="character-surname" type="text" v-model="characterSurname" />
          <label class="text-sm" for="character-class">Class</label>
          <select id="character-class" v-model="characterClass">
            <option disabled value="">Select class</option>
            <option v-for="classItem in classes" :key="classItem.id" :value="classItem.id">
              {{ classItem.name }}
            </option>
          </select>
          <!-- Commented out for now: Subclass selection comes at level 3
          <label class="text-sm" for="character-subclass">Subclass</label>
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
          <label class="text-sm" for="character-species">Species</label>
          <select
            id="character-species"
            v-model="characterSpecies"
            placeholder="Select species"
            class="select"
          >
            <option disabled value="">Select species</option>
            <option v-for="speciesItem in species" :key="speciesItem.id" :value="speciesItem.id">
              {{ speciesItem.name }}
            </option>
          </select>
          <label class="text-sm" for="character-gender">Gender</label>
          <input
            id="character-gender"
            v-model="characterGender"
            list="character-gender-options"
            required
            minlength="1"
          />
          <datalist id="character-gender-options">
            <option id="male" value="Male" />
            <option id="female" value="Female" />
            <option id="other" value="Other" />
          </datalist>
          <label class="text-sm" for="character-background">Background</label>
          <select
            id="character-background"
            v-model="characterBackground"
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
            <!-- TODO: handle custom background definition -->
          </select>
        </section>
        <div class="flex justify-end">
          <input
            type="button"
            class="button align-right"
            value="Next"
            @click="currentSection = 2"
          />
        </div>
      </BetterDetails>
      <BetterDetails id="combat-stats" group="player-character" :open="currentSection === 2" class="p-2 w-full">
        <template #summary>
          <div class="w-full text-sm">
            <div class="group-open:hidden text-[80%] flex flex-row flex-wrap gap-x-2 gap-y-1">
              <span
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
                  >: {{ abilityScores[key] }}
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
            <tr v-for="(value, key) in abilityScores" :key="key" class="align-baseline">
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
                <div
                  @touchstart.prevent="handleAttributeDragStartEvent"
                  @touchmove.prevent="handleAttributeDragTouchMove"
                  @mousedown.prevent="handleAttributeDragStartEvent"
                  @mousemove.prevent="handleAttributeDragMouseMove"
                  @mouseup.prevent="handleAttributeDragMouseUp"
                  :data-ability-score-name="key"
                  class="flex flex-row gap-0.5"
                >
                  <span
                    v-for="n in 13"
                    :class="
                      7 + n > finalAbilityScores[key]
                        ? 'bg-ink/20'
                        : 7 + n > abilityScores[key]
                          ? 'bg-blue-600/50'
                          : 'bg-ink/50'
                    "
                    :data-value="n + 7"
                    class="ability-score-cell text-[0.5rem] text-ink/20 w-3 h-7 grow"
                    >{{ n + 7 }}</span
                  >
                </div>
              </td>
              <td>
                <NumberStepper
                  :id="key"
                  v-model="abilityScores[key]"
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
                  v-model="abilityBonuses[key]"
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
                  :value="abilityBonuses[key]"
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
            @click="currentSection = 3"
          />
        </div>
      </BetterDetails>
      <BetterDetails id="skills" group="player-character" :open="currentSection === 3">
        <template #summary> Skills </template>
        <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          <div
            v-for="ability in abilityKeys"
            :key="ability"
            :id="`skillset-${ability}`"
            class="sm:min-w-8 p-1 border rounded-lg"
          >
            <h3 class="text-lg font-bold capitalize">
              {{ abilityNamesMap_en[ability] }}
            </h3>
            <ul>
              <li
                v-for="skill in skills.filter((s: Skill) => s.ability === ability)"
                :key="skill.id"
              >
                <label>{{ skillNamesMap_en[skill.id] }}</label>
              </li>
            </ul>
          </div>
        </div>
                <div class="flex justify-end">
          <input
            type="button"
            class="button align-right"
            value="Next"
            @click="currentSection = 1"
          />
        </div>
      </BetterDetails>
      <div id="action-buttons" class="mx-auto flex max-w-3xl justify-end gap-3 px-2 py-6 lg:px-10">
        <button
          type="button"
          class="px-4 py-3 text-sm font-bold text-ink/70 transition hover:text-ink"
          @click="cancelEditing"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="bg-moss-dark px-4 py-3 text-sm font-bold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="
            isSaving ||
            !hasUnsavedChanges ||
            !characterName.trim() ||
            !characterClass ||
            !characterSpecies ||
            !characterGender.trim()
          "
        >
          {{ isSaving ? "Saving..." : "Save character" }}
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
      class="mx-auto max-w-3xl px-6 pb-8 text-sm text-red-700"
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
  @apply h-7 px-1 py-0 border-transparent border-r-4 outline-1 outline-ink/20 rounded-md pr-10;
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import type { Ref } from "vue";
import NumberStepper from "@/components/NumberStepper.vue";
import type {
  AbilityScores,
  AbilityBonuses,
  Campaign,
  PlayerCharacter,
} from "@/generated/models/data.schema";
import type { AbilityKey } from "@/lib/dnd2024/base.ts";
import { abilityKeys, abilityNamesMap_en } from "@/lib/dnd2024/base.ts";
import { classes } from "@/lib/dnd2024/classFeatures.ts";
import type { Background } from "@/lib/dnd2024/backgrounds.ts";
import { backgrounds, freeBackgrounds } from "@/lib/dnd2024/backgrounds.ts";
import { species } from "@/lib/dnd2024/species.ts";
import { useDataStore } from "@/stores/data-store.ts";
import { Skill, skillNamesMap_en, skills } from "@/lib/dnd2024/skills";

const route = useRoute();
const router = useRouter();
const store = useDataStore();
const { roots } = storeToRefs(store);

const initialAbilityScores: AbilityScores = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
} as const;

const abilityBonuses: Ref<AbilityBonuses> = ref({
  str: 0,
  dex: 0,
  con: 0,
  int: 0,
  wis: 0,
  cha: 0,
});

const abilityScores: Ref<AbilityScores> = ref({
  ...initialAbilityScores,
});
const isEditorReady = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref("");

const touchedAbilityScore = ref<AbilityKey>();

const characterName = ref("");
const characterSurname = ref("");
const characterClass = ref("");
const characterSubclass = ref("");
const characterBackground = ref("");
const characterSpecies = ref("");
const characterGender = ref("");
const originalFormSnapshot = ref("");
const isDiscarding = ref(false);

const currentSection = ref(0);

const identityClassName = computed(
  () => classes.find((classItem) => classItem.id === characterClass.value)?.name,
);
const identitySpeciesName = computed(
  () => species.find((speciesItem) => speciesItem.id === characterSpecies.value)?.name,
);
const identityBackground = computed(() => {
  if (characterBackground.value === "custom") {
    return "Custom"; // TODO: replace with the actual name of the custom background
  }
  return backgrounds.find((background) => background.id === characterBackground.value)?.name_en;
});
const identityGenderName = computed(() => (characterGender.value ? characterGender.value : ""));
const identityGenderIcon = computed(() => {
  switch (characterGender.value) {
    case "male":
      return "♂";
    case "female":
      return "♀";
    default:
      return "";
  }
});

const campaignId = computed(() => String(route.params.campaignId ?? ""));
const playerCharacterId = computed(() => String(route.params.playerCharacterId ?? ""));
const campaign = computed(() =>
  ((roots.value.campaigns ?? []) as Campaign[]).find((item) => item.id === campaignId.value),
);
const playerCharacter = computed(() =>
  campaign.value?.party.find((member) => member.id === playerCharacterId.value),
);

function formSnapshot(): string {
  return JSON.stringify({
    name: characterName.value,
    surname: characterSurname.value,
    classId: characterClass.value,
    species: characterSpecies.value,
    gender: characterGender.value,
    background: characterBackground.value,
    abilityScores: abilityScores.value,
    abilityBonuses: abilityBonuses.value,
  });
}

const hasUnsavedChanges = computed(
  () => isEditorReady.value && formSnapshot() !== originalFormSnapshot.value,
);

function hydrateEditor(): void {
  isEditorReady.value = false;
  isLoading.value = true;
  errorMessage.value = "";
  const character = playerCharacter.value;
  if (character) {
    characterName.value = character.name;
    characterSurname.value = character.surname ?? "";
    characterClass.value = character.classes[0] ?? "";
    characterSpecies.value = character.species;
    characterGender.value = character.gender;
    characterBackground.value = character.background ?? "";
    abilityScores.value = {
      ...initialAbilityScores,
      ...character.abilityScores,
    };
    abilityBonuses.value = {
      ...abilityBonuses.value,
      ...character.abilityBonuses,
    };
    originalFormSnapshot.value = formSnapshot();
    isEditorReady.value = true;
  }
  isLoading.value = false;
}

watch([campaignId, playerCharacterId, () => roots.value.campaigns], hydrateEditor, {
  immediate: true,
});

function confirmDiscard(): boolean {
  return (
    isDiscarding.value ||
    !hasUnsavedChanges.value ||
    window.confirm("Discard unsaved character changes?")
  );
}

onBeforeRouteLeave(confirmDiscard);
onBeforeRouteUpdate((to, from) => {
  if (to.params.playerCharacterId === from.params.playerCharacterId) return true;
  return confirmDiscard();
});

async function savePlayerCharacter(): Promise<void> {
  const current = playerCharacter.value;
  if (!current || isSaving.value) return;

  const updated: PlayerCharacter = {
    ...current,
    name: characterName.value.trim(),
    surname: characterSurname.value.trim(),
    classes: [characterClass.value],
    species: characterSpecies.value,
    gender: characterGender.value.trim(),
    background: characterBackground.value,
    abilityScores: { ...abilityScores.value },
    abilityBonuses: { ...abilityBonuses.value },
  };

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

async function cancelEditing(): Promise<void> {
  isDiscarding.value = true;
  await router.push({
    name: "campaign-detail",
    params: { campaignId: campaignId.value },
  });
}

const availableBackgrounds: Ref<Background[]> = ref([
  ...freeBackgrounds,
  { id: "custom", name_en: "Custom" },
]);

// #region Computed's

const baseAbilityScoreUiProps = computed(() => {
  const props: Record<AbilityKey, { isLowest: boolean; isHighest: boolean; warning: string }> =
    {} as any;
  let lowest = 99;
  let highest = -99;
  (Object.keys(abilityScores.value) as AbilityKey[]).forEach((key) => {
    const value = abilityScores.value[key];
    if (value < lowest) lowest = value;
    if (value > highest) highest = value;
  });
  let highestScoreIsOneOfPrimaries = false;
  (Object.keys(abilityScores.value) as AbilityKey[]).forEach((key) => {
    const value = abilityScores.value[key];
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

const baseAbilityScoresTotal = computed(() => {
  return Object.values(abilityScores.value).reduce((sum, val) => sum + val, 0);
});

const primaryClassAbilities: Ref<AbilityKey[]> = computed(() => {
  // Consult the class features and extract the primary abilities for the class
  const cls = classes.find((c) => c.id === characterClass.value);
  if (!cls) {
    console.error("Class not found:", characterClass.value);
    return [];
  }
  return Array.isArray(cls.primary_ability)
    ? cls.primary_ability.map((a) => a.toLowerCase() as AbilityKey)
    : [cls.primary_ability.toLowerCase() as AbilityKey];
});

const finalAbilityScores = computed(() => {
  const scores: Record<AbilityKey, number> = {} as Record<AbilityKey, number>;
  (Object.keys(abilityScores.value) as AbilityKey[]).forEach((key) => {
    scores[key] = abilityScores.value[key] + (abilityBonuses.value[key] ?? 0);
  });
  return scores;
});

const abilityBonusesTotal = computed(() => {
  return Object.values(abilityBonuses.value).reduce((sum, val) => sum + val, 0);
});

const availableBaseAbilityScorePoints = computed(() => {
  return 72 - baseAbilityScoresTotal.value;
});

const availableAbilityBonusPoints = computed(() => {
  return 3 - abilityBonusesTotal.value;
});

const savingThrows = computed(() => {
  const result: Record<AbilityKey, boolean> = {} as Record<AbilityKey, boolean>;
  const classData = classes.find((c) => c.id === characterClass.value);
  if (!classData) {
    console.error("Class not found:", characterClass.value);
    return result;
  }
  abilityKeys.values().forEach((key) => {
    result[key] = classData.saving_throws.includes(key.toUpperCase());
  });
  return result;
});

const abilityModifiers = computed(() => {
  const modifiers: Record<AbilityKey, number> = {} as Record<AbilityKey, number>;
  (Object.keys(finalAbilityScores.value) as AbilityKey[]).forEach((key) => {
    modifiers[key] = Math.floor((finalAbilityScores.value[key] - 10) / 2);
  });
  return modifiers;
});

const abilityModifiersAsText = computed(() => {
  const modifiersText: Record<AbilityKey, string> = {} as Record<AbilityKey, string>;
  (Object.keys(abilityModifiers.value) as AbilityKey[]).forEach((key) => {
    const value = abilityModifiers.value[key];
    modifiersText[key] = value === 0 ? "" : value >= 0 ? `+${value}` : `${value}`;
  });
  return modifiersText;
});

const backgroundAllowsBoosting = computed(() => {
  const result: Record<AbilityKey, boolean> = {} as Record<AbilityKey, boolean>;
  if (characterBackground.value === "custom") {
    console.log("Custom background allows boosting for all abilities.");
    for (const key of Object.keys(finalAbilityScores.value) as AbilityKey[]) {
      result[key] = true;
    }
    return result;
  }
  const backgroundData = backgrounds.find((b) => b.id === characterBackground.value);
  if (!backgroundData) return result;
  (Object.keys(finalAbilityScores.value) as AbilityKey[]).forEach((key) => {
    result[key] = backgroundData.boostableAbilityScores?.includes(key) ?? false;
  });
  return result;
});

// #endregion Computed's

// #region Event Handlers

const handleAttributeDragStartEvent = (event: Event) => {
  // The mouse down or touch start event could fall on a cell within the ability score bar,
  // or between cells on the bar itself.
  const target = event.target as HTMLElement;
  const cell = target.closest(".ability-score-cell") as HTMLElement | null;
  if (!cell) {
    console.warn("No cell found for the drag start event.");
    return;
  }
  const bar = cell.parentElement as HTMLElement | null;
  if (!bar) {
    console.warn("No parent element found for the drag start cell.");
    return;
  }
  const attribKey = bar.dataset.abilityScoreName as AbilityKey;
  if (!attribKey) return;
  touchedAbilityScore.value = attribKey;
};

const handleAttributeDragTouchMove = (event: TouchEvent) => {
  const touch = event.touches[0];
  return handlePointerMove(touch.clientX, touch.clientY);
};

function handleAttributeDragMouseMove(event: MouseEvent) {
  return handlePointerMove(event.clientX, event.clientY);
}

function handleAttributeDragMouseUp(event: MouseEvent) {
  touchedAbilityScore.value = undefined;
}

function handlePointerMove(x: number, y: number) {
  const cell = getElementAtLocation(x, y);
  if (!cell) return;
  const bar = cell.parentElement;
  if (!bar) return;
  const abilityScoreName = bar.dataset.abilityScoreName as AbilityKey;
  if (!abilityScoreName || touchedAbilityScore.value !== abilityScoreName) return;
  if (!cell.dataset.value) return;
  const value = parseInt(cell.dataset.value, 10);
  abilityScores.value[abilityScoreName] = value;
}

// #endregion Event Handlers

// #region Helper Functions

function getElementAtLocation(x: number, y: number): HTMLElement | null {
  return document.elementFromPoint(x, y) as HTMLElement | null;
}

// #endregion Helper Functions
</script>
