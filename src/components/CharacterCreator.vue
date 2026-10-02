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
          class="w-full table-fixed border-separate border-spacing-2 [&>tbody>tr>*]:justify-center"
        >
          <thead>
            <tr class="*:text-left *:overflow-x-hidden">
              <th class="w-1/16">Attribute</th>
              <th class="w-6/16">Value</th>
              <th class="w-2/16">Manual</th>
              <th class="w-2/16">Bonus</th>
              <th class="w-2/16">Modifier</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in abilityScores" :key="key">
              <td>{{ key.charAt(0).toUpperCase() + key.slice(1) }}</td>
              <td>
                <div
                  @touchstart.prevent="handleTouchStart"
                  @touchmove.prevent="handleTouchMove"
                  :data-ability-score-name="key"
                  class="flex flex-row gap-0.5"
                >
                  <span
                    class="attribute-cell text-[0.5rem] text-ink/20 bg-ink/10 w-3 h-8 grow"
                    :class="{ 'bg-ink/50': abilityScores[key] >= 7 + n }"
                    v-for="n in 12"
                    :key="n"
                    :data-value="n + 7"
                    >{{ n + 7 }}</span
                  >
                </div>
              </td>
              <td>
                <input
                  :id="key"
                  type="number"
                  v-model="abilityScores[key]"
                  class="input w-12"
                />
              </td>
              <td>
                <input
                  :id="key + '-bonus'"
                  type="number"
                  v-model="abilityBonuses[key]"
                  :min="0"
                  :max="2"
                  :step="1"
                  class="input w-12"
                />
              </td>
              <td>
                {{ getAbilityModifierAsText(getFinalAbilityScore(key)) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" class="text-left">Totals</td>
              <td>
                <input
                  type="number"
                  readonly
                  class="input w-12"
                  :value="getAbilityScoreTotal()"
                />
              </td>
              <td>
                <input
                  type="number"
                  readonly
                  class="input w-12"
                  :value="getAbilityBonusTotal()"
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

.input[type="number"] {
  @apply text-right;
  &[readonly] {
    @apply bg-ink/10;
  }
}

.select {
  @apply border border-ink/20 rounded-md p-2 pr-10;
}
</style>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";

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

function getFinalAbilityScore(key: AbilityScoreKey): number {
  // TODO: Apply any modifiers from race, background, or other sources
  return abilityScores.value[key];
}

function getAbilityModifierAsText(score: number): string {
  const value = Math.floor((score - 10) / 2);
  return value === 0 ? "-" : value >= 0 ? `+${value}` : `${value}`;
}

function getAbilityBonusTotal(): number {
  const total = Object.values(abilityBonuses.value).reduce(
    (sum, val) => sum + val,
    0,
  );
  return total;
}

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

function getAbilityScoreTotal(): number {
  return Object.values(abilityScores.value).reduce((sum, val) => sum + val, 0);
}

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
