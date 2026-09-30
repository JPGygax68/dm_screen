<template>
  <main class="min-h-dvh">
    <header class="border-b border-ink/20 bg-moss-dark text-paper">
      <div
        class="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 py-8 lg:px-10"
      >
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-copper">
            Dungeon Master workspace
          </p>
          <h1 class="mt-2 font-display text-4xl leading-tight sm:text-5xl">
            Character Creator
          </h1>
        </div>
      </div>
    </header>

    <form>
      <div
        class="mx-auto max-w-2xl px-6 py-8 lg:px-10 grid grid-cols-[min-content_1fr] lg:grid-cols-[min-content_1fr_1fr_1fr] gap-y-2 gap-x-4 items-baseline"
      >
        <label class="text-sm" for="character-name">Name</label>
        <input
          id="character-name"
          type="text"
          v-model="characterName"
          class="border border-ink/20 rounded-md p-2 lg:col-span-3"
        />
        <label class="text-sm col-start-1" for="character-class">Class</label>
        <select
          id="character-class"
          v-model="characterClass"
          class="border border-ink/20 rounded-md p-2 w-48"
          >
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
        <label class="text-sm" for="character-background">Background</label>
        <input
          id="character-background"
          type="text"
          v-model="characterBackground"
          class="border border-ink/20 rounded-md p-2"
        /> 
        <label class="text-sm col-start-1" for="character-race">Race</label>
        <select
          id="character-race"
          type="text"
          v-model="characterRace"
          placeholder="Select race"
          class="border border-ink/20 rounded-md p-2 w-48 lg:col-span-3"
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
        <label class="text-sm" for="character-level">Level</label>
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
        />
      </div>
    </form>
  </main>
</template>
<script setup lang="ts">
import { ref } from "vue";

const characterName = ref("Bruul the Bruiser");
const characterClass = ref("Barbarian");
const characterLevel = ref(1);
const characterBackground = ref("");
const maxHp = ref(10);
const characterRace = ref("");
</script>
