import { setup } from 'xstate';
import { combatMachineDefinition, initialContext } from './combat-machine.definition.mjs';
import { combatMachineActions, combatMachineGuards } from './combat-machine.impl.mjs';

export { initialContext };

export const combatMachine = setup({
  guards: combatMachineGuards,
  actions: combatMachineActions
}).createMachine(combatMachineDefinition);
