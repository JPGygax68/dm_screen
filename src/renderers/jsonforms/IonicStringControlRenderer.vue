<template>
  <ion-item v-if="control.visible" class="jf-ion-item" lines="none">
    <ion-label class="jf-ion-label" position="stacked">
      {{ control.label }}
    </ion-label>
    <ion-input
      class="jf-ion-input"
      :value="control.data"
      :disabled="!control.enabled"
      :placeholder="control.description || ''"
      @ionInput="onInput"
    />
    <ion-note v-if="control.errors" color="danger" class="jf-ion-error">
      {{ control.errors }}
    </ion-note>
  </ion-item>
</template>

<script setup>
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue';
import { IonInput, IonItem, IonLabel, IonNote } from '@ionic/vue';

const props = defineProps({
  ...rendererProps()
});

const { control, handleChange } = useJsonFormsControl(props);

function onInput(event) {
  const value = event?.detail?.value ?? '';
  handleChange(control.value.path, value);
}
</script>
