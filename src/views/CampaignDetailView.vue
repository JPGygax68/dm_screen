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
  <div v-if="campaign" class="mx-auto max-w-6xl px-6 py-8 lg:px-10">
    <section class="border-b border-ink/15 pb-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="font-display text-3xl">{{ campaign.name }}</h1>
          <p v-if="campaign.description" class="mt-2 text-ink/65">{{ campaign.description }}</p>
        </div>
        <RouterLink
          :to="{ name: 'campaign-party-new', params: { campaignId: campaign.id } }"
          class="bg-moss-dark px-4 py-3 text-sm font-bold text-paper transition hover:bg-moss"
        >
          Add party member
        </RouterLink>
      </div>
    </section>

    <section class="py-6" aria-labelledby="party-title">
      <div class="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
        <h2 id="party-title" class="font-display text-xl">Party</h2>
        <RouterLink :to="{ name: 'campaign-party-collection', params: { campaignId: campaign.id } }" class="text-sm text-moss-dark underline underline-offset-4">
          View party
        </RouterLink>
      </div>
      <p v-if="campaign.party.length === 0" class="py-6 text-sm text-ink/60">No player characters yet.</p>
      <ul v-else class="grid gap-2 py-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="member in campaign.party" :key="member.id" class="border border-ink/15 bg-white/55">
          <RouterLink
            :to="{ name: 'campaign-party-player-character-detail', params: { campaignId: campaign.id, playerCharacterId: member.id } }"
            class="block px-4 py-3 hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            {{ member.name }}
          </RouterLink>
        </li>
      </ul>
    </section>

    <section class="border-t border-ink/15 py-6" aria-labelledby="encounters-title">
      <h2 id="encounters-title" class="font-display text-xl">Encounters</h2>
      <p class="mt-2 text-sm text-ink/60">{{ campaign.encounters?.length ?? 0 }} saved</p>
    </section>

  </div>
  <div v-else class="mx-auto max-w-6xl px-6 py-10 lg:px-10">
    <p class="text-ink/70">Campaign not found.</p>
    <RouterLink :to="{ name: 'campaigns-list' }" class="mt-4 inline-block text-moss-dark underline">Back to campaigns</RouterLink>
  </div>
</template>