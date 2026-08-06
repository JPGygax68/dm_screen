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
        :openValues="[selectedCampaignId]"
        @change="handleAccordionChange"
        @update:openValues="selectedCampaignId = $event?.[0] ?? null" 
      )
        template(v-slot:header="{ item, index }")
          ion-button(
            @click="router.push(`/campaigns/${item.id}/edit`)"
            fill="clear" color="medium"
          )
            ion-icon(slot="icon-only" name="open")

        template(v-slot:content="{ item, index }")
          ion-list(lines="none").main-fields
            ion-item
              ion-textarea(
                :key="item.id"
                :value="item.description" 
                label-placement="stacked" 
                placeholder="Description"
                rows="3"
                auto-grow
                readOnly
              )
            //ion-item.ion-no-padding
            div.ion-margin(style="display: flex; flex-direction: row; width: 100%; gap: 8px")
              ion-button(
                @click="router.push(`/campaigns/${item.id}/encounters`)"
                expand="block"
              ) Encounters
                ion-icon(slot="start" :icon="listOutline")
              ion-button(
                @click="router.push(`/campaigns/${item.id}/edit`)"
                expand="block"
              ) Edit Campaign

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
  import { ref, onMounted } from 'vue';
  import type { Ref } from 'vue';
  import { addIcons } from 'ionicons';
  import { openOutline, listOutline } from 'ionicons/icons';
  import { useRouter } from 'vue-router';
  import useDmScreenStore from '../stores/dataStore.ts';
  import type { AccordionArrayChangeEvent } from '../components/AccordionArray.vue';
  import { useUiStore } from '../stores/uiStore.ts';

  addIcons({
    'open': openOutline,
    'list': listOutline
  });

  const router = useRouter();
  const store = useDmScreenStore();

  const selectedCampaignId: Ref<string | null> = ref(null);

  onMounted(() => {
    if (store.campaigns.length > 0) {
      selectedCampaignId.value = store.campaigns[0].id;
    }
  });

  const addNewCampaign = () => {
    router.push('/campaigns/new');
  };

  function handleAccordionChange(event: AccordionArrayChangeEvent) {
    console.log('Accordion change event received with:', event);
    store.campaigns = [...event];
  }
</script>