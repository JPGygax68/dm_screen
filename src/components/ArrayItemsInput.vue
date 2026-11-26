<script setup lang="ts" generic="T">
import { useArrayItems } from "@/composables/useArrayItems";

const model = defineModel<T[]>({ required: true });
const props = defineProps<{ slotCount: number }>();

defineSlots<{
  default(props: {
    index: number;
    value: T | undefined;
    canAdd: boolean;
    canRemove: boolean;
    canEdit: boolean;
    addOrUpdate: (value: T) => void;
    remove: () => void;
  }): unknown;
}>();

const { slots, addOrUpdate, remove } = useArrayItems(
  model,
  () => props.slotCount,
);
</script>

<template>
  <template v-for="item in slots" :key="item.index">
    <slot
      :index="item.index"
      :value="item.value"
      :can-add="item.canAdd"
      :can-remove="item.canRemove"
      :can-edit="item.canEdit"
      :add-or-update="(value: T) => addOrUpdate(item.index, value)"
      :remove="() => remove(item.index)"
    />
  </template>
</template>
