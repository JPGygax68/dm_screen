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
            <ion-button fill="outline" size="small" @click="send({ type: 'START_ENCOUNTER' })">Start
              encounter</ion-button>
            <ion-button fill="outline" size="small" @click="send({ type: 'END_ENCOUNTER' })">End encounter</ion-button>
          </div>
        </header>

        <section class="status-bar">
          <div><strong>State:</strong> {{ snapshot.context.encounterPhase }}</div>
          <div><strong>Active turn:</strong> {{ activeTurnLabel }}</div>
        </section>

        <section ref="trackerRef" class="tracker">
          <div class="columns-header">
            <div class="row-label"></div>
            <div class="row-combatants">
              <div v-for="(combatant, turnOrderIndex) in combatants" :key="combatant.id" class="combatant-column"
                style="min-width:180px;">
                <div class="column-header" :data-turn-order-index="turnOrderIndex"
                  @click="send({ type: 'SELECT_TURN', turnIndex: turnOrderIndex })">
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
              <div class="row-label" :class="{
                active: isRoundActive(roundNumber)
              }">{{ roundNumber }}</div>
              <div class="row-combatants">
                <div v-for="(combatant, turnOrderIndex) in combatants" :key="`${roundNumber}-${combatant.id}`"
                  class="combatant-slot">
                  <div class="round-cell" :data-round="roundNumber" :data-turn-order-index="turnOrderIndex" :class="{
                    active: isTurnActive(roundNumber, turnOrderIndex),
                    selected: isSelected(roundNumber, turnOrderIndex),
                    filled: !!getTurnValue(roundNumber, turnOrderIndex)
                  }" :disabled="roundNumber !== snapshot.context.round"
                    @click="selectTurn(roundNumber, turnOrderIndex)">
                    <div v-for="(line, index) in getTurnValue(roundNumber, turnOrderIndex)" :key="index"
                      class="shorthand-line">
                      {{ line }}
                    </div>
                    <!-- <span class="cell-value">{{ getDisplayValue(roundNumber, turnOrderIndex) }}</span> -->
                  </div>
                </div>
              </div>
              <div class="row-note">{{ getRoundNote(roundNumber) }}</div>
            </div>
          </div>
      
        </section>

        <TurnInputPanel :snapshot="snapshot" :combatants="combatants"/>
      </main>
    </ion-content>
  </ion-app>
</template>

<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { createActor } from 'xstate';
import { IonApp, IonButton, IonContent } from '@ionic/vue';
import { combatMachine } from '../combat-machine.mjs';
import TurnInputPanel from './components/TurnInputPanel.vue';

// TODO: must be loaded a data source, not hardcoded
const combatants = [
  { id: 'pc_a', name: 'PC_A', portrait: 'PC', initiative: '18', hp: '38/42', status: 'Blessed, Shielded' },
  { id: 'goblin1', name: 'Goblin 1', portrait: 'G1', initiative: '14', hp: '7/11', status: 'Prone' },
  { id: 'goblin2', name: 'Goblin 2', portrait: 'G2', initiative: '12', hp: '11/11', status: 'Hidden' },
  { id: 'ogre', name: 'Ogre', portrait: 'O', initiative: '10', hp: '49/59', status: 'Angry' },
  { id: 'snake', name: 'Snake', portrait: 'S', initiative: '8', hp: '5/5', status: 'Poisoned' }
];

const baseRounds = [
  // { notes: 'Focus PC_A first.' },
  // { notes: 'Goblin 1 falls.' },
  // { notes: 'Ogre is stunned.' },
  // { notes: 'Press advantage.' }
];

const actor = createActor(combatMachine);
const snapshot = ref(actor.getSnapshot());
const trackerRef = ref(null);
let subscription;

const displayedRoundNumbers = computed(() => {
  const count = Math.max(baseRounds.length, snapshot.value.context.round);
  return Array.from({ length: count }, (_, idx) => idx + 1);
});

const activeTurnLabel = computed(() => {
  const c = combatants[snapshot.value.context.activeTurnOrderIndex];
  if (!c) return '—';
  return `Round ${snapshot.value.context.round} · ${c.name}`;
});

function send(event) {
  actor.send(event);
}

function isRoundActive(roundNumber) {
  return snapshot.value.context.round === roundNumber;
}

function getRoundNote(roundNumber) {
  return baseRounds[roundNumber - 1]?.notes || '';
}

function getTurnValue(roundNumber, turnOrderIndex) {
  const key = `${roundNumber}:${turnOrderIndex}`;
  return snapshot.value.context.turnEntries[key] || '';
}

function isTurnActive(roundNumber, turnOrderIndex) {
  return snapshot.value.context.round === roundNumber
    && snapshot.value.context.activeTurnOrderIndex === turnOrderIndex;
}

function isSelected(roundNumber, turnOrderIndex) {
  return snapshot.value.context.round === roundNumber
    && snapshot.value.context.selectedTurnOrderIndex === turnOrderIndex;
}

function getDisplayValue(roundNumber, turnOrderIndex) {
  const value = getTurnValue(roundNumber, turnOrderIndex);
  const iseditingTurn = String(snapshot.value.value) === 'editingTurn';
  if (iseditingTurn && isSelected(roundNumber, turnOrderIndex) && snapshot.value.context.draft.preview) {
    return snapshot.value.context.draft.preview;
  }
  return value || '...';
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

function scrollSelectedTurnIntoView() {
  const tracker = trackerRef.value;
  if (!tracker) return;

  const { round, selectedTurnOrderIndex } = snapshot.value.context;
  const selector = `.round-cell[data-round="${round}"][data-turn-order-index="${selectedTurnOrderIndex}"]`;
  const selectedCell = tracker.querySelector(selector);
  if (!selectedCell) return;

  selectedCell.scrollIntoView({ block: 'nearest', inline: 'center' });
}

watch(
  () => [snapshot.value.context.round, snapshot.value.context.selectedTurnOrderIndex],
  async () => {
    await nextTick();
    scrollSelectedTurnIntoView();
  }
);

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
