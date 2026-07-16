<template lang="pug">

template(v-if="node.kind === 'layout'")
  ion-card.form-spec-group(v-if="node.uiType === 'Group'")
    ion-card-header(v-if="node.label")
      ion-card-title {{ node.label }}
    ion-card-content
      FormSpecNode(
        v-for="(child, index) in node.elements || []"
        :key="child.path || `${child.uiType || 'node'}-${index}`"
        :node="child"
        :data="data"
        :error-by-path="errorByPath"
        @update-field="onChildUpdate"
      )
  div.form-spec-layout(v-else)
    FormSpecNode(
      v-for="(child, index) in node.elements || []"
      :key="child.path || `${child.uiType || 'node'}-${index}`"
      :node="child"
      :data="data"
      :error-by-path="errorByPath"
      @update-field="onChildUpdate"
    )

template(v-else-if="node.kind === 'field'")
  ion-item.form-spec-field(lines="none")
    ion-label(position="stacked") {{ node.label || node.path }}
    ion-textarea(
      v-if="isMultiline"
      :value="fieldValue"
      :placeholder="placeholderText"
      :rows="Number(node.options?.rows || 3)"
      @ionInput="onInput"
    )
    ion-input(
      v-else
      :value="fieldValue"
      :placeholder="placeholderText"
      @ionInput="onInput"
    )
    
  ion-note.form-spec-error(v-if="fieldError" color="danger") {{ fieldError }}

template(v-else)
  ion-note(color="warning") Unsupported form node: {{ node.uiType || 'unknown' }}

</template>

<script setup>
import { computed } from 'vue';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonTextarea
} from '@ionic/vue';

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
    value: event?.detail?.value ?? ''
  });
}

function onChildUpdate(payload) {
  emit('update-field', payload);
}

function getValueAtPath(target, dataPath) {
  if (!dataPath || typeof dataPath !== 'string') {
    return undefined;
  }

  const segments = dataPath.split('.').filter(Boolean);
  let current = target;

  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[segment];
  }

  return current;
}
</script>
