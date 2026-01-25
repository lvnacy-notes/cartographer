---
date: 2026-01-23
title: "Cartographer Session 4 Spec - Core Components Phase 2"
document-type: session-specification
phase: 6
phase-step: "6.4 - Core Components Phase 2"
status: "PLANNED"
tags:
  - phase-6
  - session-4
  - components
  - core
---

###############################################################################
##                                                                           ##
##   █████████████████████████████████████████████████████████████████████   ##
##   ██                                                                 ██   ##
##   ██   ✧･ﾟ: *✧･ﾟ:* THE SUPREME DIRECTIVE *:･ﾟ✧*:･ﾟ✧                  ██   ##
##   ██                                                                 ██   ##
##   ██   1.  MAKE NO FUCKING ASSUMPTIONS.                              ██   ##
##   ██   2.  READ THE FUCKING DOCS.                                    ██   ##
##   ██   3.  DON'T MAKE SHIT UP.                                       ██   ##
##   ██   4.  KEEP IT FUCKING SIMPLE.                                   ██   ##
##   ██   5.  DON'T BE FUCKING STUPID.                                  ██   ##
##   ██                                                                 ██   ##
##   ██   ✧ COMPLIANCE IS NOT OPTIONAL. VIOLATIONS ARE NOTED. ✧         ██   ##
##   ██                                                                 ██   ##
##   █████████████████████████████████████████████████████████████████████   ##
##                                                                           ##
###############################################################################

# Cartographer: Session 4 Implementation Spec

## Core Components Phase 2: PublicationDashboard, AuthorCard, BackstagePassPipeline

**Session Goal:** Build three advanced dashboard components that extend the configuration-driven architecture, support real editorial workflows, and integrate with the existing library/catalog system.

**Timeline:** 1 week (estimate: 15-20 hours)

**Outputs:** 3 pure Preact components, comprehensive unit + integration tests, Storybook stories, tested with real Pulp Fiction and multi-library data

---

## 📌 Quick Status Reference

- **Session 3.5 Status:** ✅ COMPLETE — All Phase 1 components, hooks, settings, and Storybook infra in place
- **Session 4 Status:** ⏳ PLANNED — Advanced components to be implemented
- **Components:** ⏳ PublicationDashboard, ⏳ AuthorCard, ⏳ BackstagePassPipeline (to be built)
- **Tests:** ⏳ To be written (unit, integration, configuration, edge cases)
- **Storybook:** ⏳ To be updated with new stories for all components
- **Type Safety:** Full TypeScript, all SchemaField types supported
- **Build Target:** Pure components (Obsidian wrapper deferred to Session 5)

---

## 🎯 Success Criteria

### Functional
- All 3 new components render without errors
- Components read configuration from library settings
- Components display live catalog data correctly
- All SchemaField types handled (string, number, date, boolean, array, wikilink-array, object)
- Real-time updates when data changes (subscriptions working)
- Support for multi-library switching and schema differences
- Editorial workflow logic (BackstagePassPipeline) is correct and configurable

### Code Quality
- 100% TypeScript (strict mode)
- Pure components (no hardcoded field names)
- Configuration-driven (read schema from settings)
- Full JSDoc coverage (all exports)
- All functions testable in isolation
- Zero implicit `any` types
- AGENTS.md compliance

### Testing
- Unit tests for each component (≥12 per component)
- Integration tests (multi-component flows, edge cases)
- All tests pass with Node.js native runner
- Mock/fixture data matches real library schema (Pulp Fiction, multi-library)
- Coverage: All major code paths tested

### Styling & UX
- Responsive design with 600px mobile breakpoint
- Obsidian CSS variable theming
- Mobile card layouts for all components
- Hover/focus states and transitions
- Accessibility: keyboard navigation, screen reader support

### Performance
- Works smoothly with 31+ item catalogs (tested with real data)
- Component render time < 200ms (target)
- Re-render on data change < 100ms (target)
- Filter/sort/group operations < 100ms (target)

---

## 📊 Component Specifications

### 1. PublicationDashboard Component

**Purpose:** Display all works for a specific publication, with advanced filtering, grouping, and statistics.

**Location:** `src/components/PublicationDashboard.tsx`

**Props:**
```typescript
interface PublicationDashboardProps {
  items: CatalogItem[];                    // All items from active library
  schema: CatalogSchema;                   // Library schema
  publicationField: string;                // Field to group/filter by (e.g., 'publications')
  publicationName: string;                 // Current publication (wikilink or string)
  settings: CartographerSettings;              // Full settings (for component config)
  onWorkClick?: (workId: string) => void;  // Optional: click handler for work selection
}
```

**Behavior:**
- Filters items where publicationField contains publicationName (supports array/wikilink-array)
- Groups by status or year (configurable)
- Displays publication statistics (work count, total/average word count, year range)
- Responsive layout (table on desktop, cards on mobile)
- Optional: export/download list as CSV/JSON

**Configuration:**
- `settings.dashboards.publicationDashboard.enabled`
- `settings.dashboards.publicationDashboard.displayColumns`
- `settings.dashboards.publicationDashboard.groupByField`
- `settings.dashboards.publicationDashboard.showStats`

**Test Cases:**
- Renders with valid items and schema
- Filters correctly by publication
- Handles empty/invalid publication
- Groups by status/year as configured
- Statistics calculated accurately
- Responsive on mobile

---

### 2. AuthorCard Component

**Purpose:** Display all works by a specific author, with statistics and publication breakdowns.

**Location:** `src/components/AuthorCard.tsx`

**Props:**
```typescript
interface AuthorCardProps {
  items: CatalogItem[];                    // All items from active library
  schema: CatalogSchema;                   // Library schema
  authorField: string;                     // Field to filter by (e.g., 'authors')
  authorName: string;                      // Current author (string)
  settings: CartographerSettings;              // Full settings (for component config)
  onWorkClick?: (workId: string) => void;  // Optional: click handler for work selection
}
```

**Behavior:**
- Filters items where authorField contains authorName (supports array)
- Displays author statistics (work count, total/average word count, publication count)
- Lists works with configurable columns
- Groups by publication or status (configurable)
- Responsive layout (table/cards)
- Optional: export/download list

**Configuration:**
- `settings.dashboards.authorCard.enabled`
- `settings.dashboards.authorCard.displayColumns`
- `settings.dashboards.authorCard.groupByField`
- `settings.dashboards.authorCard.showStatistics`

**Test Cases:**
- Renders with valid items and schema
- Filters correctly by author
- Statistics calculated accurately
- Handles empty/invalid author
- Responsive on mobile

---

### 3. BackstagePassPipeline Component

**Purpose:** Editorial workflow dashboard for tracking works through custom pipeline stages (e.g., BP candidate, approved, published).

**Location:** `src/components/BackstagePassPipeline.tsx`

**Props:**
```typescript
interface BackstagePassPipelineProps {
  items: CatalogItem[];                    // All items from active library
  schema: CatalogSchema;                   // Library schema
  pipelineConfig: BackstagePassPipelineConfig; // Stages and display fields
  settings: CartographerSettings;              // Full settings (for component config)
  onWorkClick?: (workId: string) => void;  // Optional: click handler for work selection
}
```

**Behavior:**
- Renders pipeline stages as columns or swimlanes
- Filters/assigns works to stages based on pipelineConfig
- Displays stage statistics (count, word count, etc.)
- Drag-and-drop or button-based stage transitions (optional, if feasible)
- Responsive layout (horizontal scroll/swimlanes on mobile)

**Configuration:**
- `settings.dashboards.backstagePassPipeline.enabled`
- `settings.dashboards.backstagePassPipeline.stages[]`
- `settings.dashboards.backstagePassPipeline.displayFields`

**Test Cases:**
- Renders with valid items and schema
- Assigns works to correct stages
- Stage statistics calculated accurately
- Handles empty pipeline or no works in stage
- Responsive on mobile

---

## 🧪 Testing Strategy

### Test Framework
- **Runner:** Node.js native test framework (`node:test`)
- **Assertions:** `node:assert/strict`
- **Pattern:** Follow existing tests in `tests/` directory

### Test File Structure
```
tests/components/
├── PublicationDashboard.test.ts
├── AuthorCard.test.ts
├── BackstagePassPipeline.test.ts
├── integration.test.ts (expanded)
└── configuration.test.ts (expanded)

tests/fixtures/
├── catalogSchema.ts
├── catalogItems.ts
├── defaultSettings.ts
└── mockData.ts
```

### Unit Tests per Component
- ≥12 tests per component (rendering, filtering, grouping, stats, edge cases, mobile)
- Edge cases: empty data, missing fields, invalid config, multi-library
- Integration: multi-component flows, settings changes, library switching

---

## 🎨 Storybook: Component Documentation & Demos

### Update Storybook for New Components

**Tasks:**
- Create stories for each new component:
  - `src/components/PublicationDashboard.stories.ts`
  - `src/components/AuthorCard.stories.ts`
  - `src/components/BackstagePassPipeline.stories.ts`
- Each story should include:
  - Default state (with real/fixture data)
  - Empty state
  - Large data set (100+ items)
  - Custom configuration variants (columns, groupings, stages)
  - Mobile viewport (600px)
  - Props documentation (JSDoc → Storybook controls)
  - Edge case demos (missing fields, invalid config)
- Add/expand fixtures in `.storybook/fixtures/` as needed
- Ensure all controls and documentation are auto-generated from JSDoc
- Test accessibility (a11y addon)
- Validate mobile and desktop rendering

**Exit Criteria:**
- All 3 new components have 8+ story variations each
- Storybook controls and documentation are up to date
- Mobile and accessibility testing complete
- Storybook builds and runs without errors

---

## 🏗️ Implementation Roadmap

### Phase 1: Setup & Scaffolding (0.5 day)
- [ ] Create component files (PublicationDashboard, AuthorCard, BackstagePassPipeline)
- [ ] Create test files and fixtures
- [ ] Create Storybook stories (structure + placeholder stories)

### Phase 2: PublicationDashboard (1-2 days)
- [ ] Implement component logic (filtering, grouping, stats)
- [ ] Implement rendering (table/card layout, responsive)
- [ ] Write unit tests (≥12)
- [ ] CSS styling
- [ ] Storybook stories

### Phase 3: AuthorCard (1-2 days)
- [ ] Implement component logic (filtering, stats, grouping)
- [ ] Implement rendering (table/cards, responsive)
- [ ] Write unit tests (≥12)
- [ ] CSS styling
- [ ] Storybook stories

### Phase 4: BackstagePassPipeline (1-2 days)
- [ ] Implement component logic (pipeline assignment, stats)
- [ ] Implement rendering (swimlanes/columns, responsive)
- [ ] Write unit tests (≥12)
- [ ] CSS styling
- [ ] Storybook stories

### Phase 5: Hooks & Integration (1 day)
- [ ] Write/expand integration tests (multi-component, settings, library switching)
- [ ] Extract/extend hooks as needed

### Phase 6: Dynamic Configuration & Polish (0.5 day)
- [ ] Ensure all components respect active library schema/settings
- [ ] Test with multiple libraries and schemas
- [ ] Polish CSS, accessibility, and mobile responsiveness
- [ ] Update documentation (README, IMPLEMENTATION.md, STORYBOOK-GUIDE.md)

### Phase 7: Verification, Build, Lint, Test (final step)
- [ ] Run full build (`npm run build`)
- [ ] Run lint (`npm run lint`)
- [ ] Run all tests (`npm run test`)
- [ ] Run Storybook (`npm run storybook`)
- [ ] Validate all exit criteria

---

## 📋 Implementation Guidelines

- TypeScript with `"strict": true`
- Zero implicit `any` types
- All types explicit or inferred
- Curly braces on all control structures
- No ESLint-disable comments
- Prefer `??` over `||` for nullish coalescing
- Use guard clauses instead of non-null assertions (!)
- Async/await over promise chains
- Full JSDoc on all public APIs and exports
- Unit and integration tests for all logic
- Storybook stories for all components and variants
- Accessibility and mobile responsiveness required

---

## 🔄 Success Criteria

Session 4 is complete when:
- All 3 new components are fully implemented, tested, and documented
- All tests pass (unit, integration, configuration)
- Storybook is updated with all new stories and controls
- All components are mobile responsive and accessible
- All code is linted, type-checked, and builds cleanly
- Documentation is updated (README, IMPLEMENTATION.md, STORYBOOK-GUIDE.md)
- Performance targets are met for all components

---

**Document Version:** 1.0 (Session 4 Planned)
**Created:** January 23, 2026
**Next Checkpoint:** End of Session 4 (verification, build, lint, test)
