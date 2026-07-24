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
            | {{ element.name }} 
            // Item {{ index + 1 }}: {{ element.name || 'Unnamed Campaign' }}
          div(slot="end" class="array-item-actions" @click.stop)
            ion-button(@click="removeItem(control.path, index)()")
              ion-icon(name="trash")
            ion-button(@click="moveUp(control.path, index)()" :disabled="index === 0")
              ion-icon(name="up")
            ion-button(@click="moveDown(control.path, index)()" :disabled="index === control.data.length - 1")
              ion-icon(name="down")
        ion-item(slot="content")
          div(
            :path="control.path + '/' + index"
            :data="control.data[index]"
          ) 
            | PLACEHOLDER FOR DETAIL VIEW

    ion-button(@click="appendNewItem()()" icon="add" expand="block") {{ control.uischema?.options?.addNewItemLabel || 'Add New Item' }}

</template>
<script setup lang="ts">
import { computed } from 'vue';
import { IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonIcon, IonButton, alertController } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { trashOutline, arrowUpOutline, arrowDownOutline, addOutline } from 'ionicons/icons';

const props = defineProps<{
  path: string,
  data: any[],
}>();

const control = computed(() => {
  return {
    path: props.path,
    data: props.data,
    enabled: true
  };
});

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

// Load all required icons for the buttons
addIcons({
  'trash': trashOutline,
  'up': arrowUpOutline,
  'down': arrowDownOutline,
  'add': addOutline
});

</script>