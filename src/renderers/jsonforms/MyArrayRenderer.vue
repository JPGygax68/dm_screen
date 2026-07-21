<script setup lang="ts">
import { useRouter } from 'vue-router';
import { createDefaultValue, resolveSchema, composePaths, findUISchema } from '@jsonforms/core';
import { 
  useJsonFormsArrayControl, 
  rendererProps,
  DispatchRenderer 
} from '@jsonforms/vue';
import { IonButton, IonIcon, IonList, IonItem, IonLabel, IonCard } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { 
  trashOutline, 
  arrowUpOutline, 
  arrowDownOutline, 
  addOutline 
} from 'ionicons/icons';

const props = defineProps<{
  uischema: any,
  schema: any,
  path: string
}>();
//console.log('CampaignListRenderer props:', props);

const usage = useJsonFormsArrayControl(props);
const { control, removeItems, addItem, moveUp, moveDown } = usage;
//console.log('CampaignListRenderer control:', control);
//console.log('schema:', control.value.arraySchema);

// Process the child element schemas safely inside the script block

const getChildUiSchema = () => {
  const arrayControl = control.value;
  const itemSchema = arrayControl.schema;
  const detailOption = arrayControl.uischema?.options?.detail;

  // If detail option says "GENERATED", pass undefined to force a full fallback generation pass
  const targetDetail = detailOption === 'GENERATED' ? undefined : detailOption;
  console.log('CampaignListRenderer: resolved target detail option:', targetDetail);

  const childUiSchema = findUISchema(
    arrayControl.uischemas,
    itemSchema,
    targetDetail,
    arrayControl.path
  );
  return childUiSchema;

  console.log('CampaignListRenderer: found child UI schema:', childUiSchema);

  if (childUiSchema && childUiSchema.elements) {
    return {
      type: 'Group',                                          // Satisfies uiTypeIs('Group')
      label: detailOption?.label || '<no label>',  
      elements: childUiSchema.elements                        // Passes down the generated input controls safely
    };
  }
  return childUiSchema;
};

const router = useRouter();

// defineEmits<{
//   (e: 'itemClicked', payload: { index: number }): void;
// }>();

function appendNewItem() {
  const schema = control.value.schema;
  const rootSchema = control.value.rootSchema;
  const defaultItemValue = createDefaultValue(schema, rootSchema);
  addItem(control.value.path, defaultItemValue)();
}

function goToDetailView(item: any, index: number) {
  router.push({ name: 'campaign', params: { index } });
}

// Load all required icons for the buttons
addIcons({
  'trash': trashOutline,
  'up': arrowUpOutline,
  'down': arrowDownOutline,
  'add': addOutline
});
</script>

<template lang="pug">

div
  ion-card(v-for="(item, index) in control.data" :key="control.path + '-' + index" class="array-item-row")
    //ion-item(@click="() => $emit('itemClicked', { index })")
    ion-item
      //(@click="() => goToDetailView(item, index)")
      //- ion-label
      //-   | Item {{ index + 1 }}: {{ item.name || 'Unnamed Campaign' }}
      dispatch-renderer(
          :schema="control.schema"
          :uischema="getChildUiSchema()"
          :path="composePaths(control.path, `${index}`)"
          :enabled="control.enabled"
          :renderers="control.renderers"
          :cells="control.cells"
        )
      div(slot="end" class="array-item-actions")
        ion-button(@click="removeItems(control.path, [index])()")
          ion-icon(name="trash")
        ion-button(@click="moveUp(control.path, index)()" :disabled="index === 0")
          ion-icon(name="up")
        ion-button(@click="moveDown(control.path, index)()" :disabled="index === control.data.length - 1")
          ion-icon(name="down")

  ion-button(@click="appendNewItem()()" icon="add" expand="block") Add New Item

</template>
