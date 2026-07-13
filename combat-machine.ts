import { setup } from 'xstate';
import { combatMachineDefinition, initialContext } from './combat-machine.definition';
import { combatMachineActions, combatMachineGuards } from './combat-machine.impl';

export { initialContext };

export const combatMachine = setup({
  guards: combatMachineGuards as any,
  actions: combatMachineActions as any
}).createMachine(combatMachineDefinition as any);
