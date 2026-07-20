<script setup lang="ts">
import { createDefaultValue, resolveSchema } from '@jsonforms/core';
import { 
  useJsonFormsArrayControl, 
  rendererProps,
  DispatchRenderer 
} from '@jsonforms/vue';
import { IonButton, IonList, IonItem, IonLabel } from '@ionic/vue';
import { computed, ref } from 'vue';

const props = defineProps<{
  uischema: any,
  schema: any,
  path: string
}>();
console.log('props', props);

const usage = useJsonFormsArrayControl(props);
console.log('usage', usage);
const { control, removeItems, addItem, moveUp, moveDown } = usage;

function appendNewItem() {
  const schema = control.value.schema;
  const rootSchema = control.value.rootSchema;
  const defaultItemValue = createDefaultValue(schema, rootSchema);
  addItem(control.value.path, defaultItemValue)();
}

</script>

<template lang="pug">
div
  h4 Data
  pre {{ JSON.stringify(control.path, null, 2) }}

  div(v-for="(item, index) in control.data" :key="control.path + '-' + index" class="array-item-row")
    ion-item
      IonLabel
        | Item {{ index + 1 }}: {{ item.name || 'Unnamed Campaign' }}
      ion-button(@click="removeItems(control.path, [index])()") Remove
      ion-button(@click="moveUp(control.path, index)()") Move Up
      ion-button(@click="moveDown(control.path, index)()") Move Down
    //- dispatch-renderer(
    //-     :schema="control.schema.items"
    //-     :uischema="control.uischema.options"
    //-     :path="composePaths(control.path, `${index}`)"
    //-     :enabled="control.enabled"
    //-     :renderers="control.renderers"
    //-     :cells="control.cells"
    //-   )

  ion-button(@click="appendNewItem()()") Add New Item

</template>
