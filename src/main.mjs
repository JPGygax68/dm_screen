import './styles.css';
import { createActor } from 'xstate';
import { combatMachine } from '../combat-machine.mjs';

const combatants = [
  { id: 'pc_a', name: 'PC_A', portrait: 'PC', initiative: '18', hp: '38/42', status: 'Bless, Shield' },
  { id: 'goblin1', name: 'Goblin 1', portrait: 'G1', initiative: '14', hp: '7/11', status: 'Prone' },
  { id: 'goblin2', name: 'Goblin 2', portrait: 'G2', initiative: '12', hp: '11/11', status: 'Hidden' },
  { id: 'ogre', name: 'Ogre', portrait: 'O', initiative: '10', hp: '49/59', status: 'Angry' }
];

const baseRounds = [
  { notes: 'Focus PC_A first.' },
  { notes: 'Goblin 1 falls.' },
  { notes: 'Ogre is stunned.' },
  { notes: 'Press advantage.' }
];

const actor = createActor(combatMachine);

function getDisplayedRoundCount(currentRound) {
  return Math.max(baseRounds.length, currentRound + 1);
}

function getRoundNote(roundNumber) {
  const idx = roundNumber - 1;
  return baseRounds[idx]?.notes || '';
}

function getTurnValue(context, roundNumber, turnOrderIndex) {
  const key = `${roundNumber}:${turnOrderIndex}`;
  return context.turnEntries[key] || '';
}

function renderStatus(snapshot) {
  const context = snapshot.context;
  const encounterState = document.getElementById('encounterState');
  const activeTurnLabel = document.getElementById('activeTurnLabel');

  encounterState.textContent = context.encounterPhase;

  const activeCombatant = combatants[context.activeTurnOrderIndex];
  if (activeCombatant) {
    activeTurnLabel.textContent = `Round ${context.round} · ${activeCombatant.name}`;
  } else {
    activeTurnLabel.textContent = '—';
  }
}

function renderColumnsHeader() {
  const header = document.getElementById('columnsHeader');
  header.innerHTML = `
    <div class="row-label"></div>
    <div class="row-combatants">
      ${combatants.map((combatant) => `
        <div class="combatant-column" style="min-width:180px;">
          <div class="column-header">
            <div class="portrait">${combatant.portrait}</div>
            <div>
              <strong>${combatant.name}</strong>
              <span>Init ${combatant.initiative}</span>
            </div>
          </div>
          <div class="current-state">HP ${combatant.hp}<br>${combatant.status}</div>
        </div>
      `).join('')}
    </div>
    <div class="row-note"></div>
  `;
}

function renderRows(snapshot) {
  const context = snapshot.context;
  const rowsContainer = document.getElementById('rowsContainer');
  const displayedRoundCount = getDisplayedRoundCount(context.round);
  const isDrafting = String(snapshot.value) === 'drafting';

  const rows = [];
  for (let roundNumber = 1; roundNumber <= displayedRoundCount; roundNumber += 1) {
    const combatantCells = combatants.map((combatant, turnOrderIndex) => {
      const value = getTurnValue(context, roundNumber, turnOrderIndex);
      const isActiveRound = context.round === roundNumber;
      const isActive = isActiveRound && context.activeTurnOrderIndex === turnOrderIndex;
      const isSelected = isActiveRound && context.selectedTurnOrderIndex === turnOrderIndex;
      const classes = ['round-cell'];
      if (isActive) classes.push('active');
      if (value) classes.push('filled');

      let displayValue = value || 'Tap to fill';
      if (isDrafting && isSelected && context.draft.preview) {
        displayValue = context.draft.preview;
      }

      return `
        <div class="combatant-slot" style="min-width:180px; display:flex; flex-direction:column;">
          <button class="${classes.join(' ')}" data-turn-index="${turnOrderIndex}" data-round-number="${roundNumber}" ${isActiveRound ? '' : 'disabled'}>
            <span class="cell-value">${displayValue}</span>
          </button>
        </div>
      `;
    }).join('');

    rows.push(`
      <div class="round-row">
        <div class="row-label">${roundNumber}</div>
        <div class="row-combatants">${combatantCells}</div>
        <div class="row-note">${getRoundNote(roundNumber)}</div>
      </div>
    `);
  }

  rowsContainer.innerHTML = rows.join('');
}

function renderSubpanel(draft) {
  const form = draft.form;
  switch (draft.selectedAction) {
    case 'attack':
      return `
        <label>
          Target
          <select id="attackTarget">
            ${combatants.map((combatant) => `<option value="${combatant.name}" ${form.attackTarget === combatant.name ? 'selected' : ''}>${combatant.name}</option>`).join('')}
          </select>
        </label>
        <label>
          Modifier
          <input id="attackMod" value="${form.attackMod}" />
        </label>
        <label>
          Damage
          <input id="attackDamage" value="${form.attackDamage}" />
        </label>
      `;
    case 'cast':
      return `
        <label>
          Spell
          <input id="castSpell" value="${form.castSpell}" />
        </label>
        <label>
          Target
          <input id="castTarget" value="${form.castTarget}" />
        </label>
      `;
    case 'condition':
      return `
        <label>
          Condition
          <input id="conditionName" value="${form.conditionName}" />
        </label>
        <label>
          Mode
          <select id="conditionMode">
            <option value="add" ${form.conditionMode === 'add' ? 'selected' : ''}>Add</option>
            <option value="remove" ${form.conditionMode === 'remove' ? 'selected' : ''}>Remove</option>
          </select>
        </label>
      `;
    case 'damage':
      return `
        <label>
          Damage
          <input id="damageAmount" value="${form.damageAmount}" />
        </label>
      `;
    case 'heal':
      return `
        <label>
          Healing
          <input id="healAmount" value="${form.healAmount}" />
        </label>
      `;
    case 'switch':
      return `
        <label>
          Weapon
          <input id="switchWeapon" value="${form.switchWeapon}" />
        </label>
      `;
    case 'note':
      return `
        <label>
          Note
          <textarea id="noteText">${form.noteText}</textarea>
        </label>
      `;
    case 'raw':
      return '<div class="preview-text">Enter raw shorthand in the field below.</div>';
    default:
      return '';
  }
}

function renderInputPanel(snapshot) {
  const context = snapshot.context;
  const panel = document.getElementById('inputPanel');
  const panelTitle = document.getElementById('panelTitle');
  const panelHint = document.getElementById('panelHint');

  const selectedCombatant = combatants[context.selectedTurnOrderIndex];
  panelTitle.textContent = `${selectedCombatant.name} · Round ${context.round}`;
  panelHint.textContent = context.recordingPanel.open
    ? 'Choose a shorthand type and record the turn.'
    : 'Start encounter to begin recording.';

  const actionMenu = document.getElementById('actionMenu');
  actionMenu.innerHTML = [
    ['attack', 'Attack'],
    ['cast', 'Cast'],
    ['condition', 'Condition'],
    ['damage', 'Damage'],
    ['heal', 'Heal'],
    ['switch', 'Switch'],
    ['note', 'Note'],
    ['raw', 'Raw']
  ].map(([value, label]) => `
    <button class="action-btn ${context.draft.selectedAction === value ? 'selected' : ''}" data-action="${value}">
      ${label}
    </button>
  `).join('');

  document.getElementById('subpanelContent').innerHTML = renderSubpanel(context.draft);

  const rawContainer = document.getElementById('rawShorthandContainer');
  const rawInput = document.getElementById('rawShorthand');
  rawContainer.style.display = context.draft.selectedAction === 'raw' ? 'flex' : 'none';
  rawInput.value = context.draft.rawShorthand || '';

  panel.classList.toggle('open', context.recordingPanel.open);

  const confirmBtn = document.getElementById('confirmDraftBtn');
  confirmBtn.disabled = !context.draft.preview;

  document.getElementById('unlockEditBtn').style.display = 'none';
}

function render(snapshot) {
  renderStatus(snapshot);
  renderColumnsHeader();
  renderRows(snapshot);
  renderInputPanel(snapshot);
}

function sendActionEvent(action) {
  actor.send({ type: 'SET_ACTION', action });
}

function sendFieldUpdate(field, value) {
  actor.send({ type: 'INPUT_CHANGED', field, value });
}

function wireEvents() {
  document.getElementById('startEncounterBtn').addEventListener('click', () => {
    actor.send({ type: 'START_ENCOUNTER' });
  });

  document.getElementById('endEncounterBtn').addEventListener('click', () => {
    actor.send({ type: 'END_ENCOUNTER' });
  });

  document.getElementById('clearDraftBtn').addEventListener('click', () => {
    actor.send({ type: 'CLEAR' });
  });

  document.getElementById('cancelDraftBtn').addEventListener('click', () => {
    actor.send({ type: 'CANCEL' });
  });

  document.getElementById('confirmDraftBtn').addEventListener('click', () => {
    actor.send({ type: 'CONFIRM' });
  });

  document.getElementById('nextTurnBtn').addEventListener('click', () => {
    actor.send({ type: 'NEXT_TURN' });
  });

  document.getElementById('unlockEditBtn').addEventListener('click', () => {
    actor.send({ type: 'UNLOCK_EDIT' });
  });

  document.getElementById('rowsContainer').addEventListener('click', (event) => {
    const button = event.target.closest('.round-cell');
    if (!button) return;
    const roundNumber = Number(button.dataset.roundNumber);
    const snapshot = actor.getSnapshot();
    if (roundNumber !== snapshot.context.round) return;
    const turnIndex = Number(button.dataset.turnIndex);
    actor.send({ type: 'SELECT_TURN', turnIndex });
  });

  document.getElementById('actionMenu').addEventListener('click', (event) => {
    const button = event.target.closest('.action-btn');
    if (!button) return;
    sendActionEvent(button.dataset.action);
  });

  document.getElementById('inputPanel').addEventListener('input', (event) => {
    const field = event.target.id;
    if (!field) return;
    sendFieldUpdate(field, event.target.value);
  });

  document.getElementById('inputPanel').addEventListener('change', (event) => {
    const field = event.target.id;
    if (!field) return;
    sendFieldUpdate(field, event.target.value);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  wireEvents();
  actor.subscribe((snapshot) => {
    render(snapshot);
  });

  actor.start();
  render(actor.getSnapshot());
});
