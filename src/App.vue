<script setup lang="ts">
  import { computed, onMounted, onBeforeUnmount, ref, useTemplateRef, watch, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { IonApp, IonBreadcrumbs, IonBreadcrumb, IonContent } from '@ionic/vue';
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

  const router = useRouter();

  const breadcrumbs = computed(() => [
    { label: 'Home', href: '/' },
    { label: 'Campaign List', href: '/campaign-list' }
  ]);

  const sliceName = computed(() => uiStore.activeSlice);

  const nameInputRefs = ref<{ [key: string]: any | null }>({});

</script>

<template lang="pug">

IonApp

  IonContent(class="ion-padding app-content" fullscreen)

    main.ui-shell
      IonBreadcrumbs(class="breadcrumbs")
        IonBreadcrumb(
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          :href="crumb.href"
        )
          | {{ crumb.label }}

      section.status-bar
        div
          strong Slice:
          |  {{ sliceName }}

      CampaignListView

</template>

<style scoped lang="scss">
  .ui-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  campaign-list-view {
    flex: 1;
  }
</style>