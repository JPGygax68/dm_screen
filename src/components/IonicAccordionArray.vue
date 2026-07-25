<template lang="pug">
div.top-level
  div.accordion-container
    IonAccordionGroup(:value="selectedItemIndex")
      IonAccordion(
        v-for="(item, index) in items"
        :value="`item-${index}`"
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

  IonButton(@click="addNewItem()()" icon="add" expand="block") {{ addNewLabel ?? 'Add New Item' }}

</template>
<style scoped lang="scss">
.top-level {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow-y: auto;
  gap: 0.5rem;

  .accordion-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 100%;
  }
}
</style>
<script setup lang="ts">
import { nextTick, watch } from 'vue';
import { computed, ref } from 'vue';
import { IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonIcon, IonButton, alertController } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { trashOutline, arrowUpOutline, arrowDownOutline, addOutline } from 'ionicons/icons';

const props = defineProps<{
  items: any[],
  path: string,
  disabled?: boolean,
  addNewLabel?: string,
  append?: boolean,
}>();

const emit = defineEmits<{
  (e: 'change', payload: { path: string, value: any[] }): void,
  (e: 'focus', index: number): void,
}>();

const selectedItemIndex = ref('');

const indexToFocus = ref(-1);

// Watch a specific value in your store
watch(() => props.items, async (newItems, oldItems) => {
  console.log('items changed to:', newItems, 'Previous value was:', oldItems);

  if (indexToFocus.value >= 0 && indexToFocus.value < newItems.length) {
    emit('focus', indexToFocus.value);
    indexToFocus.value = -1; // Reset after focusing
  }
});

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

const addNewItem = () => {
  return () => {
    const newItem = { name: '(New Item)', description: '-' };
    let index = -1;
    let newItems: any[] = [];
    if (props.append) {
      newItems = [...props.items, newItem];
      index = props.items.length; // index of the newly added item
    } else {
      newItems = [newItem, ...props.items];
      index = 0; // index of the newly added item
    }
    selectedItemIndex.value = `item-${index}`; // select the newly added item
    emit('change', { path: props.path, value: newItems });
    //indexToFocus.value = index; // set the index to focus on
    emit('focus', index); // directly emit focus event for the newly added item
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
            selectedItemIndex.value = ''; // clear selection if the selected item was removed
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