<template>
  <div class="min-h-screen bg-design-page-bg text-design-page-text">
    <Breadcrumbs />
    
    <div class="mx-auto max-w-6xl px-4 py-4">

      <main class="mt-4">
        <div class="mb-4 flex items-center justify-between gap-4">
          <h1 class="text-[clamp(1.5rem,2vw,2rem)] font-bold">Campaigns</h1>
          <button
            type="button"
            class="rounded-lg border border-component-button-bg bg-component-button-bg px-4 py-2 text-sm font-medium text-component-button-foreground hover:opacity-95"
            @click="addNewCampaign"
          >
            Add New Campaign
          </button>
        </div>

        <ul class="flex list-none flex-col gap-3 p-0">
          <li
            v-for="campaign in store.campaigns"
            :key="campaign.id"
            class="rounded-xl border border-design-border-subtle bg-component-panel-bg shadow-sm"
          >
            <div class="flex items-center justify-between gap-4 px-5 py-4">
              <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                <button
                  type="button"
                  class="cursor-pointer border-0 bg-transparent p-0 text-left text-lg font-semibold text-design-page-text"
                  @click="openCampaign(campaign.id)"
                >
                  {{ campaign.name }}
                </button>
                <p v-if="campaign.description" class="m-0 whitespace-pre-wrap text-sm leading-6 text-design-page-muted">
                  {{ campaign.description }}
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-design-border-default bg-component-button-secondary-bg px-3 py-2 text-sm font-medium text-component-button-secondary-foreground hover:bg-component-list-item-strong-bg"
                  @click="openCampaign(campaign.id)"
                >
                  Open
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-component-button-danger-bg bg-component-button-danger-bg px-3 py-2 text-sm font-medium text-component-button-danger-foreground hover:opacity-90"
                  @click="removeCampaign(campaign.id)"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        </ul>

        <button
          type="button"
          class="mt-4 rounded-lg border border-design-border-default bg-component-panel-bg px-4 py-2 text-sm font-medium hover:bg-component-list-item-subtle-bg"
          @click="router.push('/')"
        >
          Back to Home
        </button>
      </main>
    </div>
  </div>
</template>

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
    router.push(`/campaigns/${campaignId}`);
  }

  function removeCampaign(campaignId: string) {
    store.removeCampaign(campaignId);
    if (selectedCampaignId.value === campaignId) {
      selectedCampaignId.value = store.campaigns[0]?.id ?? null;
    }
  }
</script>