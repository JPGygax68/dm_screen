<template lang="pug">
ion-list.jf-ion-array(v-if="layout.visible")
  ion-item(v-if="layout.label")
    ion-label {{ layout.label }}
  dispatch-renderer(
    v-for="(element, index) in layout.uischema.elements"
    :key="`${layout.path}-${index}`"
    :schema="layout.schema"
    :uischema="element"
    :path="layout.path"
    :enabled="layout.enabled"
    :renderers="layout.renderers"
    :cells="layout.cells"
  )
</template>
<script setup>
    import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue';
    import { IonItem, IonLabel, IonList } from '@ionic/vue';
    const props = defineProps({
    ...rendererProps()
    });
</script>