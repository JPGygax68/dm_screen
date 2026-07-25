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

      IonicAccordionArray(
        :items="store.campaigns"
        :path="'campaigns'"
        :addNewLabel="'Add New Campaign'"
        @change="store.updateByPath($event.path, $event.value)"
      )
        template(v-slot="{ item, index }")
          IonList
            IonItem
              IonInput(:value="item.name" label="Name" label-placement="stacked" :placeholder="'Name'")
            IonItem
              IonInput(
                :value="item.description" 
                label="Description" 
                label-placement="stacked" 
                placeholder="Description"
                @ionInput="store.updateByPath(`campaigns/${index}/description`, $event.target.value)"
              )
      
</template>
<style scoped lang="scss">
.app-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createActor } from 'xstate';
import { 
  IonApp, IonBreadcrumbs, IonBreadcrumb, IonButton, IonContent, IonNote, 
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, 
  IonItem, IonLabel, IonIcon, IonList
} from '@ionic/vue';
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

</script>
