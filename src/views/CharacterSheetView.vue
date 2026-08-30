<template>
  <div class="flex h-screen flex-col overflow-hidden bg-design-page-bg text-design-page-text">
    <Breadcrumbs class="shrink-0" />
    <div class="flex-1 min-h-0 overflow-hidden p-2">
      <div v-if="!currentCampaign" class="border border-red-300 bg-red-50 p-3 text-red-900">
        <p class="font-semibold">Campaign not found.</p>
        <button type="button" class="secondary mt-2 px-2 py-1 text-[0.72rem]" @click="router.push('/campaigns')">Back
          to
          campaigns</button>
      </div>
      <form v-else class="flex h-full flex-col gap-1" @submit.prevent="save">
        <div
          class="sticky top-0 z-20 -mx-3 mb-1 shrink-0 border-b border-design-border-subtle bg-component-panel-bg px-3 py-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold me-4">Character Sheet</span>
            <button type="button" class="secondary px-2 py-1 text-[0.72rem]"
              @click="scrollToSection('identity')">Identity</button>
            <button type="button" class="secondary px-2 py-1 text-[0.72rem]" @click="scrollToSection('core')">Core
              Stats</button>
            <button type="button" class="secondary px-2 py-1 text-[0.72rem]"
              @click="scrollToSection('combat')">Combat</button>
            <button type="button" class="secondary px-2 py-1 text-[0.72rem]"
              @click="scrollToSection('equipment')">Equipment</button>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto">
          <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 __flex __flex-col __gap-2">
            <section ref="identitySection" class="sheet-section">
              <label class="p-[0.1rem_0] text-[0.9rem] font-bold text-design-page-text">
                Identity
              </label>
              <div v-if="sectionOpen.identity" class="mt-2 space-y-2">
                <div class="flex flex-col gap-2 sm:flex-row">
                  <ImagePicker class="flex-1" :imageDataUrl="draft.portrait || ''" @change="onPortraitChanged" />
                  <div class="flex-2 space-y-2">
                    <div>
                      <label
                        class="mb-[0.35rem] flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-design-page-text"
                        for="character-name">
                        Name <span class="text-design-page-muted">*</span>
                        <button type="button"
                          class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                          @click="openInfo('name', $event)">?</button>
                      </label>
                      <input id="character-name" ref="nameInput" v-model="draft.name" type="text"
                        class="w-full rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg"
                        placeholder="Character Name" required @blur="markAsTouched('name')" />
                      <p v-if="touchedFields.name && visibleErrors.name" class="mt-1 text-[0.8rem] text-red-700">{{
                        visibleErrors.name }}</p>
                    </div>

                    <div class="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label
                          class="mb-[0.35rem] flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-design-page-text"
                          for="character-level">
                          Level
                          <button type="button"
                            class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                            @click="openInfo('level', $event)">?</button>
                        </label>
                        <input id="character-level" v-model.number="draft.level" type="number" min="1" max="20"
                          class="w-full rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg" />
                      </div>
                      <div>
                        <label
                          class="mb-[0.35rem] flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-design-page-text"
                          for="character-race">
                          Race
                          <button type="button"
                            class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                            @click="openInfo('race', $event)">?</button>
                        </label>
                        <input id="character-race" v-model="draft.race" type="text"
                          class="w-full rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg"
                          placeholder="e.g. Red Dragonborn" />
                      </div>
                      <div>
                        <label
                          class="mb-[0.35rem] flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-design-page-text"
                          for="character-background">
                          Background
                          <button type="button"
                            class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                            @click="openInfo('background', $event)">?</button>
                        </label>
                        <input id="character-background" v-model="draft.background" type="text"
                          class="w-full rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg"
                          placeholder="e.g. Hunter" />
                      </div>
                      <div>
                        <label
                          class="mb-[0.35rem] flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-design-page-text"
                          for="character-max-hp">
                          Max HP
                          <button type="button"
                            class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                            @click="openInfo('maxHitPoints', $event)">?</button>
                        </label>
                        <input id="character-max-hp" v-model.number="draft.maxHitPoints" type="number"
                          :min="schema.properties.maxHitPoints.minimum" :max="schema.properties.maxHitPoints.maximum"
                          class="w-full rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg"
                          @blur="markAsTouched('maxHitPoints')" />
                        <p v-if="touchedFields.maxHitPoints && visibleErrors.maxHitPoints"
                          class="mt-1 text-[0.8rem] text-red-700">{{
                            visibleErrors.maxHitPoints }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <ClassSelector :classes="draft.classes || []" @update:classes="draft.classes = $event" />
              </div>
            </section>

            <section ref="coreSection" class="sheet-section">
              <label class="p-[0.1rem_0] text-[0.9rem] font-bold text-design-page-text">
                Core Stats
              </label>
              <div v-if="sectionOpen.core" class="mt-2 grid gap-2 grid-cols-2 lg:grid-cols-3">
                <div v-for="ability in abilityRows" :key="ability.key"
                  class="border border-design-border-subtle bg-component-list-item-subtle-bg px-2 py-1.5">
                  <label
                    class="mb-[0.35rem] flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-design-page-text"
                    :for="`ability-${ability.key}`">
                    {{ ability.label }}
                    <button type="button"
                      class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                      @click="openInfo(`ability-${ability.key}`, $event)">?</button>
                  </label>
                  <div class="mt-1.5 flex items-center gap-2">
                    <input :id="`ability-${ability.key}`" v-model.number="draft.abilityScores[ability.key]"
                      type="number" min="1" max="30" width="2"
                      class="w-14 text-center rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg" />
                    <div
                      class="whitespace-nowrap rounded-[0.35rem] border border-design-border-subtle bg-component-list-item-strong-bg px-[0.45rem] py-[0.2rem] font-semibold">
                      {{ formatModifier(abilityModifier(draft.abilityScores[ability.key])) }}
                    </div>
                    <div class="ml-auto whitespace-nowrap rounded-[0.35rem] border border-design-border-subtle bg-component-list-item-strong-bg px-[0.45rem] py-[0.2rem] font-semibold"
                      :class="isSavingThrowProficient(ability.key) ? 'bg-lime-400 border-lime-500' : 'text-current/10 bg-component-list-item-strong-bg border-design-border-subtle'">
                      &#x1F6E1;
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section ref="combatSection" class="sheet-section">
              <button type="button"
                class="flex w-full items-center justify-between border-0 bg-transparent p-[0.1rem_0] text-[0.9rem] font-bold text-design-page-text"
                @click="toggleSection('combat')">
                <span>Combat Summary</span>
                <span>{{ sectionOpen.combat ? '−' : '+' }}</span>
              </button>
              <div v-if="sectionOpen.combat" class="mt-2 space-y-2">
                <div
                  class="rounded-[0.35rem] border border-design-border-subtle bg-component-panel-bg p-[0.45rem_0.55rem]">
                  <div class="flex items-center gap-2 font-bold">
                    Proficiency Bonus
                    <button type="button"
                      class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                      @click="openInfo('proficiencyBonus', $event)">?</button>
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-[0.35rem]">
                    <span>{{ formatModifier(effectiveProficiencyBonus) }}</span>
                    <label class="inline-flex items-center gap-2 text-xs text-design-page-muted">
                      <input v-model="draft.overrides.proficiencyBonus.enabled" type="checkbox" />
                      Override
                    </label>
                    <input v-if="draft.overrides.proficiencyBonus.enabled"
                      v-model.number="draft.overrides.proficiencyBonus.value" type="number"
                      class="w-full max-w-20 rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition focus:border-component-button-bg" />
                  </div>
                  <p class="mt-1 text-[0.75rem] text-design-page-muted">Derived from level: {{
                    formatModifier(derivedProficiencyBonus) }}</p>
                </div>

                <div
                  class="rounded-[0.35rem] border border-design-border-subtle bg-component-panel-bg p-[0.45rem_0.55rem]">
                  <div class="flex items-center gap-2 font-bold">
                    Initiative
                    <button type="button"
                      class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                      @click="openInfo('initiative', $event)">?</button>
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-[0.35rem]">
                    <span>{{ formatModifier(effectiveInitiative) }}</span>
                    <label class="inline-flex items-center gap-2 text-xs text-design-page-muted">
                      <input v-model="draft.overrides.initiative.enabled" type="checkbox" />
                      Override
                    </label>
                    <input v-if="draft.overrides.initiative.enabled" v-model.number="draft.overrides.initiative.value"
                      type="number"
                      class="w-full max-w-20 rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition focus:border-component-button-bg" />
                  </div>
                  <p class="mt-1 text-[0.75rem] text-design-page-muted">Dex mod {{ formatModifier(dexModifier) }} +
                    bonus {{
                      formatModifier(draft.initiativeBonus) }}</p>
                </div>

                <div
                  class="rounded-[0.35rem] border border-design-border-subtle bg-component-panel-bg p-[0.45rem_0.55rem]">
                  <div class="flex items-center gap-2 font-bold">
                    Armor Class
                    <button type="button"
                      class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                      @click="openInfo('armorClass', $event)">?</button>
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-[0.35rem]">
                    <span>{{ effectiveArmorClass }}</span>
                    <label class="inline-flex items-center gap-2 text-xs text-design-page-muted">
                      <input v-model="draft.overrides.armorClass.enabled" type="checkbox" />
                      Override
                    </label>
                    <input v-if="draft.overrides.armorClass.enabled" v-model.number="draft.overrides.armorClass.value"
                      type="number"
                      class="w-full max-w-20 rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition focus:border-component-button-bg" />
                  </div>
                  <p class="mt-1 text-[0.75rem] text-design-page-muted">Base {{ draft.armorClassBase }} + Dex mod {{
                    formatModifier(dexModifier) }} + armor
                    bonus {{ formatModifier(draft.armorClassBonus) }}</p>
                </div>

                <div
                  class="rounded-[0.35rem] border border-design-border-subtle bg-component-panel-bg p-[0.45rem_0.55rem]">
                  <div class="flex items-center gap-2 font-bold">
                    Attack Bonus (equipped weapon)
                    <button type="button"
                      class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                      @click="openInfo('attackBonus', $event)">?</button>
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-[0.35rem]">
                    <span v-if="canComputeAttackBonus">{{ formatModifier(effectiveAttackBonus) }}</span>
                    <span v-else class="text-design-page-muted">Missing prerequisites</span>
                    <label class="inline-flex items-center gap-2 text-xs text-design-page-muted">
                      <input v-model="draft.overrides.attackBonus.enabled" type="checkbox" />
                      Override
                    </label>
                    <input v-if="draft.overrides.attackBonus.enabled" v-model.number="draft.overrides.attackBonus.value"
                      type="number"
                      class="w-full max-w-20 rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition focus:border-component-button-bg" />
                  </div>
                  <p v-if="canComputeAttackBonus" class="mt-1 text-[0.75rem] text-design-page-muted">
                    {{ weaponAbilityLabel }} mod {{ formatModifier(weaponAbilityModifier) }}
                    <span v-if="draft.proficientWithWeapon"> + prof {{ formatModifier(effectiveProficiencyBonus)
                    }}</span>
                  </p>
                </div>

                <div v-if="missingAttackPrerequisites.length"
                  class="border border-red-300 bg-red-50 p-2 text-sm text-red-900">
                  <p class="font-semibold">Missing data for attack bonus:</p>
                  <ul class="mt-2 space-y-1">
                    <li v-for="item in missingAttackPrerequisites" :key="item.field"
                      class="flex items-center justify-between gap-2">
                      <span>{{ item.message }}</span>
                      <button type="button" class="secondary px-2 py-1 text-[0.72rem]"
                        @click="resolveMissingPrerequisite(item.field, item.section)">
                        Go to {{ item.sectionLabel }}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section ref="equipmentSection" class="sheet-section">
              <button type="button"
                class="flex w-full items-center justify-between border-0 bg-transparent p-[0.1rem_0] text-[0.9rem] font-bold text-design-page-text"
                @click="toggleSection('equipment')">
                <span>Equipment / Prerequisites</span>
                <span>{{ sectionOpen.equipment ? '−' : '+' }}</span>
              </button>
              <div v-if="sectionOpen.equipment" class="mt-2 space-y-2">
                <div v-if="returnTarget === 'combat'"
                  class="border border-design-border-subtle bg-component-list-item-strong-bg p-2">
                  <p class="text-sm text-design-page-text">Fill the missing fields below, then return to the combat
                    calculation.</p>
                  <button type="button" class="secondary mt-2 px-2 py-1 text-[0.72rem]" @click="returnToTarget">Return
                    to Combat
                    Summary</button>
                </div>

                <div>
                  <label
                    class="mb-[0.35rem] flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-design-page-text"
                    for="equipped-weapon">
                    Equipped Weapon
                    <button type="button"
                      class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                      @click="openInfo('equippedWeapon', $event)">?</button>
                  </label>
                  <input id="equipped-weapon" :ref="(el) => setFieldRef('equippedWeaponName', el)"
                    v-model="draft.equippedWeaponName" type="text"
                    class="w-full rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg"
                    :class="{ 'ring-2 ring-red-400': highlightedFields.has('equippedWeaponName') }"
                    placeholder="e.g. Shortsword" />
                </div>

                <div class="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label
                      class="mb-[0.35rem] flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-design-page-text"
                      for="weapon-ability">
                      Weapon Ability
                      <button type="button"
                        class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                        @click="openInfo('weaponAbility', $event)">?</button>
                    </label>
                    <select id="weapon-ability" v-model="draft.equippedWeaponAbility"
                      class="w-full rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition focus:border-component-button-bg">
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
                  <label
                    class="mb-[0.35rem] flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-design-page-text"
                    for="inventory-items">
                    Inventory Items (one per line)
                    <button type="button"
                      class="inline-flex h-[1.1rem] w-[1.1rem] items-center justify-center rounded-full border border-design-border-default bg-component-panel-bg text-[0.7rem] font-bold leading-none text-design-page-muted"
                      @click="openInfo('inventory', $event)">?</button>
                  </label>
                  <textarea id="inventory-items" :ref="(el) => setFieldRef('inventoryItemsText', el)"
                    v-model="draft.inventoryItemsText" rows="4"
                    class="w-full rounded-[0.35rem] border border-component-input-border bg-component-input-bg px-2.5 py-[0.35rem] text-[0.9rem] text-component-input-text outline-none transition placeholder:text-design-page-muted focus:border-component-button-bg"
                    :class="{ 'ring-2 ring-red-400': highlightedFields.has('inventoryItemsText') }"
                    placeholder="Shortsword&#10;Leather Armor&#10;Explorer's Pack" />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2 pt-1">
          <button type="submit" :disabled="!canSave">Save</button>
          <button class="secondary" type="button" @click="cancel">Cancel</button>
          <div class="flex-1" />
          <button class="danger" v-if="isEditing" type="button" @click="presentDeleteConfirmation">Delete
            Character</button>
        </div>
      </form>
    </div>

    <div v-if="activeInfo" ref="infoPopover"
      class="fixed z-[70] w-[min(22rem,calc(100vw-1.5rem))] rounded-lg border border-design-border-subtle bg-component-panel-bg p-3 shadow-2xl"
      :style="{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }" role="dialog" aria-live="polite">
      <div class="mb-1 text-sm font-semibold text-design-page-text">{{ activeInfo.title }}</div>
      <p class="text-sm text-design-page-text">{{ activeInfo.meaning }}</p>
      <p v-if="activeInfo.formula" class="mt-2 text-xs text-design-page-muted">{{ activeInfo.formula }}</p>
      <button type="button" class="secondary mt-3 px-2 py-1 text-[0.72rem]" @click="closeInfo">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import Ajv from 'ajv';
import fullSchema from '../generated/models/data.schema.json';
import { useRoute, useRouter } from 'vue-router';
import { useDmScreenStore } from '../stores/dataStore';
import { AbilityKey, ClassName, savingThrowProficienciesFromClasses } from '../rulesets/dnd2024/classes';

const schema = { ...fullSchema.$defs.PlayerCharacter, $defs: fullSchema.$defs };
const nameInput = ref<HTMLInputElement | null>(null);
const route = useRoute();
const router = useRouter();
const dataStore = useDmScreenStore();

type SectionKey = 'identity' | 'core' | 'combat' | 'equipment';

type PlayerCharacterDraft = Record<string, unknown> & {
  id: string;
  name: string;
  portrait?: string;
  description?: string;
  race?: string;
  background?: string;
  classes: ClassName[];
  level: number;
  maxHitPoints: number;
  abilityScores: Record<AbilityKey, number>;
  initiativeBonus: number;
  armorClassBase: number;
  armorClassBonus: number;
  equippedWeaponName: string;
  equippedWeaponAbility: 'STR' | 'DEX';
  proficientWithWeapon: boolean;
  inventoryItemsText: string;
  overrides: {
    proficiencyBonus: { enabled: boolean; value: number };
    initiative: { enabled: boolean; value: number };
    armorClass: { enabled: boolean; value: number };
    attackBonus: { enabled: boolean; value: number };
  };
};

const campaignId = computed(() => String(route.params.campaignId ?? ''));
const characterId = computed(() => (typeof route.params.characterId === 'string' ? route.params.characterId : null));
const returnToPath = computed(() =>
  typeof route.query.returnTo === 'string' ? route.query.returnTo : `/campaigns/${campaignId.value}`
);
const currentCampaign = computed(() => dataStore.getCampaignById(campaignId.value));
const selectedCharacter = computed(() => {
  const campaign = currentCampaign.value;
  if (!campaign || !characterId.value || !Array.isArray(campaign.party)) return null;
  return campaign.party.find((pc: { id: string }) => pc.id === characterId.value) ?? null;
});

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
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10
    },
    initiativeBonus: 0,
    armorClassBase: 10,
    armorClassBonus: 0,
    equippedWeaponName: '',
    equippedWeaponAbility: 'STR',
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

function generateBlankOrClone(source?: Record<string, unknown> | null): PlayerCharacterDraft {
  const base = createBlankDraft();
  if (!source) return base;
  return {
    ...base,
    ...source,
    classes: Array.isArray(source.classes) ? (source.classes as ClassName[]) : [],
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

const draft = ref<PlayerCharacterDraft>(createBlankDraft());
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
  { key: 'STR', label: 'Strength' },
  { key: 'DEX', label: 'Dexterity' },
  { key: 'CON', label: 'Constitution' },
  { key: 'INT', label: 'Intelligence' },
  { key: 'WIS', label: 'Wisdom' },
  { key: 'CHA', label: 'Charisma' }
];

async function hydrateDraftFromRoute() {
  isHydrating.value = true;
  const source = selectedCharacter.value as Record<string, unknown> | null;
  draft.value = source ? generateBlankOrClone(source) : createBlankDraft();
  if (!draft.value.id) {
    draft.value.id = crypto.randomUUID();
  }
  touchedFields.value = {};
  isDirty.value = false;
  await nextTick();
  isHydrating.value = false;
}

watch(
  [campaignId, characterId, currentCampaign],
  () => {
    void hydrateDraftFromRoute();
  },
  { immediate: true }
);

watch(draft, () => {
  if (!isHydrating.value) {
    isDirty.value = true;
  }
}, { deep: true });

const isEditing = computed(() => !!characterId.value && !!selectedCharacter.value);

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
  draft.value.equippedWeaponAbility === 'DEX'
    ? abilityModifier(draft.value.abilityScores.DEX)
    : abilityModifier(draft.value.abilityScores.STR)
);
const weaponAbilityLabel = computed(() => (draft.value.equippedWeaponAbility === 'DEX' ? 'Dex' : 'Str'));
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
  if (!selectedCharacter.value) return;
  const confirmed = window.confirm(
    `Are you sure you want to permanently remove ${draft.value.name || 'this character'} from the campaign party? This action cannot be undone.`
  );
  if (confirmed) {
    deleteCharacter();
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

const canSave = computed(() => Boolean(currentCampaign.value) && validationResult.value.isValid && isDirty.value);

function unfocusActiveElement() {
  const activeElement = document.activeElement as HTMLElement | null;
  activeElement?.blur?.();
}

function save() {
  const campaign = currentCampaign.value;
  if (!campaign) {
    throw new Error(`Campaign ${campaignId.value} not found while saving character.`);
  }

  const existingParty = Array.isArray(campaign.party) ? [...campaign.party] : [];
  const index = existingParty.findIndex((pc: { id: string }) => pc.id === draft.value.id);
  const payload = JSON.parse(JSON.stringify(draft.value));

  if (index >= 0) {
    existingParty[index] = payload;
  } else {
    existingParty.push(payload);
  }

  dataStore.addOrUpdateCampaign({
    ...campaign,
    party: existingParty
  });

  router.push(returnToPath.value);
  unfocusActiveElement();
  touchedFields.value = {};
}

function cancel() {
  router.push(returnToPath.value);
  unfocusActiveElement();
  touchedFields.value = {};
}

function deleteCharacter() {
  const campaign = currentCampaign.value;
  if (!campaign) {
    throw new Error(`Campaign ${campaignId.value} not found while deleting character.`);
  }

  const existingParty = Array.isArray(campaign.party) ? campaign.party : [];
  const nextParty = existingParty.filter((pc: { id: string }) => pc.id !== draft.value.id);

  dataStore.addOrUpdateCampaign({
    ...campaign,
    party: nextParty
  });

  router.push(returnToPath.value);
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
  await nextTick();
  nameInput.value?.focus();
  window.addEventListener('keydown', handleWindowKeydown);
  window.addEventListener('click', handleWindowClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown);
  window.removeEventListener('click', handleWindowClick);
});

const savingThrowProficiencies = computed(() => {
  return savingThrowProficienciesFromClasses(draft.value.classes);
});

const isSavingThrowProficient = (abilityKey: AbilityKey) => {
  return savingThrowProficiencies.value.includes(abilityKey);
};

</script>
