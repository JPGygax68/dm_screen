<template lang="pug">
  IonPage
    IonHeader
      Breadcrumbs

    IonContent
      IonButton(
        @click="addNewCampaign()" 
        expand="block" 
        class="ion-margin-horizontal ion-margin-top"
      ) Add New Campaign

      IonicAccordionArray(
        :items="store.campaigns"
        :path="'campaigns'"
        v-model:openValues="openAccordions"
        @change="store.updateByPath($event.path, $event.value)"
      )
        template(v-slot="{ item, index }")
          IonList.main-fields
            IonItem
              IonTextarea(
              :value="item.description" 
              label-placement="stacked" 
              placeholder="Description"
              rows="5"
              readOnly
            )
</template>

<style scoped lang="scss">
  ion-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;

    ionic-accordion-array {
      flex: 1;
    }
  }
</style>

<script setup lang="ts">
  import { IonPage, IonHeader, IonContent, IonList, IonItem, IonTextarea, IonButton } from '@ionic/vue';
  import { useRouter } from 'vue-router';
  import useDmScreenStore from '../stores/dataStore.ts';
  import type { Ref } from 'vue';
  import IonicAccordionArray from '../components/IonicAccordionArray.vue';
  import Breadcrumbs from '../components/Breadcrumbs.vue';
  import { useUiStore } from '../stores/uiStore.ts';

  const router = useRouter();
  const store = useDmScreenStore();
  const ui = useUiStore();

  const { openCampaignAccordions: openAccordions } = ui;

  const addNewCampaign = () => {
    // return () => {
    //   const newCampaign = { name: '(New Campaign)' };
    //   const newCampaigns = [newCampaign, ...store.campaigns];
    //   store.updateByPath('campaigns', newCampaigns);
    // };
    router.push('/campaigns/new');
  };

  function handleAccordionChange(newValue: string | null) {
    console.log('Accordion change event received with value:', newValue);
    ui.setOpenCampaignAccordionId(newValue);
  }
</script>