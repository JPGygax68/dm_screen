<template>
  <ion-app>
    <ion-content class="ion-padding app-content" fullscreen>
      <main class="campaign-shell campaign-editor-shell">
        <header class="campaign-title">
          <div>
            <h1>Campaign Editor</h1>
            <p>Campaign slice only (name) with schema-driven rendering.</p>
          </div>
          <div class="header-actions">
            <ion-button fill="outline" size="small" @click="send({ type: 'RESET_CAMPAIGN' })">
              Reset
            </ion-button>
          </div>
        </header>

        <section class="status-bar">
          <div><strong>Slice:</strong> campaign</div>
          <div><strong>Validation errors:</strong> {{ formErrorCount }}</div>
        </section>

        <section class="input-panel open">
          <JsonForms
            :data="snapshot.context.campaignData"
            :schema="campaignSchema"
            :uischema="campaignUiSchema"
            :renderers="renderers"
            :ajv="ajv"
            @change="onFormChange"
          />
        </section>
      </main>
    </ion-content>
  </ion-app>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { createActor } from 'xstate';
import { IonApp, IonButton, IonContent } from '@ionic/vue';
import { JsonForms } from '@jsonforms/vue';
import { vanillaRenderers } from '@jsonforms/vue-vanilla';
import Ajv2020 from 'ajv/dist/2020';
import YAML from 'yaml';
import campaignSchemaRaw from './models/campaign.schema.yaml?raw';
import campaignUiSchemaRaw from './models/campaign.uischema.yaml?raw';
import { campaignEditorMachine } from './models/campaign-editor.machine.mjs';
import '@jsonforms/vue-vanilla/vanilla.css';

const campaignSchemaDocument = YAML.parse(campaignSchemaRaw);
const campaignSchema = {
  ...campaignSchemaDocument.$defs.Campaign,
  $schema: campaignSchemaDocument.$schema,
  $defs: campaignSchemaDocument.$defs
};
const campaignUiSchema = YAML.parse(campaignUiSchemaRaw);

const renderers = Object.freeze([...vanillaRenderers]);
const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

const actor = createActor(campaignEditorMachine);
const snapshot = ref(actor.getSnapshot());
let subscription;

const formErrorCount = computed(() => snapshot.value.context.formErrors.length);

function send(event) {
  actor.send(event);
}

function onFormChange({ data, errors }) {
  send({ type: 'FORM_CHANGED', data, errors });
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
