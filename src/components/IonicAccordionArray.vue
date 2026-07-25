<template lang="pug">
  div
    IonAccordionGroup
      IonAccordion(
        v-for="(item, index) in items"
        :key="`${path}-${index}`"
        :value="item.options?.value || undefined"
        :disabled="disabled"
      )
        IonItem(slot="header")
          IonLabel(slot="start")
            | {{ item.name }} 
          div(slot="end" class="array-item-actions" @click.stop)
            IonButton(@click="removeItem(path, index)()")
              IonIcon(name="trash")
            IonButton(@click="moveUp(path, index)()" :disabled="index === 0")
              IonIcon(name="up")
            IonButton(@click="moveDown(path, index)()" :disabled="index === items.length - 1")
              IonIcon(name="down")
        IonItem(slot="content")
          slot(:item="item" :index="index")

    IonButton(@click="appendNewItem()()" icon="add" expand="block") {{ addNewLabel ?? 'Add New Item' }}

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

const emit = defineEmits<{
  (e: 'change', payload: { path: string, value: any[] }): void
}>();

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