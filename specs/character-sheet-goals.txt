# Character Sheet Replacement Goals

Goal: replace the current character editor view with a full D&D 2024 character sheet while preserving the app's existing routed, client-side data model.

Scope for this phase:
- Keep the existing app flow and data model; do not introduce a backend or external persistence layer.
- Replace the current compact editor with a sheet-style layout that reads like a proper D&D 2024 character sheet.
- Preserve DM autonomy: the app must never block progress because setup is incomplete.

Planned sections:
- Header / identity: name, class, level, race, background, alignment, player name, XP, proficiency bonus, inspiration.
- Core stats: ability scores and modifiers, saving throws, skill list, passive perception.
- Combat: AC, initiative, speed, HP, hit dice, attacks / action summary, conditions.
- Proficiency and trait areas: language list, proficiencies, features, traits, abilities.
- Equipment: weapons, armor, inventory, coin, carried gear, attuned items.
- Spellcasting: prepared spells, spell slots, spell list, cantrips, ritual casting indicators.
- Notes and miscellaneous: personality, bonds, ideals, flaws, biography, notes.

Design goals:
- Fit the existing DM Screen visual style and Tailwind/PrimeVue design tokens.
- Favor clear sectioning, readable typography, and compact density over decorative UI.
- Make the sheet usable as an editable view first; polish/print/export can come later.
- Keep the layout responsive enough for laptop/tablet use without requiring a special layout system.
- Explicitly distinguish authored inputs from calculated values, with visual cues and explanatory affordances.
- Provide consistent info/help affordances for important fields so beginners and occasional DMs can understand the value's meaning without cluttering the layout.
- Favor a landscape-first, centered sheet layout for desktop/tablet use; stack sections vertically only when necessary for narrow screens.
- Use route-level navigation for page changes, not tabs for core sheet sections.
- Prefer a vertical single-page sheet with collapsible section panels and a sticky section navigator for quick jumps.
- Allow on-the-fly data entry during active play: when a calculation lacks required data, guide the DM to the missing fields and support quick return to the in-progress task.
- Mark missing prerequisite fields clearly across sheets/views, including cross-sheet dependencies (e.g., attack roll -> equipped weapon -> inventory).
- Keep overrides easy: DMs must be able to manually edit or override app-provided values when needed.

Non-goals for this pass:
- no new backend data model
- no full character generation wizard
- no multi-theme or ambiance system
- no advanced print layout or PDF export
- no drag-and-drop inventory manager

Acceptance bar for implementation:
- the view renders as a complete character sheet instead of a narrow form
- core D&D 2024 character information is visible and editable
- existing PC data remains compatible with the current app structure
- the sheet integrates cleanly with the current route and store structure without requiring new infrastructure
- calculations fail gracefully: missing prerequisites surface actionable guidance instead of hard failure
- navigation context is preserved so the DM can return to the originating encounter/calculation flow after filling missing data
