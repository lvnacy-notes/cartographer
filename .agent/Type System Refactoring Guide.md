# Type System Refactoring Guide - Cartographer Plugin

## Overview

This document outlines opportunities to improve type organization, eliminate duplicates, and strengthen separation of concerns in the Cartographer plugin's type system.

---

## 1. Duplicate FilterState Types

### Current State
`FilterState` appears in **TWO** places with different definitions:

**In `componentTypes.ts`:**
```typescript
export interface FilterState {
  [fieldKey: string]: unknown;
}
```

**In `dynamicWork.ts`:**
```typescript
export interface FilterState {
  status?: string[];
  author?: string[];
  year?: [number, number];
  text?: string;
  [key: string]: string | string[] | [number, number] | undefined;
}
```

### Problem
- Same name, different purposes
- Confusing for developers
- Can lead to import errors

### Recommendation
Keep the generic one in `componentTypes.ts` and rename the specific one in `dynamicWork.ts`:

```typescript
// In dynamicWork.ts
export interface FilterCriteria {
  status?: string[];
  author?: string[];
  year?: [number, number];
  text?: string;
  [key: string]: string | string[] | [number, number] | undefined;
}
```

Or alternatively: `QueryFilter`, `ItemFilterCriteria`, `CatalogFilterCriteria`

### Action Items
- [x] Rename `FilterState` in `dynamicWork.ts` to `QueryFilter`
- [x] Update all usages of the old name
- [x] Update barrel export in `index.ts`
- [ ] Update JSDoc comments

---

## 2. StatusCount vs StatusGroup

### Current State

**In `componentTypes.ts`:**
```typescript
export interface StatusCount {
  status: string;
  count: number;
  percentage: number;
}
```

**In `filterTypes.ts`:**
```typescript
export interface StatusGroup {
  statusValue: string | number | boolean | null;
  displayLabel: string;
  stats: StatusStatistics;
}
```

### Problem
`StatusCount` appears to be a simplified/legacy version of `StatusGroup` with overlapping functionality.

### Investigation Needed
- [x] Search codebase for `StatusCount` usage
- [x] Determine if it's actually used anywhere
- [x] Check if it's just legacy code

### Recommendation
**If `StatusCount` is unused:** Remove it entirely

**If `StatusCount` is used:** Document why both exist and when to use each:
```typescript
/**
 * Simple status count (legacy - prefer StatusGroup for new code)
 * @deprecated Use StatusGroup instead
 */
export interface StatusCount { ... }
```

### Action Items
- [x] Audit codebase for `StatusCount` usage
- [x] If unused, delete from `componentTypes.ts` and barrel export
- [/] If used, add deprecation notice and migration plan
- [/] Update JSDoc to clarify differences if both are kept

---

## 3. Statistics Types Consolidation

### Current State
Statistics are scattered across multiple files with overlapping purposes:

**In `dynamicWork.ts`:**
```typescript
export interface CatalogStatistics {
  total: number;
  byStatus?: Record<string, number>;
  byAuthor?: Record<string, number>;
  yearRange?: [number, number];
  totalWordCount?: number;
  averageWordCount?: number;
}
```

**In `filterTypes.ts`:**
```typescript
export interface StatusStatistics {
  count: number;
  totalWordCount: number;
  yearRange: { min: number | null; max: number | null };
  averageWordCount: number;
}

export interface TotalStats {
  totalCount: number;
  totalWords: number;
  yearRange: { min: number | null; max: number | null };
  averageWords: number;
  validYearCount: number;
  validWordCount: number;
}
```

### Problem
- Three different statistics interfaces with similar fields
- Unclear when to use which
- Different naming conventions (`totalWordCount` vs `totalWords`)

### Analysis
- `CatalogStatistics` = Catalog-wide summary statistics
- `StatusStatistics` = Group-specific statistics (for one status value)
- `TotalStats` = Aggregate statistics across all groups

### Recommendation
Consider if these can be unified or at least use consistent naming:

**Option 1: Keep all three but rename for clarity**
```typescript
// In a new statistics.ts file or in filterTypes.ts
export interface CatalogSummary {
  total: number;
  byStatus?: Record<string, number>;
  byAuthor?: Record<string, number>;
  yearRange?: [number, number];
  totalWordCount?: number;
  averageWordCount?: number;
}

export interface GroupStatistics {
  count: number;
  totalWordCount: number;
  yearRange: { min: number | null; max: number | null };
  averageWordCount: number;
}

export interface AggregateStatistics {
  totalCount: number;
  totalWords: number;
  yearRange: { min: number | null; max: number | null };
  averageWords: number;
  validYearCount: number;
  validWordCount: number;
}
```

**Option 2: Create a unified statistics interface**
```typescript
export interface Statistics {
  count: number;
  totalWordCount: number;
  averageWordCount: number;
  yearRange: { min: number | null; max: number | null };
  validYearCount?: number;
  validWordCount?: number;
  byStatus?: Record<string, number>;
  byAuthor?: Record<string, number>;
}
```

### Action Items
- [x] Decide on naming convention: `totalWordCount` vs `totalWords`
- [x] Choose Option 1 (keep separate) or Option 2 (unify)
- [x] If keeping separate, rename for clarity
- [x] Update all usages across codebase
- [x] Add comprehensive JSDoc explaining when to use each
- [x] Consider creating a dedicated `statistics.ts` file

---

## 4. Year Range Inconsistency

### Current State
Year ranges are represented in **TWO** different ways:

**Tuple format:**
```typescript
yearRange?: [number, number];  // [min, max]
```

**Object format:**
```typescript
yearRange: { min: number | null; max: number | null };
```

### Problem
- Inconsistent representation makes code harder to maintain
- Can't easily share utility functions between the two
- Confusing for developers

### Recommendation
**Pick the object format** because:
- More explicit and self-documenting
- Handles null values more gracefully
- Easier to extend (e.g., add `median`, `mode`, etc.)
- Better TypeScript type checking

```typescript
// Standard year range type
export type YearRange = {
  min: number | null;
  max: number | null;
};

// Use everywhere
export interface StatusStatistics {
  count: number;
  totalWordCount: number;
  yearRange: YearRange;  // ✅ Consistent
  averageWordCount: number;
}

export interface CatalogSummary {
  total: number;
  yearRange: YearRange;  // ✅ Consistent
  // ...
}
```

### Action Items
- [x] Create `YearRange` type in appropriate file
- [x] Search codebase for `[number, number]` year range tuples
- [x] Replace all tuples with `YearRange` object format
- [x] Update utility functions to work with object format
- [x] Update JSDoc comments

---

## 5. Split types.ts into Focused Files

### Current State
`types.ts` contains a mix of:
- Type guards (`isDateLike`)
- Converters (`toDate`, `coerceToValidDateValue`)
- Getters (`getTypedField`)
- Formatters (`parseFieldValue`, `formatFieldValue`)

### Problem
- Single file with mixed concerns
- Harder to find specific utilities
- Violates single responsibility principle

### Recommendation
Split into focused files:

```
types/
├── typeGuards.ts          # Type checking functions
├── fieldUtils.ts          # Parsing/formatting utilities
└── (remove types.ts or keep for misc utilities)
```

**`typeGuards.ts`:**
```typescript
/**
 * Type Guards and Type Checking Utilities
 * Runtime type validation functions
 */

export function isDateLike(value: unknown): value is string | number | Date {
  // ...
}

// Other type guards
```

**`fieldUtils.ts`:**
```typescript
/**
 * Field Utility Functions
 * Parsing, formatting, and conversion utilities for catalog fields
 */

export function toDate(value: unknown): Date | null {
  // ...
}

export function coerceToValidDateValue(
  value: string | number | boolean | string[] | Date | null | undefined
): string | number | Date | null {
  // ...
}

export function getTypedField<T>(
  item: CatalogItem,
  fieldKey: string,
  settings: CartographerSettings
): T | null {
  // ...
}

export function parseFieldValue(...) { ... }
export function formatFieldValue(...) { ... }
```

### Action Items
- [x] Create `typeGuards.ts` and move type checking functions
- [x] Create `fieldUtils.ts` and move parsing/formatting utilities
- [x] Update barrel export (`index.ts`)
- [x] Update imports across codebase
- [x] Add comprehensive JSDoc to new files
- [x] Delete or repurpose `types.ts`

---

## 6. Base Component Props Interface

### Current State
All component props repeat the same three properties:
```typescript
export interface StatusDashboardProps {
  items: CatalogItem[];
  schema: CatalogSchema;
  settings: CartographerSettings;
  // ... specific props
}

export interface WorksTableProps {
  items: CatalogItem[];
  schema: CatalogSchema;
  settings: CartographerSettings;
  // ... specific props
}

// etc.
```

### Problem
- Lots of repetition
- Common pattern not made explicit
- If core props change, must update many interfaces

### Recommendation
Create a base interface and extend it:

```typescript
/**
 * Base props shared by all dashboard components.
 * Every component receives items, schema, and settings.
 */
export interface BaseComponentProps {
  /** All items from active library */
  items: CatalogItem[];
  /** Library schema with field definitions */
  schema: CatalogSchema;
  /** Full settings object (provides component configuration) */
  settings: CartographerSettings;
}

/**
 * Props for the StatusDashboard component
 */
export interface StatusDashboardProps extends BaseComponentProps {
  /** Which field to group by (usually catalog-status) */
  statusField: string;
  /** Optional: click handler for filtering by status */
  onStatusClick?: (status: string) => void;
}

/**
 * Props for the WorksTable component
 */
export interface WorksTableProps extends BaseComponentProps {
  /** Current sort column key (optional) */
  sortColumn?: string;
  /** Sort direction - true for descending, false for ascending (optional) */
  sortDesc?: boolean;
  /** Callback fired when sort column/direction changes */
  onSort?: (column: string, desc: boolean) => void;
  // ...
}
```

### Benefits
- DRY (Don't Repeat Yourself)
- Makes common pattern explicit
- Easier to add/modify core props
- Better TypeScript IntelliSense

### Action Items
- [x] Create `BaseComponentProps` interface in `componentTypes.ts`
- [x] Update all component props interfaces to extend base
- [x] Add JSDoc explaining the base pattern
- [ ] Verify TypeScript compilation still works
- [ ] Update TypeDoc documentation

---

## 7. Suggested File Structure

### Current Structure
```
types/
├── index.ts
├── commands.ts
├── componentTypes.ts
├── dynamicWork.ts
├── filterTypes.ts
├── settings.ts
└── types.ts
```

### Proposed Structure
```
types/
├── index.ts                    # Barrel export
├── settings.ts                 # CartographerSettings, schemas, config
├── catalogItem.ts              # CatalogItem class + builders (renamed from dynamicWork.ts)
├── componentProps.ts           # All component props (renamed from componentTypes.ts)
├── statistics.ts               # All statistics types (NEW - consolidated)
├── filters.ts                  # Filter types (renamed from filterTypes.ts)
├── typeGuards.ts              # Type checking functions (NEW - split from types.ts)
├── fieldUtils.ts              # Field parsing/formatting (NEW - split from types.ts)
└── commands.ts                # Command definitions
```

### Rationale for Changes

**`dynamicWork.ts` → `catalogItem.ts`:**
- More descriptive name
- Clearer purpose: contains the `CatalogItem` class
- "dynamicWork" is vague

**`componentTypes.ts` → `componentProps.ts`:**
- More specific name
- Clearly indicates it contains component props interfaces
- Matches common React/Preact naming conventions

**`filterTypes.ts` → `filters.ts`:**
- Shorter, cleaner name
- Still clear about purpose
- Consistent with simplified naming

**New: `statistics.ts`:**
- Consolidates all statistics-related types
- Single source of truth for stats interfaces
- Easier to find and maintain

**New: `typeGuards.ts` & `fieldUtils.ts`:**
- Splits `types.ts` into focused modules
- Clear separation of concerns
- Easier to locate specific utilities

### Action Items
- [x] Create new files with appropriate content
- [x] Move interfaces/functions to new locations
- [x] Update all imports across codebase
- [x] Update barrel export (`index.ts`)
- [x] Delete old files
- [x] Update JSDoc module documentation
- [ ] Run TypeScript compiler to catch any issues
- [ ] Update this guide with actual implementation notes

---

## Priority Order

### High Priority (Do First)
1. **Resolve `FilterState` duplicate** - Actively causing confusion
2. **Audit and remove `StatusCount`** - Potential dead code
3. **Year Range standardization** - Affects many interfaces

### Medium Priority (Do Soon)
4. **Statistics consolidation** - Improves maintainability
5. **Split `types.ts`** - Better organization

### Low Priority (Nice to Have)
6. **Base component props** - DRY improvement but not critical
7. **File renaming** - Improves clarity but requires broad changes

---

## Testing Strategy

After each change:
- [ ] Run TypeScript compiler (`tsc --noEmit`)
- [ ] Run ESLint to catch any issues
- [ ] Run test suite if available
- [ ] Manually test affected components
- [ ] Update TypeDoc and verify output

---

## Notes & Decisions

_(Use this section to track decisions made during refactoring)_

### Date: [YYYY-MM-DD]
**Decision:** 
**Rationale:** 
**Files affected:**

---

## Completion Checklist

- [x] All duplicate types resolved
- [x] Dead code removed
- [x] Year ranges standardized
- [x] Statistics types consolidated
- [x] `types.ts` split into focused files
- [x] Base props interface implemented
- [x] File structure reorganized (if doing this)
- [x] All imports updated
- [x] Barrel exports updated
- [ ] ESLint passing
- [ ] TypeScript compiling without errors
- [ ] TypeDoc documentation regenerated
- [ ] Testing completed
- [ ] This guide updated with final decisions