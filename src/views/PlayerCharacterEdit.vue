<template>
  <div class="rounded-2xl border border-design-border-subtle bg-component-panel-bg p-4 shadow-sm">
    <form class="space-y-5" @submit.prevent="save">
      <div class="sticky top-0 z-20 -mx-4 mb-2 border-b border-design-border-subtle bg-component-panel-bg px-4 py-3">
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="secondary small" @click="scrollToSection('identity')">Identity</button>
          <button type="button" class="secondary small" @click="scrollToSection('core')">Core Stats</button>
          <button type="button" class="secondary small" @click="scrollToSection('combat')">Combat</button>
          <button type="button" class="secondary small" @click="scrollToSection('equipment')">Equipment</button>
        </div>
      </div>

      <section ref="identitySection" class="surface-subtle">
        <button type="button" class="section-toggle" @click="toggleSection('identity')">
          <span>Identity</span>
          <span>{{ sectionOpen.identity ? '−' : '+' }}</span>
        </button>
        <div v-if="sectionOpen.identity" class="mt-4 space-y-4">
          <div class="flex flex-col gap-4 sm:flex-row">
            <ImagePicker :imageDataUrl="draft.portrait || ''" @change="onPortraitChanged" />
            <div class="flex-1 space-y-4">
              <div>
                <label class="field-label" for="character-name">
                  Name <span class="text-design-page-muted">*</span>
                  <button type="button" class="info-btn" @click="openInfo('name', $event)">?</button>
                </label>
                <input
                  id="character-name"
                  ref="nameInput"
                  v-model="draft.name"
                  type="text"
                  class="field-input"
                  placeholder="Character Name"
                  required
                  @blur="markAsTouched('name')"
                />
                <p v-if="touchedFields.name && visibleErrors.name" class="field-error">{{ visibleErrors.name }}</p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label class="field-label" for="character-level">
                    Level
                    <button type="button" class="info-btn" @click="openInfo('level', $event)">?</button>
                  </label>
                  <input id="character-level" v-model.number="draft.level" type="number" min="1" max="20" class="field-input" />
                </div>
                <div>
                  <label class="field-label" for="character-race">
                    Race
                    <button type="button" class="info-btn" @click="openInfo('race', $event)">?</button>
                  </label>
                  <input id="character-race" v-model="draft.race" type="text" class="field-input" placeholder="e.g. Red Dragonborn" />
                </div>
                <div>
                  <label class="field-label" for="character-background">
                    Background
                    <button type="button" class="info-btn" @click="openInfo('background', $event)">?</button>
                  </label>
                  <input id="character-background" v-model="draft.background" type="text" class="field-input" placeholder="e.g. Hunter" />
                </div>
                <div>
                  <label class="field-label" for="character-max-hp">
                    Max HP
                    <button type="button" class="info-btn" @click="openInfo('maxHitPoints', $event)">?</button>
                  </label>
                  <input
                    id="character-max-hp"
                    v-model.number="draft.maxHitPoints"
                    type="number"
                    :min="schema.properties.maxHitPoints.minimum"
                    :max="schema.properties.maxHitPoints.maximum"
                    class="field-input"
                    @blur="markAsTouched('maxHitPoints')"
                  />
                  <p v-if="touchedFields.maxHitPoints && visibleErrors.maxHitPoints" class="field-error">{{ visibleErrors.maxHitPoints }}</p>
                </div>
              </div>
            </div>
          </div>
          <ClassSelector :classes="draft.classes || []" @update:classes="draft.classes = $event" />
        </div>
      </section>

      <section ref="coreSection" class="surface-subtle">
        <button type="button" class="section-toggle" @click="toggleSection('core')">
          <span>Core Stats</span>
          <span>{{ sectionOpen.core ? '−' : '+' }}</span>
        </button>
        <div v-if="sectionOpen.core" class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="ability in abilityRows" :key="ability.key" class="rounded-lg border border-design-border-subtle bg-component-list-item-subtle-bg p-3">
            <label class="field-label" :for="`ability-${ability.key}`">
              {{ ability.label }}
              <button type="button" class="info-btn" @click="openInfo(`ability-${ability.key}`, $event)">?</button>
            </label>
            <div class="mt-2 flex items-center gap-3">
              <input
                :id="`ability-${ability.key}`"
                v-model.number="draft.abilityScores[ability.key]"
                type="number"
                min="1"
                max="30"
                class="field-input"
              />
              <div class="derived-pill">
                Mod {{ formatModifier(abilityModifier(draft.abilityScores[ability.key])) }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref="combatSection" class="surface-subtle">
        <button type="button" class="section-toggle" @click="toggleSection('combat')">
          <span>Combat Summary</span>
          <span>{{ sectionOpen.combat ? '−' : '+' }}</span>
        </button>
        <div v-if="sectionOpen.combat" class="mt-4 space-y-3">
          <div class="combat-row">
            <div class="combat-label">
              Proficiency Bonus
              <button type="button" class="info-btn" @click="openInfo('proficiencyBonus', $event)">?</button>
            </div>
            <div class="combat-value">
              <span>{{ formatModifier(effectiveProficiencyBonus) }}</span>
              <label class="inline-flex items-center gap-2 text-xs text-design-page-muted">
                <input v-model="draft.overrides.proficiencyBonus.enabled" type="checkbox" />
                Override
              </label>
              <input v-if="draft.overrides.proficiencyBonus.enabled" v-model.number="draft.overrides.proficiencyBonus.value" type="number" class="field-input max-w-20" />
            </div>
            <p class="formula">Derived from level: {{ formatModifier(derivedProficiencyBonus) }}</p>
          </div>

          <div class="combat-row">
            <div class="combat-label">
              Initiative
              <button type="button" class="info-btn" @click="openInfo('initiative', $event)">?</button>
            </div>
            <div class="combat-value">
              <span>{{ formatModifier(effectiveInitiative) }}</span>
              <label class="inline-flex items-center gap-2 text-xs text-design-page-muted">
                <input v-model="draft.overrides.initiative.enabled" type="checkbox" />
                Override
              </label>
              <input v-if="draft.overrides.initiative.enabled" v-model.number="draft.overrides.initiative.value" type="number" class="field-input max-w-20" />
            </div>
            <p class="formula">Dex mod {{ formatModifier(dexModifier) }} + bonus {{ formatModifier(draft.initiativeBonus) }}</p>
          </div>

          <div class="combat-row">
            <div class="combat-label">
              Armor Class
              <button type="button" class="info-btn" @click="openInfo('armorClass', $event)">?</button>
            </div>
            <div class="combat-value">
              <span>{{ effectiveArmorClass }}</span>
              <label class="inline-flex items-center gap-2 text-xs text-design-page-muted">
                <input v-model="draft.overrides.armorClass.enabled" type="checkbox" />
                Override
              </label>
              <input v-if="draft.overrides.armorClass.enabled" v-model.number="draft.overrides.armorClass.value" type="number" class="field-input max-w-20" />
            </div>
            <p class="formula">Base {{ draft.armorClassBase }} + Dex mod {{ formatModifier(dexModifier) }} + armor bonus {{ formatModifier(draft.armorClassBonus) }}</p>
          </div>

          <div class="combat-row">
            <div class="combat-label">
              Attack Bonus (equipped weapon)
              <button type="button" class="info-btn" @click="openInfo('attackBonus', $event)">?</button>
            </div>
            <div class="combat-value">
              <span v-if="canComputeAttackBonus">{{ formatModifier(effectiveAttackBonus) }}</span>
              <span v-else class="text-design-page-muted">Missing prerequisites</span>
              <label class="inline-flex items-center gap-2 text-xs text-design-page-muted">
                <input v-model="draft.overrides.attackBonus.enabled" type="checkbox" />
                Override
              </label>
              <input v-if="draft.overrides.attackBonus.enabled" v-model.number="draft.overrides.attackBonus.value" type="number" class="field-input max-w-20" />
            </div>
            <p v-if="canComputeAttackBonus" class="formula">
              {{ weaponAbilityLabel }} mod {{ formatModifier(weaponAbilityModifier) }}
              <span v-if="draft.proficientWithWeapon"> + prof {{ formatModifier(effectiveProficiencyBonus) }}</span>
            </p>
          </div>

          <div v-if="missingAttackPrerequisites.length" class="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            <p class="font-semibold">Missing data for attack bonus:</p>
            <ul class="mt-2 space-y-1">
              <li v-for="item in missingAttackPrerequisites" :key="item.field" class="flex items-center justify-between gap-2">
                <span>{{ item.message }}</span>
                <button type="button" class="secondary small" @click="resolveMissingPrerequisite(item.field, item.section)">
                  Go to {{ item.sectionLabel }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section ref="equipmentSection" class="surface-subtle">
        <button type="button" class="section-toggle" @click="toggleSection('equipment')">
          <span>Equipment / Prerequisites</span>
          <span>{{ sectionOpen.equipment ? '−' : '+' }}</span>
        </button>
        <div v-if="sectionOpen.equipment" class="mt-4 space-y-3">
          <div v-if="returnTarget === 'combat'" class="rounded-lg border border-design-border-subtle bg-component-list-item-strong-bg p-3">
            <p class="text-sm text-design-page-text">Fill the missing fields below, then return to the combat calculation.</p>
            <button type="button" class="secondary small mt-2" @click="returnToTarget">Return to Combat Summary</button>
          </div>

          <div>
            <label class="field-label" for="equipped-weapon">
              Equipped Weapon
              <button type="button" class="info-btn" @click="openInfo('equippedWeapon', $event)">?</button>
            </label>
            <input
              id="equipped-weapon"
              :ref="(el) => setFieldRef('equippedWeaponName', el)"
              v-model="draft.equippedWeaponName"
              type="text"
              class="field-input"
              :class="{ 'ring-2 ring-red-400': highlightedFields.has('equippedWeaponName') }"
              placeholder="e.g. Shortsword"
            />
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="field-label" for="weapon-ability">
                Weapon Ability
                <button type="button" class="info-btn" @click="openInfo('weaponAbility', $event)">?</button>
              </label>
              <select id="weapon-ability" v-model="draft.equippedWeaponAbility" class="field-input">
                <option value="strength">Strength</option>
                <option value="dexterity">Dexterity</option>
              </select>
            </div>
            <label class="mt-7 inline-flex items-center gap-2 text-sm text-design-page-text">
              <input v-model="draft.proficientWithWeapon" type="checkbox" />
              Proficient with equipped weapon
            </label>
          </div>

          <div>
            <label class="field-label" for="inventory-items">
              Inventory Items (one per line)
              <button type="button" class="info-btn" @click="openInfo('inventory', $event)">?</button>
            </label>
            <textarea
              id="inventory-items"
              :ref="(el) => setFieldRef('inventoryItemsText', el)"
              v-model="draft.inventoryItemsText"
              rows="4"
              class="field-input"
              :class="{ 'ring-2 ring-red-400': highlightedFields.has('inventoryItemsText') }"
              placeholder="Shortsword&#10;Leather Armor&#10;Explorer's Pack"
            />
          </div>
        </div>
      </section>

      <div class="flex flex-wrap items-center gap-3 pt-2">
        <button type="submit" :disabled="!canSave">Save</button>
        <button class="secondary" type="button" @click="cancel">Cancel</button>
        <div class="flex-1" />
        <button class="danger" v-if="isEditing" type="button" @click="presentDeleteConfirmation">Delete Character</button>
      </div>
    </form>

    <div
      v-if="activeInfo"
      ref="infoPopover"
      class="fixed z-[70] w-[min(22rem,calc(100vw-1.5rem))] rounded-lg border border-design-border-subtle bg-component-panel-bg p-3 shadow-2xl"
      :style="{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }"
      role="dialog"
      aria-live="polite"
    >
      <div class="mb-1 text-sm font-semibold text-design-page-text">{{ activeInfo.title }}</div>
      <p class="text-sm text-design-page-text">{{ activeInfo.meaning }}</p>
      <p v-if="activeInfo.formula" class="mt-2 text-xs text-design-page-muted">{{ activeInfo.formula }}</p>
      <button type="button" class="secondary small mt-3" @click="closeInfo">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import Ajv from 'ajv';
import fullSchema from '../generated/models/data.schema.json';

const schema = { ...fullSchema.$defs.PlayerCharacter, $defs: fullSchema.$defs };
const nameInput = ref<HTMLInputElement | null>(null);

type AbilityKey = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
type SectionKey = 'identity' | 'core' | 'combat' | 'equipment';

type PlayerCharacterDraft = {
  id: string;
  name: string;
  portrait?: string;
  description?: string;
  race?: string;
  background?: string;
  classes: string[];
  level: number;
  maxHitPoints: number;
  abilityScores: Record<AbilityKey, number>;
  initiativeBonus: number;
  armorClassBase: number;
  armorClassBonus: number;
  equippedWeaponName: string;
  equippedWeaponAbility: 'strength' | 'dexterity';
  proficientWithWeapon: boolean;
  inventoryItemsText: string;
  overrides: {
    proficiencyBonus: { enabled: boolean; value: number };
    initiative: { enabled: boolean; value: number };
    armorClass: { enabled: boolean; value: number };
    attackBonus: { enabled: boolean; value: number };
  };
};

const props = defineProps<{
  characterData?: {
    id: string;
    name: string;
    maxHitPoints: number;
    classes: string[];
    [key: string]: unknown;
  };
}>();

const emit = defineEmits<{
  (e: 'save', payload: PlayerCharacterDraft): void;
  (e: 'cancel'): void;
  (e: 'delete', characterId: string): void;
}>();

function createBlankDraft(): PlayerCharacterDraft {
  return {
    id: crypto.randomUUID(),
    name: '',
    classes: [],
    level: 1,
    maxHitPoints: 10,
    description: '',
    portrait: '',
    race: '',
    background: '',
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    initiativeBonus: 0,
    armorClassBase: 10,
    armorClassBonus: 0,
    equippedWeaponName: '',
    equippedWeaponAbility: 'strength',
    proficientWithWeapon: true,
    inventoryItemsText: '',
    overrides: {
      proficiencyBonus: { enabled: false, value: 2 },
      initiative: { enabled: false, value: 0 },
      armorClass: { enabled: false, value: 10 },
      attackBonus: { enabled: false, value: 0 }
    }
  };
}

function generateBlankOrClone(source?: Record<string, unknown>): PlayerCharacterDraft {
  const base = createBlankDraft();
  if (!source) return base;
  return {
    ...base,
    ...source,
    classes: Array.isArray(source.classes) ? (source.classes as string[]) : [],
    abilityScores: {
      ...base.abilityScores,
      ...(typeof source.abilityScores === 'object' && source.abilityScores ? source.abilityScores as Record<AbilityKey, number> : {})
    },
    overrides: {
      ...base.overrides,
      ...(typeof source.overrides === 'object' && source.overrides ? source.overrides as PlayerCharacterDraft['overrides'] : {})
    }
  };
}

const draft = ref<PlayerCharacterDraft>(generateBlankOrClone(props.characterData as Record<string, unknown> | undefined));
const isDirty = ref(false);
const isHydrating = ref(true);
const touchedFields = ref<Record<string, boolean>>({});
const sectionOpen = reactive<Record<SectionKey, boolean>>({
  identity: true,
  core: true,
  combat: true,
  equipment: false
});

const identitySection = ref<HTMLElement | null>(null);
const coreSection = ref<HTMLElement | null>(null);
const combatSection = ref<HTMLElement | null>(null);
const equipmentSection = ref<HTMLElement | null>(null);

const fieldRefs = new Map<string, HTMLElement>();
const highlightedFields = ref<Set<string>>(new Set());
const returnTarget = ref<'combat' | null>(null);

const abilityRows: Array<{ key: AbilityKey; label: string }> = [
  { key: 'strength', label: 'Strength' },
  { key: 'dexterity', label: 'Dexterity' },
  { key: 'constitution', label: 'Constitution' },
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'wisdom', label: 'Wisdom' },
  { key: 'charisma', label: 'Charisma' }
];

watch(() => props.characterData, async (newSource) => {
  isHydrating.value = true;
  draft.value = generateBlankOrClone(newSource as Record<string, unknown> | undefined);
  touchedFields.value = {};
  isDirty.value = false;
  await nextTick();
  isHydrating.value = false;
}, { deep: true });

watch(draft, () => {
  if (!isHydrating.value) {
    isDirty.value = true;
  }
}, { deep: true });

const isEditing = computed(() => !!props.characterData);

function markAsTouched(field: string) {
  touchedFields.value[field] = true;
}

function abilityModifier(score: number) {
  return Math.floor((Number(score || 0) - 10) / 2);
}

function formatModifier(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

const dexModifier = computed(() => abilityModifier(draft.value.abilityScores.dexterity));
const derivedProficiencyBonus = computed(() => Math.floor((Math.max(1, draft.value.level) - 1) / 4) + 2);
const effectiveProficiencyBonus = computed(() =>
  draft.value.overrides.proficiencyBonus.enabled ? draft.value.overrides.proficiencyBonus.value : derivedProficiencyBonus.value
);

const derivedInitiative = computed(() => dexModifier.value + Number(draft.value.initiativeBonus || 0));
const effectiveInitiative = computed(() =>
  draft.value.overrides.initiative.enabled ? draft.value.overrides.initiative.value : derivedInitiative.value
);

const derivedArmorClass = computed(() =>
  Number(draft.value.armorClassBase || 10) + dexModifier.value + Number(draft.value.armorClassBonus || 0)
);
const effectiveArmorClass = computed(() =>
  draft.value.overrides.armorClass.enabled ? draft.value.overrides.armorClass.value : derivedArmorClass.value
);

const inventoryItems = computed(() =>
  draft.value.inventoryItemsText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
);

const missingAttackPrerequisites = computed(() => {
  const missing: Array<{ field: string; message: string; section: SectionKey; sectionLabel: string }> = [];
  if (!draft.value.equippedWeaponName.trim()) {
    missing.push({
      field: 'equippedWeaponName',
      message: 'Equipped weapon is required.',
      section: 'equipment',
      sectionLabel: 'Equipment'
    });
  }
  if (!inventoryItems.value.length) {
    missing.push({
      field: 'inventoryItemsText',
      message: 'Inventory items are required.',
      section: 'equipment',
      sectionLabel: 'Equipment'
    });
  }
  return missing;
});

const canComputeAttackBonus = computed(() => missingAttackPrerequisites.value.length === 0);
const weaponAbilityModifier = computed(() =>
  draft.value.equippedWeaponAbility === 'dexterity'
    ? abilityModifier(draft.value.abilityScores.dexterity)
    : abilityModifier(draft.value.abilityScores.strength)
);
const weaponAbilityLabel = computed(() => (draft.value.equippedWeaponAbility === 'dexterity' ? 'Dex' : 'Str'));
const derivedAttackBonus = computed(() => {
  if (!canComputeAttackBonus.value) return 0;
  const prof = draft.value.proficientWithWeapon ? effectiveProficiencyBonus.value : 0;
  return weaponAbilityModifier.value + prof;
});
const effectiveAttackBonus = computed(() =>
  draft.value.overrides.attackBonus.enabled ? draft.value.overrides.attackBonus.value : derivedAttackBonus.value
);

function toggleSection(section: SectionKey) {
  sectionOpen[section] = !sectionOpen[section];
}

function getSectionRef(section: SectionKey) {
  if (section === 'identity') return identitySection.value;
  if (section === 'core') return coreSection.value;
  if (section === 'combat') return combatSection.value;
  return equipmentSection.value;
}

function scrollToSection(section: SectionKey) {
  sectionOpen[section] = true;
  const sectionRef = getSectionRef(section);
  sectionRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setFieldRef(field: string, element: Element | null) {
  if (!element) return;
  fieldRefs.set(field, element as HTMLElement);
}

function resolveMissingPrerequisite(field: string, section: SectionKey) {
  returnTarget.value = 'combat';
  highlightedFields.value = new Set([field]);
  scrollToSection(section);
  nextTick(() => {
    const target = fieldRefs.get(field);
    target?.focus();
  });
}

function returnToTarget() {
  highlightedFields.value = new Set();
  returnTarget.value = null;
  scrollToSection('combat');
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
}

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
  return { isValid: valid, errors: errorsMap };
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

const canSave = computed(() => validationResult.value.isValid && isDirty.value);

function unfocusActiveElement() {
  const activeElement = document.activeElement as HTMLElement | null;
  activeElement?.blur?.();
}

function save() {
  emit('save', { ...draft.value });
  unfocusActiveElement();
  touchedFields.value = {};
}

function cancel() {
  emit('cancel');
  unfocusActiveElement();
  touchedFields.value = {};
}

const INFO_CONTENT: Record<string, { title: string; meaning: string; formula?: string }> = {
  name: {
    title: 'Character Name',
    meaning: 'The primary identity used in party, encounter, and combat views.'
  },
  level: {
    title: 'Level',
    meaning: 'Represents overall character progression and drives several derived values.',
    formula: 'Proficiency bonus is derived from level.'
  },
  race: {
    title: 'Race',
    meaning: 'Descriptive character trait useful for quick context during play.'
  },
  background: {
    title: 'Background',
    meaning: 'Narrative and proficiency context used for roleplay and checks.'
  },
  maxHitPoints: {
    title: 'Max Hit Points',
    meaning: 'Upper HP limit used to track survivability in encounters.'
  },
  proficiencyBonus: {
    title: 'Proficiency Bonus',
    meaning: 'Added to attack rolls, saves, and checks when proficient.',
    formula: 'Derived by level (default): floor((level - 1) / 4) + 2.'
  },
  initiative: {
    title: 'Initiative',
    meaning: 'Determines turn order in combat encounters.',
    formula: 'Dexterity modifier + initiative bonus (unless overridden).'
  },
  armorClass: {
    title: 'Armor Class',
    meaning: 'Target number attackers must meet or exceed to hit.',
    formula: 'Base AC + Dex modifier + armor bonus (unless overridden).'
  },
  attackBonus: {
    title: 'Attack Bonus',
    meaning: 'Modifier added to d20 attack rolls for the equipped weapon.',
    formula: 'Relevant ability mod + proficiency bonus if proficient (unless overridden).'
  },
  equippedWeapon: {
    title: 'Equipped Weapon',
    meaning: 'The weapon currently used for attack calculations.'
  },
  weaponAbility: {
    title: 'Weapon Ability',
    meaning: 'Select whether attacks use Strength or Dexterity for this equipped weapon.'
  },
  inventory: {
    title: 'Inventory Items',
    meaning: 'Tracks carried gear and supports calculation prerequisites during play.'
  },
  'ability-strength': {
    title: 'Strength',
    meaning: 'Affects melee attacks and many physical checks.',
    formula: 'Modifier = floor((score - 10) / 2).'
  },
  'ability-dexterity': {
    title: 'Dexterity',
    meaning: 'Affects initiative, AC contributions, and dexterity-based checks.',
    formula: 'Modifier = floor((score - 10) / 2).'
  },
  'ability-constitution': {
    title: 'Constitution',
    meaning: 'Affects resilience and hit point related outcomes.',
    formula: 'Modifier = floor((score - 10) / 2).'
  },
  'ability-intelligence': {
    title: 'Intelligence',
    meaning: 'Affects knowledge and reasoning-oriented checks.',
    formula: 'Modifier = floor((score - 10) / 2).'
  },
  'ability-wisdom': {
    title: 'Wisdom',
    meaning: 'Affects perception, insight, and awareness-related checks.',
    formula: 'Modifier = floor((score - 10) / 2).'
  },
  'ability-charisma': {
    title: 'Charisma',
    meaning: 'Affects influence and social interaction checks.',
    formula: 'Modifier = floor((score - 10) / 2).'
  }
};

const activeInfo = ref<{ title: string; meaning: string; formula?: string } | null>(null);
const infoPopover = ref<HTMLElement | null>(null);
const popoverPos = reactive({ top: 0, left: 0 });

function openInfo(infoId: string, event: MouseEvent) {
  activeInfo.value = INFO_CONTENT[infoId] || {
    title: 'Field information',
    meaning: 'No additional notes available yet.'
  };

  const trigger = event.currentTarget as HTMLElement | null;
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  const popoverWidth = Math.min(352, window.innerWidth - 24);
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - popoverWidth - 12));
  const top = Math.min(window.innerHeight - 140, rect.bottom + 8);
  popoverPos.top = Math.max(12, top);
  popoverPos.left = left;
}

function closeInfo() {
  activeInfo.value = null;
}

function handleWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeInfo();
}

function handleWindowClick(event: MouseEvent) {
  const target = event.target as Node | null;
  if (!target) return;
  if (infoPopover.value?.contains(target)) return;
  const trigger = (target as HTMLElement).closest?.('.info-btn');
  if (trigger) return;
  closeInfo();
}

onMounted(async () => {
  touchedFields.value = {};
  isDirty.value = false;
  await nextTick();
  isHydrating.value = false;
  nameInput.value?.focus();
  window.addEventListener('keydown', handleWindowKeydown);
  window.addEventListener('click', handleWindowClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown);
  window.removeEventListener('click', handleWindowClick);
});
</script>

<style scoped>
.surface-subtle {
  border-radius: 1rem;
  border: 1px solid var(--design-border-subtle);
  background: var(--component-list-item-subtle-bg);
  padding: 1rem;
}

.section-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  background: transparent;
  font-weight: 700;
  color: var(--design-page-text);
}

.field-label {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--design-page-text);
}

.field-input {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--component-input-border);
  background: var(--component-input-bg);
  padding: 0.45rem 0.65rem;
  color: var(--component-input-text);
  outline: none;
}

.field-input:focus {
  border-color: var(--component-button-bg);
}

.field-error {
  margin-top: 0.45rem;
  font-size: 0.8rem;
  color: #b91c1c;
}

.info-btn {
  display: inline-flex;
  height: 1.25rem;
  width: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid var(--design-border-default);
  background: var(--component-panel-bg);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  color: var(--design-page-muted);
}

.derived-pill {
  white-space: nowrap;
  border-radius: 9999px;
  border: 1px solid var(--design-border-subtle);
  background: var(--component-list-item-strong-bg);
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.combat-row {
  border-radius: 0.75rem;
  border: 1px solid var(--design-border-subtle);
  background: var(--component-panel-bg);
  padding: 0.75rem;
}

.combat-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
}

.combat-value {
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.formula {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--design-page-muted);
}

.secondary.small {
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
}
</style>
