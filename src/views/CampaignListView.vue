<template lang="pug">
  div
    IonButton(@click="addNewCampaign()()" icon="add" expand="block") Add New Campaign

    IonicAccordionArray(
      :items="store.campaigns"
      :path="'campaigns'"
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
  div {
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
import { IonList, IonItem, IonTextarea, IonButton } from '@ionic/vue';
import useDmScreenStore from '../stores/dmScreenStore';
import type { Ref } from 'vue';
import IonicAccordionArray from '../components/IonicAccordionArray.vue';

const store = useDmScreenStore();

const addNewCampaign = () => {
  return () => {
    const newCampaign = { name: '(New Campaign)' };
    const newCampaigns = [newCampaign, ...store.campaigns];
    store.updateByPath('campaigns', newCampaigns);
  };
};
</script>