<template lang="pug">
  ion-page
    ion-header
      Breadcrumbs

    ion-content
      div.editor-shell
        section.panel.selection-panel
          div.panel-header
            h2 Selected Adversaries
          div.empty-state(v-if="selectedCreatures.length === 0")
            p No creatures selected yet.

          div.selection-list(v-else)
            div.selection-item(v-for="entry in selectedCreatures" :key="entry.creatureId")
              img(:src="getCreatureImageUrl(entry)" :alt="entry.name")

              div.selection-meta
                h3 {{ entry.name }}
                p {{ entry.race }} • CR {{ entry.cr }} • AC {{ entry.armorClass }}

              div.selection-controls
                label Count
                ion-input(
                  :value="entry.count"
                  type="number"
                  min="1"
                  @ionInput="updateCreatureCount(entry, $event)"
                )

              ion-button(
                fill="clear"
                color="danger"
                @click="removeCreature(entry.creatureId)"
              ) Remove

        section.panel.bestiary-panel
          div.panel-header
            h2 Bestiary
          ion-searchbar(v-model="searchTerm" placeholder="Search creatures")

          div.bestiary-list
            button.creature-card(
              v-for="creature in filteredBestiary"
              :key="creature.id"
              type="button"
              @click="addCreature(creature)"
            )
              img(:src="getCreatureImageUrl(creature)" :alt="creature.name")
              div.creature-card-body
                h3 {{ creature.name }}
                p {{ creature.race }} • CR {{ creature.cr }} • AC {{ creature.armorClass }}

    ion-footer
      ion-toolbar
        ion-buttons(slot="start")
          ion-button(color="medium" @click="discard") Discard
        ion-buttons(slot="end")
          ion-button(color="primary" @click="saveEncounter") Save
</template>

<style scoped lang="scss">
  ion-page {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  ion-content {
    --padding-top: 12px;
  }

  .editor-shell {
    display: grid;
    grid-template-columns: minmax(320px, 0.95fr) minmax(340px, 1.35fr);
    gap: 16px;
    height: 100%;
    padding: 0 16px 16px;
    box-sizing: border-box;
  }

  .panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    h2 {
      margin: 0;
      font-size: 1.1rem;
    }
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    padding: 16px;
    color: var(--ion-color-medium);
    text-align: center;
  }

  .selection-list,
  .bestiary-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    overflow-y: auto;
  }

  .selection-item {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) 90px auto;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);

    img {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.2);
    }
  }

  .selection-meta {
    min-width: 0;

    h3,
    p {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    h3 {
      font-size: 1rem;
      margin-bottom: 4px;
    }

    p {
      color: var(--ion-color-medium);
      font-size: 0.8rem;
    }
  }

  .selection-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    label {
      color: var(--ion-color-medium);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08rem;
    }

    ion-input {
      --padding-start: 8px;
      --padding-end: 8px;
      width: 76px;
      min-height: 40px;
      text-align: center;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .creature-card {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.02);
    color: inherit;
    text-align: left;
    cursor: pointer;

    &:hover {
      border-color: rgba(var(--ion-color-primary-rgb), 0.6);
      background: rgba(var(--ion-color-primary-rgb), 0.05);
    }

    img {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: 10px;
      flex-shrink: 0;
    }
  }

  .creature-card-body {
    min-width: 0;

    h3,
    p {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    h3 {
      margin-bottom: 4px;
      font-size: 1rem;
    }

    p {
      color: var(--ion-color-medium);
      font-size: 0.8rem;
    }
  }

  @media (max-width: 760px) {
    .editor-shell {
      grid-template-columns: 1fr;
      padding-bottom: 24px;
    }
  }
</style>

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
    if (!encounter.value) return;

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
