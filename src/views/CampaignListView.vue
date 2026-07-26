<template lang="pug">
IonicAccordionArray(
  :items="store.campaigns"
  :path="'campaigns'"
  :addNewLabel="'Add New Campaign'"
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
  .app-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .main-fields {
      width: 100%;
    }
  }
</style>

<script setup lang="ts">
import { IonList, IonItem, IonTextarea } from '@ionic/vue';
import useDmScreenStore from '../stores/dmScreenStore';
import type { Ref } from 'vue';
import IonicAccordionArray from '../components/IonicAccordionArray.vue';

const store = useDmScreenStore();
</script>