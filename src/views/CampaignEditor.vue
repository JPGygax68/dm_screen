<template lang="pug">

  ion-page
    ion-header
      breadcrumbs
    ion-content
      form(@submit.prevent="save" disabled="!isValid")
        ion-list
          ion-item(:class="{ 'ion-invalid': visibleErrors.name, 'ion-touched': touchedFields.name }")
            ion-input(
              ref="nameInput"
              v-model="draft.name" 
              label-placement="stacked" 
              placeholder="Campaign Name"
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
              placeholder="Campaign Description")

          ion-item.ion-no-padding
            ion-list
              ion-list-header
                div.list-header-inner
                  | Player Characters 
                  span.annotation (Optional)

              ion-item(v-for="(pc, index) in draft.party" :key="pc.id")
                //- 1. Left side: Character primary metadata info
                ion-label
                  h3(style="font-weight: 500; font-size: 16px; margin: 0 0 4px 0;") {{ pc.name }}
                  //- Inline flex container tracking character stats summary
                  div(style="display: flex; align-items: center; gap: 12px;")
                    //- HP Badge Indicator
                    ion-note(style="font-size: 13px; color: var(--ion-color-step-600); font-weight: 500;")
                      | {{ pc.maxHitPoints || 10 }}&nbsp;HP                    
                    //- Visual Class labels loop running horizontally
                    div(style="display: flex; gap: 4px;" v-if="pc.classes && pc.classes.length > 0")
                      span(
                        v-for="cls in pc.classes" 
                        :key="cls" 
                        style="font-size: 11px; background: var(--ion-color-primary-tight, rgba(56, 128, 255, 0.1)); color: var(--ion-color-primary); padding: 2px 6px; border-radius: 4px; font-weight: 500;"
                      ) {{ cls }}
                //- ion-label
                //-   h2 {{ pc.name }}
                //-   p {{ pc.description || 'No description provided' }}
                ion-button(slot="end" fill="clear" color="danger" @click="draft.party.splice(index, 1)")
                  ion-icon(name="trash-outline")

          //- Standard layout button opening our local overlay shell to add a new player character
          ion-item(lines="none")
            ion-button(expand="block" class="ion-no-margin" @click="isCharacterModalOpen = true")
              ion-icon(slot="start" name="person-add-outline")
              | Add Player Character

          ion-item
            ion-button(type="submit" :disabled="!isValid") Save Campaign
            ion-button(type="button" color="medium" @click="cancel") Cancel

      //- Inline Ionic overlay handling local character input sandbox context
      ion-modal(:is-open="isCharacterModalOpen" @didDismiss="isCharacterModalOpen = false")
        PlayerCharacterCreate(
          @save="handleInlineCharacterSave" 
          @cancel="isCharacterModalOpen = false"
        )
</template>

<style lang="scss" scoped>
  ion-textarea {
    padding-bottom: 12px;
  }
  .list-header-inner {
    font-size: 16px;
    font-weight: 600;
    color: var(--ion-color-step-600, #666666);
    margin: 8px 0 10px 0;
    display: flex;
    gap: 4px;
    align-items: baseline;
    justify-content: space-between;
    .annotation {
      font-weight: normal; 
      font-size: 14px;
      color: var(--ion-color-step-400);
      font-weight: 400;
    }
  }
</style>

<script setup lang="ts">
  import Ajv from 'ajv';
  import { onIonViewWillEnter } from '@ionic/vue';
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import {
    IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonPage,
    IonTextarea, IonToolbar, IonText, IonNote, IonBadge, IonRange, IonIcon, IonModal,
    IonListHeader, IonLabel
  } from '@ionic/vue';
  import { useDmScreenStore } from '../stores/dataStore';
  import { addIcons } from 'ionicons';
  import { personAddOutline, trashOutline } from 'ionicons/icons';
  import Breadcrumbs from '../components/Breadcrumbs.vue';
  import PlayerCharacterCreate from './PlayerCharacterCreate.vue';
  import fullSchema from '../generated/models/data.schema.json';

  addIcons({
    personAddOutline,
    trashOutline
  });

  const route = useRoute();
  const router = useRouter();
  const dataStore = useDmScreenStore();

  const campaignId = route.params.id as string;

  const isCharacterModalOpen = ref(false);

  const draft = ref<{
    id: string;
    name: string;
    description: string;
    party: any[];
  }>({
    id: crypto.randomUUID() as string,
    name: '',
    description: '',
    party: [],
  });

  // Keep track of user interaction state per field
  const touchedFields = ref<Record<string, boolean>>({});

  // Mark a field as touched when they interact with it
  function markAsTouched(field: string) {
    // console.log(`Marking field ${field} as touched`);
    touchedFields.value[field] = true;
  }

  // Initialize AJV validator
  const schema = { ...fullSchema.$defs.Campaign, $defs: fullSchema.$defs };
  console.log('Campaign schema:', schema);
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);

  // Compute errors reactively based on JSON Schema
  const validationResult = computed(() => {
    const valid = validate(draft.value);
    console.log('Validation result for draft:', valid);
    const errorsMap: Record<string, string> = {};

    if (!valid && validate.errors) {
      validate.errors.forEach((err) => {
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
  const errors = computed(() => validationResult.value.errors);

  onIonViewWillEnter(() => {
    console.log('CampaignEditor view will enter');

    const existingCampaign = dataStore.campaigns.find(c => c.id === campaignId);
    if (existingCampaign) {
      draft.value = JSON.parse(JSON.stringify(existingCampaign)); // Clone the existing campaign data
      console.log('Loaded existing campaign into draft:', draft.value);
    } else {
      console.warn(`No existing campaign found with ID: ${campaignId}, initializing new campaign draft`);
      draft.value = {
        id: campaignId || crypto.randomUUID() as string,
        name: '',
        description: '',
        party: [],
      };
    }
  });

  // Capture inline modal character emissions directly into the draft
  function handleInlineCharacterSave(newCharacter: any) {
    if (!draft.value.party) draft.value.party = [];
    draft.value.party.push(newCharacter);
    isCharacterModalOpen.value = false;
  }

  function save() {
    dataStore.addOrUpdateCampaign(draft.value);
    router.push('/campaigns');
  }

  function cancel() {
    router.push('/campaigns');
  }

</script>