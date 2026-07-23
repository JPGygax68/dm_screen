<template lang="pug">
  ion-accordion-group
    ion-accordion(
      v-for="(element, index) in control.data"
      :key="`${control.path}-${index}`"
      :value="element.options?.value || undefined"
      :disabled="!control.enabled"
    )
      ion-item(slot="header")
        ion-label
          | Item {{ index + 1 }}: {{ element.name || 'Unnamed Campaign' }}
        div(slot="end" class="array-item-actions")
          ion-button(@click="removeItems(control.path, [index])()")
            ion-icon(name="trash")
          ion-button(@click="moveUp(control.path, index)()" :disabled="index === 0")
            ion-icon(name="up")
          ion-button(@click="moveDown(control.path, index)()" :disabled="index === control.data.length - 1")
            ion-icon(name="down")
      ion-item(slot="content")
        dispatch-renderer(
          :schema="control.schema"
          :uischema="getChildUiSchema()"
          :path="composePaths(control.path, `${index}`)"
          :enabled="control.enabled"
          :renderers="control.renderers"
          :cells="control.cells"
        )

</template>
<script setup lang="ts">
import { findUISchema, composePaths } from '@jsonforms/core';
import { DispatchRenderer, rendererProps, useJsonFormsLayout, useJsonFormsArrayControl } from '@jsonforms/vue';
import { IonAccordionGroup, IonAccordion, IonItem, IonLabel } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { trashOutline, arrowUpOutline, arrowDownOutline, addOutline } from 'ionicons/icons';

const props = defineProps<{
  uischema: any,
  schema: any,
  path: string
}>();

const usage = useJsonFormsArrayControl(props);

const { control, removeItems, addItem, moveUp, moveDown } = usage;
    
// Load all required icons for the buttons
addIcons({
  'trash': trashOutline,
  'up': arrowUpOutline,
  'down': arrowDownOutline,
  'add': addOutline
});

const getChildUiSchema = () => {
  const arrayControl = control.value;
  const itemSchema = arrayControl.schema;
  const detailOption = arrayControl.uischema?.options?.detail;

  // If detail option says "GENERATED", pass undefined to force a full fallback generation pass
  const targetDetail = detailOption === 'GENERATED' ? undefined : detailOption;

  const childUiSchema = findUISchema(
    arrayControl.uischemas,
    itemSchema,
    targetDetail,
    arrayControl.path
  );
  return childUiSchema;
};

</script>