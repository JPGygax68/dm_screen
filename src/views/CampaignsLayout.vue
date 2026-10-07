<script setup lang="ts">
/**
 * CampaignsLayout.vue
 * Layout component for the campaigns section of the application.
 * 
 * Provides the layout structure including the header with breadcrumbs and the main content area,
 * which scrolls vertically at need.
 */

import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useDataStore } from "../stores/data-store.ts";

const route = useRoute();
const store = useDataStore();
const { roots } = storeToRefs(store);

const breadcrumbs = computed(() => {
  const routeBreadcrumbs = route.meta.breadcrumbs;
  if (!Array.isArray(routeBreadcrumbs)) return [];

  const campaigns = (roots.value.campaigns ?? []) as {
    id: string;
    name: string;
    party?: { id: string; name: string }[];
  }[];
  const campaign = campaigns.find(
    (item) => item.id === route.params.campaignId,
  );

  return routeBreadcrumbs.map((item) => {
    const crumb = item as {
      label: string;
      href?: string;
      entityType?: string;
      paramName?: string;
    };
    let label = crumb.label;
    if (crumb.entityType === "Campaign") label = campaign?.name ?? label;
    if (crumb.entityType === "PlayerCharacter") {
      label =
        campaign?.party?.find(
          (member) => member.id === route.params[crumb.paramName ?? ""],
        )?.name ?? label;
    }
    const href = crumb.href?.replace(/:([A-Za-z0-9_]+)/g, (_, param: string) =>
      String(route.params[param] ?? ""),
    );
    return { label, href };
  });
});
</script>

<template>
  <div class="h-dvh flex flex-col">
    <header class="border-b border-ink/10 bg-moss-dark text-paper flex-shrink-0">
      <div class="mx-auto max-w-6xl px-2 py-1 lg:px-4 lg:py-2">
        <!-- <p class="text-xs font-bold uppercase tracking-[0.22em] text-copper">Dungeon Master workspace</p> -->
        <nav
          class="flex flex-wrap items-center gap-2 text-sm"
          aria-label="Breadcrumb"
        >
          <template
            v-for="(item, index) in breadcrumbs"
            :key="`${item.label}-${index}`"
          >
            <span v-if="index" aria-hidden="true" class="text-paper/45">/</span>
            <RouterLink
              v-if="item.href && index < breadcrumbs.length - 1"
              :to="item.href"
              class="text-paper/70 hover:text-paper"
            >
              {{ item.label }}
            </RouterLink>
            <span v-else aria-current="page" class="text-paper">{{
              item.label
            }}</span>
          </template>
        </nav>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>
