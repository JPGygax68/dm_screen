import Ajv2020 from 'ajv/dist/2020.js';
import { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

export interface ValidationIssue {
  keyword: string;
  instancePath: string;
  message: string;
}

export interface EncounterValidationOptions {
  knownIds?: ReadonlySet<string>;
}

export interface EncounterValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

interface EncounterLike {
  id?: string;
  participants?: ParticipantLike[];
  rounds?: RoundLike[];
  activeTurn?: ActiveTurnLike;
}

interface ParticipantLike {
  id?: string;
  label?: string;
}

interface RoundLike {
  number?: number;
  turns?: TurnLike[];
}

interface TurnLike {
  participantId?: string;
  status?: string;
  startChecklist?: PhaseChecklistLike;
  endChecklist?: PhaseChecklistLike;
}

interface ActiveTurnLike {
  roundNumber?: number;
  turnNumber?: number;
  phase?: string;
}

interface PhaseChecklistLike {
  phase?: string;
}

export function createEncounterValidator(schema: object): (encounter: unknown, options?: EncounterValidationOptions) => EncounterValidationResult {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(schema);
  const schemaId = (schema as { $id?: string }).$id;
  if (!schemaId) throw new Error('Encounter validation requires a schema with an $id');
  const validate: ValidateFunction = ajv.compile({ $ref: `${schemaId}#/$defs/Encounter` });

  return (encounter, options = {}) => {
    const issues = structuralIssues(validate, encounter);
    if (issues.length === 0 && isRecord(encounter)) {
      issues.push(...domainIssues(encounter as EncounterLike, options));
    }
    return { valid: issues.length === 0, issues };
  };
}

function structuralIssues(validate: ValidateFunction, value: unknown): ValidationIssue[] {
  const valid = validate(value);
  return valid ? [] : (validate.errors ?? []).map(toIssue);
}

function domainIssues(encounter: EncounterLike, options: EncounterValidationOptions): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const participants = encounter.participants ?? [];
  const participantIds = new Set<string>();
  const labels = new Map<string, string>();

  participants.forEach((participant, index) => {
    if (participant.id) {
      if (participantIds.has(participant.id)) {
        issues.push(issue('uniqueId', `/participants/${index}/id`, 'ID must be globally unique within the loaded data set'));
      }
      participantIds.add(participant.id);
      if (options.knownIds?.has(participant.id)) {
        issues.push(issue('uniqueId', `/participants/${index}/id`, 'ID is already used by another persisted object'));
      }
    }

    if (participant.label) {
      const normalizedLabel = normalizeLabel(participant.label);
      const previousLabel = labels.get(normalizedLabel);
      if (previousLabel) {
        issues.push(issue('uniqueLabel', `/participants/${index}/label`, `Label duplicates participant ${previousLabel}`));
      } else {
        labels.set(normalizedLabel, participant.id ?? String(index));
      }
    }
  });

  const rounds = encounter.rounds ?? [];
  rounds.forEach((round, roundIndex) => {
    const roundParticipantIds = new Set<string>();
    (round.turns ?? []).forEach((turn, turnIndex) => {
      if (turn.participantId && !participantIds.has(turn.participantId)) {
        issues.push(issue('reference', `/rounds/${roundIndex}/turns/${turnIndex}/participantId`, 'Turn participantId does not resolve to an encounter participant'));
      }
      if (turn.participantId && roundParticipantIds.has(turn.participantId)) {
        issues.push(issue('uniqueTurnParticipant', `/rounds/${roundIndex}/turns/${turnIndex}/participantId`, 'A round cannot contain more than one turn for the same participant'));
      }
      if (turn.participantId) roundParticipantIds.add(turn.participantId);
      checkChecklistPhase(turn.startChecklist, 'start', `/rounds/${roundIndex}/turns/${turnIndex}/startChecklist`, issues);
      checkChecklistPhase(turn.endChecklist, 'end', `/rounds/${roundIndex}/turns/${turnIndex}/endChecklist`, issues);
    });
  });

  const activeTurn = encounter.activeTurn;
  if (activeTurn) {
    const activeRoundIndex = rounds.findIndex((round) => round.number === activeTurn.roundNumber);
    const activeRound = rounds[activeRoundIndex];
    const activeTurnIndex = (activeTurn.turnNumber ?? 0) - 1;
    const turn = activeRound?.turns?.[activeTurnIndex];
    if (!activeRound) {
      issues.push(issue('activeTurnReference', '/activeTurn/roundNumber', 'Active round does not exist'));
    } else if (!turn) {
      issues.push(issue('activeTurnReference', '/activeTurn/turnNumber', 'Active turn does not exist within the active round'));
    } else if (turn.status !== 'active') {
      issues.push(issue('activeTurnStatus', '/activeTurn', 'Referenced active turn must have status active'));
    }
  }

  return issues;
}

function checkChecklistPhase(checklist: PhaseChecklistLike | undefined, expected: string, path: string, issues: ValidationIssue[]): void {
  if (checklist && checklist.phase !== expected) {
    issues.push(issue('checklistPhase', path, `Checklist phase must be ${expected}`));
  }
}

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

function toIssue(error: ErrorObject): ValidationIssue {
  return issue(error.keyword, error.instancePath, error.message ?? 'Schema validation failed');
}

function issue(keyword: string, instancePath: string, message: string): ValidationIssue {
  return { keyword, instancePath, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
