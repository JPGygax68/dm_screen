<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  import { computed } from 'vue';
  import { useDmScreenStore } from '../stores/dataStore';

  const route = useRoute();
  const router = useRouter();
  const store = useDmScreenStore();

  const crumbs = computed(() => {
    const path = route.path;

    if (path === '/campaigns') {
      return [{ label: 'Campaigns', to: '/campaigns' }];
    }

    if (path === '/campaigns/new') {
      return [
        { label: 'Campaigns', to: '/campaigns' },
        { label: 'New Campaign', to: null }
      ];
    }

    if (path.match(/\/campaigns\/[^/]+\/edit/)) {
      const id = route.params.id;
      const campaign = store.campaigns.find(c => c.id === id);
      if (!campaign) return [];
      return [
        { label: 'Campaigns', to: '/campaigns' },
        { label: `"${campaign.name}"`, to: `/campaigns/${id}` },
        { label: 'Edit Campaign', to: `/campaigns/${id}/edit` }
      ];
    }

    if (path.match(/\/campaigns\/[^/]+$/)) {
      const id = route.params.id;
      return [
        { label: 'Campaigns', to: '/campaigns' },
        { label: `"${store.campaigns.find(c => c.id === id)?.name}"`, to: `/campaigns/${id}` }
      ];
    }

    if (path.match(/\/campaigns\/[^/]+\/encounters$/)) {
      const campaignId = route.params.campaignId;
      const campaign = store.campaigns.find(c => c.id === campaignId);
      if (!campaign) return [];
      return [
        { label: 'Campaigns', to: '/campaigns' },
        { label: `"${campaign.name}"`, to: `/campaigns/${campaignId}` },
        { label: 'Encounters', to: `/campaigns/${campaignId}/encounters` }
      ];
    }

    return [];
  });

  function go(to: string | null) {
    if (to) router.push(to);
  }
</script>

<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <button
      v-for="(c, i) in crumbs"
      :key="i"
      type="button"
      class="crumb"
      :disabled="!c.to"
      @click="go(c.to)"
    >
      {{ c.label }}
    </button>
  </nav>
</template>

<style scoped lang="scss">
  .breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.8);
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  }

  .crumb {
    appearance: none;
    border: 0;
    background: transparent;
    color: #cbd5e1;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;

    &:disabled {
      cursor: default;
      opacity: 0.7;
    }
  }
</style>
