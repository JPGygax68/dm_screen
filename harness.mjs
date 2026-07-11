import { createActor } from 'xstate';
import { combatMachine } from './combat-machine.mjs';

function snapshotSummary(snapshot) {
  return {
    state: String(snapshot.value),
    phase: snapshot.context.encounterPhase,
    round: snapshot.context.round,
    activeTurnOrderIndex: snapshot.context.activeTurnOrderIndex,
    selectedTurnOrderIndex: snapshot.context.selectedTurnOrderIndex,
    panelOpen: snapshot.context.recordingPanel.open,
    draftPreview: snapshot.context.draft.preview
  };
}

function assertCondition(condition, message, snapshot) {
  if (!condition) {
    const details = snapshot ? `\nSnapshot: ${JSON.stringify(snapshotSummary(snapshot), null, 2)}` : '';
    throw new Error(`${message}${details}`);
  }
}

function runHarness() {
  const actor = createActor(combatMachine);
  actor.start();

  const check = (label, predicate) => {
    const snap = actor.getSnapshot();
    assertCondition(predicate(snap), `Check failed: ${label}`, snap);
    console.log(`PASS: ${label}`);
    console.log(JSON.stringify(snapshotSummary(snap), null, 2));
  };

  const send = (event, label) => {
    console.log(`\nEVENT: ${event.type}${label ? ` (${label})` : ''}`);
    actor.send(event);
  };

  check('initial state is idle and panel closed', (s) => String(s.value) === 'idle' && !s.context.recordingPanel.open);

  send({ type: 'START_ENCOUNTER' }, 'begin recording');
  check('recording started and panel is open', (s) => (
    String(s.value) === 'recording'
    && s.context.encounterPhase === 'recording'
    && s.context.round === 1
    && s.context.recordingPanel.open
  ));

  send({ type: 'SELECT_TURN', turnIndex: 2 }, 'prefill future turn (allowed, e.g. ready/action planning)');
  check('select turn enters drafting without toggling panel', (s) => (
    String(s.value) === 'drafting'
    && s.context.selectedTurnOrderIndex === 2
    && s.context.recordingPanel.open
  ));

  send({ type: 'SET_ACTION', action: 'raw' }, 'use raw shorthand mode');
  send({ type: 'INPUT_CHANGED', field: 'rawShorthand', value: 'ready:atk:PC_A++4/dmg=7' }, 'type shorthand prefill');
  check('draft preview reflects raw shorthand', (s) => s.context.draft.preview === 'ready:atk:PC_A++4/dmg=7');

  send({ type: 'CANCEL' }, 'cancel draft');
  check('cancel returns to recording and panel remains open', (s) => (
    String(s.value) === 'recording' && s.context.recordingPanel.open
  ));

  send({ type: 'SELECT_TURN', turnIndex: 0 }, 'select active turn (PC_A)');
  send({ type: 'SET_ACTION', action: 'raw' }, 'raw mode for current actor');
  send({ type: 'INPUT_CHANGED', field: 'rawShorthand', value: 'atk:Goblin 1++4/dmg=7' }, 'enter attack shorthand');
  send({ type: 'CONFIRM' }, 'commit turn');
  check('confirm commits and keeps panel open', (s) => {
    const key = `${s.context.round}:0`;
    return (
      String(s.value) === 'recording'
      && s.context.turnEntries[key] === 'atk:Goblin 1++4/dmg=7'
      && s.context.recordingPanel.open
    );
  });

  send({ type: 'NEXT_TURN' }, 'advance active turn');
  check('next turn advances selected and active indexes', (s) => (
    String(s.value) === 'recording'
    && s.context.activeTurnOrderIndex === 1
    && s.context.selectedTurnOrderIndex === 1
  ));

  send({ type: 'END_ENCOUNTER' }, 'finish encounter');
  check('ended state closes recording panel', (s) => (
    String(s.value) === 'ended'
    && s.context.encounterPhase === 'ended'
    && !s.context.recordingPanel.open
  ));

  console.log('\nHarness completed successfully.');
}

try {
  runHarness();
} catch (error) {
  console.error('\nHarness failed.');
  console.error(error?.stack || error);
  process.exitCode = 1;
}
