<script setup lang="ts">
import { computed } from "vue";

const model = defineModel<number>({ required: true });

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    digits?: number;
    height?: number;
  }>(),
  {
    step: 1,
    digits: 2,
  },
);

const canDecrement = computed(
  () => props.min === undefined || model.value > props.min,
);
const canIncrement = computed(
  () => props.max === undefined || model.value < props.max,
);

function decrement(): void {
  if (canDecrement.value)
    model.value = Math.max(props.min ?? -Infinity, model.value - props.step);
}

function increment(): void {
  if (canIncrement.value)
    model.value = Math.min(props.max ?? Infinity, model.value + props.step);
}
</script>

<template>
  <div class="flex items-center justify-center gap-1">
    <button
      type="button"
      :aria-label="`Decrease ${label}`"
      :disabled="!canDecrement"
      class="size-8 text-ink/70 disabled:cursor-not-allowed disabled:text-ink/25"
      @click="decrement"
    >
      {{ canDecrement ? "◀" : "◁" }}
    </button>
    <input
      :id="id"
      v-model.number="model"
      type="number"
      :aria-label="label"
      :min="min"
      :max="max"
      :step="step"
      :class="`rounded-md border border-ink/20 p-2 text-right h-${props.height}`"
      :style="props.digits ? `width: ${props.digits + 2}ch;` : ''"
    />
    <button
      type="button"
      :aria-label="`Increase ${label}`"
      :disabled="!canIncrement"
      class="size-8 text-ink/70 disabled:cursor-not-allowed disabled:text-ink/45"
      @click="increment"
    >
      {{ canIncrement ? "▶" : "▷" }}
    </button>
  </div>
</template>
