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
      //-   pre {{ JSON.stringify(store.data, null, 2) }}

      JsonForms(
        :data="store.data"
        :rootSchema="dataSchema"
        :schema="topLevelSchema"
        :uischema="topLevelUiSchema"
        :renderers="renderers"
        :ajv="ajv"
        @change="store.update"
      )
      
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue';
import { createActor } from 'xstate';
import { IonApp, IonBreadcrumbs, IonBreadcrumb, IonButton, IonContent, IonNote } from '@ionic/vue';
import { JsonForms } from '@jsonforms/vue';
import { vanillaRenderers } from '@jsonforms/vue-vanilla';
import '@jsonforms/vue-vanilla/vanilla.css';
import Ajv2020 from 'ajv/dist/2020';

import useDmScreenStore from './stores/dmScreenStore';

import dataSchema from './generated/models/data.schema.json';
import uiSchema from './generated/models/dmscreen.uischema.json';
// import campaignUiSchema from './generated/models/campaign.uischema.json';
// import campaignFormSpec from './generated/forms/campaign.form-spec.json';
// import CampaignForm from './generated/forms/CampaignForm.vue';
// import { campaignEditorMachine } from './models/campaign-editor.machine.mjs';
import { myRenderers } from './renderers/jsonforms/renderers.mjs';

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});
ajv.addSchema(dataSchema, 'dataSchema');

const store = useDmScreenStore();

const router = useRouter();

const breadcrumbs = computed(() => [
  { label: 'Home', href: '/' },
  { label: 'Campaign List', href: '/campaign-list' }
]);

const sliceName = 'campaigns';

const topLevelSchema = { ...dataSchema.properties.campaigns, $defs: dataSchema.$defs };
const topLevelUiSchema = { ...uiSchema, ...uiSchema.campaigns };
//console.log('Top-level schema:', topLevelSchema);
// const topLevelUiSchema = {
//   type: 'Control',
//   scope: '#/properties/campaigns'
// };
const validateData = ajv.compile(topLevelSchema);
const renderers = Object.freeze([...myRenderers, ...vanillaRenderers]);

</script>
