<template lang="pug">
  div
    ion-accordion-group
      ion-accordion(
        v-for="(element, index) in control.data"
        :key="`${control.path}-${index}`"
        :value="element.options?.value || undefined"
        :disabled="!control.enabled"
      )
        ion-item(slot="header")
          ion-label(slot="start")
            | {{ computedHelpers.campaignSummary(element, props.uischema) }}
            // Item {{ index + 1 }}: {{ element.name || 'Unnamed Campaign' }}
          div(slot="end" class="array-item-actions" @click.stop)
            ion-button(@click="removeItem(control.path, index)()")
              ion-icon(name="trash")
            ion-button(@click="moveUp(control.path, index)()" :disabled="index === 0")
              ion-icon(name="up")
            ion-button(@click="moveDown(control.path, index)()" :disabled="index === control.data.length - 1")
              ion-icon(name="down")
        ion-item(slot="content")
          dispatch-renderer(
            :schema="control.schema"
            :uischema="childUiSchema"
            :path="composePaths(control.path, `${index}`)"
            :enabled="control.enabled"
            :renderers="control.renderers"
            :cells="control.cells"
          )

    ion-button(@click="appendNewItem()()" icon="add" expand="block") {{ control.uischema?.options?.addNewItemLabel || 'Add New Item' }}

</template>
<script setup lang="ts">
import { findUISchema, composePaths } from '@jsonforms/core';
import { DispatchRenderer, rendererProps, useJsonFormsLayout, useJsonFormsArrayControl } from '@jsonforms/vue';
import { computed } from 'vue';
import { IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonIcon, IonButton, alertController } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { trashOutline, arrowUpOutline, arrowDownOutline, addOutline } from 'ionicons/icons';

import { computedHelpers } from '../../computedHelpers';

const props = defineProps<{
  uischema: any,
  schema: any,
  path: string
}>();

const usage = useJsonFormsArrayControl(props);
const { control, removeItems, addItem, moveUp, moveDown } = usage;

const removeItem = (path: string, value: any) => {
  return async () => {
    const alert = await alertController.create({
      header: 'Delete Campaign?',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: () => {
            removeItems(path, [value])();
          }
        }
      ]
    });

    await alert.present();
  };
};

const childUiSchema = computed(() => {
  console.log('control.value.uischema.items', control.value.uischema.items);
  return control.value.uischema.items;

  const arrayControl = control.value;
  const itemSchema = arrayControl.schema;
  // console.log('itemSchema', itemSchema);
  const detailOption = arrayControl.uischema?.options?.detail;

  // If detail option says "GENERATED", pass undefined to force a full fallback generation pass
  const targetDetail = detailOption === 'GENERATED' ? undefined : detailOption;

  console.log('finding childUiSchema for arrayControl:', arrayControl, '\nwith itemSchema:', itemSchema, '\nwith targetDetail:', targetDetail, '\nand arrayControl.path:', arrayControl.path);
  const childUiSchema = findUISchema(
    arrayControl.uischemas,
    itemSchema,
    targetDetail,
    arrayControl.path
  );
  console.log('childUiSchema', childUiSchema);
  return childUiSchema;
});
// console.log('childUiSchema', childUiSchema.value);

// Load all required icons for the buttons
addIcons({
  'trash': trashOutline,
  'up': arrowUpOutline,
  'down': arrowDownOutline,
  'add': addOutline
});

</script>