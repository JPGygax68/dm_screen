<template lang="pug">
div(class="rounded-2xl border border-design-border-subtle bg-component-panel-bg p-4 shadow-sm")
    form(class="space-y-5" @submit.prevent="save")
        div(class="flex flex-col gap-4 sm:flex-row")
            ImagePicker(:imageDataUrl="draft.portrait || ''" @change="onPortraitChanged")

            div(class="flex-1")
                label(class="mb-2 block text-sm font-semibold text-design-page-text" for="character-name")
                    | Name
                    span(class="text-design-page-muted") *
                input#character-name(ref="nameInput" v-model="draft.name" type="text" class="w-full rounded-lg border border-component-input-border bg-component-input-bg px-3 py-2 text-base text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg" placeholder="Character Name" required @input="isDirty = true" @blur="markAsTouched('name')")
                p(class="mt-2 text-sm text-design-page-muted" v-if="touchedFields.name && visibleErrors.name") {{ visibleErrors.name }}

        div
            label(class="label" for="character-description")
                | Description
            textarea#character-description(
                v-model="draft.description" rows="3"  
                placeholder="Character Description" 
                @input="isDirty = true")

        div
            ClassSelector(:classes="draft.classes || []" @update:classes="draft.classes = $event")

        div(class="rounded-xl border border-design-border-subtle bg-component-list-item-subtle-bg p-3")
            div(class="mb-3 flex items-center justify-between gap-4")
                label(class="text-sm font-semibold text-design-page-text") Max Hit Points
                div(class="flex items-center gap-2")
                    button(class="icon-button" type="button" @click="adjustHp(-1)") -
                    span(class="min-w-16 text-center text-sm font-semibold") {{ draft.maxHitPoints || 10 }} HP
                    button(class="button-plain h-8 w-8 rounded-md border border-design-border-default bg-component-panel-bg px-0 py-0 text-lg text-design-page-text transition hover:bg-component-list-item-strong-bg" type="button" @click="adjustHp(1)") +

            input(v-model.number="draft.maxHitPoints" type="range" :min="schema.properties.maxHitPoints.minimum" :max="schema.properties.maxHitPoints.maximum" step="1" class="w-full accent-component-button-bg")

        div(class="flex flex-wrap items-center gap-3 pt-2")
            button(type="submit" :disabled="!canSave") Save
            button(class="secondary" type="button" @click="cancel") Cancel
            div(class="flex-1")
            button(class="danger" v-if="isEditing" type="button" @click="presentDeleteConfirmation")
                | Delete Character
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
