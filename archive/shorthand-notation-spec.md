# Turn Shorthand Notation Specification

## Purpose

This document defines a compact, human-editable notation for recording combat turn updates, consumable actions, and checklist items. It is intended to be usable by an application, a printable sheet, or any other tool that needs a compact representation of encounter changes.

## Core goals

- Keep each turn update compact enough to fit in a single row or checklist entry.
- Use a simple grammar that is easy to parse without AI assistance.
- Stay readable for humans while remaining compatible with ASCII-oriented tooling.
- Allow free-text notes when the compact tokens are insufficient.
- Preserve the notation as the editable source of truth for checklist items and printed output.

## Row format

Each turn row uses the following structure:

`Actor: update1; update2; ... [| note]`

- Use `;` to separate compact update tokens.
- Use `|` to attach a free-text note when the token set is insufficient.
- The actor is the participant's `label`, such as `Goblin_1`, `PC_A`, or `DM`.
- Labels are canonical, human-readable identifiers and MUST be unique within an
  encounter. They contain no spaces and use only letters, digits, `_`, and `-`.

## Supported update tokens

### Health and combat stats

- `+Nhp`, `-Nhp`: change current HP by `N`.
- `hp=N`: set current HP.
- `maxhp=N`: set maximum HP.
- `ac=N`, `ac+N`, `ac-N`: set or modify armor class.
- `move:N`: record movement in feet.

### Conditions and effects

- `cond:NAME`: add condition `NAME`.
- `clr:NAME`: clear condition `NAME`.
- `cond:+NAME[N]`: add condition `NAME` with duration `N` rounds/turns.
- `cond:-NAME`: remove condition `NAME` with duration semantics.
- `+NAME`, `-NAME`: add or remove a condition in a compact turn-cell token.

### Ability and skill values

- `STR=18`: set an ability score.
- `STR:+2=18`: increase an ability score; the resulting score is required so the app can verify the calculation.
- `STR:-1`, `STR:-1=16`: decrease an ability score; the resulting score is optional but verified when supplied.
- `STR:+2=18[1]`: apply a temporary ability adjustment lasting `N` rounds/turns.
- `stat:STR=18`, `stat:STR:+2=18`, `save:WIS:+2=5`, and `skill:PER:+1=6`: explicit prefixed forms are always accepted.
- Prefixes are optional only when the name resolves unambiguously as an ability, save, or skill. The app MUST reject ambiguous bare names and ask for an explicit prefix.
- `res:TYPE`, `vul:TYPE`, `imm:TYPE`: add resistance, vulnerability, or immunity.

### Actions and notes

- Actions MAY include an optional roll suffix: `[d20[+|-] [MODIFIER] = TOTAL [vs AC|DC TARGET] -> OUTCOME]`.
- `cast:SPELL`: note a spell casting action. The colon is optional, so `cast Fireball` is also valid.
- `switch FROM to TO`: record a specific weapon transition. Example: `switch dagger to shortsword`.
- `action:TEXT`: record an action or short description.
- `atk TARGET [d20[+|-]] [MODIFIER] = TOTAL [vs AC N] -> OUTCOME [dmg=N]`: record an attack against `TARGET`. The roll, modifier, total, comparison, and outcome are individually optional.
- `influence TARGET`, `magic NAME`, `search SUBJECT`, `study SUBJECT`, and `custom DESCRIPTION` may use the same optional roll suffix.
- `roll:TEXT`: record a notable roll or check.
- `note:TEXT`: record a short free-text note inline.
- `raw:TEXT`: record any update that cannot be expressed with the standard tokens. `raw:` may contain multi-line content and free-form notes; implementations should preserve line breaks when storing and rendering `raw:` entries.

### Parenthesized additional information

Any update token MAY be followed by a space and parenthesized information:

```text
-7hp (fall damage)
cond:PRONE[1] (until the end of the next turn)
STR:+2=18[1] (bless)
```

The parenthesized text is preserved as human-readable annotation. It is not
required to be parseable, although a future parser MAY recognize structured
content within it.

### Rolls and outcomes

`d20+` means advantage and `d20-` means disadvantage. An unmarked `d20` is a
normal roll. The modifier and total are separated by `=` so the app can verify
the arithmetic:

```text
atk Goblin_1 d20+ +6 = 21 vs AC 15 -> hit dmg=8
study Runes using INT d20- +5 = 9 vs DC 14 -> failure
```

The `vs AC N` or `vs DC N` comparison is optional. The outcome follows `->` and
may be omitted when only the roll or comparison is being recorded. The app
preserves entered shorthand and reports arithmetic or outcome inconsistencies
instead of silently rewriting it.

Actions may specify the ability or skill used with `using`, for example
`influence Guard using CHA d20 = 14 vs DC 12 -> success` or
`search Room using Perception d20+5 = 17 vs DC 15 -> success`. The ability or
skill is optional, and explicit prefixes such as `skill:Perception` remain valid.

### Weapon switching notes

- Under DnD 2024 rules, weapon switching is treated as a minor or free combat adjustment, not a full separate action.
- Use `switch ... to ...` to record the equipment transition without implying an extra action cost. The colon is optional, so `switch:shortsword` is also accepted.
- The source weapon is optional: `switch to shortsword` or `switch dagger to shortsword`.
- Hand extensions are optional: `switch lh to poison_dagger`, `switch rh to shield`. Future hand specifiers may be added for participants with more than two hands.
- If the participant attacks with a different weapon in the same turn, the notation should combine the switch and the attack in one row, e.g. `switch dagger to shortsword; atk Goblin_1 +6 -> hit dmg=8`.
- The app may propose `switch` automatically when the current weapon state differs from the weapon implied by the next attack token.

## Targets and labels

- `TARGET` should match the target participant's `label`.
- Actor and target labels MUST use their canonical, space-free participant
  labels. Quoting is not part of the shorthand grammar.
- Printed or OCR-derived text MAY display or recognize spaces for readability,
  but import must normalize it back to the canonical label before validation.
- When an attack affects another participant, the actor's cell should record the provenance with `atk ... -> ...`, and the target's cell should record resulting deltas such as `+Nhp`, `-Nhp`, `+NAME`, or `-NAME`.

## Resources and action side effects

Spell slots, device charges, inventory, and similar resources are participant
state, not shorthand update tokens. An action may cause the application to
update that state, but the shorthand records the action itself:

```text
magic Fireball
utilize Wand_of_Frost
```

The application may provide dedicated controls for resource changes. Exceptional
or out-of-band changes may be mentioned in a parenthesized annotation or a
`note`/`raw` entry, but the shorthand grammar does not define resource-consumption
tokens.

## Parsing rules

- Token names are case-insensitive for common keywords such as `hp`, `ac`, `cond`, `clr`, `stat`, `save`, `skill`, `res`, `vul`, `imm`, `cast`, `action`, `roll`, `note`, and `raw`.
- A keyword colon is optional where the grammar permits it: `cast Fireball` and `cast:Fireball` are equivalent. A colon may also be followed by a space.
- Use simple separators and avoid punctuation that conflicts with parsing.
- If needed, use `note:` or `raw:` to capture exceptional or manual updates.
- Signed numeric tokens are interpreted as deltas when preceded by `+` or `-`. Example: `+5hp` increases current HP by 5, while `hp=5` sets HP to 5.
- For tokens that use `:`, the unsigned value retains the per-token meaning. Example: `move:10` records 10 feet moved this turn.
- For ability, save, and skill adjustments, a positive adjustment MUST include the resulting value, such as `STR:+2=18`; the app verifies that result against the prior value.
- Ability, save, and skill durations use the same `[N]` suffix as conditions, for example `save:WIS:+2=5[1]`.

## Example rows

- `Goblin_1: -7hp; cond:PRONE; move:10; note fell from ledge`
- `PC_A: +5hp; cond:BRACED[1] (temporary); action Shield spell`
- `DM: cond:BLINDED[1]; atk Goblin_1 +6 -> hit dmg=8; note target behind cover`
- `PC_A: switch dagger to shortsword; atk Goblin_1 +6 -> hit dmg=8; note wielding blade`
- `Ogre: hp=45; ac=13; res:fire; note: rage active`
- `DM: raw:Grant inspiration; note: team advantage for next check`

## Checklist-driven turn progression

The notation should be usable in end-of-turn and start-of-turn checklists. Each checklist item should preserve a compact token list and remain editable before confirmation.

## Checklist item schema

A lightweight checklist item can be represented as:

```json
{
  "id": "uuid",
  "encounterId": "uuid",
  "roundNumber": 1,
  "turnNumber": 3,
  "phase": "end",
  "participantId": "participant-internal-id",
  "tokens": ["-7hp", "cond:PRONE", "move:10"],
  "tokensHash": "sha256-hex-of-tokens",
  "note": "fell from ledge",
  "overridden": false,
  "applied": false,
  "timestamp": "2026-07-07T12:00:00Z"
}
```

### Field notes

- `roundNumber` and `turnNumber` identify the round-local turn; `turnNumber` is one-based.
- `phase` should be `end` or `start`.
- `participantId` identifies the participant whose turn owns the checklist.
- `tokens` is the authoritative compact shorthand representation.
- `tokensHash` is optional integrity data for detecting accidental edits.
- `overridden` identifies items edited by the GM before confirmation.
- `applied` identifies items that have been confirmed and incorporated into state.

## Implementation guidance

- The shorthand notation should be the readable, editable source of truth.
- Structured effects should be derived from the tokens at runtime rather than stored separately.
- The UI should allow the GM to accept, modify, or reject proposed tokens before confirming them.
- If the app does not have explicit data for a consumable, it should require the GM to enter the relevant token explicitly and confirm the update.
