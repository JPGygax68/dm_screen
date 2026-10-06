# 🏛️ D&D Campaign Planner: Technical Architecture Blueprint

This document serves as the comprehensive technical reference manual for the tablet-first D&D Campaign Planner application. It consolidates all architectural decisions, storage choices, memory isolation strategies, and UX patterns established for the prototype and production roadmap.

---

## 🏗️ 1. Core Architecture & State Paradigm

* **State Framework:** Vue 3 Composition API paired with **Pinia Setup Store syntax** (`defineStore('id', () => { ... })`). This style aligns perfectly with native Vue component composition, replaces the rigid Options API layout, and keeps reactivity patterns uniform.
* **Navigation-Driven Context:** Component data hydration is strictly **path-directed** by URL route parameters (e.g., `/campaign/:campaignId/encounter/:encounterId`). We explicitly reject recursive deep-tree ID searches in favour of deterministic lookups driven straight by active route coordinates.
* **Physical Stack Rejection:** The application completely avoids physical `z-index` layer stacking or modal dialogue queues. Deep nesting is handled entirely via the **Vue Router path hierarchy** and native browser routing history.

---

## 🗄️ 2. Storage & Persistence Blueprint

* **Database Selection:** **PouchDB** running locally over the browser's native **IndexedDB** engine. It treats each D&D Campaign as an independent, isolated, deeply nested JSON document tree.
* **File Portability:** Storing campaigns as single nested JSON documents makes exporting, importing, and individual remote cloud synchronization computationally trivial via simple `JSON.stringify` and `JSON.parse` operations on a single root object tree.
* **The Performance Boundary Guard:** To avoid layout stutter (jank) from high-frequency serialization, the system completely avoids global root array watchers on `allCampaigns`. Instead:
  1. Modifications happen instantly in ultra-fast, cheap in-memory RAM variables.
  2. A **300ms throttle debounce window** (`_.debounce`) filters high-frequency keystroke noise.
  3. The heavy document duplication and storage write run exactly **once** when the user pauses typing.

---

## 🛡️ 3. Memory Isolation & Data Integrity

* **The Permanent Identity Rule:** To completely eliminate the complex "ID remapping nightmare" upon background database synchronization, the database never generates sequence IDs. The client app generates standard v4 UUIDs via the browser's native `crypto.randomUUID()` immediately at creation. These IDs remain immutable across the entire lifecycle of the record.
* **The Polymorphic Sandbox Slot:** The store maintains a single, generic `activeDraft` state property. Since a Dungeon Master can physically only focus on one screen at a time, this single polymorphic slot safely adapts to any object type (`campaign`, `encounter`, `combatant`) by embedding a simple tracking `_type` property.
* **Strictly Shallow Drafts:** When editing existing records, objects are cloned into the sandbox using a **shallow JavaScript spread pointer** (`{ ...toRaw(source) }`), not a deep clone. This ensures instant form initialization speeds (<0.05ms) while protecting data integrity because sub-arrays are modified by pointer assignment rather than mutating elements inline.
* **Data-Corruption Protection:** To guarantee that the active UI thread never mutates an object while PouchDB is in the middle of writing it asynchronously to disk, we run an isolated clone step **inside the debounced save boundary** using the browser's native, optimized C++ `structuredClone()` method.

---

## 🍃 4. Tablet User Experience (UX) Protocols

* **Pristine-to-Active State Shift:** Creating a campaign begins inside the isolated `activeDraft` sandbox with a single required text input field, locking out the dashboard. Clicking "Initialize World" fires `commitDraft()`, pushing the record to PouchDB and seamlessly transforming the interface into a multi-panel live grid workspace.
* **Localized Sub-Tree Mutators:** Sub-items that depend on a parent (like tapping monsters from a Bestiary sidebar to add them to an encounter) **do not fork routes**. Instead, they mutate the active reactive tree inline. Because the parent encounter is instantly committed to the campaign array on load, the background auto-save protocols keep the data bulletproof.
* **Enforced Navigation Guards:** If a user attempts a "dirty navigation away" (e.g., clicking a sidebar link or using tablet hardware back-swipes while a draft is active), a **`beforeRouteLeave` router guard** blocks navigation and surfaces a confirmation modal. The transaction must explicitly end in a Commit (Save) or a Rollback (Cancel), preventing uncommitted data leaks.
* **Immutable Overlaid Inspectors:** Secondary overlay windows, pull-out drawers, or slide-sheets used to cross-reference data are strictly **read-only**. They bind directly to `store.currentCampaign` (bypassing the draft entirely) and are wrapped inside an HTML `<fieldset disabled class="pointer-events-none">` container to prevent accidental touch-input modifications.

---

## ⚡ 5. Resiliency & Recovery Controls

* **F5 Browser Reload Protection:** To heal the application context if a DM refreshes the browser page or experiences an app crash, a secondary automated watcher continuously mirrors the volatile `activeDraft` RAM contents into a dedicated `localStorage` key. 
* **Self-Healing Lifecycles:** On view compilation (`onMounted`), components inspect the `localStorage` key. If a matching ID string is found, the sandbox state is instantly rehydrated, rendering the form exactly where the user left off. Resolving the form automatically purges the cache key.
* **The Testing Harness Switch:** To allow rapid development loops, the store includes a `forceOverwriteDatabaseWithTestingData()` utility. This action uses PouchDB's database destruction primitive to cleanly wipe the local database index file, recreates a pristine instance constructor, and runs a safe `bulkDocs()` injection of your testing seed arrays.