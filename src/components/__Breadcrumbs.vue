<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDmScreenStore } from "../stores/dataStore";

const route = useRoute();
const router = useRouter();
const store = useDmScreenStore();

const crumbs = computed(() => {
  const segments = route.path.split("/").filter(Boolean);

  if (!segments.length || segments[0] !== "campaigns") {
    return [];
  }

  const campaignId = route.params.campaignId as string | undefined;
  const characterId = route.params.characterId as string | undefined;
  const encounterId = route.params.encounterId as string | undefined;
  const campaign = campaignId ? store.allCampaigns.find((c) => c.id === campaignId) : null;

  const base = [{ label: "Campaigns", to: "/campaigns" }];

  if (segments.length === 1) {
    return base;
  }

  if (segments[1] === "new") {
    return [...base, { label: "New Campaign", to: null }];
  }

  if (campaign) {
    base.push({ label: `"${campaign.name}"`, to: `/campaigns/${campaignId}` });
  }

  if (segments.length === 2) {
    return base;
  }

  if (segments[2] === "characters" && characterId) {
    const character = campaign?.party.find((ch: any) => ch.id === characterId);
    return [...base, { label: character ? `"${character.name}"` : "Character", to: null }];
  }

  if (segments[2] === "encounters") {
    const encountersPath = `/campaigns/${campaignId}/encounters`;
    if (segments.length === 3) {
      return [...base, { label: "Encounters", to: null }];
    }

    const encounter = campaign?.encounters?.find((entry: any) => entry.id === encounterId);
    return [
      ...base,
      { label: "Encounters", to: encountersPath },
      { label: encounter ? `"${encounter.title}"` : "(New Encounter)", to: null },
    ];
  }

  return base;
});

function go(to: string | null) {
  if (to) router.push(to);
}
</script>

<template>
  <nav
    aria-label="Breadcrumbs"
    class="flex flex-wrap gap-2 border-b border-design-border-subtle bg-component-list-item-strong-bg px-2 py-2"
  >
    <a
      v-for="(c, i) in crumbs"
      :key="i"
      :href="c.to || '#'"
      class="rounded-full px-2 py-1 text-sm text-design-page-muted transition cursor-pointer hover:text-design-page-text disabled:cursor-default disabled:opacity-70"
      @click.prevent="go(c.to)"
    >
      {{ c.label }}
    </a>
    <button
      v-if="crumbs.length"
      @click.prevent="store.forceOverwriteDatabaseWithTestingData()"
      class="ml-auto button-like small"
    >
      Reload test data
    </button>
  </nav>
</template>
