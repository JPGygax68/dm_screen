<template>
  <div class="class-selector">
    <label class="label">Character Classes</label>

    <div class="selected-list">
      <span v-if="!classes || classes.length === 0" class="empty">No classes selected yet.</span>
      <button
        v-for="selectedClass in classes"
        :key="selectedClass"
        type="button"
        class="selected-pill"
        @click="removeClass(selectedClass)"
      >
        {{ selectedClass }} ×
      </button>
    </div>

    <div class="choice-list">
      <label v-for="dndClass in availableClasses" :key="dndClass" class="choice-item">
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

<style scoped lang="scss">
  .class-selector {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #cbd5e1;
  }

  .selected-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 2.25rem;
  }

  .empty {
    color: #94a3b8;
    font-size: 0.85rem;
  }

  .selected-pill {
    appearance: none;
    border: 1px solid rgba(96, 165, 250, 0.4);
    background: rgba(59, 130, 246, 0.12);
    color: #dbeafe;
    border-radius: 999px;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
  }

  .choice-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .choice-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 8px;
    padding: 0.5rem 0.6rem;
    background: rgba(15, 23, 42, 0.4);
  }
</style>

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