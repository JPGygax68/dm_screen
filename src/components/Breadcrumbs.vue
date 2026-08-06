<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  import { computed } from 'vue';
  import { IonToolbar, IonButtons, IonButton } from '@ionic/vue';
  import { useDmScreenStore } from '../stores/dataStore';

  const route = useRoute();
  const router = useRouter();

  const store = useDmScreenStore();

  // Map routes to breadcrumb labels
  const crumbs = computed(() => {
    const path = route.path;

    if (path === '/campaigns') {
      return [
        { label: 'Campaigns', to: '/campaigns' }
      ];
    }

    if (path === '/campaigns/new') {
      return [
        { label: 'Campaigns', to: '/campaigns' },
        { label: 'New Campaign', to: null }
      ];
    }

    // /campaigns/:id/player-characters/new
    if (path.match(/\/campaigns\/[^/]+\/player-characters\/new/)) {
      // console.log('Generating breadcrumbs for path:', path);
      const campaign_id = route.params.campaign_id;
      const campaign = store.campaigns.find(c => c.id === campaign_id);
      if (!campaign) {
        console.error(`No campaign found with ID: ${campaign_id}`);
        return [];
      }
      return [
        { label: 'Player Characters', to: `/campaigns/${campaign_id}/player-characters` },
        { label: `"${campaign.name }"`, to: `/campaigns/${campaign_id}` },
        { label: 'New Player Character', to: `/campaigns/${campaign_id}/player-characters/new` }
      ];
    }

    // /campaigns/:id/edit
    if (path.match(/\/campaigns\/[^/]+\/edit/)) {
      console.log('Generating breadcrumbs for Campaign edit path:', path);
      const id = route.params.id;
      const campaign = store.campaigns.find(c => c.id === id);
      if (!campaign) {
        console.error(`No campaign found with ID: ${id}`);
        return [];
      }
      return [
        { label: 'Campaigns', to: '/campaigns' },
        { label: `"${campaign.name }"`, to: `/campaigns/${id}` },
        { label: 'Edit Campaign', to: `/campaigns/${id}/edit` }
      ];
    }

    // /campaigns/:id
    if (path.match(/\/campaigns\/[^/]+$/)) {
      const id = route.params.id;
      return [
        { label: 'Campaigns', to: '/campaigns' },
        { label: `"${store.campaigns.find(c => c.id === id)?.name}"`, to: `/campaigns/${id}` }
      ];
    }

    // /campaigns/:campaignId/encounters
    if (path.match(/\/campaigns\/[^/]+\/encounters$/)) {
      const campaignId = route.params.campaignId;
      const campaign = store.campaigns.find(c => c.id === campaignId);
      if (!campaign) {
        console.error(`No campaign found with ID: ${campaignId}`);
        return [];
      }
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

<template lang="pug">

  IonToolbar(color="light")
    IonButtons(slot="start")
      IonButton(v-for="(c, i) in crumbs" :key="i" @click="go(c.to)" :disabled="!c.to")
        | {{ c.label }}

</template>
