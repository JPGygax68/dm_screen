<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import CampaignList from "@/components/CampaignList.vue";
import NewCampaignDialog from "@/dialogs/NewCampaignDialog.vue";
import { useDataStore } from "@/stores/data-store.ts";
import type { Campaign } from "@/types/campaign.ts";

const store = useDataStore();
const { roots } = storeToRefs(store);
const campaigns = computed(() => (roots.value.campaigns ?? []) as Campaign[]);
const isDialogOpen = ref(false);
const errorMessage = ref("");
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-8 lg:px-10">
    <div class="mb-6 flex items-center justify-between gap-4">
      <h1 class="font-display text-2xl text-ink">Your campaigns</h1>
      <span class="ml-auto text-sm text-ink/60">{{ campaigns.length }} saved</span>
      <button type="button" class="bg-copper px-4 py-3 text-sm font-bold text-ink transition hover:bg-copper/85" @click="isDialogOpen = true">
        New campaign
      </button>
    </div>
    <CampaignList :campaigns="campaigns" :is-loading="false" />
    <p v-if="errorMessage" class="mt-4 text-sm text-red-700" role="alert">{{ errorMessage }}</p>
    <NewCampaignDialog v-model:open="isDialogOpen" @error="(message) => (errorMessage = message)" />
  </div>
</template>