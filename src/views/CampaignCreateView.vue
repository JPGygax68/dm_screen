<template lang="pug">

  ion-page
    ion-header
      breadcrumbs
    ion-content
      ion-list
        ion-item(:class="{ 'ion-invalid': true ||errors.name, 'ion-touched': errors.name }")
          ion-input(
            v-model="draft.name" label="Name" label-placement="stacked" 
            placeholder="Campaign Name"
            :class="{ 'ion-invalid': errors.name, 'ion-touched': errors.name }"
            :error-text="errors.name"
          )
        ion-item
          ion-textarea(v-model="draft.description" label="Description" label-placement="stacked" 
            placeholder="Campaign Description")
        ion-item
          ion-button(@click="save" :disabled="!isValid") Save
          ion-button(@click="cancel" color="medium") Cancel

</template>

<style scoped lang="scss">
  div {
    color: darkred;
  }
</style>

<script setup lang="ts">
  import { computed } from 'vue';
  import { IonPage, IonHeader, IonContent, IonList, IonItem, IonInput, IonTextarea, IonButton,
    IonNote
   } from '@ionic/vue';
  import { useUiStore } from '../stores/uiStore.ts';
  import useDataStore from '../stores/dataStore.ts';
  import { useRouter } from 'vue-router';
  import Breadcrumbs from '../components/Breadcrumbs.vue';
  import Ajv from 'ajv';
  import schema from '../generated/models/data.schema.json';

  const campaignSchema = { ...schema.$defs.Campaign, $defs: schema.$defs };
  //console.log('Campaign schema:', campaignSchema);

  const dataStore = useDataStore();
  const ui = useUiStore();

  const router = useRouter();

  const draft = ui.startCampaignDraft();

  // Initialize AJV validator
  const ajv = new Ajv({ allErrors: true });
  const validateCampaign = ajv.compile(campaignSchema);

  // Compute errors reactively based on JSON Schema
  const validationResult = computed(() => {
    const valid = validateCampaign(draft);
    const errorsMap: Record<string, string> = {};

    if (!valid && validateCampaign.errors) {
      validateCampaign.errors.forEach((err) => {
        // err.instancePath looks like "/name"
        const fieldName = err.instancePath.replace('/', '') || err.params.missingProperty;
        if (fieldName) {
          errorsMap[fieldName] = err.message || 'Invalid field';
        }
      });
    }

    return {
      isValid: valid,
      errors: errorsMap
    };
  });


  // Helpers for structural clarity in template
  const isValid = computed(() => validationResult.value.isValid);
  const errors = computed(() => validationResult.value.errors);

  function save() {
    console.assert(!!ui.campaignDraft, 'No campaign draft to save');
    console.assert(isValid.value, 'Cannot save invalid campaign draft', errors.value);
    // Save the draft to the store
    dataStore.addCampaign(ui.campaignDraft);
    ui.clearCampaignDraft();
    router.push('/campaigns');
  }

  function cancel() {
    ui.clearCampaignDraft();
  }
</script>