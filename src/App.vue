<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { IonApp, IonRouterOutlet } from '@ionic/vue';
  import Ajv2020 from 'ajv/dist/2020';

  import { focusIonicInput, focusAndSelectIonicInput } from './lib/vue-ionic-utils';
  import useDmScreenStore from './stores/dmScreenStore';
  import { useUiStore } from './stores/uiStateStore';

  import CampaignListView from './views/CampaignListView.vue';

  import _dataSchema from './generated/models/data.schema.json';

  const dataSchema = Object.freeze(_dataSchema);

  const ajv = computed(() => new Ajv2020({
    allErrors: true,
    strict: false
  }));

  const validate = ajv.value.compile(dataSchema);

  const store = useDmScreenStore();
  const uiStore = useUiStore();

  const breadcrumbs = computed(() => [
    { label: 'Home', href: '/' },
    { label: 'Campaign List', href: '/campaign-list' }
  ]);

  const sliceName = computed(() => uiStore.activeSlice);

  const nameInputRefs = ref<{ [key: string]: any | null }>({});

</script>

<template lang="pug">

IonApp   
  IonRouterOutlet

</template>

<style scoped lang="scss">
  ion-app {
    height: 100%;
    border: none;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
</style>