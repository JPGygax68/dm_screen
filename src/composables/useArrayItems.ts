import { computed, toValue } from "vue";
import type { MaybeRefOrGetter, Ref } from "vue";

export function useArrayItems<T>(
  items: Ref<T[]>,
  slotCount: MaybeRefOrGetter<number>,
) {
  function getSlotCount(): number {
    const count = toValue(slotCount);
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError(
        "Array item slot count must be a non-negative integer",
      );
    }
    return count;
  }

  const slots = computed(() => {
    return Array.from({ length: getSlotCount() }, (_, index) => ({
      index,
      value: items.value[index],
      canAdd: index === items.value.length,
      canRemove: index === items.value.length - 1,
      canEdit: index <= items.value.length,
    }));
  });

  function addOrUpdate(index: number, value: T): void {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= getSlotCount() ||
      index > items.value.length
    ) {
      throw new RangeError("Cannot update an unavailable array item");
    }
    const next = [...items.value];
    next[index] = value;
    items.value = next;
  }

  function remove(index: number): void {
    if (
      index < 0 ||
      index >= getSlotCount() ||
      index !== items.value.length - 1
    ) {
      throw new RangeError("Only the last array item can be removed");
    }
    items.value = items.value.slice(0, -1);
  }

  return { slots, addOrUpdate, remove };
}
