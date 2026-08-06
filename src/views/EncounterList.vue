<template lang="pug">
  ion-page
    ion-header
      Breadcrumbs

    ion-content
      ion-button(
        @click="addNewEncounter()" 
        expand="block" 
        class="ion-margin-horizontal ion-margin-top"
      ) Add New Encounter

      ArrayAccordion(
        :items="encounters"
        :openValues="[selectedEncounterId]"
        @change="handleAccordionChange"
        @update:openValues="selectedEncounterId = $event[0]" 
      )
        template(v-slot:header="{ item, index }")
          ion-button(
            @click="router.push(`/campaigns/${campaignId}/encounters/${item.id}/edit`)"
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
            div.ion-margin(style="display: flex; flex-direction: row; width: 100%; gap: 8px")
              ion-button(
                @click="router.push(`/campaigns/${campaignId}/encounters/${item.id}/edit`)"
                expand="block"
              ) Edit Encounter

    ion-footer
      ion-button(
        @click="router.push('/')" 
        class="ion-margin-horizontal ion-margin-bottom"
      ) Back to Home
</template>

<style lang="scss" module>
  ion-page {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  ion-content {
    flex: 1;
    overflow-y: auto;
  }
</style>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useDmScreenStore from '../stores/dataStore';
  import { addIcons } from 'ionicons';
  import { open } from 'ionicons/icons';

  addIcons({
    open,
  });

  const route = useRoute();
  const router = useRouter();
  const dataStore = useDmScreenStore();

  const campaignId = route.params.campaignId as string;
  
  const encounters = computed(() => {
    const campaign = dataStore.getCampaignById(campaignId);
    return campaign ? campaign.encounters : [];
  });

  const selectedEncounterId = ref<string | null>(null);

  // Lifecycle hook to load the encounter list into the draft when the component is mounted
  onMounted(() => {
    console.log(`Loading encounters for campaign ID: ${campaignId}`);
    selectedEncounterId.value = encounters.value.length > 0 ? encounters.value[0].id : null;
  });

  function addNewEncounter() {
    // Logic to add a new encounter
    const newEncounter = {
      id: `encounter-${Date.now()}`,
      name: 'New Encounter',
      description: '',
    };
    dataStore.getCampaignById(campaignId)!.encounters.push(newEncounter);
    selectedEncounterId.value = newEncounter.id;
  }

  function handleAccordionChange(event: any[]) {
    console.log('Encounter List Accordion change event received with:', event);
    dataStore.getCampaignById(campaignId)!.encounters = [...event];
  }
</script>