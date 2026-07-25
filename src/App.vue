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
        @focus="focusNameInput($event)"
      )
        template(v-slot="{ item, index }")
          IonList.main-fields
            IonItem
              IonInput(
                :value="item.name"
                @ionInput="store.updateByPath(`campaigns/${index}/name`, $event.target.value)"
                label="Name" 
                label-placement="stacked" 
                placeholder="Name"
                :ref="(el) => registerNameInputField(el, index)"
              )
            IonItem
              IonTextarea(
                :value="item.description" 
                label="Description" 
                label-placement="stacked" 
                placeholder="Description"
                rows="3"
                @ionInput="store.updateByPath(`campaigns/${index}/description`, $event.target.value)"
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
import { computed, onMounted, onBeforeUnmount, ref, useTemplateRef, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonApp, IonBreadcrumbs, IonBreadcrumb, IonButton, IonContent, IonNote,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput,
  IonItem, IonLabel, IonIcon, IonList, IonTextarea
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

const registerNameInputField = (el: any, index: number) => {
  nameInputRefs.value[index] = el;
};

const focusNameInput = (index: number) => {
  const input = nameInputRefs.value[index];
  setTimeout(() => input?.$el.setFocus(), 1); // Delay to ensure the input is rendered and ready
  // nextTick(() => {
  //   const input = nameInputRefs.value[index];
  //   console.log(`Focusing on name input field for index: ${index}`, input?.$el);
  //   input?.$el.setFocus();
  // });
};

</script>
