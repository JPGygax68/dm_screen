import { setup, assign } from 'xstate';

const initialDraftForm = {
  attackTarget: 'PC_A',
  attackMod: '+4',
  attackDamage: '7',
  castSpell: 'Shield',
  castTarget: 'PC_A',
  conditionName: 'Blessed',
  conditionMode: 'add',
  damageAmount: '6',
  healAmount: '8',
  switchWeapon: 'longbow',
  noteText: ''
};

export const initialContext = {
  encounterPhase: 'creating',
  round: 1,
  turnOrder: ['pc_a', 'goblin1', 'goblin2', 'ogre'],
  activeTurnIndex: 0,
  selectedTurnIndex: 0,
  draft: {
    selectedAction: 'attack',
    preview: '',
    rawShorthand: '',
    form: { ...initialDraftForm }
  },
  // Committed shorthand per turn key: "<round>:<turnIndex>" -> shorthand text.
  turnEntries: {},
  recordingPanel: {
    open: false,
    editingLocked: false,
    unlockEditing: false
  }
};

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
    form: { ...initialDraftForm }
  };
}

export const combatMachine = setup({
  guards: {
    hasValidTurnIndex: ({ context, event }) => {
      if (typeof event.turnIndex !== 'number') return false;
      return event.turnIndex >= 0 && event.turnIndex < context.turnOrder.length;
    },
    hasDraftPreview: ({ context }) => Boolean(context.draft.preview)
  },
  actions: {
    setEncounterPhaseRecording: assign({ encounterPhase: 'recording' }),
    setEncounterPhaseEnded: assign({ encounterPhase: 'ended' }),
    setRoundOne: assign({ round: 1 }),
    setActiveTurnIndexZero: assign({ activeTurnIndex: 0 }),
    setSelectedTurnIndexZero: assign({ selectedTurnIndex: 0 }),

    setSelectedTurnIndexFromEvent: assign({
      selectedTurnIndex: ({ event }) => event.turnIndex
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

    clearDraft: assign({
      draft: () => emptyDraft()
    }),

    discardDraft: assign({
      draft: () => emptyDraft()
    }),

    hydrateDraftFromSelectedTurn: assign({
      draft: ({ context }) => {
        const key = buildTurnKey(context.round, context.selectedTurnIndex);
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

    commitDraftToSelectedTurn: assign(({ context }) => {
      if (!context.draft.preview) return {};
      const key = buildTurnKey(context.round, context.selectedTurnIndex);
      return {
        turnEntries: {
          ...context.turnEntries,
          [key]: context.draft.preview
        }
      };
    }),

    commitDraftIfPresent: assign(({ context }) => {
      if (!context.draft.preview) return {};
      const key = buildTurnKey(context.round, context.selectedTurnIndex);
      return {
        turnEntries: {
          ...context.turnEntries,
          [key]: context.draft.preview
        }
      };
    }),

    advanceActiveTurnIndex: assign(({ context }) => {
      const nextIndex = (context.activeTurnIndex + 1) % context.turnOrder.length;
      const wrapped = nextIndex === 0;
      return {
        activeTurnIndex: nextIndex,
        selectedTurnIndex: nextIndex,
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
      activeTurnIndex: 0,
      selectedTurnIndex: 0,
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
    })
  }
}).createMachine({
  id: 'combat-tracker',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {
      on: {
        START_ENCOUNTER: {
          target: 'recording',
          actions: [
            'setEncounterPhaseRecording',
            'setRoundOne',
            'clearDraft',
            'setActiveTurnIndexZero',
            'setSelectedTurnIndexZero',
            'openRecordingPanel'
          ]
        }
      }
    },

    recording: {
      on: {
        SELECT_TURN: {
          guard: 'hasValidTurnIndex',
          target: 'drafting',
          actions: ['setSelectedTurnIndexFromEvent', 'hydrateDraftFromSelectedTurn']
        },
        NEXT_TURN: {
          actions: ['commitDraftIfPresent', 'advanceActiveTurnIndex', 'clearDraft']
        },
        END_ENCOUNTER: {
          target: 'ended',
          actions: ['setEncounterPhaseEnded', 'closeRecordingPanel']
        }
      }
    },

    drafting: {
      on: {
        SET_ACTION: {
          actions: ['setSelectedActionFromEvent']
        },
        INPUT_CHANGED: {
          actions: ['updateDraftFieldFromEvent']
        },
        CLEAR: {
          actions: ['clearDraft']
        },
        CANCEL: {
          target: 'recording',
          actions: ['discardDraft']
        },
        CONFIRM: {
          target: 'recording',
          actions: ['commitDraftToSelectedTurn', 'clearDraft']
        },
        NEXT_TURN: {
          target: 'recording',
          actions: ['commitDraftIfPresent', 'advanceActiveTurnIndex', 'clearDraft']
        },
        UNLOCK_EDIT: {
          actions: ['setUnlockEditingTrue']
        },
        SELECT_TURN: {
          guard: 'hasValidTurnIndex',
          target: 'drafting',
          actions: ['setSelectedTurnIndexFromEvent', 'hydrateDraftFromSelectedTurn']
        }
      }
    },

    ended: {
      on: {
        START_ENCOUNTER: {
          target: 'recording',
          actions: [
            'resetEncounter',
            'setEncounterPhaseRecording',
            'setRoundOne',
            'setActiveTurnIndexZero',
            'setSelectedTurnIndexZero',
            'openRecordingPanel'
          ]
        }
      }
    }
  }
});
