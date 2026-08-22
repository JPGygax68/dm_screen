<template>
  <div class="min-h-screen bg-app-body text-app-text">
    <div class="border-b border-border-default bg-surface-strong text-app-text">
      <div class="mx-auto max-w-6xl px-4 py-3 text-sm font-medium">
        <div class="flex items-center gap-2">
          <span>Campaigns</span>
          <span class="text-app-muted">/</span>
          <span>{{ currentCampaign?.name || 'Campaign' }}</span>
          <span class="text-app-muted">/</span>
          <span class="font-semibold">Encounters</span>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-6">
        <h1 class="text-5xl font-black tracking-[-0.06em]">Encounters</h1>
      </div>

      <div class="max-w-[440px]">
        <button type="button" class="mb-4 rounded border border-border-default bg-surface px-3 py-2 text-left text-[15px] font-medium hover:bg-surface-subtle" @click="addNewEncounter">Add New Encounter</button>

        <div v-if="encounters.length === 0" class="rounded border border-dashed border-border-subtle bg-surface-subtle p-6 text-sm text-app-muted">
          No encounters created yet.
        </div>

        <div v-else class="space-y-3">
          <div v-for="item in encounters" :key="item.id" class="border-b border-border-subtle pb-3 last:border-b-0 last:pb-0">
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="cursor-pointer text-[15px] font-medium hover:text-app-muted" @click="toggleEncounter(item.id)">
                  {{ item.name || 'Untitled Encounter' }}
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button type="button" class="rounded border border-border-default bg-surface px-2 py-1 text-[12px] font-medium hover:bg-surface-subtle" @click="router.push(`/campaigns/${campaignId}/encounters/${item.id}/edit`)">Open</button>
                <button type="button" class="rounded border border-border-default bg-surface px-2 py-1 text-[12px] font-medium hover:bg-surface-subtle" @click="removeEncounter(item.id)">Delete</button>
              </div>
            </div>

            <div v-if="selectedEncounterId === item.id" class="mt-3 pl-0">
              <div class="mb-2 text-sm font-semibold">Description</div>
              <textarea
                :value="item.description || ''"
                rows="4"
                readonly
                class="w-full rounded border border-border-subtle bg-surface px-2 py-2 text-sm"
              />
              <div class="mt-3">
                <button type="button" class="rounded border border-border-default bg-surface-subtle px-3 py-2 text-[15px] font-medium hover:bg-surface-strong" @click="router.push(`/campaigns/${campaignId}/encounters/${item.id}/edit`)">Edit Encounter</button>
              </div>
            </div>
          </div>
        </div>

        <button type="button" class="mt-4 rounded border border-border-default bg-surface px-3 py-2 text-[15px] font-medium hover:bg-surface-subtle" @click="router.push('/')">Back to Home</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useDmScreenStore from '../stores/dataStore';

  const route = useRoute();
  const router = useRouter();
  const dataStore = useDmScreenStore();

  const campaignId = route.params.campaignId as string;

  const currentCampaign = computed(() => dataStore.getCampaignById(campaignId) || dataStore.campaigns[0] || null);

  const encounters = computed(() => {
    const campaign = dataStore.getCampaignById(campaignId) || dataStore.campaigns[0] || null;
    return campaign ? (campaign.encounters || []) : [];
  });

  const selectedEncounterId = ref<string | null>(null);

  onMounted(() => {
    selectedEncounterId.value = encounters.value.length > 0 ? encounters.value[0].id : null;
  });

  function toggleEncounter(encounterId: string) {
    selectedEncounterId.value = selectedEncounterId.value === encounterId ? null : encounterId;
  }

  function addNewEncounter() {
    const campaign = dataStore.getCampaignById(campaignId);
    if (!campaign) return;

    const newEncounter = {
      id: `encounter-${Date.now()}`,
      name: 'New Encounter',
      description: '',
    };

    campaign.encounters.push(newEncounter);
    selectedEncounterId.value = newEncounter.id;
  }

  function removeEncounter(encounterId: string) {
    const campaign = dataStore.getCampaignById(campaignId);
    if (!campaign) return;

    const index = campaign.encounters.findIndex((item: any) => item.id === encounterId);
    if (index >= 0) {
      campaign.encounters.splice(index, 1);
    }

    if (selectedEncounterId.value === encounterId) {
      selectedEncounterId.value = campaign.encounters.length > 0 ? campaign.encounters[0].id : null;
    }
  }
</script>
