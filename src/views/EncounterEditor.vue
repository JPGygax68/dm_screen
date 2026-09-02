<template>
  <div class="min-h-screen bg-design-page-bg text-design-page-text">
    <Breadcrumbs />

    <form class="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-2">
      <section id="general" class="sheet-section">
        <label for="encounter-title"
          >Encounter Title<span class="text-design-page-muted">*</span></label
        >
        <input
          id="encounter-title"
          type="text"
          v-model="encounter.title"
          placeholder="New Encounter"
          class="w-full"
        />
      </section>

      <section id="enemies" class="sheet-section">
        <label for="enemy-list">Enemy List</label>
        <span id="enemy-list" class="flex flex-wrap gap-2">
          <span
            v-for="enemy in encounter.enemies"
            :key="enemy.id"
            @click="editEnemy(enemy)"
            class="badge-like clickable"
          >
            {{ enemy.name }}
          </span>
        </span>
      </section>

      <div id="actions" class="mt-2 flex gap-2">
        <button type="button" @click="discard" class="secondary">
          Discard
        </button>
        <button type="button" @click="saveEncounter" class="primary">
          Save
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
@reference "../styles/tailwind.css";

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import useDmScreenStore from "../stores/dataStore";
import { CreatureRef } from "../components/CreatureSelector.vue";

const route = useRoute();
const router = useRouter();
const dataStore = useDmScreenStore();

const campaignId = route.params.campaignId as string;
const encounterId = route.params.encounterId as string;
//const searchTerm = ref("");
const encounter = ref<any>({});
//const selectedCreatures = ref<SelectedCreature[]>([]);

onMounted(async () => {
  // await dataStore.loadBestiary();
  loadEncounter();
});

function loadEncounter() {
  const campaign = dataStore.getCampaignById(campaignId);
  if (!campaign) {
    router.push("/campaigns");
    return;
  }

  const existingEncounter = campaign.encounters?.find(
    (entry: any) => entry.id === encounterId,
  ) || {
    id: encounterId,
    name: "New Encounter",
    description: "",
    enemyList: [],
  };

  encounter.value = {
    ...existingEncounter,
    enemyList: Array.isArray(existingEncounter.enemyList)
      ? existingEncounter.enemyList.map((item: CreatureRef) => ({
          id: item.id,
          count: item.count ?? 1,
        }))
      : [],
  };
}

function editEnemy(enemy: CreatureRef) {
  // Implement the logic to edit the enemy here
  console.log("TODO: edit enemy:", enemy);
}

function saveEncounter() {
  if (!encounter.value) {
    throw new Error("Encounter state was not initialized before save.");
  }

  const finalizedEncounter = {
    ...encounter.value,
    enemyList: encounter.value.enemyList.map((entry) => ({
      ...entry,
      count: Math.max(1, Number(entry.count || 1)),
    })),
    monstersSummary: encounter.value.enemyList.length
      ? encounter.value.enemyList
          .map((entry) => `${entry.count}x ${entry.id}`)
          .join(", ")
      : "No creatures selected",
  };

  dataStore.saveEncounter(campaignId, finalizedEncounter);
  router.push(`/campaigns/${campaignId}/encounters`);
}

function discard() {
  const confirmed = window.confirm("Discard the current encounter changes?");
  if (confirmed) {
    router.push(`/campaigns/${campaignId}/encounters`);
  }
}
</script>
