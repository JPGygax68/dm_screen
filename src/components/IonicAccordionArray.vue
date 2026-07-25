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
import { nextTick } from 'vue';
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
  (e: 'change', payload: { path: string, value: any[] }): void
}>();

const selectedItemIndex = ref('');

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
    // TODO: define a callback or prop to generate a new item based on the schema or a default value
    const newItem = { name: '(New Item)', description: '-' };
    if (props.append) {
      const newItems = [...props.items, newItem];
      emit('change', { path: props.path, value: newItems });
      selectedItemIndex.value = `item-${props.items.length}`; // select the newly added item
    } else {
      const newItems = [newItem, ...props.items];
      emit('change', { path: props.path, value: newItems });
      selectedItemIndex.value = `item-0`; // select the newly added item
    }
    nextTick(() => {
      // Scroll to the newly added item if needed
      const accordionGroup = document.querySelector(`#item-${selectedItemIndex.value}`);
      console.log('Scrolling to newly added item:', accordionGroup);
      if (accordionGroup) {
        accordionGroup.scrollTop = accordionGroup.scrollHeight;
      }
    });
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