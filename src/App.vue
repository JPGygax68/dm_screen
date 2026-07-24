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

      //- div.debug
      //-   h4 Store data
      //-   pre(style="font-size: 50%;") {{ JSON.stringify(store.data, null, 2) }}

      JsonForms(
        :data="store.data"
        :schema="dataSchema"
        :uischema="uischema"
        :renderers="renderers"
        :validate="validate"
        :ajv="ajv"
        @change="store.update"
      )
      
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue';
import { createActor } from 'xstate';
import { IonApp, IonBreadcrumbs, IonBreadcrumb, IonButton, IonContent, IonNote, IonAccordion, IonAccordionGroup } from '@ionic/vue';
import { JsonForms } from '@jsonforms/vue';
import { vanillaRenderers, arrayRenderers } from '@jsonforms/vue-vanilla';
import '@jsonforms/vue-vanilla/vanilla.css';
import Ajv2020 from 'ajv/dist/2020';

import useDmScreenStore from './stores/dmScreenStore';

import dataSchema from './generated/models/data.schema.json';
import uiSchema from './generated/models/campaign-list.uischema.json';
import { myRenderers } from './renderers/jsonforms/renderers.mjs';

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

const validate = ajv.compile(dataSchema);

const store = useDmScreenStore();

const router = useRouter();

const breadcrumbs = computed(() => [
  { label: 'Home', href: '/' },
  { label: 'Campaign List', href: '/campaign-list' }
]);

const sliceName = 'campaigns';

const uischema = Object.freeze({
  type: 'array',
  scope: '#/properties/campaigns',
  options: {
    addNewItemLabel: 'Add New Campaign'
  }
});
// const uischema = Object.freeze(uiSchema);

const renderers = Object.freeze([
  ...myRenderers,
  ...vanillaRenderers,
  ...arrayRenderers
]);

</script>
