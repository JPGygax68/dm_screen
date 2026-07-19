<script setup lang="ts">
import type { ControlProps } from '@jsonforms/vue';
import { 
  useJsonFormsArrayControl, 
  rendererProps,
  DispatchRenderer 
} from '@jsonforms/vue';
import { IonButton, IonList, IonItem, IonLabel } from '@ionic/vue';

const props = defineProps<{
  //...rendererProps
  uischema: any,
  schema: any,
  path: string
}>();
console.log('props', props);

const {
  control,
} = useJsonFormsArrayControl(props);
</script>

<template lang="pug">
div
  h4 Data
  pre {{ JSON.stringify(control.data, null, 2) }}

  //- div(v-for="(item, index) in control.data" :key="`${path}-${index}`" class="array-item-row")
  //-   ion-item
  //-     IonLabel
  //-       | Item {{ index + 1 }}: {{ item.name || 'Unnamed Campaign' }}
  //-     ion-button(@click="control.removeItems([index])") Remove
  //-     ion-button(@click="moveUp(index)") Move Up
  //-     ion-button(@click="moveDown(index)") Move Down
  //-   //- dispatch-renderer(
  //-   //-     :schema="control.schema.items"
  //-   //-     :uischema="control.uischema.options"
  //-   //-     :path="composePaths(control.path, `${index}`)"
  //-   //-     :enabled="control.enabled"
  //-   //-     :renderers="control.renderers"
  //-   //-     :cells="control.cells"
  //-   //-   )

  // ion-button(@click="addItem(path, createDefaultValue())") Add Item

</template>
