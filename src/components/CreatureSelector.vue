<template>
  <div
    class="mt-4 grid gap-4 lg:grid-cols-[minmax(320px,0.95fr)_minmax(340px,1.35fr)]"
  >
    <section
      id="selected-adversaries"
      class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-design-border-subtle bg-component-panel-bg"
    >
      <div class="border-b border-design-border-subtle px-4 py-3">
        <h2 class="text-lg font-semibold">Selected Adversaries</h2>
      </div>

      <div
        v-if="selectedCreatures.length === 0"
        class="flex min-h-48 items-center justify-center p-4 text-center text-sm text-design-page-muted"
      >
        No creatures selected yet.
      </div>

      <div v-else class="flex flex-col gap-3 overflow-y-auto p-3">
        <div
          v-for="entry in selectedCreatures"
          :key="entry.id"
          class="grid grid-cols-[64px_minmax(0,1fr)_90px_auto] items-center gap-3 rounded-lg border border-design-border-subtle bg-component-list-item-subtle-bg px-2 py-2"
        >
          <img
            :src="getCreatureImageUrl(entry)"
            :alt="entry.name"
            class="h-16 w-16 rounded-md object-cover"
          />

          <div class="min-w-0">
            <h3 class="truncate text-base font-semibold">
              {{ entry.name }}
            </h3>
            <p class="truncate text-xs text-design-page-muted">
              {{ entry.race }} • CR {{ entry.cr }} • AC
              {{ entry.armorClass }}
            </p>
          </div>

          <div class="flex flex-col items-center gap-1">
            <label
              class="text-[11px] uppercase tracking-widest text-design-page-muted"
              >Count</label
            >
            <input
              :value="entry.count"
              type="number"
              min="1"
              class="w-20 rounded-md border border-component-input-border bg-component-input-bg px-2 py-1 text-center text-sm text-component-input-text outline-none focus:border-component-button-bg"
              @input="updateCreatureCount(entry, $event)"
            />
          </div>

          <button
            type="button"
            class="rounded border border-design-border-default bg-component-list-item-bg px-3 py-1.5 text-sm font-medium hover:bg-component-list-item-subtle-bg"
            @click="removeCreature(entry.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </section>

    <section
      class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-design-border-subtle bg-component-panel-bg"
    >
      <div class="border-b border-design-border-subtle px-4 py-3">
        <h2 class="text-lg font-semibold">Bestiary</h2>
      </div>

      <div class="px-3 pt-3">
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search creatures"
          class="w-full rounded-md border border-component-input-border bg-component-input-bg px-3 py-2 text-sm text-component-input-text outline-none placeholder:text-design-page-muted focus:border-component-button-bg"
        />
      </div>

      <div class="flex flex-col gap-3 overflow-y-auto p-3">
        <button
          v-for="creature in filteredBestiary"
          :key="creature.id"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg border border-design-border-subtle bg-component-list-item-subtle-bg px-3 py-2 text-left transition hover:border-design-border-default hover:bg-component-list-item-strong-bg"
          @click="addCreature(creature)"
        >
          <img
            :src="getCreatureImageUrl(creature)"
            :alt="creature.name"
            class="h-14 w-14 shrink-0 rounded-md object-cover"
          />
          <div class="min-w-0">
            <h3 class="truncate text-base font-semibold">
              {{ creature.name }}
            </h3>
            <p class="truncate text-xs text-design-page-muted">
              {{ creature.race }} • CR {{ creature.cr }} • AC
              {{ creature.armorClass }}
            </p>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";    

export type CreatureRef = {
  id: string;
  count: number;
};

// Read the bestiary from public/assets/bestiary/bestiary.yaml
const bestiary = ref<any[]>([]);

fetch("/assets/bestiary/bestiary.yaml")
  .then((response) => response.text())
  .then((yamlText) => {
    // Assuming you have a YAML parser available, e.g., js-yaml
    bestiary.value = jsyaml.load(yamlText) as any[];
  });

const selectedCreatures = ref<CreatureRef[]>([]);

const searchTerm = ref("");

function getCreatureImageUrl(creature: any) {
  return `/assets/bestiary/images/${creature.id}.png`;
}

const filteredBestiary = computed(() => {
  const query = searchTerm.value.trim().toLowerCase();
  if (!query) return bestiary.value;

  return bestiary.value.filter((creature: any) => {
    const haystack = [
      creature.name,
      creature.race,
      creature.family,
      creature.cr,
      creature.alignment,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
});

function addCreature(creature: any) {
  const existing = encounter.value.enemyList.find(
    (entry) => entry.id === creature.id,
  );

  if (existing) {
    existing.count += 1;
    return;
  }

  encounter.value.enemyList.push({
    id: creature.id,
    count: 1,
  });
}

function updateCreatureCount(entry: CreatureRef, event: Event) {
  const target = event.target as HTMLInputElement | null;
  const nextValue = Number.parseInt(target?.value ?? "1", 10);
  entry.count = Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1;
}

function removeCreature(creatureId: string) {
  encounter.value.enemyList = encounter.value.enemyList.filter(
    (entry) => entry.id !== creatureId,
  );
}

</script>
