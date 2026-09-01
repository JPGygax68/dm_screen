<template>
  <div class="h-full bg-design-page-bg text-design-page-text flex flex-col">
    <Breadcrumbs class="flex-0 shrink-0" />

    <div class="max-w-6xl px-4 py-6 grow flex flex-col overflow-hidden">
      <div class="">
        <button type="button" @click="addNewEncounter" class="">Add New Encounter</button>
      </div>

      <div id="content" class="my-4 flex-1 overflow-y-auto">
        <div v-if="encounters.length === 0">
          No encounters created yet.
        </div>

        <div v-else id="encounter-list" class="">

          <div v-for="item in encounters" :key="item.id" class="encounter-item border-t">
            <div class="encounter-header"">
              <span class="accordion-header flex items-start gap-3 my-2">
                <span class="flex-1 min-w-0" @click="toggleEncounter(item.id)">
                  <span class="">
                    {{ item.title || 'Untitled Encounter' }}
                  </span>
                </span>
                <span class="encounter-status">{{ getEncounterStatusInEnglish(item.status) }}</span>
                <span class="flex shrink-0 items-center gap-2">
                  <button type="button" class="secondary small-box"
                    @click="router.push(`/campaigns/${campaignId}/encounters/${item.id}/edit`)">Open</button>
                  <button type="button" class="danger small-box" @click="removeEncounter(item.id)">Delete</button>
                </span>
              </span>
            </div>
            <div class="encounter-content text-sm grid grid-cols-1 sm:grid-cols-2 gap-2"
              v-show="selectedEncounterId === item.id">
              <div v-if="item.summary" class="col-span-full">
                "{{ item.summary }}"
              </div>
              <span><span class="text-xs">Location: </span> {{ item.location || 'Unknown' }}</span>
            </div>

            <!--
            <div v-if="selectedEncounterId === item.id" class="mt-3 pl-0">
              <div class="mb-2 text-sm font-semibold">Description</div>
              <textarea :value="item.description || ''" rows="4" readonly
                class="w-full rounded border border-design-border-subtle bg-component-panel-bg px-2 py-2 text-sm" />
            </div>
            -->
          </div>
        </div>
      </div>

      <div class="">
        <button type="button" class="secondary" @click="router.push('/')">Back to Home</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @reference "#styles/tailwind.css";
  .encounter-status {
    @apply badge-like small-box w-16 text-center;
  }
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useDmScreenStore, { getEncounterStatusInEnglish } from '../stores/dataStore';

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
    title: 'New Encounter',
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
