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

    // /campaigns/:id
    if (path.startsWith('/campaigns/')) {
      const id = route.params.id;
      return [
        { label: 'Campaigns:', to: '/campaigns' },
        { label: `"${store.campaigns.find(c => c.id === id)?.name}"`, to: `/campaigns/${id}` }
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
