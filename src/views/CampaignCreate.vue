<template lang="pug">

  ion-page
    ion-header
      breadcrumbs
    ion-content
      form(@submit.prevent="save")
        ion-list
          ion-item(:class="{ 'ion-invalid': !isValid || visibleErrors.name, 'ion-touched': touchedFields.name }")
            //- ion-icon(slot="start" name="create" color="primary")
            ion-input(
              ref="nameInput"
              v-model="draft.name" 
              label-placement="stacked" 
              placeholder="Campaign Name"
              :class="{ 'ion-invalid': visibleErrors.name, 'ion-touched': touchedFields.name }"
              :error-text="visibleErrors.name"
              required="true"
              enterkeyhint="next"
              @ionBlur="markAsTouched('name')"
            )
              div(slot="label")
                ion-text(color="dark") Name
                ion-text(color="primary")  *
          ion-item
            ion-textarea(v-model="draft.description" label="Description" label-placement="stacked" 
              placeholder="Campaign Description")
          ion-item
            ion-button(type="submit" :disabled="!isValid") Save
            ion-button(@click="cancel" color="medium") Cancel

</template>

<style scoped lang="scss">
</style>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import {
    IonPage, IonHeader, IonContent, IonList, IonItem, IonInput, IonTextarea, IonButton,
    IonNote, IonIcon, IonText
  } from '@ionic/vue';
  import { addIcons } from 'ionicons';
  import { createOutline } from 'ionicons/icons';
  import { onIonViewWillEnter, onIonViewWillLeave, onIonViewDidEnter } from '@ionic/vue';
  import { useUiStore } from '../stores/uiStore.ts';
  import useDataStore from '../stores/dataStore.ts';
  import { useRouter } from 'vue-router';
  import Breadcrumbs from '../components/Breadcrumbs.vue';
  import Ajv from 'ajv';
  import schema from '../generated/models/data.schema.json';

  addIcons({
    'create': createOutline
  });

  const campaignSchema = { ...schema.$defs.Campaign, $defs: schema.$defs };
  //console.log('Campaign schema:', campaignSchema);

  const dataStore = useDataStore();
  const ui = useUiStore();

  const router = useRouter();

  const draft = ref<any>({});

  const nameInput = ref<any>(null);

  // Keep track of user interaction state per field
  const touchedFields = ref<Record<string, boolean>>({});

  // Mark a field as touched when they interact with it
  function markAsTouched(field: string) {
    // console.log(`Marking field ${field} as touched`);
    touchedFields.value[field] = true;
  }

  onIonViewWillEnter(() => {
    draft.value = ui.startCampaignDraft();
    touchedFields.value = {};
  });

  onIonViewDidEnter(async () => {
    if (nameInput.value) {
      // Wait for Ionic to expose the inner native HTMLInputElement
      const nativeInput = await nameInput.value.$el.getInputElement();
      // Focus the field
      nativeInput.focus();
      // Select the text content (works for both empty strings and edits)
      nativeInput.select();
    }
  });

  onIonViewWillLeave(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  // Initialize AJV validator
  const ajv = new Ajv({ allErrors: true });
  const validateCampaign = ajv.compile(campaignSchema);

  // Compute errors reactively based on JSON Schema
  const validationResult = computed(() => {
    const valid = validateCampaign(draft.value);
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

  // Only expose error strings to the template if the field has been touched
  const visibleErrors = computed(() => {
    const errorsMap: Record<string, string> = {};

    Object.keys(validationResult.value.errors).forEach((key) => {
      if (touchedFields.value[key]) {
        errorsMap[key] = validationResult.value.errors[key];
      }
    });
    return errorsMap;
  });

  // Helpers for structural clarity in template
  const isValid = computed(() => validationResult.value.isValid);
  // const errors = computed(() => validationResult.value.errors);

  function save() {
    console.assert(!!ui.campaignDraft, 'No campaign draft to save');
    console.assert(isValid.value, 'Cannot save invalid campaign draft', visibleErrors.value);
    // Save the draft to the store
    dataStore.addCampaign(ui.campaignDraft);
    ui.clearCampaignDraft();
    router.push('/campaigns');
  }

  function cancel() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // touchedFields.value = {
    //   name: false,
    //   description: false
    // };
    // TODO: Consider prompting the user to confirm discarding changes if the draft has been modified
    ui.clearCampaignDraft();
    touchedFields.value = {};
    router.push('/campaigns');
  }
</script>