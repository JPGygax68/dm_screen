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
- Support actor labels with simple names such as `Goblin1`, `PC_A`, or `DM`.

## Supported update tokens

### Health and combat stats

- `+Nhp`, `-Nhp`: change current HP by `N`.
- `hp=N`: set current HP.
- `maxhp=N`: set maximum HP.
- `ac=N`, `ac+N`, `ac-N`: set or modify armor class.
- `init=N`: set initiative value.
- `move:N`: record movement in feet.

### Conditions and effects

- `cond:NAME`: add condition `NAME`.
- `clr:NAME`: clear condition `NAME`.
- `cond:+NAME[N]`: add condition `NAME` with duration `N` rounds/turns.
- `cond:-NAME`: remove condition `NAME` with duration semantics.
- `+NAME`, `-NAME`: add or remove a condition in a compact turn-cell token.
- `temp:NAME N`: add a temporary effect `NAME` lasting `N` rounds/turns.

### Ability and skill values

- `stat:STR=18`, `str=18`: set a stat value.
- `save:WIS+2`, `skill:PER+5`: set or adjust saves/skills.
- `res:TYPE`, `vul:TYPE`, `imm:TYPE`: add resistance, vulnerability, or immunity.

### Actions and notes

- `cast:SPELL`: note a spell casting action.
- `switch:WEAPON`: record switching to a different weapon. Example: `switch:shortsword`.
- `switch:FROM->TO`: record a specific weapon transition. Example: `switch:dagger->shortsword`.
- `action:TEXT`: record an action or short description.
- `atk:TARGET+MOD[/dmg=N][/miss]`: record an attack against `TARGET` with an optional modifier, damage, or miss flag.
- `roll:TEXT`: record a notable roll or check.
- `note:TEXT`: record a short free-text note inline.
- `raw:TEXT`: record any update that cannot be expressed with the standard tokens.

### Weapon switching notes

- Under DnD 2024 rules, weapon switching is treated as a minor or free combat adjustment, not a full separate action.
- Use `switch:...` to record the equipment transition without implying an extra action cost.
- If the combatant attacks with a different weapon in the same turn, the notation should combine the switch and the attack in one row, e.g. `switch:dagger->shortsword; atk:Goblin1+6/dmg=8`.
- The app may propose `switch:` automatically when the current weapon state differs from the weapon implied by the next attack token.

## Targets and labels

- `TARGET` should match the combatant label used in the column headers.
- Use underscores or hyphens instead of spaces when possible.
- If needed, implementations may support quoted labels for parsing robustness.
- When an attack affects another combatant, the attacker's cell should record the provenance with `atk:...`, and the target's cell should record resulting deltas such as `+Nhp`, `-Nhp`, `+NAME`, or `-NAME`.

## Consumables and resources

- `use:slot:L`: consume one spell slot of level `L`.
- `use:slot:L:N`: consume `N` slots at level `L`.
- `set:slot:L=N`: set remaining slots of level `L` to `N`.
- `use:item:NAME`: consume one unit of `NAME`.
- `use:item:NAME:N`: consume `N` units.
- `add:item:NAME:N`: add `N` units.
- `set:item:NAME=N`: set remaining quantity of `NAME` to `N`.
- `rest:short`, `rest:long`: apply short/long rest semantics.

## Parsing rules

- Token names are case-insensitive for common keywords such as `hp`, `ac`, `cond`, `clr`, `temp`, `stat`, `save`, `skill`, `res`, `vul`, `imm`, `cast`, `action`, `roll`, `note`, and `raw`.
- Use simple separators and avoid punctuation that conflicts with parsing.
- If needed, use `note:` or `raw:` to capture exceptional or manual updates.
- Signed numeric tokens are interpreted as deltas when preceded by `+` or `-`. Example: `+5hp` increases current HP by 5, while `hp=5` sets HP to 5.
- For tokens that use `:`, the unsigned value retains the per-token meaning. Example: `move:10` records 10 feet moved this turn.

## Example rows

- `Goblin1: -7hp; cond:PRONE; move:10; note: fell from ledge`
- `PC_A: +5hp; temp:BRACED 1; action:Shield spell`
- `DM: cond:BLINDED[1]; atk:Spear +4; note: target behind cover`
- `PC_A: switch:dagger->shortsword; atk:Goblin1+6/dmg=8; note: wielding blade for next turn`
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
  "turnIndex": 3,
  "phase": "end",
  "actorId": "Goblin1",
  "tokens": ["-7hp", "cond:PRONE", "move:10"],
  "tokensHash": "sha256-hex-of-tokens",
  "note": "fell from ledge",
  "overridden": false,
  "applied": false,
  "timestamp": "2026-07-07T12:00:00Z"
}
```

### Field notes

- `turnIndex` is a turn counter for the encounter.
- `phase` should be `end` or `start`.
- `tokens` is the authoritative compact shorthand representation.
- `tokensHash` is optional integrity data for detecting accidental edits.
- `overridden` identifies items edited by the GM before confirmation.
- `applied` identifies items that have been confirmed and incorporated into state.

## Implementation guidance

- The shorthand notation should be the readable, editable source of truth.
- Structured effects should be derived from the tokens at runtime rather than stored separately.
- The UI should allow the GM to accept, modify, or reject proposed tokens before confirming them.
- If the app does not have explicit data for a consumable, it should require the GM to enter the relevant token explicitly and confirm the update.
