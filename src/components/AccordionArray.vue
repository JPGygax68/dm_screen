<template lang="pug">

  IonAccordionGroup.group(
    :multiple="false"
    :value="props.openValues[0]"
    @ionChange="onAccordionChange($event)"
  )
    IonAccordion(
      v-for="(item, index) in items"
      :value="item[props.idField] || console.assert(false, `Item at index ${index} is missing the id field '${props.idField}'`)"
      :key="item[props.idField]"
      :disabled="disabled"
      @focusin="emit('update:openValues', [item[props.idField]])"
    )
      IonItem(slot="header")
        IonLabel(slot="start")
          | {{ item.name }} 
        div.header-buttons(slot="end" class="array-item-actions" @click.stop)
          slot(name="header" :item="item" :index="index")
          IonButton(@click="removeItem(index)" fill="clear" color="danger")
            IonIcon(slot="icon-only" name="trash")
          IonButton(@click="moveUp(index)" :disabled="index === 0" fill="clear" color="medium")
            IonIcon(slot="icon-only" name="up")
          IonButton(@click="moveDown(index)" :disabled="index === items.length - 1" fill="clear" color="medium")
            IonIcon(slot="icon-only" name="down")
      IonItem(slot="content")
        slot(name="content" :item="item" :index="index")

</template>

<style scoped lang="scss">
  .header-buttons {
    display: flex;
    gap: 4px;
    margin-right: 16px;
  }
</style>

<script setup lang="ts">
  import { alertController } from '@ionic/vue';
  import { addIcons } from 'ionicons';
  import { trashOutline, arrowUpOutline, arrowDownOutline, addOutline } from 'ionicons/icons';

  export type AccordionArrayChangeEvent = any[]; // newly ordered array of items after a change (e.g., item moved or removed)

  const props = withDefaults(defineProps<{
    idField?: string,
    items: any[],
    disabled?: boolean,
    openValues?: string[] | null
  }>(), {
    idField: 'id',
    disabled: false,
  });

  const emit = defineEmits<{
    // Emitted when the items array is changed (e.g., item moved or removed)
    (e: 'change', payload: any[]): void,
    // Emitted when an accordion is opened or closed; array of ID's
    (e: 'update:openValues', value: string[] | null): void
  }>();

  function onAccordionChange(event: CustomEvent) {
    const currentOpenValues = Array.isArray(event.detail.value)
      ? event.detail.value
      : [event.detail.value].filter(Boolean);
    console.log('IonAccordionGroup change event received with:', currentOpenValues);
    emit('update:openValues', currentOpenValues);
  }

  const moveUp = (index: number) => {
    const newItems = [...props.items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    emit('change', newItems);
  };

  const moveDown = (index: number) => {
    const newItems = [...props.items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    emit('change', newItems);
  };

  const removeItem = async (index: number) => {
    // TODO: confirmation should be delegated back to the parent component
    const alert = await alertController.create({
      header: 'Delete Item?',
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
            emit('change', newItems);
          }
        }
      ]
    });

    await alert.present();
  };

  // Load all required icons for the buttons
  addIcons({
    'trash': trashOutline,
    'up': arrowUpOutline,
    'down': arrowDownOutline,
    'add': addOutline
  });

</script>