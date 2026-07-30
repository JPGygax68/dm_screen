<template lang="pug">

  ion-page
    ion-header
      breadcrumbs
    ion-content
      form(@submit.prevent="save")
        ion-list
          ion-item(:class="{ 'ion-invalid': visibleErrors.name, 'ion-touched': touchedFields.name }")
            ion-input(
              ref="nameInput"
              v-model="draft.name" 
              label-placement="stacked" 
              placeholder="Character Name"
              autocapitalize="words"
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
              placeholder="Character Description")

          ion-item            
            ClassSelector(
              ref="classSelectRef"
              label="Character Classes"
              label-placement="stacked"
              placeholder="Select Character Classes"
              :classes="draft.classes"
              @update:classes="draft.classes = $event"
              multiple
            )

          ion-item
            ion-button(type="submit" :disabled="!isValid") Save
            ion-button(@click="cancel" color="medium") Cancel

</template>

<style scoped lang="scss">
  div {
    color: darkred;
  }

  .loose-label {
    font-size: 13px;
    margin-bottom: 8px;
    font-weight: normal;
    color: var(--ion-color-dark);
  }
</style>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    IonPage, IonHeader, IonContent, IonList, IonItem, IonInput, IonTextarea, IonButton,
    IonNote, IonIcon, IonText, IonLabel, IonChip, IonSelect, IonSelectOption
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
  import ClassSelector from '../components/ClassSelector.vue';

  addIcons({
    'create-outline': createOutline,
  });

  const characterSchema = { ...schema.$defs.PlayerCharacter, $defs: schema.$defs };
  //console.log('Campaign schema:', campaignSchema);

  const dataStore = useDataStore();
  const ui = useUiStore();

  const router = useRouter();
  const route = useRoute(); // Access the current route to get parameters
  const campaignId = route.params.campaign_id as string;

  const draft = ref<any>({ classes: [] });

  const nameInput = ref<any>(null);

  // Keep track of user interaction state per field
  const touchedFields = ref<Record<string, boolean>>({});

  // Mark a field as touched when they interact with it
  function markAsTouched(field: string) {
    // console.log(`Marking field ${field} as touched`);
    touchedFields.value[field] = true;
  }

  onIonViewWillEnter(() => {
    draft.value = ui.startPlayerCharacterDraft();
    console.log('Starting new player character draft:', draft.value);
    touchedFields.value = {};
  });

  onIonViewDidEnter(async () => {
    console.log('PlayerCharacterCreate.vue: onIonViewDidEnter');
    if (nameInput.value) {
      // Wait for Ionic to expose the inner native HTMLInputElement
      const nativeInput = await nameInput.value.$el.getInputElement();
      // Focus the field
      nativeInput.focus();
      // Select the text content (works for both empty strings and edits)
      // nativeInput.select();
    }
  });

  onIonViewWillLeave(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  // Initialize AJV validator
  const ajv = new Ajv({ allErrors: true });
  const validateCharacter = ajv.compile(characterSchema);

  // Compute errors reactively based on JSON Schema
  const validationResult = computed(() => {
    const valid = validateCharacter(draft.value);
    const errorsMap: Record<string, string> = {};

    if (!valid && validateCharacter.errors) {
      validateCharacter.errors.forEach((err) => {
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
  const isValid = computed(() => validationResult.value.isValid || true);
  // const errors = computed(() => validationResult.value.errors);

  function toggleClass(className: string) {
    const index = draft.value.classes.indexOf(className);
    if (index === -1) {
      // Add class if not present
      draft.value.classes.push(className);
    } else {
      // Remove class if tapped again
      draft.value.classes.splice(index, 1);
    }
  }


  // Reference pointer targeting the hidden select web component
  const classSelectRef = ref<any>(null);

  // Open the native Ionic popup window programmatically
  function openClassSelector(event: Event) {
    if (classSelectRef.value) {
      // Passes the physical pointer event so the popover aligns cleanly near the button on tablet
      classSelectRef.value.$el.open(event);
    }
  }

  // Inline helper to let users remove a class straight from the chip row
  function removeClass(className: string) {
    if (draft.value.classes) {
      draft.value.classes = draft.value.classes.filter((c: string) => c !== className);
    }
  }

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