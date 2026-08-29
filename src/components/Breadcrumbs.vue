<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
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

    if (path.match(/\/campaigns\/[^/]+/)) {
      const id = route.params.id;
      const campaign = store.campaigns.find(c => c.id === id);
      if (!campaign) return [];
      return [
        { label: 'Campaigns', to: '/campaigns' },
        { label: `"${campaign.name}"`, to: `/campaigns/${id}` }
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
  <nav aria-label="Breadcrumbs" class="flex flex-wrap gap-2 border-b border-design-border-subtle bg-component-list-item-strong-bg px-4 py-3">
    <a
      v-for="(c, i) in crumbs"
      :key="i"
      :href="c.to || '#'"
      class="rounded-full px-2 py-1 text-sm text-design-page-muted transition cursor-pointer hover:text-design-page-text disabled:cursor-default disabled:opacity-70"
      @click.prevent="go(c.to)"
    >
      {{ c.label }}
    </a>
  </nav>
</template>
