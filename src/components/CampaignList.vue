<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { Campaign } from "../types/campaign.ts";

defineProps<{
  campaigns: Campaign[];
  isLoading: boolean;
}>();
</script>

<template>
  <section aria-label="Campaign list">
    <p v-if="isLoading" class="py-10 text-ink/60">Opening your local archive...</p>
    <div v-else-if="campaigns.length" class="grid gap-3 pt-5">
      <RouterLink
        v-for="campaign in campaigns"
        :key="campaign.id"
        :to="{ name: 'campaign-detail', params: { campaignId: campaign.id } }"
        class="block"
      >
      <article
        class="border border-ink/15 bg-white/55 p-5 shadow-[0_8px_24px_-18px_oklch(0.24_0.03_165)] transition hover:border-moss/60 hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="font-display text-xl">{{ campaign.name }}</h3>
            <p v-if="campaign.description" class="mt-1 text-sm text-ink/65">{{ campaign.description }}</p>
          </div>
          <span class="text-xs uppercase tracking-[0.16em] text-moss">Draft</span>
        </div>
        <div class="mt-5 flex gap-5 text-xs text-ink/55">
          <span>{{ campaign.party?.length ?? 0 }} party members</span>
          <span>{{ campaign.encounters?.length ?? 0 }} encounters</span>
        </div>
      </article>
      </RouterLink>
    </div>
    <div v-else class="border border-dashed border-ink/25 px-6 py-12 text-center">
      <p class="font-display text-xl">The table is clear.</p>
      <p class="mt-2 text-sm text-ink/60">Create your first campaign to begin preparing a session.</p>
    </div>
  </section>
</template>
