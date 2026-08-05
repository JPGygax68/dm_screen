<template lang="pug">
  ion-page
    ion-header
      Breadcrumbs
    
    ion-content
      ion-button(
        @click="addNewCampaign()" 
        expand="block" 
        class="ion-margin-horizontal ion-margin-top"
      ) Add New Campaign

      AccordionArray(
        :items="store.campaigns"
        :path="'campaigns'"
        v-model:openValues="openAccordions"
        @change="handleAccordionChange"
      )
        template(v-slot:header="{ item, index }")
          ion-button(
            @click="router.push(`/campaigns/${item.id}/edit`)"
          )
            ion-icon(name="open")

        template(v-slot:content="{ item, index }")
          ion-list.main-fields
            ion-item
              ion-textarea(
              :value="item.description" 
              label-placement="stacked" 
              placeholder="Description"
              rows="5"
              readOnly
            )

    ion-footer
      ion-button(
        @click="router.push('/')" 
        class="ion-margin-horizontal ion-margin-bottom"
      ) Back to Home

</template>

<style scoped lang="scss">
  ion-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;

    // ionic-accordion-array {
    //   flex: 1;
    // }

  }

  .main-fields {
    width: 100%;
  }
</style>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { Ref } from 'vue';
  import { addIcons } from 'ionicons';
  import { openOutline } from 'ionicons/icons';
  import { useRouter } from 'vue-router';
  import useDmScreenStore from '../stores/dataStore.ts';
  import type { AccordionArrayChangeEvent } from '../components/AccordionArray.vue';
  import { useUiStore } from '../stores/uiStore.ts';

  addIcons({
    'open': openOutline
  });

  const router = useRouter();
  const store = useDmScreenStore();
  const ui = useUiStore();

  const openAccordions: Ref<string[] | null> = ref([]);

  const addNewCampaign = () => {
    // return () => {
    //   const newCampaign = { name: '(New Campaign)' };
    //   const newCampaigns = [newCampaign, ...store.campaigns];
    //   store.updateByPath('campaigns', newCampaigns);
    // };
    router.push('/campaigns/new');
  };

  function handleAccordionChange(event: AccordionArrayChangeEvent) {
    //console.log('Accordion change event received with:', event);
    const { path, value } = event;
    store.updateByPath(path, value);
  }
</script>