<template>
  <div v-if="node.kind === 'layout'" class="form-spec-layout">
    <div v-if="node.uiType === 'Group'" class="group-card">
      <h4 v-if="node.label">{{ node.label }}</h4>
      <FormSpecNode
        v-for="(child, index) in node.elements || []"
        :key="child.path || `${child.uiType || 'node'}-${index}`"
        :node="child"
        :data="data"
        :error-by-path="errorByPath"
        @update-field="onChildUpdate"
      />
    </div>

    <template v-else>
      <FormSpecNode
        v-for="(child, index) in node.elements || []"
        :key="child.path || `${child.uiType || 'node'}-${index}`"
        :node="child"
        :data="data"
        :error-by-path="errorByPath"
        @update-field="onChildUpdate"
      />
    </template>
  </div>

  <div v-else-if="node.kind === 'field'" class="field-block">
    <label>{{ node.label || node.path }}</label>
    <textarea
      v-if="isMultiline"
      :value="fieldValue"
      :placeholder="placeholderText"
      :rows="Number(node.options?.rows || 3)"
      @input="onInput($event)"
    />
    <input
      v-else
      :value="fieldValue"
      :placeholder="placeholderText"
      @input="onInput($event)"
    />
    <small v-if="fieldError" class="error">{{ fieldError }}</small>
  </div>

  <small v-else class="warning">Unsupported form node: {{ node.uiType || 'unknown' }}</small>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  errorByPath: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update-field']);

const isMultiline = computed(() => Boolean(props.node?.options?.multi));
const placeholderText = computed(() => props.node?.placeholder || '');
const fieldValue = computed(() => {
  const value = getValueAtPath(props.data, props.node?.path);
  return value == null ? '' : value;
});
const fieldError = computed(() => {
  if (!props.node?.path) return '';
  return props.errorByPath[props.node.path] || '';
});

function onInput(event) {
  emit('update-field', {
    path: props.node.path,
    value: event?.target?.value ?? ''
  });
}

function onChildUpdate(payload) {
  emit('update-field', payload);
}

function getValueAtPath(target, dataPath) {
  if (!dataPath || typeof dataPath !== 'string') return undefined;
  const segments = dataPath.split('.').filter(Boolean);
  let current = target;

  for (const segment of segments) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[segment];
  }

  return current;
}
</script>
