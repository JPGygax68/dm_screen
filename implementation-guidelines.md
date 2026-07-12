# Implementation Guidelines

This document captures implementation principles for maintainability and consistency.

## State machine design

- Keep the state machine topology separate from the implementation logic whenever possible.
- Define states, events, transitions, and named actions/guards in a declarative form.
- Implement action and guard behavior in a separate layer.
- Compose definition and implementation through a thin integration layer.

## Single source of truth

- Treat the machine definition as the authoritative behavior model.
- Keep derived UI details out of persistent machine state.
- Derive presentation coordinates and convenience values from domain state at render time.

## Invariants and safety checks

- Put precondition assertions inside action implementations rather than duplicating checks at transition call sites.
- Use invariant checks to fail fast on impossible transitions or invalid state assumptions.

## Testing and verification

- Maintain an executable harness that drives representative event sequences.
- Verify key invariants after each major transition.
- Run machine verification after each behavior change.

## Appearance considerations

- Use semantic colors
- Consider using a token-based color architecture

## Change discipline

- Prefer adding or updating named actions and guards over embedding ad hoc transition logic.
- Keep naming domain-focused and consistent across definition and implementation layers.
- Evolve the machine incrementally and preserve backward behavior unless change is intentional.
