<template>
  <div class="min-h-screen bg-design-page-bg text-design-page-text">
    <Breadcrumbs />

    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="mb-6 flex items-center justify-between gap-4 border-b border-design-border-subtle pb-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-design-page-muted">Campaign</p>
          <h1 class="text-3xl font-bold">{{ draft.name || 'Untitled Campaign' }}</h1>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="rounded-lg border border-design-border-default bg-component-button-secondary-bg px-4 py-2 text-sm font-medium text-component-button-secondary-foreground transition hover:bg-component-list-item-strong-bg" @click="openEncounterList">Encounter List</button>
          <button type="button" class="rounded-lg border border-design-border-default bg-component-button-secondary-bg px-4 py-2 text-sm font-medium text-component-button-secondary-foreground transition hover:bg-component-list-item-strong-bg" @click="cancel">Cancel</button>
          <button type="submit" form="campaign-form" class="rounded-lg border border-component-button-bg bg-component-button-bg px-4 py-2 text-sm font-medium text-component-button-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-component-list-item-strong-bg disabled:text-design-page-muted" :disabled="!canSave">Save Campaign</button>
        </div>
      </header>

      <form id="campaign-form" @submit.prevent="save" class="space-y-6">
        <div class="rounded-2xl border border-design-border-subtle bg-component-panel-bg p-5 shadow-sm">
          <label for="campaign-name" class="mb-2 block text-sm font-semibold text-design-page-text">Name <span class="text-design-page-muted">*</span></label>
          <input
            id="campaign-name"
            ref="nameInput"
            v-model="draft.name"
            type="text"
            class="w-full rounded-lg border border-component-input-border bg-component-input-bg px-3 py-2 text-base text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg"
            placeholder="Campaign Name"
            required
            @input="isDirty = true"
            @blur="markAsTouched('name')"
          />
          <p v-if="touchedFields.name && visibleErrors.name" class="mt-2 text-sm text-design-page-muted">{{ visibleErrors.name }}</p>
        </div>

        <div class="rounded-2xl border border-design-border-subtle bg-component-panel-bg p-5 shadow-sm">
          <label for="campaign-description" class="mb-2 block text-sm font-semibold text-design-page-text">Description</label>
          <textarea
            id="campaign-description"
            :key="draft.id"
            v-model="draft.description"
            rows="5"
            class="w-full rounded-lg border border-component-input-border bg-component-input-bg px-3 py-2 text-base text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg"
            placeholder="Campaign Description"
          />
        </div>

        <div class="rounded-2xl border border-design-border-subtle bg-component-panel-bg p-5 shadow-sm">
          <div class="mb-3 flex items-center justify-between gap-3">
            <label class="text-sm font-semibold text-design-page-text">Party Members</label>
            <button type="button" class="rounded-lg border border-design-border-default bg-component-button-secondary-bg px-3 py-2 text-sm font-medium text-component-button-secondary-foreground transition hover:bg-component-list-item-strong-bg" @click="openCharacterCreator">Add Member</button>
          </div>

          <div v-if="draft.party && draft.party.length" class="flex flex-wrap gap-2">
            <button
              v-for="pc in draft.party"
              :key="pc.id"
              type="button"
              class="rounded-full border border-design-border-default bg-component-list-item-subtle-bg px-3 py-1.5 text-sm font-medium text-design-page-text transition hover:border-design-border-subtle hover:bg-component-list-item-strong-bg"
              @click="openCharacterEditor(pc)"
            >
              {{ pc.name || 'Unnamed character' }}
            </button>
          </div>
          <p v-else class="text-sm text-design-page-muted">No party members added yet.</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Ajv from 'ajv';
  import addFormats from 'ajv-formats';
  import { ref, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useDmScreenStore } from '../stores/dataStore';
  import fullSchema from '../generated/models/data.schema.json';

  const route = useRoute();
  const router = useRouter();
  const dataStore = useDmScreenStore();

  const campaignId = route.params.campaignId as string;
  const draft = ref<{
    id: string;
    name: string;
    description: string;
    party: any[];
  }>({
    id: crypto.randomUUID() as string,
    name: '',
    description: '',
    party: [],
  });

  const isDirty = ref(false);
  const touchedFields = ref<Record<string, boolean>>({});

  function markAsTouched(field: string) {
    touchedFields.value[field] = true;
  }

  const schema = { ...fullSchema.$defs.Campaign, $defs: fullSchema.$defs };
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const validationResult = computed(() => {
    const valid = validate(draft.value);
    const errorsMap: Record<string, string> = {};

    if (!valid && validate.errors) {
      validate.errors.forEach((err) => {
        const fieldName = err.instancePath.replace('/', '') || err.params.missingProperty;
        if (fieldName) {
          errorsMap[fieldName] = err.message || 'Invalid field';
        }
      });
    }

    return {
      isValid: valid,
      errors: errorsMap,
    };
  });

  const visibleErrors = computed(() => {
    const errorsMap: Record<string, string> = {};

    Object.keys(validationResult.value.errors).forEach((key) => {
      if (touchedFields.value[key]) {
        errorsMap[key] = validationResult.value.errors[key];
      }
    });
    return errorsMap;
  });

  const isValid = computed(() => validationResult.value.isValid);
  const canSave = computed(() => isValid.value && isDirty.value);

  function openCharacterCreator() {
    const targetCampaignId = persistDraftAndGetId();
    router.push({
      name: 'campaign-character-new',
      params: { id: targetCampaignId },
      query: { returnTo: `/campaigns/${targetCampaignId}` }
    });
  }

  function openCharacterEditor(character: { id: string }) {
    const targetCampaignId = persistDraftAndGetId();
    router.push({
      name: 'campaign-character-edit',
      params: {
        campaignId: targetCampaignId,
        characterId: character.id
      },
      query: { returnTo: `/campaigns/${targetCampaignId}` }
    });
  }

  function openEncounterList() {
    const targetCampaignId = persistDraftAndGetId();
    router.push({
      name: 'campaign-encounters',
      params: { campaignId: targetCampaignId }
    });
  }

  function persistDraftAndGetId() {
    const targetCampaignId = draft.value.id || crypto.randomUUID();
    draft.value.id = targetCampaignId;
    dataStore.addOrUpdateCampaign(JSON.parse(JSON.stringify(draft.value)));
    isDirty.value = false;
    return targetCampaignId;
  }

  function save() {
    dataStore.addOrUpdateCampaign(draft.value);
    router.push('/campaigns');
  }

  function cancel() {
    router.push('/campaigns');
  }

  const existingCampaign = dataStore.campaigns.find(c => c.id === campaignId);
  if (existingCampaign) {
    draft.value = JSON.parse(JSON.stringify(existingCampaign));
    isDirty.value = false;
  } else {
    draft.value = {
      id: campaignId || crypto.randomUUID() as string,
      name: '',
      description: '',
      party: [],
    };
  }
</script>
