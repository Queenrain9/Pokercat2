# Pokercat2 UI/Code Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the accumulated multi-generation UI overrides and reduce CSS conflicts while preserving Pokercat2's current feature set and restoring the intended v40 bottom navigation (Tools in the fourth slot; Schedule inside Explore).

**Architecture:** Keep the current static HTML/CSS/global-JavaScript architecture. Canonicalize ownership incrementally: feed first, profile/navigation second, styles third/fourth, then wiring and release. Add a dependency-free Node structural regression test so later edits cannot silently reintroduce the known override chains.

**Tech Stack:** Static HTML, CSS, browser JavaScript, localStorage, Node.js built-ins for structural tests, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-27-ui-code-consolidation-design.md`

## Global Constraints

- Preserve existing v40 product flows: feed, Explore, nearby store finder, Schedule inside Explore, profile, career, compose, Poker Room, Hold'em, Poker Tools, auth gating, avatar selection.
- Keep GitHub Pages and the static global-script architecture; add no framework, backend, build system, or product dependency.
- Do not redesign the UI in this refactor.
- Keep existing localStorage keys and public `data-*` event attributes stable.
- Treat Poker Room/Hold'em as high risk and avoid broad behavioral edits.
- Preserve the intended navigation contract: Home / Explore / Compose / Tools / Profile; Schedule is reached from Explore.
- Work in small phase commits and verify before moving on.

## Review Focus

- Logged-out navigation: Home and Explore still render; protected actions continue to invoke auth gating rather than failing.
- Explore routing: `stores` and `schedule` tabs still render their existing content after legacy Explore code is removed.
- Nested routes: `hand:*`, `tool:*`, `roomcreate`, and `room:*` keep the correct bottom-navigation visibility.
- Profile ownership: career CRUD and avatar picker continue to use the v2 profile implementation after legacy profile functions are deleted.
- Hold'em isolation: loading the live table still uses `holdem-table-ui.js` / `holdem-wire.js` and is not captured by legacy room UI.

---

### Task 1: Canonicalize Home and Explore rendering

**Files:**
- Create: `tests/refactor-structure.test.mjs`
- Modify: `feed.js:42-168, 258-357`

**Interfaces:**
- Consumes: global `state`, `scheduleView()`, `storeFinderContent()`, `exploreMockContent()`, room/feed helpers already present in `feed.js`.
- Produces: exactly one global `homeView()` and exactly one global `exploreView()`; `exploreView()` retains tabs `popular, rooms, stores, schedule, latest, hands, events, pubs, users`.

- [ ] **Step 1: Write the failing structural test**

Create a dependency-free Node test that reads source files and asserts:
- `feed.js` contains exactly one declaration of `function homeView(`.
- `feed.js` contains exactly one declaration of `function exploreView(`.
- the canonical Explore renderer includes `stores` and `schedule`.
- `scheduleExploreContent()` still delegates to `scheduleView()`.

- [ ] **Step 2: Run the test and confirm RED**

Run: `node tests/refactor-structure.test.mjs`
Expected: FAIL because `feed.js` currently declares both `homeView` and `exploreView` twice.

- [ ] **Step 3: Remove only the shadowed Home/Explore implementations**

Delete the earlier legacy `homeView()` at current line 42 and earlier legacy `exploreView()` at current line 142. Keep the later Home Pub-aware `homeView()` and the Explore renderer that includes Poker Room, nearby stores, and Schedule. Rename `pokerRoomExploreViewV1()` to a neutral private helper only if doing so removes a versioned legacy name without changing output; otherwise inline it into the single `exploreView()`.

- [ ] **Step 4: Run the structural test and confirm GREEN**

Run: `node tests/refactor-structure.test.mjs`
Expected: PASS for all Task 1 assertions.

- [ ] **Step 5: Commit**

Commit message: `refactor: canonicalize feed and explore views`

### Task 2: Canonicalize profile and bottom navigation ownership

**Files:**
- Modify: `tests/refactor-structure.test.mjs`
- Modify: `profile-compose.js:1-161, 188-198`
- Modify: `profile-v2.js:45-208`

**Interfaces:**
- Consumes: `state.view`, `icon()`, profile helpers/data, compose/hand composer functions.
- Produces: `profile-v2.js` as sole owner of `profileView()`, `profileBody()`, `careerHighView()`, `careerCard()`; one global `bottomNav()` owned by `profile-compose.js`.

- [ ] **Step 1: Extend the test and confirm RED**

Add assertions that:
- `profile-compose.js` no longer declares `profileView`, `profileBody`, `careerHighView`, or `careerCard`.
- the combined loaded source contains exactly one declaration of each of those four functions.
- the combined loaded source contains exactly one declaration of `bottomNav`.
- canonical bottom-nav source contains routes `home, explore, compose, tools, profile` and does not contain a Schedule nav item.
- canonical bottom-nav hides on `hand:*`, `tool:*`, `roomcreate`, and `room:*`.

Run: `node tests/refactor-structure.test.mjs`
Expected: FAIL on legacy profile declarations and multiple `bottomNav` declarations.

- [ ] **Step 2: Remove the legacy profile generation**

Delete the shadowed profile/career rendering block from `profile-compose.js`, preserving compose/hand composer and any modal/form helper still referenced by wiring. Keep the v2 profile functions in `profile-v2.js`.

- [ ] **Step 3: Replace the navigation override chain with one canonical function**

In `profile-compose.js`, collapse the current early `bottomNav()`, `pokerRoomBottomNavV1()`, and final wrapper into one `bottomNav()`. Its visible items are Home / Explore / Compose / Tools / Profile. Compose keeps `data-open-create-menu`. It returns an empty string for hand detail/tool detail/room create/room detail routes.

Remove the `bottomNav()` override from `profile-v2.js`.

- [ ] **Step 4: Run the test and confirm GREEN**

Run: `node tests/refactor-structure.test.mjs`
Expected: PASS for Tasks 1-2 assertions.

- [ ] **Step 5: Commit**

Commit message: `refactor: unify profile and navigation ownership`

### Task 3: Consolidate base/feed CSS and establish shared UI tokens

**Files:**
- Modify: `tests/refactor-structure.test.mjs`
- Modify: `base.css:1-96`
- Modify: `feed.css:1-440`

**Interfaces:**
- Consumes: existing class names emitted by `core.js`, `feed.js`, and the canonical bottom nav.
- Produces: stable shared tokens in `:root`; base shell/navigation primitives in `base.css`; feed/Explore/store/schedule styles in `feed.css`.

- [ ] **Step 1: Add token/ownership assertions and confirm RED**

Assert that `:root` exposes canonical tokens for app max width, surface colors, text hierarchy, border, shared radii, and bottom-nav height, and that the store finder / Explore schedule selectors remain in `feed.css`.

Run: `node tests/refactor-structure.test.mjs`
Expected: FAIL because the complete canonical token set does not yet exist.

- [ ] **Step 2: Normalize base tokens without intentional visual changes**

Extend the existing `:root` rather than creating a second token block. Replace repeated literals only where values are exactly equivalent. Keep responsive/media overrides intact. Merge only same-scope duplicate declarations whose later cascade currently wins; do not flatten legitimate media-query overrides.

- [ ] **Step 3: Keep feed-specific ownership in feed.css**

Group current Home, Explore, Poker Room feed-card, nearby-store, and Explore Schedule rules by feature comment. Collapse only exact same-scope duplicate selectors and preserve the final effective declarations.

- [ ] **Step 4: Run structural verification**

Run: `node tests/refactor-structure.test.mjs`
Expected: PASS for Tasks 1-3 assertions.

- [ ] **Step 5: Commit**

Commit message: `refactor: normalize shared and feed styles`

### Task 4: Consolidate forms, Poker Tools, and Hold'em style generations

**Files:**
- Modify: `tests/refactor-structure.test.mjs`
- Modify: `forms.css:1-398`
- Modify: `poker-tools.css:1-263`
- Modify: `holdem-table.css:1-122`

**Interfaces:**
- Consumes: unchanged class names from profile/compose/room/tool/Hold'em renderers.
- Produces: one effective same-scope rule per known duplicated component while preserving responsive overrides.

- [ ] **Step 1: Add targeted duplicate-style assertions and confirm RED**

Add source assertions for the duplicates that are safe to canonicalize, including the two same-scope `.session-row` base blocks in `poker-tools.css`. Explicitly exempt responsive overrides such as `.holdem-board` under `@media(max-width:360px)` and `.poker-table.portrait-table` responsive sizing.

Run: `node tests/refactor-structure.test.mjs`
Expected: FAIL on at least the current split `.session-row` definition.

- [ ] **Step 2: Merge safe forms/tool duplicates**

Consolidate same-scope repeated component blocks by carrying forward the later winning declarations. Keep auth, compose, profile forms, room forms/modals in `forms.css`; keep all calculator/tracker/range/ICM styles in `poker-tools.css`.

- [ ] **Step 3: Preserve Hold'em responsive specialization**

Only remove exact redundant declarations in `holdem-table.css`; retain media-query variants and live-table state selectors.

- [ ] **Step 4: Run structural verification**

Run: `node tests/refactor-structure.test.mjs`
Expected: PASS for Tasks 1-4 assertions.

- [ ] **Step 5: Commit**

Commit message: `refactor: consolidate feature style generations`

### Task 5: Remove orphaned references, verify loaded assets, and release

**Files:**
- Modify: `tests/refactor-structure.test.mjs`
- Modify if proven orphaned: `wire.js:1-693`
- Modify if proven orphaned: `core.js`
- Modify: `index.html:8-29`

**Interfaces:**
- Consumes: canonical view functions and unchanged public `data-*` attributes from Tasks 1-4.
- Produces: clean v41 static asset graph with all existing features loaded once.

- [ ] **Step 1: Add final source-graph assertions and confirm any remaining RED**

Assert:
- every local `<script src>` and `<link href>` in `index.html` points to a repository file.
- no merge-conflict markers exist in loaded HTML/CSS/JS.
- no removed versioned helper names remain referenced.
- the Hold'em engine/UI/wire files and Equity/ICM/Preflop modules remain loaded.
- the intended Explore/store/schedule and Tools-navigation source markers remain present.

Run: `node tests/refactor-structure.test.mjs`
Expected: FAIL only for references actually left orphaned by earlier cleanup; if this new assertion set is already green, record that finding and do not invent code changes.

- [ ] **Step 2: Delete only proven orphaned handlers/helpers**

Search `wire.js` and `core.js` for references to deleted legacy functions. Remove code only when the structural test/source search proves it is unreachable and not a public event contract.

- [ ] **Step 3: Bump the static release cache key**

Change all local CSS/JS asset query versions in `index.html` from `v=40` to `v=41`. Do not change file order unless a removed override makes the order unnecessary and the structural test proves all references remain available.

- [ ] **Step 4: Run full verification**

Run:
- `node tests/refactor-structure.test.mjs`
- `node --check core.js`
- `node --check feed.js`
- `node --check profile-compose.js`
- `node --check profile-v2.js`
- `node --check poker-room.js`
- `node --check holdem-table-ui.js`
- `node --check holdem-wire.js`
- `node --check poker-tools.js`
- `node --check wire.js`
- `node --check equity-engine.js`
- `node --check icm-calculator.js`
- `node --check preflop-range-data.js`
Expected: every command exits 0 and the structural test reports all assertions passing.

- [ ] **Step 5: Commit**

Commit message: `release: consolidate Pokercat UI codebase v41`

- [ ] **Step 6: Verify deployment**

Confirm the GitHub Pages workflow for the release commit finishes with conclusion `success`. Only then report the v41 deployment URL.

## Completion contract

The plan is complete only when the structural test and every JavaScript syntax check pass on the release commit, the GitHub Pages workflow succeeds, the known global override chains are gone, the fourth bottom-nav item is Tools, and Schedule remains available inside Explore.
