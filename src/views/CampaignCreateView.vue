<template lang="pug">

  ion-page
    ion-header
      Breadcrumbs
    ion-content
      ion-list
        ion-item
          ion-input(v-model="draft.name" label="Name" label-placement="stacked" placeholder="Campaign Name")
        ion-item
          ion-textarea(v-model="draft.description" label="Description" label-placement="stacked" placeholder="Campaign Description")
        ion-item
          ion-button(@click="save") Save
          ion-button(@click="cancel" color="medium") Cancel

</template>

<style scoped lang="scss">
  div {
    color: darkred;
  }
</style>

<script setup lang="ts">
  import { IonPage, IonHeader, IonContent, IonList, IonInput, IonTextarea, IonButton } from '@ionic/vue';
  import { useUiStore } from '../stores/uiStore.ts';
  import useDataStore from '../stores/dataStore.ts';
  import { useRouter } from 'vue-router';
  import Breadcrumbs from '../components/Breadcrumbs.vue';

  const dataStore = useDataStore();
  const ui = useUiStore();

  const router = useRouter();

  const draft = ui.startCampaignDraft();

  function save() {
    console.assert(!!ui.campaignDraft, 'No campaign draft to save');
    // Save the draft to the store
    dataStore.addCampaign(ui.campaignDraft);
    ui.clearCampaignDraft();
    router.push('/campaigns');
  }

  function cancel() {
    ui.clearCampaignDraft();
  }
</script>