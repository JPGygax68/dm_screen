<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useDataStore } from "../stores/data-store.ts";
import type { Campaign } from "../types/campaign.ts";

const route = useRoute();
const store = useDataStore();
const { roots } = storeToRefs(store);
const campaign = computed(() => {
  const campaignId = route.params.campaignId;
  if (typeof campaignId !== "string") return undefined;
  return ((roots.value.campaigns ?? []) as Campaign[]).find((item) => item.id === campaignId);
});
</script>

<template>
  <section v-if="campaign" class="mx-auto max-w-6xl px-6 py-8 lg:px-10">
    <div class="flex items-start justify-between gap-4 border-b border-ink/15 pb-4">
      <div>
        <h1 class="font-display text-3xl">Party</h1>
        <p class="mt-1 text-sm text-ink/60">{{ campaign.name }}</p>
      </div>
      <RouterLink
        :to="{ name: 'campaign-party-new', params: { campaignId: campaign.id } }"
        class="bg-moss-dark px-4 py-3 text-sm font-bold text-paper transition hover:bg-moss"
      >
        Add party member
      </RouterLink>
    </div>

    <p v-if="campaign.party.length === 0" class="border-b border-ink/10 py-8 text-sm text-ink/60">
      No party members yet.
    </p>
    <ul v-else class="grid gap-2 py-5 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="member in campaign.party" :key="member.id" class="border border-ink/15 bg-white/55">
        <RouterLink
          :to="{ name: 'campaign-party-player-character-detail', params: { campaignId: campaign.id, playerCharacterId: member.id } }"
          class="block px-4 py-4 hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <span class="font-display text-lg">{{ member.name }}</span>
          <span class="mt-1 block text-sm text-ink/60">{{ member.species }} · {{ member.classes.join(", ") }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
  <section v-else class="mx-auto max-w-6xl px-6 py-8 lg:px-10">
    <p class="text-ink/70">Campaign not found.</p>
    <RouterLink :to="{ name: 'campaigns-list' }" class="mt-4 inline-block text-moss-dark underline">Back to campaigns</RouterLink>
  </section>
</template>
