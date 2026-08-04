<template lang="pug">

  IonAccordionGroup.group(
    :value="props.openValues"
    @ionChange="onAccordionChange($event)"
  )
    IonAccordion(
      v-for="(item, index) in items"
      :value="item[props.idField] || console.assert(false, `Item at index ${index} is missing the id field '${props.idField}'`)"
      :disabled="disabled"
    )
      IonItem(slot="header")
        IonLabel(slot="start")
          | {{ item.name }} 
        div(slot="end" class="array-item-actions" @click.stop)
          slot(name="header" :item="item" :index="index")
          IonButton(@click="removeItem(path, index)()")
            IonIcon(name="trash")
          IonButton(@click="moveUp(path, index)()" :disabled="index === 0")
            IonIcon(name="up")
          IonButton(@click="moveDown(path, index)()" :disabled="index === items.length - 1")
            IonIcon(name="down")
      IonItem(slot="content")
        slot(name="content" :item="item" :index="index")

</template>

<style scoped lang="scss">
  ion-accordion-group {
    overflow-y: auto;
    flex: 1;
  }
</style>

<script setup lang="ts">
  import { watch } from 'vue';
  import { computed, ref } from 'vue';
  import { IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonIcon, IonButton, alertController } from '@ionic/vue';
  import { addIcons } from 'ionicons';
  import { trashOutline, arrowUpOutline, arrowDownOutline, addOutline } from 'ionicons/icons';

  const props = withDefaults(defineProps<{
    idField?: string,
    items: any[],
    path: string,
    disabled?: boolean,
    openValue?: string
  }>(), {
    idField: 'id',
    disabled: false,
    openValues: null
  });

  const emit = defineEmits<{
    (e: 'change', payload: { path: string, value: any[] }): void,
    (e: 'update:openValues', value: string[]): void
  }>();

  function onAccordionChange(event: CustomEvent) {
    const currentOpenValues = Array.isArray(event.detail.value) 
      ? event.detail.value 
      : [event.detail.value].filter(Boolean);

    emit('update:openValues', currentOpenValues);
  }

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

  const removeItem = (path: string, index: number) => {
    return async () => {
      // TODO: confirmation should be delegated back to the parent component
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
              // TODO: Inform the parent that the item has been removed (by id)
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