@ -1,32 +0,0 @@
<template lang="pug">

ion-card
  ion-card-header(v-if="layout.label")
    ion-card-title {{ layout.label }}
  ion-card-content(
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
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/vue';

const props = defineProps({
  ...rendererProps()
});

</script>