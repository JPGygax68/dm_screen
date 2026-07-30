<template lang="pug">

  div(style="display: flex; flex-direction: column; width: 100%; padding: 10px 0;")

    ion-label.loose-label Character Classes

    //- Header Row with an action trigger button
    div(style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;")
      div(style="display: flex; flex-wrap: wrap; gap: 8px;")
        //- Fallback text if array is empty
        ion-text(color="medium" style="font-size: 14px;" v-if="!classes || classes.length === 0")
          | No classes selected yet.                 
        //- Render chips for selected targets with a click-to-remove function
        ion-chip(
          v-for="selectedClass in classes" 
          :key="selectedClass"
          color="primary"
        )
          ion-label {{ selectedClass }}
          ion-icon(name="close-circle" @click="removeClass(selectedClass)")

      ion-button(fill="clear" size="small" @click="openClassSelector")
        ion-icon(slot="start" name="options-outline")
          | Manage Classes

    //- 1. Hidden Ionic Select control that handles the data state
    ion-select(
      ref="classSelectRef"
      :value="classes"
      @ionChange="handleSelectChange"
      :interface-options="selectorOptions"
      multiple="true"
      interface="alert"
      ok-text="Apply"
      cancel-text="Dismiss"
      style="display: none; visibility: hidden; position: absolute;"
    )
      ion-select-option(v-for="dndClass in availableClasses" :key="dndClass" :value="dndClass")
        | {{ dndClass }}
</template>

<style scoped lang="scss">
  .loose-label {
    font-size: 13px;
    margin-bottom: 8px;
    font-weight: normal;
    color: var(--ion-color-dark);
  }
</style>

<script setup lang="ts">
  import { ref } from 'vue';
  import { addIcons } from 'ionicons';
  import {
    IonLabel, IonText, IonChip, IonIcon, IonSelect, IonSelectOption,
    IonButton
  } from '@ionic/vue';
  import { optionsOutline, closeCircle } from 'ionicons/icons';

  import type { Ref } from 'vue';

  // The static source of truth for standard SRD D&D 5e classes
  const availableClasses = [
    'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
    'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
  ];

  addIcons({
    'options-outline': optionsOutline,
    'close-circle': closeCircle
  });

  const selectorOptions = {
    header: 'Select Character Classes',
    subHeader: 'Choose one or more classes for your character'
  };
  
  const props = defineProps<{
    classes: string[];
    // TODO: additional classes?
  }>();

  const emit = defineEmits<{
    (e: 'update:classes', values: string[]): void
  }>();

  function handleSelectChange(event: CustomEvent) {
    const updatedValues = Array.isArray(event.detail.value) ? event.detail.value : [];
    emit('update:classes', updatedValues);
  }

  const classSelectRef: Ref<any> = ref(null);

  function openClassSelector() {
    if (classSelectRef.value) {
      classSelectRef.value.$el.open();
    }
  }

  function removeClass(selectedClass: string) {
    const index = props.classes.indexOf(selectedClass);
    if (index > -1) {
      props.classes.splice(index, 1);
    }
  }
</script>