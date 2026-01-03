# Phase 1 Cleanup Session Guide

**Purpose:** Identify and document all lint/build errors in the codebase prepared during Phase 1 setup, creating a reference guide of errors, patches, and fixes for systematic resolution.

**Status:** Awaiting devcontainer environment with Node.js

---

## Session Objectives

1. **Run full build** to identify all TypeScript compilation errors
2. **Run eslint** to identify all linting issues
3. **Document each error** with:
   - Error message and location
   - Root cause analysis
   - Before/after code examples
   - Patch details
4. **Create reference document** at `.agent/phase-one/ERRORS_AND_PATCHES.md` for future reference
5. **Apply fixes** systematically to clean up codebase

---

## Setup Instructions (for devcontainer agent)

### Prerequisites
- Node.js 18+ available in container
- npm installed
- Current directory: `/workspace/context-library-service`

### Initial Build Check

```bash
# Install dependencies if not already done
npm install

# Run production build to identify TypeScript errors
npm run build

# Run linter for code quality issues
npm run lint
```

### Expected Outcomes

The build and lint will likely identify issues in these categories:
- **Type mismatches** (CatalogItem, FilterState, SortState usage)
- **Missing imports** (observable functions, types)
- **React hook patterns** (useDataLoading is named like a hook but doesn't follow React patterns)
- **Obsidian API integration** (App, TFile usage)
- **Configuration/schema references** (settings object structure)

---

## Known Codebase Context

### Key Files to Review
- [src/hooks/useDataLoading.ts](../../src/hooks/useDataLoading.ts) - Data loading and filtering functions
- [src/types/dynamicWork.ts](../../src/types/dynamicWork.ts) - CatalogItem and state interfaces
- [src/types/settings.ts](../../src/types/settings.ts) - DatacoreSettings interface
- [src/types/types.ts](../../src/types/types.ts) - Utility functions
- [src/queries/queryFunctions.ts](../../src/queries/queryFunctions.ts) - Query operations
- [src/main.ts](../../src/main.ts) - Plugin entry point
- [src/config/presets.ts](../../src/config/presets.ts) - Configuration presets

### Architecture Notes
- **No React dependency** - This is an Obsidian plugin, not a React app
- **Configuration-driven** - All behavior configured via presets
- **TypeScript strict mode** - `tsconfig.json` has `"strict": true`
- **ESBuild bundler** - esbuild.config.mjs handles compilation

---

## Error Documentation Template

When documenting errors, use this format in ERRORS_AND_PATCHES.md:

```markdown
### Error #[N]: [Brief description]

**Location:** [file.ts#L123]

**Error Message:**
```
[Full error message from build/lint]
```

**Root Cause:**
[Why this error occurs]

**Before (incorrect code):**
```typescript
[Code that causes the error]
```

**After (fixed code):**
```typescript
[Corrected code]
```

**Patch Details:**
- Line range: [123-125]
- Files affected: [list of files]
- Dependencies: [any related changes needed elsewhere]
```

---

## Next Steps (for devcontainer agent)

1. Run `npm install` to ensure all dependencies are installed
2. Run `npm run build` and capture all errors
3. Run `npm run lint` and capture all warnings/errors
4. For each error:
   - Open the referenced file
   - Understand the issue in context
   - Create before/after code example
   - Document in ERRORS_AND_PATCHES.md
5. Apply all fixes to source files
6. Run build again to verify cleanup
7. Create summary of all changes made

---

## Quick Reference: File Structure

```
src/
  main.ts                 # Plugin lifecycle, settings, commands
  index.ts               # Export index
  config/
    presets.ts           # 4 catalog presets (Pulp Fiction, etc)
    settingsManager.ts   # Settings persistence and UI
  types/
    settings.ts          # DatacoreSettings interface
    dynamicWork.ts       # CatalogItem, FilterState, SortState
    types.ts             # Utility functions (parseFieldValue, etc)
  hooks/
    useDataLoading.ts    # Data loading and filtering functions
  queries/
    queryFunctions.ts    # Query operations (filter, sort, group, etc)
  components/
    DatacoreComponentView.ts
    StatusDashboardView.ts
    WorksTableView.ts
  styles/
    components.css
```

---

## Build Commands Reference

```bash
npm install              # Install dependencies
npm run dev             # Watch mode (rebuilds on file change)
npm run build           # Production build
npm run lint            # Run eslint
npm run esbuild         # Manual esbuild (if needed)
```

---

## Notes for Agent

- This plugin targets **Obsidian Community Plugin** format
- Entry point compiles to `main.js` and is loaded by Obsidian
- No Node/Electron APIs used (should work on mobile)
- All external dependencies bundled into `main.js` by esbuild
- Settings managed through Obsidian's plugin settings UI

**Start with:** `cd /workspace/context-library-service && npm install && npm run build`

Then systematically document and fix each error found.
