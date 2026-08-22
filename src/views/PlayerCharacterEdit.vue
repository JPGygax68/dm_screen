<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <form @submit.prevent="save" class="space-y-5">
      <div class="flex flex-col gap-4 sm:flex-row">
        <ImagePicker :imageDataUrl="draft.portrait || ''" @change="onPortraitChanged" />

        <div class="flex-1">
          <label for="character-name" class="mb-2 block text-sm font-semibold text-slate-700">Name <span class="text-amber-600">*</span></label>
          <input
            id="character-name"
            ref="nameInput"
            v-model="draft.name"
            type="text"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white"
            placeholder="Character Name"
            required
            @input="isDirty = true"
            @blur="markAsTouched('name')"
          />
          <p v-if="touchedFields.name && visibleErrors.name" class="mt-2 text-sm text-red-600">{{ visibleErrors.name }}</p>
        </div>
      </div>

      <div>
        <label for="character-description" class="mb-2 block text-sm font-semibold text-slate-700">Description</label>
        <textarea
          id="character-description"
          v-model="draft.description"
          rows="3"
          class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white"
          placeholder="Character Description"
          @input="isDirty = true"
        />
      </div>

      <div>
        <ClassSelector :classes="draft.classes || []" @update:classes="draft.classes = $event" />
      </div>

      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div class="mb-3 flex items-center justify-between gap-4">
          <label class="text-sm font-semibold text-slate-700">Max Hit Points</label>
          <div class="flex items-center gap-2">
            <button type="button" class="h-8 w-8 rounded-md border border-slate-300 bg-white text-lg text-slate-700 hover:bg-slate-100" @click="adjustHp(-1)">-</button>
            <span class="min-w-16 text-center text-sm font-semibold text-slate-900">{{ draft.maxHitPoints || 10 }} HP</span>
            <button type="button" class="h-8 w-8 rounded-md border border-slate-300 bg-white text-lg text-slate-700 hover:bg-slate-100" @click="adjustHp(1)">+</button>
          </div>
        </div>

        <input
          v-model.number="draft.maxHitPoints"
          type="range"
          :min="schema.properties.maxHitPoints.minimum"
          :max="schema.properties.maxHitPoints.maximum"
          step="1"
          class="w-full accent-slate-900"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3 pt-2">
        <button type="submit" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300" :disabled="!canSave">Save</button>
        <button type="button" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" @click="cancel">Cancel</button>
        <div class="flex-1" />
        <button
          v-if="isEditing"
          type="button"
          class="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          @click="presentDeleteConfirmation"
        >
          Delete Character
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onMounted } from 'vue';
  import Ajv from 'ajv';
  import fullSchema from '../generated/models/data.schema.json';

  const schema = { ...fullSchema.$defs.PlayerCharacter, $defs: fullSchema.$defs };
  const nameInput = ref<HTMLInputElement | null>(null);

  const props = defineProps<{
    characterData?: {
      id: string;
      name: string;
      maxHitPoints: number;
      classes: any[];
    };
  }>();

  const emit = defineEmits<{
    (e: 'save', payload: any): void;
    (e: 'cancel'): void;
    (e: 'delete', characterId: string): void;
  }>();

  const draft = ref(generateBlankOrClone(props.characterData));
  const isDirty = ref(false);

  function generateBlankOrClone(source: any | null) {
    if (source) {
      return { ...source };
    }
    return {
      id: crypto.randomUUID(),
      name: '',
      classes: [] as string[],
      maxHitPoints: 10,
      description: '',
      portrait: '',
    };
  }

  watch(() => props.characterData, (newSource) => {
    draft.value = generateBlankOrClone(newSource);
  }, { deep: true });

  const isEditing = computed(() => !!props.characterData);
  const touchedFields = ref<Record<string, boolean>>({});

  function markAsTouched(field: string) {
    touchedFields.value[field] = true;
  }

  function presentDeleteConfirmation() {
    const confirmed = window.confirm(
      `Are you sure you want to permanently remove ${draft.value.name || 'this character'} from the campaign party? This action cannot be undone.`
    );

    if (confirmed) {
      emit('delete', draft.value.id);
    }
  }

  function onPortraitChanged(newImageDataUrl: string) {
    draft.value.portrait = newImageDataUrl;
    isDirty.value = true;
  }

  onMounted(() => {
    touchedFields.value = {};
    isDirty.value = false;
    if (nameInput.value) {
      nameInput.value.focus();
    }
  });

  const ajv = new Ajv({ allErrors: true });
  const validatePlayerCharacter = ajv.compile(schema);

  const validationResult = computed(() => {
    const valid = validatePlayerCharacter(draft.value);
    const errorsMap: Record<string, string> = {};

    if (!valid && validatePlayerCharacter.errors) {
      validatePlayerCharacter.errors.forEach((err) => {
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

  function unfocusActiveElement() {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
  }

  function adjustHp(delta: number) {
    const minHp = schema.properties.maxHitPoints.minimum || 1;
    const maxHp = schema.properties.maxHitPoints.maximum || 300;
    let newHp = (draft.value.maxHitPoints || 10) + delta;
    if (newHp < minHp) newHp = minHp;
    if (newHp > maxHp) newHp = maxHp;
    draft.value.maxHitPoints = newHp;
    isDirty.value = true;
  }

  function save() {
    console.assert(!!draft.value, 'No player character draft to save');
    emit('save', { ...draft.value });
    unfocusActiveElement();
    touchedFields.value = {};
  }

  function cancel() {
    console.assert(!!draft.value, 'No player character draft to cancel');
    emit('cancel');
    unfocusActiveElement();
    touchedFields.value = {};
  }
</script>
