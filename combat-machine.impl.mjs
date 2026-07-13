import { assign } from 'xstate';
import { initialContext } from './combat-machine.definition.mjs';

function assertInvariant(condition, message) {
  if (!condition) {
    throw new Error(`[combatMachine invariant] ${message}`);
  }
}

function buildTurnKey(round, turnIndex) {
  return `${round}:${turnIndex}`;
}

function buildPreview(draft) {
  const { form } = draft;
  if (draft.selectedAction === 'raw') return draft.rawShorthand || '';
  switch (draft.selectedAction) {
    case 'attack':
      return `atk:${form.attackTarget}+${form.attackMod}/dmg=${form.attackDamage}`;
    case 'cast':
      return `cast:${form.castSpell}/${form.castTarget}`;
    case 'condition':
      return `${form.conditionMode === 'add' ? 'cond' : 'cond-'}:${form.conditionName}`;
    case 'damage':
      return `dmg:${form.damageAmount}`;
    case 'heal':
      return `heal:${form.healAmount}`;
    case 'switch':
      return `switch:${form.switchWeapon}`;
    case 'note':
      return form.noteText ? `note:${form.noteText}` : 'note:';
    default:
      return '';
  }
}

function emptyDraft() {
  return {
    selectedAction: 'attack',
    preview: '',
    rawShorthand: '',
    form: { ...initialContext.draft.form }
  };
}

export const combatMachineGuards = {
  hasValidTurnIndex: ({ context, event }) => {
    if (typeof event.turnIndex !== 'number') return false;
    return event.turnIndex >= 0 && event.turnIndex < context.turnOrder.length;
  },
  hasDraftPreview: ({ context }) => Boolean(context.draft.preview)
};

export const combatMachineActions = {
  setEncounterPhaseRecording: assign({ encounterPhase: 'recording' }),
  setEncounterPhaseEnded: assign({ encounterPhase: 'ended' }),
  setRoundOne: assign({ round: 1 }),
  setActiveTurnOrderIndexZero: assign({ activeTurnOrderIndex: 0 }),
  setSelectedTurnOrderIndexZero: assign({ selectedTurnOrderIndex: 0 }),

  setSelectedTurnOrderIndexFromEvent: assign({
    selectedTurnOrderIndex: ({ event }) => event.turnIndex
  }),

  setSelectedActionFromEvent: assign({
    draft: ({ context, event }) => {
      const next = { ...context.draft, selectedAction: event.action };
      return { ...next, preview: buildPreview(next) };
    }
  }),

  updateDraftFieldFromEvent: assign({
    draft: ({ context, event }) => {
      const draft = context.draft;
      if (event.field === 'rawShorthand') {
        const next = { ...draft, rawShorthand: event.value };
        return { ...next, preview: buildPreview(next) };
      }

      const next = {
        ...draft,
        form: {
          ...draft.form,
          [event.field]: event.value
        }
      };
      return { ...next, preview: buildPreview(next) };
    }
  }),

  clearTurn: assign(({ context, event }) => {
    console.log(`Clearing turn for round ${context.round}, turn index ${context.selectedTurnOrderIndex}`);
    const key = buildTurnKey(context.round, context.selectedTurnOrderIndex);
    const { [key]: _, ...rest } = context.turnEntries;
    return { turnEntries: rest };
  }),

  discardDraft: assign({
    draft: () => emptyDraft()
  }),

  hydrateDraftFromSelectedTurn: assign({
    draft: ({ context }) => {
      const key = buildTurnKey(context.round, context.selectedTurnOrderIndex);
      const value = context.turnEntries[key] || '';
      if (!value) return emptyDraft();
      return {
        ...emptyDraft(),
        selectedAction: 'raw',
        rawShorthand: value,
        preview: value
      };
    }
  }),

  addDraftToSelectedTurn: assign(({ context }) => {
    if (!context.draft.preview) return {};
    const key = buildTurnKey(context.round, context.selectedTurnOrderIndex);
    return {
      turnEntries: {
        ...context.turnEntries,
        [key]: [...(context.turnEntries[key] || []), context.draft.preview]
      }
    };
  }),

  advanceActiveTurnOrderIndex: assign(({ context }) => {
    const nextIndex = (context.activeTurnOrderIndex + 1) % context.turnOrder.length;
    const wrapped = nextIndex === 0;
    return {
      activeTurnOrderIndex: nextIndex,
      selectedTurnOrderIndex: nextIndex,
      round: wrapped ? context.round + 1 : context.round
    };
  }),

  setUnlockEditingTrue: assign({
    recordingPanel: ({ context }) => ({
      ...context.recordingPanel,
      unlockEditing: true
    })
  }),

  resetEncounter: assign(() => ({
    encounterPhase: 'creating',
    round: 1,
    activeTurnOrderIndex: 0,
    selectedTurnOrderIndex: 0,
    draft: emptyDraft(),
    turnEntries: {},
    recordingPanel: {
      open: false,
      editingLocked: false,
      unlockEditing: false
    }
  })),

  openRecordingPanel: assign({
    recordingPanel: ({ context }) => {
      // Debug contract: this action must not be called when already open.
      assertInvariant(!context.recordingPanel.open, 'openRecordingPanel called while already open');
      return {
        ...context.recordingPanel,
        open: true
      };
    }
  }),

  closeRecordingPanel: assign({
    recordingPanel: ({ context }) => {
      // Debug contract: this action must not be called when already closed.
      assertInvariant(context.recordingPanel.open, 'closeRecordingPanel called while already closed');
      return {
        ...context.recordingPanel,
        open: false
      };
    }
  }),

  // NEW STUFF, appending here for simplicity
  initializeNewRound: assign(({ context }) => {
    console.log(`Initializing new round. Current round: ${context.round}`);
    const nextRound = context.round + 1;
    return {
      round: nextRound,
      activeTurnOrderIndex: 0,
      selectedTurnOrderIndex: 0,
      draft: emptyDraft()
    }
  })

};


