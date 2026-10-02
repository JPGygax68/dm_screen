<template>
  <main class="min-h-dvh">
    <header class="border-b border-ink/20 bg-moss-dark text-paper">
      <div
        class="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 py-4 sm:py-6 lg:py-8 lg:px-10"
      >
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-copper">
            Dungeon Master workspace
          </p>
          <h1 class="mt-2 font-display text-2xl leading-tight sm:text-3xl">
            Character Creator
          </h1>
        </div>
      </div>
    </header>

    <form>
      <section
        id="identity"
        class="mx-auto max-w-2xl px-6 py-8 lg:px-10 grid grid-cols-[min-content_1fr] sm:grid-cols-[min-content_1fr_min-content_1fr] [&>label]:justify-self-end gap-y-2 gap-x-3 items-baseline [&>select>option]:box-border_p-0"
      >
        <label class="text-sm" for="character-name">Name</label>
        <input
          id="character-name"
          type="text"
          v-model="characterName"
          class="input lg:col-span-3"
        />
        <label class="text-sm col-start-1" for="character-class">Class</label>
        <select id="character-class" class="select" v-model="characterClass">
          <option disabled value="">Select class</option>
          <option>Barbarian</option>
          <option>Bard</option>
          <option>Cleric</option>
          <option>Druid</option>
          <option>Fighter</option>
          <option>Monk</option>
          <option>Paladin</option>
          <option>Ranger</option>
          <option>Rogue</option>
          <option>Sorcerer</option>
          <option>Warlock</option>
          <option>Wizard</option>
        </select>
        <label class="text-sm" for="character-subclass">Subclass</label>
        <select
          id="character-subclass"
          class="select"
          v-model="characterSubclass"
          placeholder="Select subclass"
        >
          <option disabled value="">Select subclass</option>
          <option>Champion</option>
          <option>Berserker</option>
          <option>Evocation</option>
          <option>Divination</option>
        </select>
        <label class="text-sm" for="character-race">Race</label>
        <select
          id="character-race"
          v-model="characterRace"
          placeholder="Select race"
          class="select"
        >
          <option disabled value="">Select race</option>
          <option>Human</option>
          <option>Elf</option>
          <option>Dwarf</option>
          <option>Halfling</option>
          <option>Orc</option>
          <option>Gnome</option>
          <option>Dragonborn</option>
          <option>Tiefling</option>
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
        <!-- <input
          id="character-background"
          type="text"
          v-model="characterBackground"
          class="input"
        /> -->
      </section>
      <section id="ability-scores" class="mx-auto max-w-2xl">
        <table
          class="w-full table-fixed border-separate border-spacing-2 overflow-x-auto"
        >
          <thead>
            <tr class="*:overflow-x-hidden *:text-ellipsis">
              <th class="w-2/16 text-left">Ability</th>
              <th class="w-10/16 hidden sm:table-cell">Score</th>
              <th class="w-4/16"><div class="w-full sm:hidden">Score</div></th>
              <th class="w-3/16 text-center">Bonus</th>
              <th class="w-2/16 text-center">Final</th>
              <th class="w-2/16 text-center">Modifier</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in abilityScores" :key="key">
              <td>{{ key.charAt(0).toUpperCase() + key.slice(1) }}</td>
              <td class="hidden sm:table-cell">
                <div
                  @touchstart.prevent="handleTouchStart"
                  @touchmove.prevent="handleTouchMove"
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
                    class="attribute-cell text-[0.5rem] text-ink/20 w-3 h-8 grow"
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
                  :height="8"
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
                  :height="8"
                />
              </td>
              <td class="text-center">
                <input
                  type="number"
                  readonly
                  :value="finalAbilityScores[key]"
                  class="input w-12"
                />
              </td>
              <td class="text-center">
                <input
                  type="text"
                  readonly
                  :value="finalAbilityModifiersAsText[key]"
                  class="input w-12 h-8 text-center"
                />
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
                    class="input w-[4ch]"
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
                  class="input w-[4ch]"
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

.input {
  @apply border border-ink/20 rounded-md p-2;
}

table tr > *[bonus-points] {
  @apply text-center justify-center;
}

.input[type="number"] {
  @apply text-right h-8;
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
}

.select {
  @apply border border-ink/20 rounded-md p-2 pr-10;
}
</style>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Ref } from "vue";
import NumberStepper from "./NumberStepper.vue";

type AbilityScoreKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

const AbilityScoreNamesMap_en: { [k in AbilityScoreKey]: string } = {
  str: "strength",
  dex: "dexterity",
  con: "constitution",
  int: "intelligence",
  wis: "wisdom",
  cha: "charisma",
};

const initialAbilityScores: Record<AbilityScoreKey, number> = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
} as const;

type AbilityScores = typeof initialAbilityScores;

type Background = {
  name: string;
  description?: string;
  boostableAbilityScores?: AbilityScoreKey[];
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
  boostableAbilityScores: ["int", "wis"] as AbilityScoreKey[],
  tools: ["Calligrapher's Supplies"],
};

const soldierBackground: Background = {
  name: "Soldier",
  description: "A background of military service and discipline.",
  boostableAbilityScores: ["str", "dex", "con"] as AbilityScoreKey[],
  feats: [{ savage_attack: "Savage Attacker" }],
  skills: ["Athletics", "Intimidation"],
  tools: ["Gaming Set"],
};

const freeBackgrounds = [criminalBackground, sageBackground, soldierBackground];

const availableBackgrounds: Ref<Background[]> = ref([
  ...freeBackgrounds,
  { name: "Custom" },
]);

const abilityScores: Ref<AbilityScores> = ref({
  ...initialAbilityScores,
});

const abilityBonuses: Ref<Record<AbilityScoreKey, number>> = ref({
  str: 0,
  dex: 0,
  con: 0,
  int: 0,
  wis: 0,
  cha: 0,
});

const touchedAbilityScore = ref<AbilityScoreKey>();

const characterName = ref("Bruul the Bruiser");
const characterClass = ref("Barbarian");
const characterSubclass = ref("");
const characterLevel = ref(1);
const characterBackground = ref("");
const maxHp = ref(10);
const characterRace = ref("");

const handleTouchStart = (event: TouchEvent) => {
  const cell = event.target as HTMLElement;
  if (!cell) return;
  const bar = cell.parentElement;
  if (!bar) {
    console.warn("No parent element found for the touched cell.");
    return;
  }
  const attribKey = bar.dataset.abilityScoreName as AbilityScoreKey;
  if (!attribKey) return;
  touchedAbilityScore.value = attribKey;
  console.log("Starting touch for attribute:", attribKey);
};

const baseAbilityScoresTotal = computed(() => {
  return Object.values(abilityScores.value).reduce((sum, val) => sum + val, 0);
});

const finalAbilityScores = computed(() => {
  const scores: Record<AbilityScoreKey, number> = {} as Record<
    AbilityScoreKey,
    number
  >;
  (Object.keys(abilityScores.value) as AbilityScoreKey[]).forEach((key) => {
    scores[key] = abilityScores.value[key] + (abilityBonuses.value[key] ?? 0);
  });
  return scores;
});

const finalAbilityModifiers = computed(() => {
  const modifiers: Record<AbilityScoreKey, number> = {} as Record<
    AbilityScoreKey,
    number
  >;
  (Object.keys(finalAbilityScores.value) as AbilityScoreKey[]).forEach(
    (key) => {
      modifiers[key] = Math.floor((finalAbilityScores.value[key] - 10) / 2);
    },
  );
  return modifiers;
});

const finalAbilityModifiersAsText = computed(() => {
  const modifiersText: Record<AbilityScoreKey, string> = {} as Record<
    AbilityScoreKey,
    string
  >;
  (Object.keys(finalAbilityModifiers.value) as AbilityScoreKey[]).forEach(
    (key) => {
      const value = finalAbilityModifiers.value[key];
      modifiersText[key] =
        value === 0 ? "-" : value >= 0 ? `+${value}` : `${value}`;
    },
  );
  return modifiersText;
});

function getAbilityBonusesTotal(): number {
  const total = Object.values(abilityBonuses.value).reduce(
    (sum, val) => sum + val,
    0,
  );
  return total;
}

const availableBaseAbilityScorePoints = computed(() => {
  return 72 - baseAbilityScoresTotal.value;
});

const availableAbilityBonusPoints = computed(() => {
  return 3 - getAbilityBonusesTotal();
});

const handleTouchMove = (event: TouchEvent) => {
  const cell = getElementUnderFinger(event);
  if (!cell) return;
  const bar = cell.parentElement;
  if (!bar) return;
  const abilityScoreName = bar.dataset.abilityScoreName as AbilityScoreKey;
  if (!abilityScoreName || touchedAbilityScore.value !== abilityScoreName)
    return;
  if (!cell.dataset.value) return;
  const value = parseInt(cell.dataset.value, 10);
  abilityScores.value[abilityScoreName] = value;
};

function getElementUnderFinger(event: TouchEvent): HTMLElement | null {
  const touch = event.touches[0];
  return document.elementFromPoint(
    touch.clientX,
    touch.clientY,
  ) as HTMLElement | null;
}
</script>
