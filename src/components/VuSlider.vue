<!-- @format -->

<script setup lang="ts">
import { ref, computed } from "vue";

export interface VuSliderProps {
  modelValue: number;
  bonus?: number;
  min?: number;
  max?: number;
  cellCount?: number;
  dataAttributeName?: string;
}

const props = withDefaults(defineProps<VuSliderProps>(), {
  min: 8,
  max: 20,
  cellCount: 13,
  dataAttributeName: "ability-score-name",
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const touchedSlider = ref(false);

const cells = computed(() => {
  const result = [];
  for (let i = 0; i < props.cellCount; i++) {
    result.push({
      index: i,
      value: props.min + i,
    });
  }
  return result;
});

const getCellClass = (cellValue: number) => {
  const finalValue = props.modelValue + (props.bonus ?? 0);
  
  // Above final value (with bonuses): unavailable
  if (cellValue > finalValue) {
    return "bg-ink/20";
  }
  // Between base and final (bonus range): highlighted
  if (cellValue > props.modelValue) {
    return "bg-blue-600/50";
  }
  // Base value and below: selected/active
  return "bg-ink/50";
};

const handleDragStartEvent = (event: Event) => {
  const target = event.target as HTMLElement;
  const cell = target.closest(".vu-slider-cell") as HTMLElement | null;
  if (!cell || !cell.dataset.value) {
    return;
  }
  touchedSlider.value = true;
  updateValueFromCell(cell);
};

const handleTouchMove = (event: TouchEvent) => {
  if (!touchedSlider.value) return;
  const touch = event.touches[0];
  updateValueFromPoint(touch.clientX, touch.clientY);
};

const handleMouseMove = (event: MouseEvent) => {
  if (!touchedSlider.value) return;
  updateValueFromPoint(event.clientX, event.clientY);
};

const handleMouseUp = () => {
  touchedSlider.value = false;
};

const updateValueFromPoint = (x: number, y: number) => {
  const cell = document.elementFromPoint(x, y) as HTMLElement | null;
  if (cell?.classList.contains("vu-slider-cell")) {
    updateValueFromCell(cell);
  }
};

const updateValueFromCell = (cell: HTMLElement) => {
  const value = parseInt(cell.dataset.value || "0", 10);
  if (value >= props.min && value <= props.max) {
    emit("update:modelValue", value);
  }
};
</script>

<template>
  <div
    class="vu-slider flex flex-row gap-0.5"
    @touchstart.prevent="handleDragStartEvent"
    @touchmove.prevent="handleTouchMove"
    @mousedown.prevent="handleDragStartEvent"
    @mousemove.prevent="handleMouseMove"
    @mouseup.prevent="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <span
      v-for="cell in cells"
      :key="cell.value"
      :data-value="cell.value"
      :class="getCellClass(cell.value)"
      class="vu-slider-cell text-[0.5rem] text-ink/20 w-3 h-7 grow"
    >
      {{ cell.value }}
    </span>
  </div>
</template>
