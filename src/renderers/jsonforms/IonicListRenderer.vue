<template lang="pug">
  ion-list
    ion-item(
      v-for="(element, index) in control.data"
      :key="`${control.path}-${index}`"
      :value="element.options?.value || undefined"
      :disabled="!control.enabled"
    )
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
import { IonList, IonItem, IonLabel } from '@ionic/vue';

const props = defineProps<{
  uischema: any,
  schema: any,
  path: string
}>();

const usage = useJsonFormsArrayControl(props);

const { control, removeItems, addItem, moveUp, moveDown } = usage;
    
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