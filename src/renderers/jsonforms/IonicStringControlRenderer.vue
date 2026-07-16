<template lang="pug">

  ion-item(v-if="control.visible" class="jf-ion-item" lines="none")
    ion-label(class="jf-ion-label" position="stacked")
      | {{ control.label }}
    ion-textarea(v-if="isMultiline" class="jf-ion-input"
      :value="control.data"
      :disabled="!control.enabled"
      :rows="textareaRows"
      :placeholder="placeholderText"
      @ionInput="onInput"
    )
    ion-input(v-else class="jf-ion-input"
      :value="control.data"
      :disabled="!control.enabled"
      :placeholder="placeholderText"
      @ionInput="onInput"
    )
    ion-note(v-if="control.errors" color="danger" class="jf-ion-error")
      | {{ control.errors }}
      
</template>

<script setup>
import { computed } from 'vue';
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue';
import { IonInput, IonItem, IonLabel, IonNote, IonTextarea } from '@ionic/vue';

const props = defineProps({
  ...rendererProps()
});

const { control, handleChange } = useJsonFormsControl(props);
const isMultiline = computed(() => Boolean(control.value?.uischema?.options?.multi));
const textareaRows = computed(() => Number(control.value?.uischema?.options?.rows || 5));
const placeholderText = computed(() => control.value?.description || '');

function onInput(event) {
  const value = event?.detail?.value ?? '';
  handleChange(control.value.path, value);
}
</script>
