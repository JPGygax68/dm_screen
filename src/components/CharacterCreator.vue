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
        <select id="character-class" class="input" v-model="characterClass">
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
          class="input"
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
          class="input"
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
        <input
          id="character-background"
          type="text"
          v-model="characterBackground"
          class="input"
        />
        <!-- <label class="text-sm" for="character-level">Level</label>
        <input
          id="character-level"
          type="number"
          v-model="characterLevel"
          class="number-input border border-ink/20 rounded-md p-2 w-16"
        />
        <label class="text-sm" for="max-hp">Max&nbsp;Hitpoints</label>
        <input
          id="max-hp"
          type="number"
          v-model="maxHp"
          class="number-input border border-ink/20 rounded-md p-2 w-16"
        /> -->
      </section>
      <section id="attributes" class="mx-auto max-w-2xl">
        <table
          class="w-full border-separate border-spacing-2 [&>tbody>tr>*]:justify-center"
        >
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Value</th>
              <th>Manual</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in characterAttributes" :key="key">
              <td>{{ key.charAt(0).toUpperCase() + key.slice(1) }}</td>
              <td>
                <div
                  @touchstart.prevent="handleTouchStart"
                  @touchmove.prevent="handleTouchMove"
                  :data-attribute-key="key"
                  class="flex flex-row gap-0.5"
                >
                  <span
                    class="attribute-cell text-[0.5rem] text-ink/20 bg-ink/10 w-3 h-8 grow"
                    :class="{ 'bg-ink/50': characterAttributes[key] >= 7 + n }"
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
                  v-model="characterAttributes[key]"
                  class="input w-12"
                />
              </td>
            </tr>
          </tbody>
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
</style>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";

const characterName = ref("Bruul the Bruiser");
const characterClass = ref("Barbarian");
const characterSubclass = ref("");
const characterLevel = ref(1);
const characterBackground = ref("");
const maxHp = ref(10);
const characterRace = ref("");

const initialCharacterAttributes = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

type CharacterAttributes = typeof initialCharacterAttributes;
const characterAttributes: Ref<CharacterAttributes> = ref({ ...initialCharacterAttributes });

type AttributeKey = keyof CharacterAttributes;

const touchedAttribute = ref<AttributeKey>();

const handleTouchStart = (event: TouchEvent) => {
  const cell = event.target as HTMLElement;
  if (!cell) return;
  const bar = cell.parentElement;
  if (!bar) {
    console.warn("No parent element found for the touched cell.");
    return;
  }
  const attribKey = bar.dataset.attributeKey as AttributeKey;
  if (!attribKey) return;
  touchedAttribute.value = attribKey;
  console.log("Starting touch for attribute:", attribKey);
};

const handleTouchMove = (event: TouchEvent) => {
  const cell = getElementUnderFinger(event);
  if (!cell) return;
  const bar = cell.parentElement;
  if (!bar) return;
  const attribKey = bar.dataset.attributeKey as AttributeKey;
  if ((!attribKey) || touchedAttribute.value !== attribKey) return;
  if (!cell.dataset.value) return;
  const value = parseInt(cell.dataset.value, 10);
  characterAttributes.value[attribKey] = value;
};


function getElementUnderFinger(event: TouchEvent): HTMLElement | null {
  const touch = event.touches[0];
  return document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
}


</script>
