/* export const initialFormFieldValues = {
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
}; */

/**
@typedef {Object} AttackNote
  @property {CombatNodeKind:'attack'} kind
  @property {string} target
  @property {number?} mod     // may not be useful after all
  @property {number} damage

@typedef {Object} CastNote
  @property {CombatNodeKind:'cast'} kind
  @property {string} spellName
  @property {string} target

@typedef {Object} ConditionNote 
  @property {CombatNodeKind:'condition'} kind
  @property {string} conditionName
  @property {'add' | 'remove'} mode

@typedef {Object} DamageNote
  @property {CombatNodeKind:'damage'} kind
  @property {number} amount

@typedef {Object} HealNote
  @property {CombatNodeKind:'heal'} kind
  @property {number} amount

@typedef {Object} SwitchNote
  @property {CombatNodeKind:'switch'} kind
  @property {string} weapon

@typedef {Object} MiscNote
  @property {CombatNodeKind:'misc'} kind
  @property {string} text

@typedef {AttackNote | DefendNote | ConditionNote | CastNote | DamageNote | HealNote | SwitchNote | MiscNote} Note

@typedef {Object} CombatRound
  @property {CombatTurn[]} turns

@typedef {Object} CombatTurn
  @property {string} combatantId
  @property {Note[]} notes

@typedef {'attack' | 'cast' | 'condition' | 'damage' | 'heal' | 'switch' | 'misc'} CombatNodeKind 

@typedef {'creating' | 'recording' | 'ended'} EncounterPhase

@typedef {Object} CombatMachineContext
  @property {EncounterPhase} encounterPhase
  @property {[key: string]: Combatant} combatantsById
  @property {string[]} turnOrder // ordered list of combatant IDs
  @property {CombatRound[]} rounds
  @property {number} selectedRoundNumber
  @property {number} activeRoundNumber
  @property {number} selectedTurnIndex
  @property {number} activeTurnIndex
*/

export const initialContext /** @type {CombatMachineContext} */ = {
  // This field ist the "product" of the combat UI. It is built up as the encounter progresses.
  rounds: [],           /// @type {CombatRound[]}
  // All following fields must be initialized when combatants are loaded
  combatantsById: null, // must be created when combatants are loaded
  encounterPhase: null, // will start at 'creating', but only when combatants are loaded
  turnOrder: null,      // must be created when combatants are loaded
  selectedRoundNumber: 0,
  activeRoundNumber: 0,
  selectedTurnIndex: 0,
  activeTurnIndex: 0
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
        // END_ENCOUNTER: {
        //   target: 'ended',
        //   actions: ['setEncounterPhaseEnded', 'closeRecordingPanel']
        // },
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
