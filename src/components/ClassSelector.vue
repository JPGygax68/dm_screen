<template>
  <div class="flex w-full flex-col">
    <label class="text-sm font-semibold text-design-page-text">Character Class(es)</label>

    <div class="flex min-h-9 flex-wrap items-center gap-2">
      <span v-if="!classes || classes.length === 0" class="text-sm text-design-page-muted">No classes selected yet.</span>
      <button
        v-for="selectedClass in classes"
        :key="selectedClass"
        type="button"
        class="badge"
        @click="removeClass(selectedClass)"
      >
        {{ selectedClass }} ×
      </button>

      <select
        v-if="!isMaxClassesReached"
        v-model="pendingClass"
        @change="addSelectedClass"
      >
        <option value="">Multiclass</option>
        <option v-for="dndClass in unselectedClasses" :key="dndClass" :value="dndClass">
          {{ dndClass }}
        </option>
      </select>
      <span v-else class="text-sm text-design-page-muted">
        Maximum of {{ maxClasses }} classes reached.
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { pcClasses } from '../rulesets/dnd2024';

  const availableClassNames = computed(() => [
    ...Object.keys(pcClasses)
  ]);

  const props = defineProps<{ classes: string[] }>();
  const emit = defineEmits<{ (e: 'update:classes', values: string[]): void }>();
  const pendingClass = ref('');

  const unselectedClasses = computed(() => {
    const selected = new Set(props.classes ?? []);
    return availableClassNames.value.filter(dndClass => !selected.has(dndClass));
  });

  function syncClasses(next: string[]) {
    emit('update:classes', next);
  }

  function addSelectedClass() {
    const selectedClass = pendingClass.value;
    if (!selectedClass) return;

    const next = [...(props.classes ?? [])];
    if (!next.includes(selectedClass)) next.push(selectedClass);
    syncClasses(next);

    pendingClass.value = '';
  }

  function removeClass(selectedClass: string) {
    const next = (props.classes ?? []).filter(c => c !== selectedClass);
    syncClasses(next);
  }

  // Ruleset specific logic
  // TODO: for now it's DnD 2024, but this should be configurable and moved to a ruleset-specific component
  const maxClasses = 3;
  const isMaxClassesReached = computed(() => (props.classes ?? []).length >= maxClasses);

</script>