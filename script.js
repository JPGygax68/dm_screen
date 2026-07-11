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
  encounterState: 'recording',
  activeSlotIndex: 0,
  currentSlotIndex: 0,
  panelOpen: true,
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
    noteText: '',
    rawShorthand: ''
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
  if (state.selectedAction === 'raw' && form.rawShorthand && form.rawShorthand.trim().length > 0) return form.rawShorthand;
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
    case 'raw':
      return form.rawShorthand || '';
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
  renderColumnsHeader();
  renderRows();
  renderInputPanel();
}
function renderStatus() {
  document.getElementById('encounterState').textContent = state.encounterState;
  const slot = getSlot(state.activeSlotIndex);
  const combatant = combatants[slot.combatantIndex];
  document.getElementById('activeTurnLabel').textContent = `Round ${rounds[slot.roundIndex].label} · ${combatant.name}`;
}

function renderRows() {
  const container = document.getElementById('rowsContainer');
  container.innerHTML = rounds.map((round, roundIndex) => {
    const combatantCells = combatants.map((combatant, combatantIndex) => {
      const slotIndex = getSlotIndex(roundIndex, combatantIndex);
      const slot = getSlot(slotIndex);
      const isActive = state.activeSlotIndex === slotIndex;
      const isFilled = Boolean(slot.value);
      const classes = ['round-cell'];
      if (isActive) classes.push('active');
      if (isFilled) classes.push('filled');
      const baseLabel = slot.value || 'Tap to fill';
      const displayValue = (state.panelOpen && state.currentSlotIndex === slotIndex) ? (state.draftPreview || baseLabel) : baseLabel;
      return `
        <div class="combatant-slot" style="min-width:180px; display:flex; flex-direction:column;">
          <button class="${classes.join(' ')}" data-slot-index="${slotIndex}">
            <span class="cell-value">${displayValue}</span>
          </button>
        </div>
      `;
    }).join('');

    return `
      <div class="round-row">
        <div class="row-label">${round.label}</div>
        <div class="row-combatants">${combatantCells}</div>
        <div class="row-note">${round.notes}</div>
      </div>
    `;
  }).join('');
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
        ? 'Choose a shorthand type and record the turn.'
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
      ['note', 'Note'],
      ['raw', 'Raw']
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

  const rawContainer = document.getElementById('rawShorthandContainer');
  const raw = document.getElementById('rawShorthand');
  if (rawContainer) {
    rawContainer.style.display = state.selectedAction === 'raw' ? 'flex' : 'none';
  }
  if (raw) raw.value = state.formState.rawShorthand || '';

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
    case 'raw':
      return `
        <div class="preview-text">Enter raw shorthand in the field below.</div>
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
  state.panelOpen = state.encounterState === 'recording';
  state.unlockEditing = false;
  state.editingLockedCell = false;
  render();
}

function confirmDraft() {
  const slot = getCurrentSlot();
  if (!state.draftPreview) return;
  slot.value = state.draftPreview;
  slot.locked = true;
  state.draftPreview = '';
  state.formState.rawShorthand = '';
  setPreview();
  render();
}

function clearDraft() {
  state.draftPreview = '';
  state.formState.rawShorthand = '';
  setPreview();
  render();
}

function cancelDraft() {
  state.draftPreview = '';
  state.formState.rawShorthand = '';
  setPreview();
  renderInputPanel();
}

function nextTurn() {
  const slot = getCurrentSlot();
  if (state.draftPreview) {
    slot.value = state.draftPreview;
    slot.locked = true;
  }
  if (state.activeSlotIndex < slotData.length - 1) {
    state.activeSlotIndex += 1;
  }
  state.currentSlotIndex = state.activeSlotIndex;
  state.draftPreview = '';
  state.formState.rawShorthand = '';
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
  if (field === 'rawShorthand') form.rawShorthand = value;
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
  state.encounterState = 'recording';
  state.activeSlotIndex = 0;
  state.currentSlotIndex = 0;
  state.panelOpen = true;
  render();
}

function endEncounter() {
  state.encounterState = 'ended';
  state.panelOpen = false;
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startEncounterBtn').addEventListener('click', startEncounter);
  document.getElementById('endEncounterBtn').addEventListener('click', endEncounter);
  document.getElementById('clearDraftBtn').addEventListener('click', clearDraft);
  document.getElementById('cancelDraftBtn').addEventListener('click', cancelDraft);
  document.getElementById('confirmDraftBtn').addEventListener('click', confirmDraft);
  document.getElementById('nextTurnBtn').addEventListener('click', nextTurn);
  document.getElementById('unlockEditBtn').addEventListener('click', unlockEdit);
  document.getElementById('rowsContainer').addEventListener('click', (event) => {
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
  document.getElementById('inputPanel').addEventListener('input', handleFormInput);
  document.getElementById('inputPanel').addEventListener('change', handleFormInput);
  render();
});
