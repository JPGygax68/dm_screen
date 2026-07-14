<template>
  <ion-card v-if="layout.visible" class="jf-ion-group">
    <ion-card-header v-if="layout.label">
      <ion-card-title>{{ layout.label }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <dispatch-renderer
        v-for="(element, index) in layout.uischema.elements"
        :key="`${layout.path}-${index}`"
        :schema="layout.schema"
        :uischema="element"
        :path="layout.path"
        :enabled="layout.enabled"
        :renderers="layout.renderers"
        :cells="layout.cells"
      />
    </ion-card-content>
  </ion-card>
</template>

<script setup>
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/vue';

const props = defineProps({
  ...rendererProps()
});

const { layout } = useJsonFormsLayout(props);
</script>
