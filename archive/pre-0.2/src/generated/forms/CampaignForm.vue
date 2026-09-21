
  <template lang="pug">div.form-spec-layout
  div.form-spec-layout
    ion-item.form-spec-field(lines="none")
      ion-label(position="stacked") Campaign Name
      ion-input(:value='getValueAtPath(data, "name")' :placeholder='"Campaign name"' @ionInput='(event) => emitFieldUpdate("name", event)')
    ion-note.form-spec-error(v-if='errorByPath["name"]' color="danger") {{ errorByPath["name"] }}
    ion-item.form-spec-field(lines="none")
      ion-label(position="stacked") Campaign description
      ion-textarea(:value='getValueAtPath(data, "description")' :rows='5' :placeholder='"Campaign description (optional)"' @ionInput='(event) => emitFieldUpdate("description", event)')
    ion-note.form-spec-error(v-if='errorByPath["description"]' color="danger") {{ errorByPath["description"] }}
  </template>
  <script setup>
  const props = defineProps({
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
  
  function emitFieldUpdate(path, event) {
    emit('update-field', {
      path,
      value: event?.detail?.value ?? ''
    });
  }
    
  function getValueAtPath(target, dataPath) {
    if (!dataPath || typeof dataPath !== 'string') {
      return '';
    }
      
    const segments = dataPath.split('.').filter(Boolean);
    let current = target;
    for (const segment of segments) {
      if (current == null || typeof current !== 'object') {
        return '';
      }
      current = current[segment];
    }
      
    return current == null ? '' : current;
  }
</script>
