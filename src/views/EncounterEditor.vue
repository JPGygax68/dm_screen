<template>
  <div class="min-h-screen bg-design-page-bg text-design-page-text">
    <div class="mx-auto max-w-7xl px-4 py-4">
      <Breadcrumbs />

      <div class="mt-4 grid gap-4 lg:grid-cols-[minmax(320px,0.95fr)_minmax(340px,1.35fr)]">
        <section class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-design-border-subtle bg-component-panel-bg">
          <div class="border-b border-design-border-subtle px-4 py-3">
            <h2 class="text-lg font-semibold">Selected Adversaries</h2>
          </div>

          <div v-if="selectedCreatures.length === 0" class="flex min-h-48 items-center justify-center p-4 text-center text-sm text-design-page-muted">
            No creatures selected yet.
          </div>

          <div v-else class="flex flex-col gap-3 overflow-y-auto p-3">
            <div
              v-for="entry in selectedCreatures"
              :key="entry.id"
              class="grid grid-cols-[64px_minmax(0,1fr)_90px_auto] items-center gap-3 rounded-lg border border-design-border-subtle bg-component-list-item-subtle-bg px-2 py-2"
            >
              <img :src="getCreatureImageUrl(entry)" :alt="entry.name" class="h-16 w-16 rounded-md object-cover" />

              <div class="min-w-0">
                <h3 class="truncate text-base font-semibold">{{ entry.name }}</h3>
                <p class="truncate text-xs text-design-page-muted">{{ entry.race }} • CR {{ entry.cr }} • AC {{ entry.armorClass }}</p>
              </div>

              <div class="flex flex-col items-center gap-1">
                <label class="text-[11px] uppercase tracking-widest text-design-page-muted">Count</label>
                <input
                  :value="entry.count"
                  type="number"
                  min="1"
                  class="w-20 rounded-md border border-component-input-border bg-component-input-bg px-2 py-1 text-center text-sm text-component-input-text outline-none focus:border-component-button-bg"
                  @input="updateCreatureCount(entry, $event)"
                />
              </div>

              <button
                type="button"
                class="rounded border border-design-border-default bg-component-list-item-bg px-3 py-1.5 text-sm font-medium hover:bg-component-list-item-subtle-bg"
                @click="removeCreature(entry.id)"
              >
                Remove
              </button>
            </div>
          </div>
        </section>

        <section class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-design-border-subtle bg-component-panel-bg">
          <div class="border-b border-design-border-subtle px-4 py-3">
            <h2 class="text-lg font-semibold">Bestiary</h2>
          </div>

          <div class="px-3 pt-3">
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Search creatures"
              class="w-full rounded-md border border-component-input-border bg-component-input-bg px-3 py-2 text-sm text-component-input-text outline-none placeholder:text-design-page-muted focus:border-component-button-bg"
            />
          </div>

          <div class="flex flex-col gap-3 overflow-y-auto p-3">
            <button
              v-for="creature in filteredBestiary"
              :key="creature.id"
              type="button"
              class="flex w-full items-center gap-3 rounded-lg border border-design-border-subtle bg-component-list-item-subtle-bg px-3 py-2 text-left transition hover:border-design-border-default hover:bg-component-list-item-strong-bg"
              @click="addCreature(creature)"
            >
              <img :src="getCreatureImageUrl(creature)" :alt="creature.name" class="h-14 w-14 shrink-0 rounded-md object-cover" />
              <div class="min-w-0">
                <h3 class="truncate text-base font-semibold">{{ creature.name }}</h3>
                <p class="truncate text-xs text-design-page-muted">{{ creature.race }} • CR {{ creature.cr }} • AC {{ creature.armorClass }}</p>
              </div>
            </button>
          </div>
        </section>
      </div>

      <div class="mt-4 flex justify-end gap-2 border-t border-design-border-subtle pt-4">
        <button
          type="button"
          class="rounded border border-design-border-default bg-component-list-item-bg px-4 py-2 text-sm font-medium hover:bg-component-list-item-subtle-bg"
          @click="discard"
        >
          Discard
        </button>
        <button
          type="button"
          class="rounded border border-component-button-bg bg-component-button-bg px-4 py-2 text-sm font-medium text-component-button-foreground hover:opacity-95"
          @click="saveEncounter"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useDmScreenStore from '../stores/dataStore';

  type SelectedCreature = {
    id: string;
    name: string;
    race: string;
    cr: string;
    armorClass: number;
    count: number;
  };

  const route = useRoute();
  const router = useRouter();
  const dataStore = useDmScreenStore();

  const campaignId = route.params.campaignId as string;
  const encounterId = route.params.encounterId as string;
  const searchTerm = ref('');
  const encounter = ref<any>(null);
  const selectedCreatures = ref<SelectedCreature[]>([]);

  const bestiary = computed(() => dataStore.bestiary || []);

  const filteredBestiary = computed(() => {
    const query = searchTerm.value.trim().toLowerCase();
    if (!query) return bestiary.value;

    return bestiary.value.filter((creature: any) => {
      const haystack = [
        creature.name,
        creature.race,
        creature.family,
        creature.cr,
        creature.alignment,
      ].filter(Boolean).join(' ').toLowerCase();

      return haystack.includes(query);
    });
  });

  onMounted(async () => {
    await dataStore.loadBestiary();
    loadEncounter();
  });

  function getCreatureImageUrl(creature: any) {
    return `/assets/bestiary/images/${creature.id}.png`;
  }

  function loadEncounter() {
    const campaign = dataStore.getCampaignById(campaignId);
    if (!campaign) {
      router.push('/campaigns');
      return;
    }

    const existingEncounter = campaign.encounters?.find((entry: any) => entry.id === encounterId) || {
      id: encounterId,
      name: 'New Encounter',
      description: '',
      selectedCreatures: [],
    };

    encounter.value = {
      ...existingEncounter,
      selectedCreatures: Array.isArray(existingEncounter.selectedCreatures)
        ? existingEncounter.selectedCreatures.map((item: any) => ({
            id: item.id,
            name: item.name,
            race: item.race,
            cr: item.cr,
            armorClass: Number(item.armorClass || 0),
            count: Math.max(1, Number(item.count || 1)),
          }))
        : [],
    };

    selectedCreatures.value = encounter.value.selectedCreatures;
  }

  function addCreature(creature: any) {
    const existing = selectedCreatures.value.find((entry) => entry.id === creature.id);

    if (existing) {
      existing.count += 1;
      return;
    }

    selectedCreatures.value.push({
      id: creature.id,
      name: creature.name,
      race: creature.race || 'Unknown',
      cr: creature.cr || '—',
      armorClass: Number(creature.armorClass || 0),
      count: 1,
    });
  }

  function updateCreatureCount(entry: SelectedCreature, event: Event) {
    const target = event.target as HTMLInputElement | null;
    const nextValue = Number.parseInt(target?.value ?? '1', 10);
    entry.count = Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1;
  }

  function removeCreature(creatureId: string) {
    selectedCreatures.value = selectedCreatures.value.filter((entry) => entry.id !== creatureId);
  }

  function saveEncounter() {
    if (!encounter.value) {
      throw new Error('Encounter state was not initialized before save.');
    }

    const finalizedEncounter = {
      ...encounter.value,
      selectedCreatures: selectedCreatures.value.map((entry) => ({
        ...entry,
        count: Math.max(1, Number(entry.count || 1)),
      })),
      monstersSummary: selectedCreatures.value.length
        ? selectedCreatures.value.map((entry) => `${entry.count}x ${entry.name}`).join(', ')
        : 'No creatures selected',
    };

    dataStore.saveEncounter(campaignId, finalizedEncounter);
    router.push(`/campaigns/${campaignId}/encounters`);
  }

  function discard() {
    const confirmed = window.confirm('Discard the current encounter changes?');
    if (confirmed) {
      router.push(`/campaigns/${campaignId}/encounters`);
    }
  }
</script>
