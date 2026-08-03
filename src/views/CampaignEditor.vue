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

          ion-item
            //- Use your custom FormRow wrapper or standard isolated layout container
            div(style="display: flex; flex-direction: column; width: 100%; padding: 10px 0;")
              div(style="font-size: 13px; font-weight: 500; color: var(--ion-color-step-600); margin-bottom: 8px;") 
                | Party Members

              //- Horizontal flexbox group automatically wraps elements gracefully onto new lines
              div(class="party-inline-flex-group")
                
                //- Clickable Character Badges
                ion-badge(
                  v-for="pc in draft.party" 
                  :key="pc.id" 
                  class="badge-interactive-pc"
                  @click="openCharacterEditor(pc)"
                ) {{ pc.name }}

                //- Clean inline execution button matching the height of your text badges
                ion-button(
                  fill="clear" 
                  size="small" 
                  @click="openCharacterCreator"
                  style="margin: 0; --padding-start: 8px; --padding-end: 8px; font-size: 13px;"
                )
                  ion-icon(slot="start" :icon="personAddOutline" style="font-size: 16px; margin-inline-end: 4px;")
                  | Add Member

          ion-item
            ion-button(type="submit" :disabled="!isValid") Save Campaign
            ion-button(type="button" color="medium" @click="cancel") Cancel

      //- Inline Ionic overlay handling local character input sandbox context
      ion-modal(:is-open="isCharacterModalOpen" @didDismiss="isCharacterModalOpen = false")
        PlayerCharacterEditor(
          :characterData="selectedCharacterForEdit"
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
  }

  .inline-annotation {
    font-weight: normal;
    font-size: 14px;
    color: var(--ion-color-step-400);
    font-weight: 400;
  }

  .character-css-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    padding: 16px;
    gap: 16px;
    width: 100%;
  }

  ion-card-header ion-button.trashcan {
    position: absolute;
    right: 0;
    top: 0;
  }

  .bottom {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .classes {
      --color: --ion-color-light;
    }
  }

  .character-classes {
    ion-badge {
      &.main-class {
        font-size: 14px;
      }

      padding: 4px 8px;
      font-weight: bold;
      border-radius: 6px;
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
    IonListHeader, IonLabel, IonGrid, IonRow, IonCol, IonCard, IonCardContent
  } from '@ionic/vue';
  import { useDmScreenStore } from '../stores/dataStore';
  import { addIcons } from 'ionicons';
  import { personAddOutline, trashOutline } from 'ionicons/icons';
  import Breadcrumbs from '../components/Breadcrumbs.vue';
  import PlayerCharacterEditor from './PlayerCharacterEditor.vue';
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

  // Local tracker holding the active character configuration target data structure
  const selectedCharacterForEdit = ref<any>(null);

  function openCharacterCreator() {
    selectedCharacterForEdit.value = null; // Tells the modal to act as a creation sandbox
    isCharacterModalOpen.value = true;
  }

  function openCharacterEditor(character: any) {
    // Pass a deep copy of the selected character row safely into the editor state
    selectedCharacterForEdit.value = JSON.parse(JSON.stringify(character));
    isCharacterModalOpen.value = true;
  }

  function handleInlineCharacterSave(characterData: any) {
    if (!draft.value.party) draft.value.party = [];

    const index = draft.value.party.findIndex((pc: any) => pc.id === characterData.id);

    if (index !== -1) {
      // Modify existing character details row inline
      draft.value.party[index] = characterData;
    } else {
      // Append a brand new character record
      draft.value.party.push(characterData);
    }

    isCharacterModalOpen.value = false;
  }

  function handleInlineCharacterDelete(characterId: string) {
    draft.value.party = draft.value.party.filter((pc: any) => pc.id !== characterId);
    isCharacterModalOpen.value = false;
  }

  function save() {
    dataStore.addOrUpdateCampaign(draft.value);
    router.push('/campaigns');
  }

  function cancel() {
    router.push('/campaigns');
  }

  // Lifecycle hook to load existing campaign data into the draft when the view is entered

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


</script>