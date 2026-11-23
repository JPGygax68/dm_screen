# VuSlider Component

A configurable interactive slider component for selecting values by dragging or clicking. Designed for D&D ability scores but flexible for any range.

## Features

- **Drag and Click Support**: Users can drag across cells or click individual cells to select values
- **Touch Support**: Full touch event support for mobile and tablet devices
- **Configurable Range**: Customize min/max values and cell count
- **Visual Feedback**: Shows different background colors for selected vs available values
- **Mouse Leave Safety**: Automatically deselects when mouse leaves the slider

## Props

```typescript
interface VuSliderProps {
  modelValue: number;        // Base value (required, mutable)
  bonus?: number;            // Additional bonus points (read-only, for display)
  min?: number;              // Minimum value (default: 8)
  max?: number;              // Maximum value (default: 20)
  cellCount?: number;        // Number of cells to display (default: 13)
  dataAttributeName?: string; // Custom data attribute name (default: "ability-score-name")
}
```

### Visual States

When `bonus` is provided, the slider displays three color states:
- **bg-ink/50**: Base value and below (selected range)
- **bg-blue-600/50**: Between base value and (base + bonus) (bonus range)
- **bg-ink/20**: Above (base + bonus) (unavailable)

## Events

- `update:modelValue`: Emitted when the user selects a new value

## Usage Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import VuSlider from "@/components/VuSlider.vue";

const baseScore = ref(14);
const bonusPoints = ref(2);  // From items, spells, class features, etc.
</script>

<template>
  <VuSlider
    v-model="baseScore"
    :bonus="bonusPoints"
    :min="8"
    :max="20"
    :cell-count="13"
  />
  <p>Base: {{ baseScore }} | Bonus: +{{ bonusPoints }} | Total: {{ baseScore + bonusPoints }}</p>
</template>
```

The blue cells visualize the bonus range (from base value to base + bonus).
Without `bonus`, the slider works in simple mode with just two states.

## D&D Ability Scores Configuration

The component is pre-configured for D&D 5e ability scores:
- **Min**: 8 (minimum ability score)
- **Max**: 20 (maximum achievable ability score)
- **Cells**: 13 (covering 8-20 range)

## Styling

The component uses Tailwind CSS classes:
- `.vu-slider`: Main container div
- `.vu-slider-cell`: Individual cell elements
- Background colors: `bg-ink/20` (unavailable), `bg-blue-600/50` (bonus), `bg-ink/50` (base)

Customize styling by targeting these classes or overriding via CSS.
