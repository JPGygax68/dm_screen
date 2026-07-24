<template lang="pug">

ion-app

  ion-content(class="ion-padding app-content" fullscreen)

    main.ui-shell
      ion-breadcrumbs.breadcrumbs
        ion-breadcrumb(
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          :href="crumb.href"
        )
          | {{ crumb.label }}

      section.status-bar
        div
          strong Slice:
          |  {{ sliceName }}
        //- div
        //-   strong Validation errors:
        //-   |  {{ formErrorCount }}

      //- div.campaign
      //-   header.campaign-title
      //-     div
      //-       h1 Campaign Editor
      //-       p Campaign slice only (name) with schema-driven rendering.
      //-     div.header-actions
      //-       ion-button(fill="outline" size="small" @click="send({ type: 'RESET_CAMPAIGN' })")
      //-         | Reset

      div.debug
        div {{ activeData }}
        div {{ activeUiSchema}}
        //- h4 Store data
        //- pre(style="font-size: 50%;") {{ JSON.stringify(store.data, null, 2) }}

      IonicAccordionArray(
        :data="store.data.campaigns"
        :path="'/campaigns'"
        @change="store.update($event.path, $event.value)"
      )
      
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createActor } from 'xstate';
import { IonApp, IonBreadcrumbs, IonBreadcrumb, IonButton, IonContent, IonNote, IonAccordion } from '@ionic/vue';
import IonicAccordionArray from './components/IonicAccordionArray.vue';
import Ajv2020 from 'ajv/dist/2020';

import useDmScreenStore from './stores/dmScreenStore';
import { useUiStore } from './stores/uiStateStore';

import _dataSchema from './generated/models/data.schema.json';

const dataSchema = Object.freeze(_dataSchema);

const ajv = computed(() => new Ajv2020({
  allErrors: true,
  strict: false
}));

const validate = ref(() => ajv.value.compile(dataSchema));

const store = useDmScreenStore();
const uiStore = useUiStore();

const router = useRouter();

const breadcrumbs = computed(() => [
  { label: 'Home', href: '/' },
  { label: 'Campaign List', href: '/campaign-list' }
]);

const sliceName = computed(() => uiStore.activeSlice);

const campaignListUiSchema = Object.freeze({
  type: 'array',
  scope: '#/properties/campaigns',
  items: {
    type: 'Control',
    options: { readOnly: true },
    elements: [
      {
        type: 'Control',
        scope: '#/properties/name'
      },
      {
        type: 'Control',
        scope: '#/properties/description'
      }
    ],
  },
  options: {
    addNewItemLabel: 'Add New Campaign'
  }
});

const campaignDetailUiSchema = Object.freeze({
  type: 'Group',
  // scope: '#/properties/campaigns/items/' + uiStore.activeCampaignIndex,
  scope: '#',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/name'
    },
    {
      type: 'Control',
      scope: '#/properties/description'
    }
  ],
});

const activeData = computed(() => {
  console.log('store.data', store.data);
  switch (uiStore.activeSlice) {
    case 'campaigns':
      return store.data;
    case 'campaign':
      return store.data.campaigns[uiStore.activeCampaignIndex];
    default:
      return store.data;
  }
});

const activeDataSchema = computed(() => {
  switch (uiStore.activeSlice) {
    case 'campaigns':
      return dataSchema;
    case 'campaign':
      return dataSchema.properties.campaigns.items;
    default:
      return dataSchema;
  }
});

const activeUiSchema = computed(() => {
  switch (uiStore.activeSlice) {
    case 'campaigns':
      return campaignListUiSchema;
    case 'campaign':
      return campaignDetailUiSchema; // You need to define campaignDetailUiSchema somewhere
    default:
      return campaignListUiSchema;
  }
});

</script>
