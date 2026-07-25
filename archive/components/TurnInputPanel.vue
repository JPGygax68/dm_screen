<template>
    <section class="turn-input-panel" :class="{ open: snapshot.context.recordingPanel.open }" aria-live="polite">
        <div class="panel-header">
            <div>
                <h2>{{ panelTitle }}</h2>
            </div>
            <div class="panel-actions">
                <ion-button fill="outline" size="small" @click="send({ type: 'UNLOCK_EDIT' })"
                    style="display:none;">Unlock edit</ion-button>
            </div>
        </div>

        <div class="panel-body">
            <div class="action-section">
                <div class="action-menu">
                    <button v-for="action in actions" :key="action.value" class="action-btn"
                        :class="{ selected: snapshot.context.draft.selectedAction === action.value }"
                        @click="send({ type: 'SET_ACTION', action: action.value })">
                        {{ action.label }}
                    </button>
                </div>
            </div>

            <div class="composer-block">
                <div class="composer-section">
                    <div class="subpanel">
                        <template v-if="snapshot.context.draft.selectedAction === 'attack'">
                            <label>
                                Target
                                <select :value="snapshot.context.draft.form.attackTarget"
                                    @input="updateField('attackTarget', $event)">
                                    <option v-for="combatant in combatants" :key="combatant.id" :value="combatant.id">{{
                                        combatant.name }}</option>
                                </select>
                            </label>
                            <label>
                                Modifier
                                <input :value="snapshot.context.draft.form.attackMod"
                                    @input="updateField('attackMod', $event)" />
                            </label>
                            <label>
                                Damage
                                <input :value="snapshot.context.draft.form.attackDamage"
                                    @input="updateField('attackDamage', $event)" />
                            </label>
                        </template>

                        <template v-else-if="snapshot.context.draft.selectedAction === 'cast'">
                            <label>
                                Spell
                                <input :value="snapshot.context.draft.form.castSpell"
                                    @input="updateField('castSpell', $event)" />
                            </label>
                            <label>
                                Target
                                <input :value="snapshot.context.draft.form.castTarget"
                                    @input="updateField('castTarget', $event)" />
                            </label>
                        </template>

                        <template v-else-if="snapshot.context.draft.selectedAction === 'condition'">
                            <label>
                                Condition
                                <input :value="snapshot.context.draft.form.conditionName"
                                    @input="updateField('conditionName', $event)" />
                            </label>
                            <label>
                                Mode
                                <select :value="snapshot.context.draft.form.conditionMode"
                                    @input="updateField('conditionMode', $event)">
                                    <option value="add">Add</option>
                                    <option value="remove">Remove</option>
                                </select>
                            </label>
                        </template>

                        <template v-else-if="snapshot.context.draft.selectedAction === 'damage'">
                            <label>
                                Damage
                                <input :value="snapshot.context.draft.form.damageAmount"
                                    @input="updateField('damageAmount', $event)" />
                            </label>
                        </template>

                        <template v-else-if="snapshot.context.draft.selectedAction === 'heal'">
                            <label>
                                Healing
                                <input :value="snapshot.context.draft.form.healAmount"
                                    @input="updateField('healAmount', $event)" />
                            </label>
                        </template>

                        <template v-else-if="snapshot.context.draft.selectedAction === 'switch'">
                            <label>
                                Weapon
                                <input :value="snapshot.context.draft.form.switchWeapon"
                                    @input="updateField('switchWeapon', $event)" />
                            </label>
                        </template>

                        <template v-else-if="snapshot.context.draft.selectedAction === 'note'">
                            <label>
                                Note
                                <textarea :value="snapshot.context.draft.form.noteText"
                                    @input="updateField('noteText', $event)"></textarea>
                            </label>
                        </template>

                    </div>

                    <div v-if="snapshot.context.draft.selectedAction === 'raw'" class="raw-composer">
                        <textarea class="raw-textarea" placeholder="Add raw shorthand here (multi-line allowed)"
                            :value="snapshot.context.draft.rawShorthand"
                            @input="updateField('rawShorthand', $event)"></textarea>
                    </div>
                </div>
            </div>

            <div class="turn-actions-panel">
                <div class="panel">
                    <ion-button class="composer-action-btn" :disabled="!snapshot.context.draft.preview" size="small"
                        @click="send({ type: 'ADD_SHORTHAND' })">Add</ion-button>
                    <ion-button class="composer-action-btn" fill="outline" size="small"
                        :disabled="!snapshot.context.draft.preview" @click="send({ type: 'CLEAR' })">Clear</ion-button>
                    <ion-button class="composer-action-btn composer-action-btn--next" size="small"
                        @click="send({ type: 'NEXT_TURN' })">Next Turn</ion-button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { computed } from 'vue';

const actions = [
  { value: 'attack', label: 'Attack' },
  { value: 'cast', label: 'Cast' },
  { value: 'condition', label: 'Condition' },
  { value: 'damage', label: 'Damage' },
  { value: 'heal', label: 'Heal' },
  { value: 'switch', label: 'Switch' },
  { value: 'note', label: 'Note' },
  { value: 'raw', label: 'Raw' }
];


const props = defineProps<{
    snapshot: any;
    combatants: any[];
}>();

const emit = defineEmits<{
    (event: 'send', payload: any): void;
}>();

function send(event: any) {
    emit('send', event);
}

function eventValue(event: Event) {
    const target = event?.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    return target?.value ?? '';
}

function updateField(field: string, event: Event) {
    send({ type: 'INPUT_CHANGED', field, value: eventValue(event) });
}

const panelTitle = computed(() => {
  const selectedTurnOrderIndex = props.snapshot?.context?.selectedTurnOrderIndex ?? 0;
  const combatant = props.combatants?.[selectedTurnOrderIndex];
  const round = props.snapshot?.context?.round ?? 1;
  return `${combatant?.name ?? 'Turn'} · Round ${round}`;
});

</script>