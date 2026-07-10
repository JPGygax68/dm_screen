const combatants = [
  { id: 'pc_a', name: 'PC_A', portrait: 'PC', initiative: '18', hp: '38/42', status: 'Bless, Shield' },
  { id: 'goblin1', name: 'Goblin 1', portrait: 'G1', initiative: '14', hp: '7/11', status: 'Prone' },
  { id: 'goblin2', name: 'Goblin 2', portrait: 'G2', initiative: '12', hp: '11/11', status: 'Hidden' },
  { id: 'ogre', name: 'Ogre', portrait: 'O', initiative: '10', hp: '49/59', status: 'Angry' }
];

const rounds = [
  { label: '1', notes: 'Focus PC_A first.' },
  { label: '2', notes: 'Goblin 1 falls.' },
  { label: '3', notes: 'Ogre is stunned.' },
  { label: '4', notes: 'Press advantage.' }
];

const slotData = [];
for (let roundIndex = 0; roundIndex < rounds.length; roundIndex += 1) {
  for (let combatantIndex = 0; combatantIndex < combatants.length; combatantIndex += 1) {
    slotData.push({
      roundIndex,
      combatantIndex,
      value: '',
      locked: false,
      key: `${roundIndex}-${combatantIndex}`
    });
  }
}

const state = {
  encounterState: 'creating',
  activeSlotIndex: 0,
  currentSlotIndex: 0,
  panelOpen: false,
  selectedAction: 'attack',
  formState: {
    attackTarget: combatants[0].name,
    attackMod: '+4',
    attackDamage: '7',
    castSpell: 'Shield',
    castTarget: combatants[0].name,
    conditionName: 'Blessed',
    conditionMode: 'add',
    damageAmount: '6',
    healAmount: '8',
    switchWeapon: 'longbow',
    noteText: ''
  },
  draftPreview: '',
  unlockEditing: false,
  editingLockedCell: false,
  panelPending: false
};

function getSlot(slotIndex) {
  return slotData[slotIndex];
}

function getCurrentSlot() {
  return getSlot(state.currentSlotIndex);
}

function getSlotIndex(roundIndex, combatantIndex) {
  return roundIndex * combatants.length + combatantIndex;
}

function buildPreview() {
  const form = state.formState;
  switch (state.selectedAction) {
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

function setPreview() {
  state.draftPreview = buildPreview();
  const previewEl = document.getElementById('previewText');
  if (previewEl) {
    previewEl.textContent = state.draftPreview || '—';
  }
}

function render() {
  renderStatus();
  renderRoundLabels();
  renderCombatantColumns();
  renderInputPanel();
}

function renderStatus() {
  document.getElementById('encounterState').textContent = state.encounterState;
  const slot = getSlot(state.activeSlotIndex);
  const combatant = combatants[slot.combatantIndex];
  document.getElementById('activeTurnLabel').textContent = `Round ${rounds[slot.roundIndex].label} · ${combatant.name}`;
}

function renderRoundLabels() {
  const left = document.getElementById('roundLabels');
  const right = document.getElementById('roundNotes');
  left.innerHTML = rounds.map((round) => `<div class="row-label">${round.label}</div>`).join('');
  right.innerHTML = rounds.map((round) => `<div class="row-label">${round.notes}</div>`).join('');
}

function renderCombatantColumns() {
  const container = document.getElementById('combatantColumns');
  container.innerHTML = combatants.map((combatant, combatantIndex) => {
    const cells = rounds.map((round, roundIndex) => {
      const slotIndex = getSlotIndex(roundIndex, combatantIndex);
      const slot = getSlot(slotIndex);
      const isActive = state.activeSlotIndex === slotIndex;
      const isFilled = Boolean(slot.value);
      const classes = ['round-cell'];
      if (isActive) classes.push('active');
      if (isFilled) classes.push('filled');
      return `
        <button class="${classes.join(' ')}" data-slot-index="${slotIndex}">
          <span class="cell-title">${round.label}</span>
          <span class="cell-value">${slot.value || 'Tap to fill'}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="combatant-column">
        <div class="column-header">
          <div class="portrait">${combatant.portrait}</div>
          <div>
            <strong>${combatant.name}</strong>
            <span>Init ${combatant.initiative}</span>
          </div>
        </div>
        <div class="current-state">HP ${combatant.hp}<br>${combatant.status}</div>
        ${cells}
      </div>
    `;
  }).join('');
}

function renderInputPanel() {
  const panel = document.getElementById('inputPanel');
  const title = document.getElementById('panelTitle');
  const slot = getCurrentSlot();
  const combatant = combatants[slot.combatantIndex];
  const round = rounds[slot.roundIndex];

  if (title) {
    title.textContent = `${combatant.name} · Round ${round.label}`;
  }

  const hint = document.getElementById('panelHint');
  const isLocked = Boolean(slot.value) && state.currentSlotIndex !== state.activeSlotIndex && !state.unlockEditing;
  if (hint) {
    hint.textContent = isLocked
      ? 'This completed turn is locked. Unlock it to edit.'
      : state.panelOpen
        ? 'Fill the active turn with shorthand.'
        : 'Select a turn to begin.';
  }

  document.getElementById('unlockEditBtn').style.display = isLocked ? 'inline-flex' : 'none';

  const menu = document.getElementById('actionMenu');
  if (menu) {
    menu.innerHTML = [
      ['attack', 'Attack'],
      ['cast', 'Cast'],
      ['condition', 'Condition'],
      ['damage', 'Damage'],
      ['heal', 'Heal'],
      ['switch', 'Switch'],
      ['note', 'Note']
    ].map(([value, label]) => `
      <button class="action-btn ${state.selectedAction === value ? 'selected' : ''}" data-action="${value}">
        ${label}
      </button>
    `).join('');
  }

  const subpanel = document.getElementById('subpanelContent');
  if (subpanel) {
    subpanel.innerHTML = renderSubpanel();
  }

  if (panel) {
    panel.classList.toggle('open', state.panelOpen);
  }

  const confirmBtn = document.getElementById('confirmDraftBtn');
  if (confirmBtn) {
    confirmBtn.disabled = !state.draftPreview;
  }
}

function renderSubpanel() {
  const form = state.formState;
  switch (state.selectedAction) {
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
    default:
      return '';
  }
}

function openPanel(slotIndex) {
  state.currentSlotIndex = slotIndex;
  state.panelOpen = true;
  state.unlockEditing = false;
  state.editingLockedCell = Boolean(getSlot(slotIndex).value) && slotIndex !== state.activeSlotIndex;
  const slot = getSlot(slotIndex);
  if (slot.value && slotIndex !== state.activeSlotIndex && !state.unlockEditing) {
    state.draftPreview = slot.value;
  } else {
    state.draftPreview = '';
  }
  setPreview();
  render();
}

function closePanel() {
  state.panelOpen = false;
  state.unlockEditing = false;
  state.editingLockedCell = false;
  render();
}

function confirmDraft() {
  const slot = getCurrentSlot();
  if (!state.draftPreview) return;
  slot.value = state.draftPreview;
  slot.locked = true;
  if (state.currentSlotIndex === state.activeSlotIndex) {
    state.activeSlotIndex += 1;
    if (state.activeSlotIndex >= slotData.length) {
      state.activeSlotIndex = slotData.length - 1;
    }
  }
  state.panelOpen = false;
  state.unlockEditing = false;
  state.editingLockedCell = false;
  render();
}

function clearDraft() {
  state.draftPreview = '';
  setPreview();
  render();
}

function setAction(action) {
  state.selectedAction = action;
  setPreview();
  renderInputPanel();
}

function handleFormInput(event) {
  if (!event.target.id) return;
  const field = event.target.id;
  const value = event.target.value;
  const form = state.formState;
  if (field === 'attackTarget') form.attackTarget = value;
  if (field === 'attackMod') form.attackMod = value;
  if (field === 'attackDamage') form.attackDamage = value;
  if (field === 'castSpell') form.castSpell = value;
  if (field === 'castTarget') form.castTarget = value;
  if (field === 'conditionName') form.conditionName = value;
  if (field === 'conditionMode') form.conditionMode = value;
  if (field === 'damageAmount') form.damageAmount = value;
  if (field === 'healAmount') form.healAmount = value;
  if (field === 'switchWeapon') form.switchWeapon = value;
  if (field === 'noteText') form.noteText = value;
  setPreview();
}

function unlockEdit() {
  state.unlockEditing = true;
  state.editingLockedCell = false;
  state.draftPreview = getCurrentSlot().value;
  setPreview();
  render();
}

function startEncounter() {
  state.encounterState = 'active';
  state.activeSlotIndex = 0;
  render();
}

function endEncounter() {
  state.encounterState = 'ending';
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startEncounterBtn').addEventListener('click', startEncounter);
  document.getElementById('endEncounterBtn').addEventListener('click', endEncounter);
  document.getElementById('closePanelBtn').addEventListener('click', closePanel);
  document.getElementById('clearDraftBtn').addEventListener('click', clearDraft);
  document.getElementById('cancelDraftBtn').addEventListener('click', closePanel);
  document.getElementById('confirmDraftBtn').addEventListener('click', confirmDraft);
  document.getElementById('unlockEditBtn').addEventListener('click', unlockEdit);
  document.getElementById('combatantColumns').addEventListener('click', (event) => {
    const button = event.target.closest('.round-cell');
    if (!button) return;
    const slotIndex = Number(button.dataset.slotIndex);
    openPanel(slotIndex);
  });
  document.getElementById('actionMenu').addEventListener('click', (event) => {
    const button = event.target.closest('.action-btn');
    if (!button) return;
    setAction(button.dataset.action);
  });
  document.getElementById('subpanelContent').addEventListener('input', handleFormInput);
  document.getElementById('subpanelContent').addEventListener('change', handleFormInput);
  render();
});
