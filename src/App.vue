<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { IonApp, IonRouterOutlet } from '@ionic/vue';
  import Ajv2020 from 'ajv/dist/2020';

  // TODO: the code is not being used and left here for future use. Remove it if not needed.
  
  import _dataSchema from './generated/models/data.schema.json';

  const dataSchema = Object.freeze(_dataSchema);

  const ajv = computed(() => new Ajv2020({
    allErrors: true,
    strict: false
  }));

  const validate = ajv.value.compile(dataSchema);

</script>

<template lang="pug">

IonApp   
  IonRouterOutlet

</template>

<style scoped lang="scss"></style>