<template lang="pug">

    IonAccordionGroup(
      :multiple="false"
      :value="props.openValues[0]"
      @ionChange="onAccordionChange($event)"
    )
      IonReorderGroup(@ionReorderEnd="onReorderEnd" :disabled="disabled")
        IonAccordion(
          v-for="(item, index) in items"
          :value="item[props.idField] || console.assert(false, `Item at index ${index} is missing the id field '${props.idField}'`)"
          :key="item[props.idField]"
          :disabled="disabled"
          @focusin="emit('update:openValues', [item[props.idField]])"
        )
          IonItem(slot="header")
            IonReorder(slot="start")
            IonLabel()
              | {{ item.name }} 
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
  import { trashOutline, arrowUpOutline, arrowDownOutline, addOutline, reorderTwoOutline } from 'ionicons/icons';
  import type { ReorderEndCustomEvent } from '@ionic/core/components';

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
    // Emitted when an accordion is opened or closed; array of ID's
    (e: 'update:openValues', value: string[] | null): void,
    // Emitted when the items array is changed (e.g., item moved or removed)
    (e: 'update:reorder', payload: any[]): void,
  }>();

  function onAccordionChange(event: CustomEvent) {
    const currentOpenValues = Array.isArray(event.detail.value)
      ? event.detail.value
      : [event.detail.value].filter(Boolean);
    console.log('IonAccordionGroup change event received with:', currentOpenValues);
    emit('update:openValues', currentOpenValues);
  }

  function onReorderEnd(event: ReorderEndCustomEvent) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', event.detail.from, 'to', event.detail.to);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group.
    event.detail.complete();
  }

  // Load all required icons for the buttons
  addIcons({
    'trash': trashOutline,
    'up': arrowUpOutline,
    'down': arrowDownOutline,
    'add': addOutline
  });

</script>