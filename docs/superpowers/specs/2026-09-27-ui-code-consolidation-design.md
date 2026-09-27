# Pokercat2 UI/Code Consolidation Design

Date: 2026-09-27
Status: proposed
Baseline: main @ 5ebe7b98

## Goal

Consolidate Pokercat2 so each active screen and UI responsibility has one canonical implementation, while preserving the currently shipped product behavior and visual output as closely as practical. This is a structural cleanup, not a redesign.

## Success criteria

- Existing v40 product flows remain available: feed, Explore, nearby store finder, schedule inside Explore, profile, career, compose, Poker Room, Hold'em, Poker Tools, auth gating, avatar selection.
- One canonical implementation remains for each active top-level view.
- Known override chains are removed rather than relying on script load order.
- CSS ownership becomes predictable and duplicate/conflicting rules are reduced.
- Shared visual primitives use a small token layer instead of repeated literal values where safe.
- No new backend, framework, build system, or product dependency is introduced.
- Static GitHub Pages deployment remains the delivery model.

## Current findings

The app is a static global-script application. index.html currently loads 13 JavaScript files in order, and later files intentionally override earlier global functions.

Confirmed duplicate/override hotspots:
- feed.js defines exploreView twice.
- feed.js defines homeView twice.
- profile-compose.js defines bottomNav twice.
- profile-compose.js and profile-v2.js both define profileView, profileBody, careerHighView, and careerCard.
- profile-v2.js supplies the currently active profile generation because it loads after profile-compose.js.
- profile-v2.js also supplies the currently active bottomNav wrapper after profile-compose.js.
- CSS has repeated selectors inside base.css, feed.css, forms.css, poker-tools.css, and holdem-table.css.
- forms.css is the largest style file and currently carries responsibilities from several feature generations.
- Recent Poker Room/Hold'em work is already separated into dedicated engine/UI/wire files and should not be folded back into legacy files.

## Approaches considered

### A. Minimal dead-code deletion only
Remove duplicate function bodies that are clearly shadowed and leave file responsibilities otherwise unchanged.

Pros: lowest regression risk.
Cons: leaves CSS ownership and oversized mixed-responsibility files mostly unchanged.

### B. Staged canonicalization (selected)
First remove proven shadowed implementations, then normalize CSS ownership/tokens, then clean wiring and references. Preserve the global-script architecture for now.

Pros: materially reduces accumulated generations without turning cleanup into a rewrite; easiest to verify incrementally.
Cons: global namespace remains, so future modularization may still be desirable.

### C. Full module rewrite
Convert the application to ES modules/components and reorganize all screens at once.

Pros: cleanest end state.
Cons: unnecessarily large regression surface for the current prototype and unrelated to the immediate cleanup goal.

## Selected design

Use Approach B.

### Phase 1 — Canonical view ownership

Establish one owner for each active screen:
- feed.js: home, Explore, schedule content, feed-related rendering.
- profile-compose.js: compose flows and shared bottom-navigation renderer only.
- profile-v2.js: canonical profile and career rendering, avatar picker, profile-specific helpers.
- poker-room.js: room creation/lobby/room rendering.
- holdem-table-ui.js: live Hold'em table rendering.
- poker-tools.js: Poker Tools screens.
- core.js: shared state, shared helpers, top-level rendering/auth/modal infrastructure.
- wire.js: general event wiring.
- holdem-wire.js: Hold'em-specific event wiring.

Delete only implementations proven to be shadowed by the current load order. Do not change product behavior in this phase.

### Phase 2 — CSS ownership

Keep the current stylesheet split but give each file a clear scope:
- base.css: reset, shell, typography, top/bottom navigation, generic primitives.
- feed.css: home feed, Explore, schedule, nearby store finder, feed cards.
- forms.css: auth, compose, profile editing/forms, room forms/modals.
- poker-tools.css: Poker Tools only.
- holdem-table.css: Hold'em table only.

For selectors duplicated within the same stylesheet, retain the effective final behavior and collapse them into one canonical rule when safe. Cross-feature selectors are moved only when ownership is unambiguous.

### Phase 3 — UI tokens

Introduce a small :root token set for repeated dark surfaces, borders, text hierarchy, accent, radii, and spacing. Convert repeated literals opportunistically where equivalence is clear. This is not a visual redesign; tokenization must not intentionally change the appearance.

### Phase 4 — Wiring/reference cleanup

Remove handlers and helpers that only support deleted legacy views. Keep current public data attributes and localStorage keys stable unless a compatibility alias is necessary.

### Phase 5 — Verification

For each phase:
- JavaScript syntax verification for all loaded JS files.
- Static reference checks for loaded assets/functions.
- Duplicate-function scan.
- Conflict-marker scan.
- Confirm index.html load order references existing files.
- Confirm GitHub Pages workflow result after release.

Before final release, exercise the major routes/flows structurally: home, Explore tabs including stores/schedule, profile/avatar/career, compose, Poker Room/lobby/table, Poker Tools, auth-gated actions.

## Non-goals

- No Figma redesign in this refactor.
- No framework migration.
- No backend migration.
- No change to poker calculation algorithms unless cleanup exposes an existing defect.
- No change to store directory product policy.
- No removal of working features merely because they are demo/localStorage based.

## Risk controls

- Work in small commits by phase.
- Do not delete a duplicate until its later canonical implementation and call sites are identified.
- Preserve current script ordering until the override dependency being removed is proven unnecessary.
- Treat Poker Room and Hold'em as high-risk areas; avoid broad edits there unless required by a verified duplicate/reference issue.
- If cleanup reveals behavior ambiguity, preserve the behavior currently shipped on main and record the ambiguity rather than inventing a new behavior.

## Completion condition

The refactor is complete when the shipped feature set remains intact, known JS override chains are removed, CSS duplicate/conflict count is materially reduced, verification checks are green, and GitHub Pages deploys successfully.
