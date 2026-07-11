<template>
  <ion-app>
    <ion-content class="ion-padding app-content" fullscreen>
      <main class="tracker-shell">
        <header class="tracker-title">
          <div>
            <h1>Combat Tracker Prototype</h1>
            <p>Interactive turn entry, active-turn focus, and a lower input panel.</p>
          </div>
          <div class="header-actions">
            <ion-button fill="outline" size="small" @click="send({ type: 'START_ENCOUNTER' })">Start encounter</ion-button>
            <ion-button fill="outline" size="small" @click="send({ type: 'END_ENCOUNTER' })">End encounter</ion-button>
          </div>
        </header>

        <section class="status-bar">
          <div><strong>State:</strong> {{ snapshot.context.encounterPhase }}</div>
          <div><strong>Active turn:</strong> {{ activeTurnLabel }}</div>
        </section>

        <section class="tracker">
          <div class="columns-header">
            <div class="row-label"></div>
            <div class="row-combatants">
              <div v-for="combatant in combatants" :key="combatant.id" class="combatant-column" style="min-width:180px;">
                <div class="column-header">
                  <div class="portrait">{{ combatant.portrait }}</div>
                  <div>
                    <strong>{{ combatant.name }}</strong>
                    <span>Init {{ combatant.initiative }}</span>
                  </div>
                </div>
                <div class="current-state">HP {{ combatant.hp }}<br>{{ combatant.status }}</div>
              </div>
            </div>
            <div class="row-note"></div>
          </div>

          <div class="rows-container">
            <div v-for="roundNumber in displayedRoundNumbers" :key="roundNumber" class="round-row">
              <div class="row-label">{{ roundNumber }}</div>
              <div class="row-combatants">
                <div
                  v-for="(combatant, turnOrderIndex) in combatants"
                  :key="`${roundNumber}-${combatant.id}`"
                  class="combatant-slot"
                  style="min-width:180px; display:flex; flex-direction:column;"
                >
                  <button
                    class="round-cell"
                    :class="{
                      active: isActive(roundNumber, turnOrderIndex),
                      selected: isSelected(roundNumber, turnOrderIndex),
                      filled: !!getTurnValue(roundNumber, turnOrderIndex)
                    }"
                    :disabled="roundNumber !== snapshot.context.round"
                    @click="selectTurn(roundNumber, turnOrderIndex)"
                  >
                    <span class="cell-value">{{ getDisplayValue(roundNumber, turnOrderIndex) }}</span>
                  </button>
                </div>
              </div>
              <div class="row-note">{{ getRoundNote(roundNumber) }}</div>
            </div>
          </div>
        </section>

        <section class="input-panel" :class="{ open: snapshot.context.recordingPanel.open }" aria-live="polite">
          <div class="panel-header">
            <div>
              <h2>{{ panelTitle }}</h2>
            </div>
            <div class="panel-actions">
              <ion-button fill="outline" size="small" @click="send({ type: 'UNLOCK_EDIT' })" style="display:none;">Unlock edit</ion-button>
            </div>
          </div>

          <div class="panel-body">
            <div class="action-section">
              <div class="action-menu">
                <button
                  v-for="action in actions"
                  :key="action.value"
                  class="action-btn"
                  :class="{ selected: snapshot.context.draft.selectedAction === action.value }"
                  @click="send({ type: 'SET_ACTION', action: action.value })"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>

            <div class="composer-column">
              <div class="composer-section">
                <div class="subpanel">
                <template v-if="snapshot.context.draft.selectedAction === 'attack'">
                  <label>
                    Target
                    <select :value="snapshot.context.draft.form.attackTarget" @input="updateField('attackTarget', $event)">
                      <option v-for="combatant in combatants" :key="combatant.id" :value="combatant.name">{{ combatant.name }}</option>
                    </select>
                  </label>
                  <label>
                    Modifier
                    <input :value="snapshot.context.draft.form.attackMod" @input="updateField('attackMod', $event)" />
                  </label>
                  <label>
                    Damage
                    <input :value="snapshot.context.draft.form.attackDamage" @input="updateField('attackDamage', $event)" />
                  </label>
                </template>

                <template v-else-if="snapshot.context.draft.selectedAction === 'cast'">
                  <label>
                    Spell
                    <input :value="snapshot.context.draft.form.castSpell" @input="updateField('castSpell', $event)" />
                  </label>
                  <label>
                    Target
                    <input :value="snapshot.context.draft.form.castTarget" @input="updateField('castTarget', $event)" />
                  </label>
                </template>

                <template v-else-if="snapshot.context.draft.selectedAction === 'condition'">
                  <label>
                    Condition
                    <input :value="snapshot.context.draft.form.conditionName" @input="updateField('conditionName', $event)" />
                  </label>
                  <label>
                    Mode
                    <select :value="snapshot.context.draft.form.conditionMode" @input="updateField('conditionMode', $event)">
                      <option value="add">Add</option>
                      <option value="remove">Remove</option>
                    </select>
                  </label>
                </template>

                <template v-else-if="snapshot.context.draft.selectedAction === 'damage'">
                  <label>
                    Damage
                    <input :value="snapshot.context.draft.form.damageAmount" @input="updateField('damageAmount', $event)" />
                  </label>
                </template>

                <template v-else-if="snapshot.context.draft.selectedAction === 'heal'">
                  <label>
                    Healing
                    <input :value="snapshot.context.draft.form.healAmount" @input="updateField('healAmount', $event)" />
                  </label>
                </template>

                <template v-else-if="snapshot.context.draft.selectedAction === 'switch'">
                  <label>
                    Weapon
                    <input :value="snapshot.context.draft.form.switchWeapon" @input="updateField('switchWeapon', $event)" />
                  </label>
                </template>

                <template v-else-if="snapshot.context.draft.selectedAction === 'note'">
                  <label>
                    Note
                    <textarea :value="snapshot.context.draft.form.noteText" @input="updateField('noteText', $event)"></textarea>
                  </label>
                </template>

                </div>

                <div v-if="snapshot.context.draft.selectedAction === 'raw'" class="raw-composer">
                  <textarea
                    class="raw-textarea"
                    placeholder="Add raw shorthand here (multi-line allowed)"
                    :value="snapshot.context.draft.rawShorthand"
                    @input="updateField('rawShorthand', $event)"
                  ></textarea>
                </div>
              </div>

              <div class="composer-actions-panel">
                <div class="panel-footer">
                  <ion-button class="composer-action-btn" fill="outline" size="small" @click="send({ type: 'CLEAR' })">Clear</ion-button>
                  <ion-button class="composer-action-btn" fill="outline" size="small" @click="send({ type: 'CANCEL' })">Cancel</ion-button>
                  <ion-button class="composer-action-btn" :disabled="!snapshot.context.draft.preview" size="small" @click="send({ type: 'CONFIRM' })">Confirm</ion-button>
                  <ion-button class="composer-action-btn composer-action-btn--next" size="small" @click="send({ type: 'NEXT_TURN' })">Next Turn</ion-button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ion-content>
  </ion-app>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { createActor } from 'xstate';
import { IonApp, IonButton, IonContent } from '@ionic/vue';
import { combatMachine } from '../combat-machine.mjs';

const combatants = [
  { id: 'pc_a', name: 'PC_A', portrait: 'PC', initiative: '18', hp: '38/42', status: 'Bless, Shield' },
  { id: 'goblin1', name: 'Goblin 1', portrait: 'G1', initiative: '14', hp: '7/11', status: 'Prone' },
  { id: 'goblin2', name: 'Goblin 2', portrait: 'G2', initiative: '12', hp: '11/11', status: 'Hidden' },
  { id: 'ogre', name: 'Ogre', portrait: 'O', initiative: '10', hp: '49/59', status: 'Angry' }
];

const baseRounds = [
  { notes: 'Focus PC_A first.' },
  { notes: 'Goblin 1 falls.' },
  { notes: 'Ogre is stunned.' },
  { notes: 'Press advantage.' }
];

const actions = [
  { value: 'attack', label: 'Attack' },
  { value: 'cast', label: 'Cast' },
  { value: 'condition', label: 'Condition' },
  { value: 'damage', label: 'Damage' },
  { value: 'heal', label: 'Heal' },
  { value: 'switch', label: 'Switch' },
  { value: 'note', label: 'Note' },
  { value: 'raw', label: 'Raw' }
];

const actor = createActor(combatMachine);
const snapshot = ref(actor.getSnapshot());
let subscription;

const displayedRoundNumbers = computed(() => {
  const count = Math.max(baseRounds.length, snapshot.value.context.round + 1);
  return Array.from({ length: count }, (_, idx) => idx + 1);
});

const activeTurnLabel = computed(() => {
  const c = combatants[snapshot.value.context.activeTurnOrderIndex];
  if (!c) return '—';
  return `Round ${snapshot.value.context.round} · ${c.name}`;
});

const panelTitle = computed(() => {
  const c = combatants[snapshot.value.context.selectedTurnOrderIndex];
  return `${c.name} · Round ${snapshot.value.context.round}`;
});

function send(event) {
  actor.send(event);
}

function getRoundNote(roundNumber) {
  return baseRounds[roundNumber - 1]?.notes || '';
}

function getTurnValue(roundNumber, turnOrderIndex) {
  const key = `${roundNumber}:${turnOrderIndex}`;
  return snapshot.value.context.turnEntries[key] || '';
}

function isActive(roundNumber, turnOrderIndex) {
  return snapshot.value.context.round === roundNumber
    && snapshot.value.context.activeTurnOrderIndex === turnOrderIndex;
}

function isSelected(roundNumber, turnOrderIndex) {
  return snapshot.value.context.round === roundNumber
    && snapshot.value.context.selectedTurnOrderIndex === turnOrderIndex;
}

function getDisplayValue(roundNumber, turnOrderIndex) {
  const value = getTurnValue(roundNumber, turnOrderIndex);
  const isDrafting = String(snapshot.value.value) === 'drafting';
  if (isDrafting && isSelected(roundNumber, turnOrderIndex) && snapshot.value.context.draft.preview) {
    return snapshot.value.context.draft.preview;
  }
  return value || 'Tap to fill';
}

function selectTurn(roundNumber, turnOrderIndex) {
  if (roundNumber !== snapshot.value.context.round) return;
  send({ type: 'SELECT_TURN', turnIndex: turnOrderIndex });
}

function eventValue(event) {
  return event?.target?.value ?? '';
}

function updateField(field, event) {
  send({ type: 'INPUT_CHANGED', field, value: eventValue(event) });
}

onMounted(() => {
  actor.start();
  subscription = actor.subscribe((next) => {
    snapshot.value = next;
  });
});

onBeforeUnmount(() => {
  if (subscription) subscription.unsubscribe();
  actor.stop();
});
</script>
