<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useDataStore } from "./stores/data-store.ts";
import CampaignList from "./components/CampaignList.vue";
import NewCampaignDialog from "./components/NewCampaignDialog.vue";
import type { Campaign } from "./types/campaign.ts";

const store = useDataStore();
const { roots } = storeToRefs(store);
const campaigns = computed(() => (roots.value.campaigns ?? []) as Campaign[]);
const isLoading = ref(true);
const isDialogOpen = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  try {
    await store.load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to load local data.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <main class="min-h-dvh">
    <header class="border-b border-ink/10 bg-moss-dark text-paper">
      <div class="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 py-8 lg:px-10">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-copper">Dungeon Master workspace</p>
          <h1 class="mt-2 font-display text-4xl leading-tight sm:text-5xl">Campaigns</h1>
        </div>
        <div class="flex items-center gap-4">
          <span class="hidden rounded-full border border-paper/25 px-3 py-1 text-xs text-paper/75 sm:inline">Local archive</span>
          <button
            type="button"
            class="shrink-0 bg-copper px-4 py-3 text-sm font-bold text-ink transition hover:bg-copper/85"
            @click="isDialogOpen = true"
          >
            New campaign
          </button>
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <CampaignList :campaigns="campaigns" :is-loading="isLoading" />
    </div>

    <NewCampaignDialog v-model:open="isDialogOpen" @error="(message) => (errorMessage = message)" />

    <p v-if="errorMessage" class="mx-auto max-w-6xl px-6 pb-8 text-sm text-red-700 lg:px-10" role="alert">{{ errorMessage }}</p>
  </main>
</template>
