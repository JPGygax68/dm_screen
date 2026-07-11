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
  activeTurnOrderIndex: 0,
  selectedTurnOrderIndex: 0,
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
          target: 'drafting',
          actions: [
            'setEncounterPhaseRecording',
            'setRoundOne',
            'clearDraft',
            'setActiveTurnOrderIndexZero',
            'setSelectedTurnOrderIndexZero',
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
          actions: ['setSelectedTurnOrderIndexFromEvent', 'hydrateDraftFromSelectedTurn']
        },
        NEXT_TURN: {
          actions: ['commitDraftIfPresent', 'advanceActiveTurnOrderIndex', 'clearDraft']
        },
        END_ENCOUNTER: {
          target: 'ended',
          actions: ['setEncounterPhaseEnded', 'closeRecordingPanel']
        }
      }
    },

    drafting: {
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
          actions: ['clearDraft']
        },
        CANCEL: {
          target: 'drafting',
          actions: ['discardDraft']
        },
        CONFIRM: {
          target: 'drafting',
          actions: ['commitDraftToSelectedTurn', 'clearDraft']
        },
        NEXT_TURN: {
          target: 'drafting',
          actions: ['commitDraftIfPresent', 'advanceActiveTurnOrderIndex', 'clearDraft']
        },
        UNLOCK_EDIT: {
          actions: ['setUnlockEditingTrue']
        },
        SELECT_TURN: {
          guard: 'hasValidTurnIndex',
          target: 'drafting',
          actions: ['setSelectedTurnOrderIndexFromEvent', 'hydrateDraftFromSelectedTurn']
        }
      }
    },

    ended: {
      on: {
        START_ENCOUNTER: {
          target: 'drafting',
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
