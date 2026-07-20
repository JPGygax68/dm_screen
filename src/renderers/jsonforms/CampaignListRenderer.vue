<script setup lang="ts">
import { createDefaultValue, resolveSchema } from '@jsonforms/core';
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

const usage = useJsonFormsArrayControl(props);
const { control, removeItems, addItem, moveUp, moveDown } = usage;

function appendNewItem() {
  const schema = control.value.schema;
  const rootSchema = control.value.rootSchema;
  const defaultItemValue = createDefaultValue(schema, rootSchema);
  addItem(control.value.path, defaultItemValue)();
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
    ion-item
      IonLabel
        | Item {{ index + 1 }}: {{ item.name || 'Unnamed Campaign' }}
      ion-button(@click="removeItems(control.path, [index])()")
        ion-icon(name="trash")
      ion-button(@click="moveUp(control.path, index)()")
        ion-icon(name="up")
      ion-button(@click="moveDown(control.path, index)()")
        ion-icon(name="down")
    //- dispatch-renderer(
    //-     :schema="control.schema.items"
    //-     :uischema="control.uischema.options"
    //-     :path="composePaths(control.path, `${index}`)"
    //-     :enabled="control.enabled"
    //-     :renderers="control.renderers"
    //-     :cells="control.cells"
    //-   )

  ion-button(@click="appendNewItem()()" icon="add" expand="block") Add New Item

</template>
