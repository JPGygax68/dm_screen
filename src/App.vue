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
        div
          strong Validation errors:
          |  {{ formErrorCount }}

      //- div.campaign
      //-   header.campaign-title
      //-     div
      //-       h1 Campaign Editor
      //-       p Campaign slice only (name) with schema-driven rendering.
      //-     div.header-actions
      //-       ion-button(fill="outline" size="small" @click="send({ type: 'RESET_CAMPAIGN' })")
      //-         | Reset

      JsonForms(
        :schema="campaignSchema"
        :uischema="campaignUiSchema"
        :renderers="renderers"
        @change="store.update"
      )
      
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue';
import { createActor } from 'xstate';
import { IonApp, IonBreadcrumbs, IonBreadcrumb, IonButton, IonContent, IonNote } from '@ionic/vue';
import { JsonForms } from '@jsonforms/vue';
import { vanillaRenderers } from '@jsonforms/vue-vanilla';
import Ajv2020 from 'ajv/dist/2020';

import useDmScreenStore from './stores/dmScreenStore';

import dataSchema from './generated/models/data.schema.json';
import campaignUiSchema from './generated/models/campaign.uischema.json';
import campaignFormSpec from './generated/forms/campaign.form-spec.json';
import CampaignForm from './generated/forms/CampaignForm.vue';
import { campaignEditorMachine } from './models/campaign-editor.machine.mjs';
import { ionicRenderers } from './renderers/jsonforms/renderers.mjs';
import '@jsonforms/vue-vanilla/vanilla.css';

const store = useDmScreenStore();

const sliceName = 'campaign';

const breadcrumbs = computed(() => [
  { label: 'Home', href: '/' },
  { label: 'Campaign Editor', href: '/campaign-editor' }
]);

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

// Extract the Campaign schema from the data schema and include all definitions for validation
const campaignSchema = { ...dataSchema.$defs.Campaign, $defs: dataSchema.$defs };
const validateCampaign = ajv.compile(campaignSchema);

const renderers = Object.freeze([...ionicRenderers, ...vanillaRenderers]);

const actor = createActor(campaignEditorMachine);
const snapshot = ref(actor.getSnapshot());
let subscription;

const formErrorCount = computed(() => snapshot.value.context.formErrors.length);
const errorsByPath = computed(() => mapErrorsByPath(snapshot.value.context.formErrors));

function send(event) {
  actor.send(event);
}

function onFormChange({ data, errors }) {
  send({ type: 'FORM_CHANGED', data, errors });
}

function onSpecFieldUpdate({ path, value }) {
  if (!path || typeof path !== 'string') {
    return;
  }

  const nextData = setValueAtPath(snapshot.value.context.campaignData, path, value);
  const valid = validateCampaign(nextData);
  send({
    type: 'FORM_CHANGED',
    data: nextData,
    errors: valid ? [] : (validateCampaign.errors || [])
  });
}

function setValueAtPath(source, dataPath, value) {
  const clone = structuredClone(source || {});
  const segments = dataPath.split('.').filter(Boolean);
  if (segments.length === 0) {
    return clone;
  }

  let current = clone;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[segments[segments.length - 1]] = value;
  return clone;
}

function mapErrorsByPath(errors) {
  const mapped = {};
  if (!Array.isArray(errors)) {
    return mapped;
  }

  for (const error of errors) {
    const path = instancePathToDataPath(error?.instancePath);
    const message = error?.message || 'Invalid value';
    if (!path) {
      continue;
    }

    if (mapped[path]) {
      mapped[path] = `${mapped[path]} | ${message}`;
    } else {
      mapped[path] = message;
    }
  }

  return mapped;
}

function instancePathToDataPath(instancePath) {
  if (typeof instancePath !== 'string' || instancePath.length === 0) {
    return '';
  }

  return instancePath
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
    .join('.');
}

onMounted(() => {
  actor.start();
  subscription = actor.subscribe((next) => {
    snapshot.value = next;
  });
});

onBeforeUnmount(() => {
  if (subscription) subscription.unsubscribe();
  actor.stop();
});
</script>
