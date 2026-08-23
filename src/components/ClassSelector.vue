<template>
  <div class="flex w-full flex-col gap-3">
    <label class="text-sm font-semibold text-design-page-text">Character Classes</label>

    <div class="flex min-h-9 flex-wrap gap-2">
      <span v-if="!classes || classes.length === 0" class="text-sm text-design-page-muted">No classes selected yet.</span>
      <button
        v-for="selectedClass in classes"
        :key="selectedClass"
        type="button"
        class="rounded-full border border-design-border-default bg-component-list-item-subtle-bg px-3 py-1 text-sm text-design-page-text transition hover:bg-component-list-item-strong-bg"
        @click="removeClass(selectedClass)"
      >
        {{ selectedClass }} ×
      </button>
    </div>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
      <label v-for="dndClass in availableClasses" :key="dndClass" class="flex items-center gap-2 rounded-lg border border-design-border-subtle bg-component-panel-bg px-3 py-2 text-sm text-design-page-text">
        <input
          type="checkbox"
          :checked="classes.includes(dndClass)"
          @change="toggleClass(dndClass, $event)"
        />
        <span>{{ dndClass }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
  const availableClasses = [
    'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
    'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
  ];

  const props = defineProps<{ classes: string[] }>();
  const emit = defineEmits<{ (e: 'update:classes', values: string[]): void }>();

  function syncClasses(next: string[]) {
    emit('update:classes', next);
  }

  function toggleClass(selectedClass: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const next = [...(props.classes ?? [])];

    if (checked && !next.includes(selectedClass)) next.push(selectedClass);
    if (!checked) {
      const index = next.indexOf(selectedClass);
      if (index >= 0) next.splice(index, 1);
    }

    syncClasses(next);
  }

  function removeClass(selectedClass: string) {
    const next = (props.classes ?? []).filter(c => c !== selectedClass);
    syncClasses(next);
  }
</script>