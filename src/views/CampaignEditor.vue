<template>
  <div class="min-h-screen bg-app-body text-app-text">
    <Breadcrumbs />

    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Campaign</p>
          <h1 class="text-3xl font-bold text-slate-900">{{ draft.name || 'Untitled Campaign' }}</h1>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" @click="cancel">Cancel</button>
          <button type="submit" form="campaign-form" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300" :disabled="!canSave">Save Campaign</button>
        </div>
      </header>

      <form id="campaign-form" @submit.prevent="save" class="space-y-6">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label for="campaign-name" class="mb-2 block text-sm font-semibold text-slate-700">Name <span class="text-amber-600">*</span></label>
          <input
            id="campaign-name"
            ref="nameInput"
            v-model="draft.name"
            type="text"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white"
            placeholder="Campaign Name"
            required
            @input="isDirty = true"
            @blur="markAsTouched('name')"
          />
          <p v-if="touchedFields.name && visibleErrors.name" class="mt-2 text-sm text-red-600">{{ visibleErrors.name }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label for="campaign-description" class="mb-2 block text-sm font-semibold text-slate-700">Description</label>
          <textarea
            id="campaign-description"
            :key="draft.id"
            v-model="draft.description"
            rows="5"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white"
            placeholder="Campaign Description"
          />
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-center justify-between gap-3">
            <label class="text-sm font-semibold text-slate-700">Party Members</label>
            <button type="button" class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="openCharacterCreator">Add Member</button>
          </div>

          <div v-if="draft.party && draft.party.length" class="flex flex-wrap gap-2">
            <button
              v-for="pc in draft.party"
              :key="pc.id"
              type="button"
              class="rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-200"
              @click="openCharacterEditor(pc)"
            >
              {{ pc.name || 'Unnamed character' }}
            </button>
          </div>
          <p v-else class="text-sm text-slate-500">No party members added yet.</p>
        </div>
      </form>
    </div>

    <div v-if="isCharacterModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" @click.self="isCharacterModalOpen = false">
      <div class="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900">{{ selectedCharacterForEdit ? 'Edit Party Member' : 'Add Party Member' }}</h2>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100" @click="isCharacterModalOpen = false">Close</button>
        </div>
        <PlayerCharacterEdit
          :characterData="selectedCharacterForEdit"
          @save="handleInlineCharacterSave"
          @cancel="isCharacterModalOpen = false"
          @delete="handleInlineCharacterDelete"
        />
      </div>
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

  const campaignId = route.params.id as string;
  const isCharacterModalOpen = ref(false);
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

  const selectedCharacterForEdit = ref<any>(null);

  function openCharacterCreator() {
    selectedCharacterForEdit.value = null;
    isCharacterModalOpen.value = true;
  }

  function openCharacterEditor(character: any) {
    selectedCharacterForEdit.value = JSON.parse(JSON.stringify(character));
    isCharacterModalOpen.value = true;
  }

  function handleInlineCharacterSave(characterData: any) {
    if (!draft.value.party) draft.value.party = [];

    const index = draft.value.party.findIndex((pc: any) => pc.id === characterData.id);

    if (index !== -1) {
      draft.value.party[index] = characterData;
    } else {
      draft.value.party.push(characterData);
    }

    isDirty.value = true;
    isCharacterModalOpen.value = false;
  }

  function handleInlineCharacterDelete(characterId: string) {
    draft.value.party = draft.value.party.filter((pc: any) => pc.id !== characterId);
    isCharacterModalOpen.value = false;
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
