export const initialDraftForm = {
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

export const combatMachineDefinition = {
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
};
