# Phase 1 Cleanup: Errors and Patches

**Session Date:** January 2, 2026  
**Status:** In Progress  
**Goal:** Eliminate all explicit `any` types and lint errors from Phase 1 codebase

---

## Summary of Changes

Total errors fixed so far: 76+ (across type system, query functions, hooks, config, and components)

### Change Bundles Applied

**Bundle #1: Explicit Any Type Elimination** (Patches #1-11)
- Replaced `Map<string, any>` with `Map<string, FieldValueType>`
- Replaced `Record<string, any>` with `Record<string, FieldValueType>`
- Replaced function parameters `value: any` with union types
- Updated generic constraints `<T = any>` to `<T extends FieldValueType>`
- Files: dynamicWork.ts, types.ts, queryFunctions.ts, components/DatacoreComponentView.ts

**Bundle #2: Plugin Entry Point** (Patch #18)
- Removed unused imports (App, Editor, MarkdownView, Modal, Notice)
- Removed unused DEFAULT_SETTINGS constant
- Changed UI text to sentence case (commands, ribbon icon)
- Wrapped async callbacks with `void` operator
- Removed detachLeavesOfType calls from onunload

**Bundle #3: Type Assertions & Safety** (Patches #13-15)
- Added proper type assertions for loadData() returning `any`
- Fixed validateSettings parameter type
- Fixed CartographerSettingsTab plugin parameter type

**Bundle #4: Code Organization** (In Progress)
- Moved PRESETS export to end of file (after definitions) to fix use-before-define
- Changing if-statement formatting for curly braces compliance
- Fixing nullish coalescing and optional chaining patterns

## Final Status

**Session End:** January 3, 2026

### Errors Remaining to Fix
1. **TypeScript type errors in queryFunctions.ts** - Date constructor receives incompatible types (boolean, string[])
2. **Unsafe arguments in queryFunctions.ts** - createCompoundFilter takes `any` value parameter
3. **Curly brace warnings** - Multiple if statements need braces
4. **Forbidden non-null assertions** - Multiple files using `!` operator
5. **Nullish coalescing operators** - Should use `??` instead of `||`  
6. **ESLint @typescript-eslint/no-explicit-any** - One remaining in queryFunctions at line 343

### Progress Made This Session
- ✅ Fixed all explicit `any` types in type system (dynamicWork.ts, types.ts)
- ✅ Fixed parser error in useDataLoading.ts (changed return type syntax)
- ✅ Refactored CartographerSettingsTab to separate file (settingsTab.ts)
- ✅ Fixed max-classes-per-file constraint (now 1 per file max)
- ✅ Fixed sentence case in UI text
- ✅ Updated ESLint config with stylistic plugin support
- ✅ Build now gets past parsing stage (TypeScript compilation)
- Reduced errors from 113 to ~45 (60% reduction)

### Next Session Tasks
1. Fix Date constructor type errors in queryFunctions/types
2. Fix createCompoundFilter `any` type handling  
3. Add curly braces to remaining if statements
4. Replace forbidden non-null assertions with proper type guards
5. Replace `||` with `??` for nullish coalescing
6. Verify build completes successfully
7. Run full linter to completion

---

## Patches Applied

### Patch #1: Type System - CatalogItem class (dynamicWork.ts)

**Location:** [src/types/dynamicWork.ts](../../../src/types/dynamicWork.ts#L1-L35)

**Error:** Explicit `any` types throughout CatalogItem class definition

**Root Cause:** Placeholder types needed concrete union types for type safety

**Changes Made:**
- `Map<string, any>` → `Map<string, string | number | boolean | string[] | Date | null>`
- `Record<string, any>` → `Record<string, string | number | boolean | string[] | Date | null>`
- `getField<T = any>()` → `getField<T = string | number | boolean | string[] | Date | null>()`
- `setField(value: any)` → `setField(value: string | number | boolean | string[] | Date | null)`

**Files Affected:** `/workspace/src/types/dynamicWork.ts` (lines 12-35)

---

### Patch #2: Type System - FilterState interface (dynamicWork.ts)

**Location:** [src/types/dynamicWork.ts](../../../src/types/dynamicWork.ts#L52-L59)

**Error:** `[key: string]: any` in FilterState interface

**Root Cause:** Open index signature needed explicit type constraint

**Changes Made:**
- `[key: string]: any` → `[key: string]: string | string[] | [number, number] | undefined`

**Files Affected:** `/workspace/src/types/dynamicWork.ts` (lines 52-59)

---

### Patch #3: Utility Functions - parseFieldValue (types.ts)

**Location:** [src/types/types.ts](../../../src/types/types.ts#L29-L53)

**Errors:**
- `value: any` parameter (explicit any)
- `): any` return type (explicit any)

**Root Cause:** Function needed concrete types for parameters and return

**Changes Made:**
```typescript
// Before
export function parseFieldValue(value: any, fieldType: string): any

// After
export function parseFieldValue(
  value: string | number | boolean | string[] | Date | null | undefined,
  fieldType: string
): string | number | boolean | string[] | Date | null
```

**Files Affected:** `/workspace/src/types/types.ts` (lines 29-53)

---

### Patch #4: Utility Functions - formatFieldValue (types.ts)

**Location:** [src/types/types.ts](../../../src/types/types.ts#L56-L82)

**Errors:**
- `value: any` parameter (explicit any)

**Root Cause:** Similar to parseFieldValue - needed type constraints

**Changes Made:**
```typescript
// Before
export function formatFieldValue(value: any, fieldType: string): string

// After
export function formatFieldValue(
  value: string | number | boolean | string[] | Date | null | undefined,
  fieldType: string
): string
```

**Files Affected:** `/workspace/src/types/types.ts` (lines 56-82)

---

### Patch #5: Query Functions - filterByField (queryFunctions.ts)

**Location:** [src/queries/queryFunctions.ts](../../../src/queries/queryFunctions.ts#L10-L16)

**Error:** `filterByField<T = any>()` - explicit generic `any`

**Root Cause:** Generic type parameter needed proper constraints

**Changes Made:**
```typescript
// Before
export function filterByField<T = any>(
  items: CatalogItem[],
  fieldKey: string,
  value: T
): CatalogItem[]

// After
export function filterByField<T extends string | number | boolean | string[] | Date | null = string>(
  items: CatalogItem[],
  fieldKey: string,
  value: T
): CatalogItem[]
```

**Files Affected:** `/workspace/src/queries/queryFunctions.ts` (lines 10-16)

---

### Patch #6: Query Functions - filterByArrayField (queryFunctions.ts)

**Location:** [src/queries/queryFunctions.ts](../../../src/queries/queryFunctions.ts#L19-L35)

**Error:** `value: any` parameter

**Root Cause:** Function needed concrete type for array field values

**Changes Made:**
```typescript
// Before
export function filterByArrayField(items: CatalogItem[], fieldKey: string, value: any): CatalogItem[]

// After
export function filterByArrayField(
  items: CatalogItem[],
  fieldKey: string,
  value: string | number | boolean
): CatalogItem[]
```

**Files Affected:** `/workspace/src/queries/queryFunctions.ts` (lines 19-35)

---

### Patch #7: Query Functions - groupByField (queryFunctions.ts)

**Location:** [src/queries/queryFunctions.ts](../../../src/queries/queryFunctions.ts#L136-L153)

**Error:** `Map<any, CatalogItem[]>` return type

**Root Cause:** Map key type needed explicit union

**Changes Made:**
```typescript
// Before
): Map<any, CatalogItem[]>

// After
): Map<string | number | boolean | string[] | Date | null, CatalogItem[]>
```

**Files Affected:** `/workspace/src/queries/queryFunctions.ts` (lines 136-153)

---

### Patch #8: Query Functions - groupByArrayField (queryFunctions.ts)

**Location:** [src/queries/queryFunctions.ts](../../../src/queries/queryFunctions.ts#L157-L177)

**Errors:**
- `Map<any, CatalogItem[]>` return type
- `item.getField<any[]>(fieldKey)` explicit any

**Root Cause:** Both key type and element type needed specification

**Changes Made:**
```typescript
// Before
): Map<any, CatalogItem[]> {
  const values = item.getField<any[]>(fieldKey);

// After
): Map<string | number | boolean, CatalogItem[]> {
  const values = item.getField<string[]>(fieldKey);
```

**Files Affected:** `/workspace/src/queries/queryFunctions.ts` (lines 157-177)

---

### Patch #9: Query Functions - countByField (queryFunctions.ts)

**Location:** [src/queries/queryFunctions.ts](../../../src/queries/queryFunctions.ts#L181-L193)

**Error:** `Record<any, number>` return and variable type

**Root Cause:** Record key type should be string (converted from field value)

**Changes Made:**
```typescript
// Before
): Record<any, number> {
  const counts: Record<any, number> = {};

// After
): Record<string, number> {
  const counts: Record<string, number> = {};
```

**Files Affected:** `/workspace/src/queries/queryFunctions.ts` (lines 181-193)

---

### Patch #10: Query Functions - aggregateByField (queryFunctions.ts)

**Location:** [src/queries/queryFunctions.ts](../../../src/queries/queryFunctions.ts#L197-L233)

**Error:** `Record<any, number>` return type and unsafe operations

**Root Cause:** Need to convert map keys to strings for record, and filter type-unsafe values

**Changes Made:**
```typescript
// Before
): Record<any, number> {
  const groups = groupByField(items, groupField);
  const results: Record<any, number> = {};
  for (const [key, groupItems] of groups) {
    const values = groupItems.map(...).filter((v) => v !== null);

// After
): Record<string, number> {
  const groups = groupByField(items, groupField);
  const results: Record<string, number> = {};
  for (const [key, groupItems] of groups) {
    const keyStr = String(key);
    const values = groupItems.map(...).filter((v) => v !== null && typeof v === 'number');
```

**Files Affected:** `/workspace/src/queries/queryFunctions.ts` (lines 197-233)

---

### Patch #11: Query Functions - getUniqueValues (queryFunctions.ts)

**Location:** [src/queries/queryFunctions.ts](../../../src/queries/queryFunctions.ts#L238-L254)

**Error:** `any[]` return type and `Set<any>`

**Root Cause:** Set and return needed concrete type union

**Changes Made:**
```typescript
// Before
): any[] {
  const values = new Set<any>();
  ...
  return Array.from(values).sort();

// After
): (string | number | boolean | string[] | Date | null)[] {
  const values = new Set<string | number | boolean | string[] | Date | null>();
  ...
  return Array.from(values).sort((a, b) => String(a).localeCompare(String(b)));
```

**Files Affected:** `/workspace/src/queries/queryFunctions.ts` (lines 238-254)

---

### Patch #12: Hooks - subscribeToVaultChanges (useDataLoading.ts)

**Location:** [src/hooks/useDataLoading.ts](../../../src/hooks/useDataLoading.ts#L105-L125)

**Error:** Parsing error: tabs converted to spaces causing syntax error

**Root Cause:** Mixed indentation (spaces vs tabs) broke parsing

**Changes Made:**
- Replaced spaces with tabs consistently throughout function
- Fixed indentation of function parameters and body

**Files Affected:** `/workspace/src/hooks/useDataLoading.ts` (lines 105-125)

---

### Patch #13: Config - loadSettings method (settingsManager.ts)

**Location:** [src/config/settingsManager.ts](../../../src/config/settingsManager.ts#L23-L33)

**Errors:**
- `const saved = await this.plugin.loadData()` - unsafe assignment of `any`
- Unsafe member access `.version` on `any` value
- Unsafe argument of type `any` assigned to CartographerSettings parameter

**Root Cause:** `loadData()` returns `any`, needed type assertion

**Changes Made:**
```typescript
// Before
const saved = await this.plugin.loadData();
if (saved && saved.version) {
  this.settings = this.validateSettings(saved);
} else {
  this.settings = JSON.parse(JSON.stringify(PRESETS['pulp-fiction']));
}

// After
const saved = (await this.plugin.loadData()) as CartographerSettings | null;
if (saved && saved.version) {
  this.settings = this.validateSettings(saved);
} else {
  this.settings = JSON.parse(JSON.stringify(PRESETS['pulp-fiction'])) as CartographerSettings;
}
```

**Files Affected:** `/workspace/src/config/settingsManager.ts` (lines 23-33)

---

### Patch #14: Config - validateSettings method (settingsManager.ts)

**Location:** [src/config/settingsManager.ts](../../../src/config/settingsManager.ts#L104-L127)

**Error:** `private validateSettings(saved: any): CartographerSettings` - explicit `any` parameter

**Root Cause:** Method signature needed explicit type for parameter

**Changes Made:**
```typescript
// Before
private validateSettings(saved: any): CartographerSettings {

// After
private validateSettings(saved: CartographerSettings): CartographerSettings {
```

**Files Affected:** `/workspace/src/config/settingsManager.ts` (lines 104-127)

---

### Patch #15: Config - CartographerSettingsTab class (settingsManager.ts)

**Location:** [src/config/settingsManager.ts](../../../src/config/settingsManager.ts#L162-L171)

**Error:** `plugin: any` field and constructor parameter

**Root Cause:** Should be typed as `Plugin` from Obsidian

**Changes Made:**
```typescript
// Before
export class CartographerSettingsTab extends PluginSettingTab {
  plugin: any;
  settingsManager: SettingsManager;
  constructor(app: App, plugin: any, settingsManager: SettingsManager)

// After
export class CartographerSettingsTab extends PluginSettingTab {
  plugin: Plugin;
  settingsManager: SettingsManager;
  constructor(app: App, plugin: Plugin, settingsManager: SettingsManager)
```

**Files Affected:** `/workspace/src/config/settingsManager.ts` (lines 162-171)

---

### Patch #16: Components - createFilterElement (DatacoreComponentView.ts)

**Location:** [src/components/DatacoreComponentView.ts](../../../src/components/DatacoreComponentView.ts#L88-L132)

**Errors:**
- `onFilterChange: (filters: Record<string, any>) => void` - explicit any
- `const filters: Record<string, any> = {}` - explicit any

**Root Cause:** Filter value types needed explicit union

**Changes Made:**
```typescript
// Before
onFilterChange: (filters: Record<string, any>) => void
const filters: Record<string, any> = {};

// After
onFilterChange: (filters: Record<string, string | boolean | undefined>) => void
const filters: Record<string, string | boolean | undefined> = {};
```

**Files Affected:** `/workspace/src/components/DatacoreComponentView.ts` (lines 88-132)

---

### Patch #17: Components - createStatusSummary (DatacoreComponentView.ts)

**Location:** [src/components/DatacoreComponentView.ts](../../../src/components/DatacoreComponentView.ts#L137-L157)

**Error:** `Map<any, CatalogItem[]>` type variable

**Root Cause:** Map key type needed explicit union

**Changes Made:**
```typescript
// Before
const groups = new Map<any, CatalogItem[]>();

// After
const groups = new Map<string | number | boolean | string[] | Date | null, CatalogItem[]>();
```

**Files Affected:** `/workspace/src/components/DatacoreComponentView.ts` (lines 137-157)

---

### Patch #18: Main Plugin - Unused imports and sentence case (main.ts)

**Location:** [src/main.ts](../../../src/main.ts#L1-L95)

**Errors:**
- Unused imports: `App`, `Editor`, `MarkdownView`, `Modal`, `Notice`
- Sentence case violations in UI text
- Floating promises (unawaited async callbacks)
- `detachLeavesOfType` in onunload (antipattern)
- Unused `DEFAULT_SETTINGS` constant

**Root Cause:** Placeholder code from template, UI text conventions

**Changes Made:**
- Removed all unused imports
- Removed unused `DEFAULT_SETTINGS` constant
- Changed UI text to sentence case:
  - "Open Status Dashboard" → "Open status dashboard"
  - "Open Works Table" → "Open works table"
  - "Datacore Catalog" → "Datacore catalog"
- Wrapped async callbacks with `void` operator to handle floating promises
- Removed `detachLeavesOfType` calls from `onunload` (Obsidian handles cleanup automatically)

**Files Affected:** `/workspace/src/main.ts` (lines 1-95)

---

### Patch #19: ESLint Config - Tab indentation and SwitchCase

**Location:** [eslint.config.mts](../../../eslint.config.mts#L24-L27)

**Error:** ESLint not respecting tab indentation; switch case statements not properly indented

**Root Cause:** Missing indent rule configuration

**Changes Made:**
```typescript
// Added to rules:
'indent': ['error', 'tab', { 'SwitchCase': 1 }]
```

This enforces:
- Tabs for all indentation
- Case statements indented 1 level beneath switch declaration

**Files Affected:** `/workspace/eslint.config.mts` (lines 24-27)

---

## Remaining Issues to Address

After all patches:
- Sentence case violations in settingsManager.ts (UI text strings)
- Manual HTML heading elements in settingsManager.ts settings tab
- Additional any type handling in queryFunctions.ts (createCompoundFilter, error handling)
- Component file unused imports/variables warnings

---

## Process Notes

All changes maintain:
- ✅ Tab-based indentation throughout
- ✅ Type safety with explicit union types (no implicit `any`)
- ✅ Obsidian API compatibility
- ✅ Mobile-friendly code (no Node/Electron APIs)
- ✅ Backward compatibility with existing interfaces
