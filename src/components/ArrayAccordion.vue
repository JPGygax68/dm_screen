<template>
  <div class="accordion-array">
    <div v-for="(item, index) in items" :key="item[props.idField] || index" class="accordion-item">
      <div class="accordion-header">
        <button type="button" class="accordion-toggle" @click="toggleItem(item)">
          {{ item.name || `Item ${index + 1}` }}
        </button>

        <div class="header-actions">
          <button type="button" @click="moveItem(index, -1)" :disabled="index === 0">↑</button>
          <button type="button" @click="moveItem(index, 1)" :disabled="index === items.length - 1">↓</button>
          <button type="button" class="danger" @click="deleteItem(index, item)">Remove</button>
        </div>
      </div>

      <div v-if="isOpen(item)" class="accordion-content">
        <slot name="content" :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .accordion-array {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .accordion-item {
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    overflow: hidden;
    background: rgba(15, 23, 42, 0.35);
  }

  .accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .accordion-toggle {
    flex: 1;
    background: transparent;
    border: 0;
    color: inherit;
    text-align: left;
    font: inherit;
    cursor: pointer;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    button {
      appearance: none;
      border: 1px solid rgba(148, 163, 184, 0.2);
      background: rgba(15, 23, 42, 0.7);
      color: inherit;
      border-radius: 8px;
      padding: 0.35rem 0.5rem;
      cursor: pointer;

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      &.danger {
        color: #fca5a5;
      }
    }
  }

  .accordion-content {
    border-top: 1px solid rgba(148, 163, 184, 0.15);
    padding: 0.75rem 1rem 1rem;
  }
</style>

<script setup lang="ts">
  export type AccordionArrayChangeEvent = any[];

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
    (e: 'update:openValues', value: string[] | null): void,
    (e: 'update:reorder', payload: any[]): void,
    (e: 'update:deleteItem', payload: { index: number; id: string }): void,
  }>();

  function getItemId(item: any, index: number) {
    if (item && item[props.idField] != null) return String(item[props.idField]);
    return `item-${index}`;
  }

  function isOpen(item: any) {
    const itemId = getItemId(item, 0);
    return (props.openValues ?? []).includes(itemId);
  }

  function toggleItem(item: any) {
    const currentIds = props.openValues ?? [];
    const itemId = getItemId(item, currentIds.length);
    const next = currentIds.includes(itemId) ? [] : [itemId];
    emit('update:openValues', next);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= props.items.length) return;

    const copy = [...props.items];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    emit('update:reorder', copy);
  }

  function deleteItem(index: number, item: any) {
    const itemId = getItemId(item, index);
    emit('update:deleteItem', { index, id: itemId });
  }
</script>
