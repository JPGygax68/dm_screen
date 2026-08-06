<template lang="pug">

  ion-page
    ion-header
      ion-toolbar
        ion-title.ion-padding Player Character
    ion-content
      form(@submit.prevent="save")
        ion-list
          ion-item(:class="{ 'ion-invalid': visibleErrors.name, 'ion-touched': touchedFields.name }")
            div(style="display: flex; align-items: flex-start; gap: 16px; width: 100%;")
              ImagePicker(
                ref="imageUploaderRef"
                :imageDataUrl="draft.portrait || ''"
                @change="onPortraitChanged($event)"
              )

              ion-input(
                ion-no-padding
                style="flex-grow: 1"
                ref="nameInput"
                v-model="draft.name" 
                label-placement="stacked" 
                placeholder="Character Name"
                autocapitalize="words"
                :class="{ 'ion-invalid': visibleErrors.name, 'ion-touched': touchedFields.name }"
                :error-text="visibleErrors.name"
                required="true"
                enterkeyhint="next"
                @ionInput="isDirty = true"
                @ionBlur="markAsTouched('name')"
              )
                div(slot="label")
                  ion-text(color="dark") Name
                  ion-text(color="primary")  *

          ion-item
            ion-textarea(
              v-model="draft.description" label="Description" label-placement="stacked" 
              placeholder="Character Description"
              @ionInput="isDirty = true"
              :rows="2"
              :auto-grow="true"
            )

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
            div(style="display: flex; flex-direction: column; width: 100%; padding: 10px 0;")
              div(style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;")
                ion-note(style="font-size: 13px; font-weight: 500; color: var(--ion-color-step-600);")
                  | Max Hit Points
                //- Floating badge showing active numerical data
                //- Interconnected Stepper Control Group
                div.badge
                  //- Down (Left Arrow) Button
                  ion-button(fill="clear" @click="adjustHp(-1)" style="margin: 0; --padding-start: 4px; --padding-end: 4px;")
                    ion-icon(slot="icon-only" :icon="chevronBackOutline" style="font-size: 16px;")
                  //- Your clean, permanent value badge
                  ion-badge(color="primary" style="font-size: 14px; padding: 6px 10px;")
                    | {{ draft.maxHitPoints || 10 }} HP
                  //- Up (Right Arrow) Button
                  ion-button(fill="clear" @click="adjustHp(1)" style="margin: 0; --padding-start: 4px; --padding-end: 4px;")
                    ion-icon(slot="icon-only" :icon="chevronForwardOutline" style="font-size: 16px;")

              //- Native Ionic Range Slider Component
              ion-range(
                v-model="draft.maxHitPoints"
                :min="schema.properties.maxHitPoints.minimum"
                :max="schema.properties.maxHitPoints.maximum"
                step="1"
                snaps="false"
                pin="false"
              )
                //- Optional: Add clear heart or metric contextual indicators to the edges
                ion-icon(slot="start" size="small" name="heart-dislike-outline" color="medium")
                ion-icon(slot="end" size="small" name="heart-outline" color="primary")
                
          ion-item(style="display: flex; gap: 8px")
            ion-button(type="submit" :disabled="!canSave") Save
            ion-button(@click="cancel" color="medium") Cancel
            span(style="flex: 1")
            //- Delete option only renders if modifying an existing PC profile row
            ion-button(
              v-if="isEditing" 
              type="button" 
              color="danger" 
              fill="outline" 
              @click="presentDeleteConfirmation"
            ) Delete Character

</template>

<style scoped lang="scss">

</style>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { alertController } from '@ionic/vue';
  import { addIcons } from 'ionicons';
  import {
    createOutline, removeOutline, addOutline,
    chevronBackOutline, chevronForwardOutline,
    heartOutline, heartDislikeOutline, personOutline
  } from 'ionicons/icons';
  import { onIonViewWillEnter, onIonViewWillLeave, onIonViewDidEnter } from '@ionic/vue';
  import Ajv from 'ajv';
  import fullSchema from '../generated/models/data.schema.json';
  import { unfocusActiveElement } from '../lib/domHelpers.ts';

  addIcons({
    createOutline,
    removeOutline,
    addOutline,
    heartOutline,
    heartDislikeOutline,
    chevronBackOutline,
    chevronForwardOutline
  });

  const schema = { ...fullSchema.$defs.PlayerCharacter, $defs: fullSchema.$defs };

  const nameInput = ref<any>(null);

  const props = defineProps<{
    characterData?: {
      id: string;
      name: string;
      maxHitPoints: number;
      classes: any[];
    };
  }>();

  const emit = defineEmits<{
    (e: 'save', payload: any): void;
    (e: 'cancel'): void;
    (e: 'delete', characterId: string): void;
  }>();

  const draft = ref(generateBlankOrClone(props.characterData));

  const isDirty = ref(false);

  function generateBlankOrClone(source: any | null) {
    if (source) {
      return { ...source }; // Return a clean copy of the character profile
    }
    return {
      id: crypto.randomUUID(),
      name: '',
      classes: [] as string[],
      maxHitPoints: 10
    };
  }

  // CRITICAL FOR MODALS: Watch for property swaps when toggling between different data objects
  watch(() => props.characterData, (newSource) => {
    draft.value = generateBlankOrClone(newSource);
  }, { deep: true });

  const isEditing = computed(() => !!props.characterData);

  // Keep track of user interaction state per field
  const touchedFields = ref<Record<string, boolean>>({});

  // Mark a field as touched when they interact with it
  function markAsTouched(field: string) {
    // console.log(`Marking field ${field} as touched`);
    touchedFields.value[field] = true;
  }

  async function presentDeleteConfirmation() {
    // Build and display the native confirmation overlay programmatically
    const alert = await alertController.create({
      header: 'Delete Character?',
      message: `Are you sure you want to permanently remove ${draft.value.name || 'this character'} \
        from the campaign party? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-role-cancel' // Keeps cancel styled softly
        },
        {
          text: 'Delete',
          role: 'destructive', // Signals a data-erasing step to the engine
          handler: () => {
            //console.log('User confirmed deletion track. Bubbling payload up...');
            emit('delete', draft.value.id);
          }
        }
      ]
    });

    await alert.present();
  }

  function onPortraitChanged(newImageDataUrl: string) {
    //console.log('Portrait image updated. New data URL length:', newImageDataUrl.length);
    draft.value.portrait = newImageDataUrl;
    isDirty.value = true;
  }

  // Lifecycle hooks to manage focus and reset touched fields when entering/leaving the view

  onIonViewWillEnter(() => {
    touchedFields.value = {};
    isDirty.value = false;
  });

  onIonViewDidEnter(async () => {
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
    unfocusActiveElement();
  });

  // Initialize AJV validator
  const ajv = new Ajv({ allErrors: true });
  const validatePlayerCharacter = ajv.compile(schema);

  // Compute errors reactively based on JSON Schema
  const validationResult = computed(() => {
    const valid = validatePlayerCharacter(draft.value);
    console.log('Validation result for draft:', valid);
    const errorsMap: Record<string, string> = {};

    if (!valid && validatePlayerCharacter.errors) {
      validatePlayerCharacter.errors.forEach((err) => {
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

  const canSave = computed(() => {
    return isValid.value && isDirty.value;
  });

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

  function adjustHp(delta: number) {
    const minHp = schema.properties.maxHitPoints.minimum || 1;
    const maxHp = schema.properties.maxHitPoints.maximum || 300;
    let newHp = (draft.value.maxHitPoints || 10) + delta;
    if (newHp < minHp) newHp = minHp;
    if (newHp > maxHp) newHp = maxHp;
    draft.value.maxHitPoints = newHp;
  }

  function save() {
    console.assert(!!draft.value, 'No player character draft to save');
    emit('save', { ...draft.value });
    unfocusActiveElement();
    touchedFields.value = {};
  }

  function cancel() {
    console.assert(!!draft.value, 'No player character draft to cancel');
    emit('cancel');
    unfocusActiveElement();
    touchedFields.value = {};
  }
</script>