<template lang="pug">
  div.page-shell
    Breadcrumbs

    main.content-panel
      div.page-header
        h1 Campaigns
        button.primary-button(type="button", @click="addNewCampaign") Add New Campaign

      ul.campaign-list
        li.campaign-item(v-for="campaign in store.campaigns" :key="campaign.id")
          div.campaign-row
            div.campaign-copy
              button.campaign-title-button(type="button", @click="openCampaign(campaign.id)") {{ campaign.name }}
              p.description(v-if="campaign.description") {{ campaign.description }}

            div.actions
              button.ghost-button(type="button", @click="openCampaign(campaign.id)") Open
              button.danger-button(type="button", @click="removeCampaign(campaign.id)") Remove

      button.secondary-button(type="button", @click="router.push('/')") Back to Home
</template>

<style scoped lang="scss">
  .page-shell {
    min-height: 100vh;
    background: #f8fafc;
    color: #0f172a;
  }

  .content-panel {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.5rem, 2vw, 2rem);
    color: #0f172a;
  }

  .campaign-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .campaign-item {
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  }

  .campaign-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
  }

  .campaign-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 0.4rem;
  }

  .campaign-title-button {
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0;
    font: inherit;
    font-size: 1.1rem;
    font-weight: 600;
    color: #0f172a;
    text-align: left;
    cursor: pointer;
  }

  .description {
    margin: 0;
    color: #475569;
    white-space: pre-wrap;
    line-height: 1.5;
    font-size: 0.93rem;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  button {
    appearance: none;
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 10px;
    background: #fff;
    color: #0f172a;
    padding: 0.6rem 0.9rem;
    font: inherit;
    cursor: pointer;
    transition: filter 0.15s ease, transform 0.15s ease;

    &:hover {
      filter: brightness(0.98);
    }
  }

  .primary-button {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }

  .ghost-button {
    background: #eef2ff;
    border-color: #c7d2fe;
    color: #1d4ed8;
  }

  .danger-button {
    background: #fff1f2;
    border-color: #fecdd3;
    color: #be123c;
  }

  .secondary-button {
    margin-top: 1rem;
    background: #f8fafc;
  }
</style>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import type { Ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useDmScreenStore from '../stores/dataStore.ts';

  const router = useRouter();
  const store = useDmScreenStore();
  const selectedCampaignId: Ref<string | null> = ref(null);

  onMounted(() => {
    if (store.campaigns.length > 0) {
      selectedCampaignId.value = store.campaigns[0].id;
    }
  });

  function addNewCampaign() {
    router.push('/campaigns/new');
  }

  function openCampaign(campaignId: string) {
    router.push(`/campaigns/${campaignId}/encounters`);
  }

  function removeCampaign(campaignId: string) {
    store.removeCampaign(campaignId);
    if (selectedCampaignId.value === campaignId) {
      selectedCampaignId.value = store.campaigns[0]?.id ?? null;
    }
  }
</script>