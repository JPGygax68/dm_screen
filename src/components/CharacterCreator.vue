<template>
  <main class="min-h-dvh">
    <header class="border-b border-ink/20 bg-moss-dark text-paper">
      <div
        class="mx-auto flex max-w-6xl items-end justify-between gap-6 px-4 py-2 sm:px-6 sm:portrait:py-4 xl:py-8 xl:px-10"
      >
        <div class="flex flex-row items-baseline gap-6 portrait:gap-2 lg:gap-2 portrait:flex-col lg:flex-col">
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-copper order-2 lg:order-1 portrait:order-1">
            Dungeon Master workspace
          </p>
          <h1 class="font-display text-2xl leading-tight sm:text-3xl order-1">
            Character Creator
          </h1>
        </div>
      </div>
    </header>

    <form>
      <section
        id="identity"
        class="mx-auto max-w-3xl px-2 py-4 lg:px-10 grid grid-cols-[min-content_1fr] sm:grid-cols-[min-content_1fr_min-content_1fr] [&>label]:justify-self-end gap-y-2 gap-x-3 items-baseline [&>select>option]:box-border_p-0"
      >
        <label class="text-sm" for="character-name">Name</label>
        <input
          id="character-name"
          type="text"
          v-model="characterName"
        />
        <label class="text-sm" for="character-class">Class</label>
        <select id="character-class" v-model="characterClass">
          <option disabled value="">Select class</option>
          <option
            v-for="classItem in classes"
            :key="classItem.id"
            :value="classItem.id"
          >
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
          <option
            v-for="speciesItem in species"
            :key="speciesItem.id"
            :value="speciesItem.id"
          >
            {{ speciesItem.name }}
          </option>
        </select>
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
            :key="background.name"
          >
            {{ background.name }}
          </option>
        </select>
      </section>
      <section id="ability-scores" class="mx-auto max-w-3xl">
        <table
          class="w-full table-fixed border-separate border-spacing-y-2 border-spacing-x-3 overflow-x-auto"
        >
          <thead>
            <tr class="*:overflow-x-hidden *:text-ellipsis">
              <th class="w-2/24 text-left">Ability</th>
              <th class="w-10/24 hidden sm:table-cell">Score</th>
              <th class="w-4/24"><div class="w-full sm:hidden">Score</div></th>
              <th class="w-3/24 text-center">Bonus</th>
              <th class="w-2/24 text-center">Final</th>
              <th class="w-2/24 text-center">Modifier</th>
              <th class="w-1/24 text-center">Save</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in abilityScores" :key="key">
              <td :class="{ 'font-bold': primaryClassAbilities.includes(key) }">
                {{ key.charAt(0).toUpperCase() + key.slice(1) }}
              </td>
              <td class="hidden sm:table-cell">
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
                    class="ability-score-cell text-[0.5rem] text-ink/20 w-3 h-8 grow"
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
                  :bg-classes="
                    !!baseAbilityScoreUiProps[key].warning
                      ? 'bg-warning-light'
                      : ''
                  "
                />
              </td>
              <td>
                <NumberStepper
                  :id="key + '-bonus'"
                  v-model="abilityBonuses[key]"
                  :label="`${key} ability bonus`"
                  :min="0"
                  :max="2"
                  :step="1"
                  :digits="1"
                  :height="7"
                />
              </td>
              <td class="text-center">
                <input
                  type="number"
                  readonly
                  tabindex="-1"
                  :value="finalAbilityScores[key]"
                  class="score-field w-10"
                />
              </td>
              <td class="text-center">
                <input
                  type="text"
                  readonly
                  tabindex="-1"
                  :value="finalAbilityModifiersAsText[key]"
                  class="score-field thick w-10 text-center"
                />
              </td>
              <td><input type="checkbox" /></td>
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
                    class="score-field w-[4ch]"
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
                  class="score-field w-[4ch]"
                />
              </td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </section>
    </form>
  </main>
</template>

<style scoped lang="css">
@reference "@/styles/tailwind.css";

table tr > *[bonus-points] {
  @apply text-center justify-center;
}

input:not([type="checkbox"]) {
  @apply border border-ink/20 rounded-md p-2;
}

input[type="checkbox"] {
  @apply appearance-none h-4 w-4 rounded border-2 border-ink/80 bg-white 
         checked:bg-ink/60 checked:border-ink/60 
         focus:outline-none focus:ring-2 focus:ring-ink/40 focus:ring-offset-2
         transition-all duration-150 cursor-pointer;
}

input[type="checkbox"]:disabled {
  @apply border-transparent;
}

input[type="number"] {
  @apply text-right;
}

input {
  &.score-field {
    @apply h-7;
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
  @apply border-transparent border-r-4 outline-1 outline-ink/20 rounded-md p-2 pr-10;
}
</style>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Ref } from "vue";
import NumberStepper from "./NumberStepper.vue";
import { classes } from "@/lib/dnd2024/classFeatures.ts";
import type {
  AbilityKey,
  AbilityScores,
  AbilityBonuses,
} from "@/lib/dnd2024/base.ts";
import type { Background } from "@/lib/dnd2024/backgrounds.ts";
import { freeBackgrounds } from "@/lib/dnd2024/backgrounds.ts";
import { species } from "@/lib/dnd2024/species.ts";

const initialAbilityScores: AbilityScores = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
} as const;

const abilityScores: Ref<AbilityScores> = ref({
  ...initialAbilityScores,
});

const abilityBonuses: Ref<AbilityBonuses> = ref({
  str: 0,
  dex: 0,
  con: 0,
  int: 0,
  wis: 0,
  cha: 0,
});

const touchedAbilityScore = ref<AbilityKey>();

// TODO: remove the debug defaults
const characterName = ref("Bruul the Bruiser");
const characterClass = ref("barbarian");
const characterSubclass = ref("");
const characterBackground = ref("");
const characterSpecies = ref("");

const availableBackgrounds: Ref<Background[]> = ref([
  ...freeBackgrounds,
  { name: "Custom" },
]);

const baseAbilityScoreUiProps = computed(() => {
  const props: Record<
    AbilityKey,
    { isLowest: boolean; isHighest: boolean; warning: string }
  > = {} as any;
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

const finalAbilityModifiers = computed(() => {
  const modifiers: Record<AbilityKey, number> = {} as Record<
    AbilityKey,
    number
  >;
  (Object.keys(finalAbilityScores.value) as AbilityKey[]).forEach((key) => {
    modifiers[key] = Math.floor((finalAbilityScores.value[key] - 10) / 2);
  });
  return modifiers;
});

const finalAbilityModifiersAsText = computed(() => {
  const modifiersText: Record<AbilityKey, string> = {} as Record<
    AbilityKey,
    string
  >;
  (Object.keys(finalAbilityModifiers.value) as AbilityKey[]).forEach((key) => {
    const value = finalAbilityModifiers.value[key];
    modifiersText[key] =
      value === 0 ? "-" : value >= 0 ? `+${value}` : `${value}`;
  });
  return modifiersText;
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
  if (!abilityScoreName || touchedAbilityScore.value !== abilityScoreName)
    return;
  if (!cell.dataset.value) return;
  const value = parseInt(cell.dataset.value, 10);
  abilityScores.value[abilityScoreName] = value;
}

function getElementAtLocation(x: number, y: number): HTMLElement | null {
  return document.elementFromPoint(x, y) as HTMLElement | null;
}
</script>
