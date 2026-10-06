<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useDataStore } from "../stores/data-store.ts";

const route = useRoute();
const store = useDataStore();
const { roots } = storeToRefs(store);
const campaignName = computed(() => {
  const campaignId = route.params.campaignId;
  if (typeof campaignId !== "string") return undefined;
  const campaigns = (roots.value.campaigns ?? []) as { id: string; name: string }[];
  return campaigns.find((campaign) => campaign.id === campaignId)?.name;
});

const breadcrumbs = computed(() => {
  const entries: { label: string; to?: string }[] = [];

  for (const record of route.matched) {
    const breadcrumb = record.meta.breadcrumb;
    if (typeof breadcrumb !== "string") continue;

    const isCampaign = record.meta.entityType === "Campaign";
    entries.push({
      label: isCampaign ? campaignName.value ?? breadcrumb : breadcrumb,
      to: record.name !== "campaign-party-new"
        ? record.path.replace(/:([A-Za-z0-9_]+)(?:\([^)]*\))?/g, (_, param: string) => String(route.params[param] ?? ""))
        : undefined,
    });
  }

  return entries;
});
</script>

<template>
  <main class="min-h-dvh">
    <header class="border-b border-ink/10 bg-moss-dark text-paper">
      <div class="mx-auto max-w-6xl px-6 py-5 lg:px-10">
        <p class="text-xs font-bold uppercase tracking-[0.22em] text-copper">Dungeon Master workspace</p>
        <nav class="mt-2 flex flex-wrap items-center gap-2 text-sm" aria-label="Breadcrumb">
          <template v-for="(item, index) in breadcrumbs" :key="`${item.label}-${index}`">
            <span v-if="index" aria-hidden="true" class="text-paper/45">/</span>
            <RouterLink v-if="item.to && index < breadcrumbs.length - 1" :to="item.to" class="text-paper/70 hover:text-paper">
              {{ item.label }}
            </RouterLink>
            <span v-else aria-current="page" class="text-paper">{{ item.label }}</span>
          </template>
        </nav>
      </div>
    </header>
    <RouterView />
  </main>
</template>