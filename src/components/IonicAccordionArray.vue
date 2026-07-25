<template lang="pug">
  div
    ion-accordion-group
      ion-accordion(
        v-for="(item, index) in items"
        :key="`${path}-${index}`"
        :value="item.options?.value || undefined"
        :disabled="disabled"
      )
        ion-item(slot="header")
          ion-label(slot="start")
            | {{ item.name }} 
            // Item {{ index + 1 }}: {{ element.name || 'Unnamed Campaign' }}
          div(slot="end" class="array-item-actions" @click.stop)
            ion-button(@click="removeItem(path, index)()")
              ion-icon(name="trash")
            ion-button(@click="moveUp(path, index)()" :disabled="index === 0")
              ion-icon(name="up")
            ion-button(@click="moveDown(path, index)()" :disabled="index === items.length - 1")
              ion-icon(name="down")
        ion-item(slot="content")
          slot(:item="item" :index="index")

    ion-button(@click="appendNewItem()()" icon="add" expand="block") {{ addNewLabel ?? 'Add New Item' }}

</template>
<script setup lang="ts">
import { computed } from 'vue';
import { IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonIcon, IonButton, alertController } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { trashOutline, arrowUpOutline, arrowDownOutline, addOutline } from 'ionicons/icons';

const props = defineProps<{
  items: any[],
  path: string,
  disabled?: boolean,
  addNewLabel?: string,
}>();
console.log('props', props);

const emit = defineEmits<{
  (e: 'change', payload: { path: string, value: any[] }): void,
  (e: 'append', payload: { path: string, value: any }): void,
}>();
console.log('emit', emit);

const moveUp = (path: string, index: number) => {
  return () => {
    const newItems = [...props.items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    emit('change', { path, value: newItems });
  };
};

const moveDown = (path: string, index: number) => {
  return () => {
    const newItems = [...props.items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    emit('change', { path, value: newItems });
  };
};

const appendNewItem = () => {
  return () => {
    // TODO: define a callback or prop to generate a new item based on the schema or a default value
    const newItem = { name: 'New Campaign', description: '' };
    emit('change', { path: props.path, value: [...props.items, newItem] });
  };
};

const removeItem = (path: string, index: number) => {
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
            const newItems = [...props.items];
            newItems.splice(index, 1);
            emit('change', { path, value: newItems });
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