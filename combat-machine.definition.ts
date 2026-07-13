export const initialFormFieldValues = {
  attackTarget: 'goblin1',
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
  turnOrder: ['pc_a', 'goblin1', 'goblin2', 'ogre', 'snake'],
  activeTurnOrderIndex: 0,
  selectedTurnOrderIndex: 0,
  draft: {
    selectedAction: 'attack',
    form: { ...initialFormFieldValues }
  },
  turnEntries: {},
  // Committed shorthand per turn key: "<round>:<turnIndex>" -> shorthand text.
  rounds: [],
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
          target: 'editingTurn',
          actions: [
            'setEncounterPhaseRecording',
            'setRoundOne',
            'clearTurn',
            'setActiveTurnOrderIndexZero',
            'setSelectedTurnOrderIndexZero',
            'openRecordingPanel'
          ]
        }
      }
    },

    editingTurn: {
      on: {
        END_ENCOUNTER: {
          target: 'ended',
          actions: ['setEncounterPhaseEnded', 'closeRecordingPanel']
        },
        SET_ACTION: {
          actions: ['setSelectedActionFromEvent']
        },
        INPUT_CHANGED: {
          actions: ['updateDraftFieldFromEvent']
        },
        CLEAR: {
          actions: ['clearTurn']
        },
        CANCEL: {
          target: 'editingTurn',
          actions: ['discardDraft']
        },
        ADD_SHORTHAND: {
          target: 'editingTurn',
          actions: ['addDraftToSelectedTurn']
        },
        NEXT_TURN: {
          target: 'editingTurn',
          actions: ['advanceActiveTurnOrderIndex', 'clearTurn']
        },
        UNLOCK_EDIT: {
          actions: ['setUnlockEditingTrue']
        },
        SELECT_TURN: {
          guard: 'hasValidTurnIndex',
          target: 'editingTurn',
          actions: ['setSelectedTurnOrderIndexFromEvent', 'hydrateDraftFromSelectedTurn']
        }
      }
    },

    ended: {
      on: {
        START_ENCOUNTER: {
          target: 'editingTurn',
          actions: [
            'resetEncounter',
            'setEncounterPhaseRecording',
            'setRoundOne',
            'setActiveTurnOrderIndexZero',
            'setSelectedTurnOrderIndexZero',
            'openRecordingPanel'
          ]
        }
      }
    }
  }
};
