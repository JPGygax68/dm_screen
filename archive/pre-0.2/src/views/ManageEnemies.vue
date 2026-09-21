<template>
  <div class="mt-4 grid gap-4 lg:grid-cols-[minmax(320px,0.95fr)_minmax(340px,1.35fr)]">
    <section
      id="enemies"
      class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-design-border-subtle bg-component-panel-bg"
    >
      <div class="border-b border-design-border-subtle px-4 py-3">
        <h2 class="text-lg font-semibold">Selected Adversaries</h2>
      </div>

      <div
        v-if="enemies.length === 0"
        class="flex min-h-48 items-center justify-center p-4 text-center text-sm text-design-page-muted"
      >
        No creatures selected yet.
      </div>

      <div v-else class="flex flex-col gap-3 overflow-y-auto p-3">
        <div
          v-for="enemy in enemies"
          :key="enemy.id"
          class="grid grid-cols-[64px_minmax(0,1fr)_90px_auto] items-center gap-3 rounded-lg border border-design-border-subtle bg-component-list-item-subtle-bg px-2 py-2"
        >
          <img
            :src="getEnemyImageUrl(enemy)"
            :alt="enemy.name"
            class="h-16 w-16 rounded-md object-cover"
          />

          <div class="min-w-0">
            <h3 class="truncate text-base font-semibold">
              {{ enemy.name }}
            </h3>
            <p class="truncate text-xs text-design-page-muted">
              <span v-if="enemy.race">{{ enemy.race }} • </span>CR {{ enemy.cr }} • AC
              {{ enemy.armorClass }}
            </p>
          </div>

          <button type="button" @click="removeCreature(enemy.id)" class="danger">Remove</button>
        </div>
      </div>
    </section>

    <section
      id="bestiary"
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
        <div
          v-for="creature in filteredBestiary"
          :key="creature.id"
          type="button"
          @click="addCreature(creature)"
          class="clickable flex w-full items-center gap-3 rounded-lg border border-design-border-subtle bg-component-list-item-subtle-bg px-3 py-2 text-left transition hover:border-design-border-default hover:bg-component-list-item-strong-bg"
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
              <span v-if="creature.race"
                >{{ creature.race }} • CR {{ creature.cr }} • AC {{ creature.armorClass }}</span
              >
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useDmScreenStore from "../stores/dataStore";

const route = useRoute();
const router = useRouter();
const dataStore = useDmScreenStore();

const campaignId = route.params.campaignId as string;
const encounterId = route.params.encounterId as string;

const bestiary = ref<any>({});
const enemies = ref<any[]>([]);
const searchTerm = ref("");

onMounted(async () => {
  const results = await Promise.all([
    dataStore.loadBestiary(),
    dataStore
      .getCampaignById(campaignId)
      ?.encounters?.find((entry: any) => entry.id === encounterId)?.enemies || [],
  ]);

  bestiary.value = results[0];
  enemies.value = [ ...results[1] ]
});

function getCreatureImageUrl(creature: any) {
  return `/assets/bestiary/images/${creature.id}.png`;
}

function getEnemyImageUrl(enemy: any) {
  return `/assets/bestiary/images/${enemy.imageId}.png`;
}

const filteredBestiary = computed(() => {
  const query = searchTerm.value.trim().toLowerCase();
  if (!query) return Object.values(bestiary.value);

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
  console.log("Adding creature:", creature.id, enemies.value);
  const count = enemies.value.filter(
    (entry) => entry.id.substring(0, creature.id.length) === creature.id,
  ).length;
  console.log("Adding creature:", creature.id, "Count:", count);
  const name = count > 0 ? `${creature.name} #${count + 1}` : creature.name;
  const id = `${creature.id}-${count + 1}`;

  enemies.value.push({
    id: id,
    name: name,
    imageId: creature.id,
    cr: creature.cr,
    armorClass: creature.armorClass,
  });
}

function updateCreatureCount(entry: any, event: Event) {
  const target = event.target as HTMLInputElement | null;
  const nextValue = Number.parseInt(target?.value ?? "1", 10);
  entry.count = Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1;
}

function removeCreature(creatureId: string) {
  enemies.value = enemies.value.filter((entry) => entry.id !== creatureId);
}
</script>
