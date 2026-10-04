<script setup lang="ts">
import {
  ClassValue,
  computed,
  nextTick,
  onBeforeUnmount,
  shallowRef,
  useTemplateRef,
} from "vue";
import { useDeviceType } from "@/composables/useDeviceType";

const WARNING_DISPLAY_MS = 3000;
const WARNING_VIEWPORT_MARGIN_PX = 8;
const WARNING_GAP_PX = 4;

const model = defineModel<number>({ required: true });

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    digits?: number; /// Determines the number of digits to display in the input field - width only
    height?: number;
    warning?: string;
    bgClasses?: ClassValue;
  }>(),
  {
    step: 1,
    digits: 2,
  },
);

const { isMobileOrTablet } = useDeviceType();

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

function checkAndAdjust(): void {
  if (props.min !== undefined && model.value < props.min) {
    model.value = props.min;
  }
  if (props.max !== undefined && model.value > props.max) {
    model.value = props.max;
  }
}

const isWarningVisible = shallowRef(false);
const warningStyle = shallowRef<Record<string, string>>({});
const inputEl = useTemplateRef<HTMLInputElement>("input");
const warningEl = useTemplateRef<HTMLElement>("warningLabel");
let warningTimer: ReturnType<typeof setTimeout> | undefined;

// Fixed coordinates keep the label on-screen and outside any clipping scroll container.
function positionWarning(): void {
  const input = inputEl.value;
  const label = warningEl.value;
  if (!input || !label) return;

  const rect = input.getBoundingClientRect();
  const margin = WARNING_VIEWPORT_MARGIN_PX;
  const centeredLeft = rect.left + rect.width / 2 - label.offsetWidth / 2;
  const left = Math.min(
    Math.max(centeredLeft, margin),
    window.innerWidth - label.offsetWidth - margin,
  );
  const above = rect.top - label.offsetHeight - WARNING_GAP_PX;
  const top = above >= margin ? above : rect.bottom + WARNING_GAP_PX;
  warningStyle.value = { left: `${left}px`, top: `${top}px` };
}

async function showWarning(): Promise<void> {
  if (!props.warning) return;
  isWarningVisible.value = true;
  clearTimeout(warningTimer);
  warningTimer = setTimeout(() => {
    isWarningVisible.value = false;
  }, WARNING_DISPLAY_MS);
  await nextTick();
  positionWarning();
}

onBeforeUnmount(() => clearTimeout(warningTimer));

</script>

<template>
  <div class="flex items-center justify-center gap-1">
    <span
      v-if="isWarningVisible && warning"
      :id="`${id}-warning`"
      ref="warningLabel"
      role="tooltip"
      :style="warningStyle"
      class="pointer-events-none fixed z-10 w-max max-w-[calc(100vw-1rem)] rounded-md border border-warning bg-warning-light px-2 py-1 text-xs text-warning-dark shadow-sm"
    >
      {{ warning }}
    </span>
    <button
      type="button"
      :aria-label="`Decrease ${label}`"
      :disabled="!canDecrement"
      class="h-8 w-4 text-ink/70 disabled:cursor-not-allowed disabled:text-ink/25"
      @click="decrement"
    >
      {{ canDecrement ? "◀" : "◁" }}
    </button>
    <input
      :id="id"
      type="number"
      ref="input"
      v-model.number="model"
      :readonly="isMobileOrTablet"
      :aria-label="label"
      :min="min"
      :max="max"
      :step="step"
      :aria-describedby="
        isWarningVisible && warning ? `${id}-warning` : undefined
      "
      :class="`appearance-none rounded-md border border-ink/20 p-2 text-right ${!props.warning ? (isMobileOrTablet ? 'bg-red': '') : 'bg-warning-light'}`"
      :style="`width: ${props.digits ? props.digits + 2 + 'ch' : 'auto'};
        height: ${props.height ? props.height * 0.25 + 'rem' : 'auto'};`"
      @mouseenter="showWarning"
      @blur="checkAndAdjust()"
    />
    <button
      type="button"
      :aria-label="`Increase ${label}`"
      :disabled="!canIncrement"
      class="h-8 w-4 text-ink/70 disabled:cursor-not-allowed disabled:text-ink/45"
      @click="increment"
    >
      {{ canIncrement ? "▶" : "▷" }}
    </button>
  </div>
</template>

<style scoped lang="css"></style>
