---
date: 2026-01-09
title: "Session 3.5 - QueryBuilder Decision Record"
document-type: decision-record
session: "3.5"
status: "DECIDED"
tags:
  - phase-6
  - session-3.5
  - decisions
  - querybuilder
---

# Session 3.5 - QueryBuilder Assessment & Decision

**Decision Date:** January 9, 2026  
**Status:** ✅ DECIDED (SKIP)  
**Confidence Level:** HIGH

---

## Executive Summary

**Decision:** Do NOT implement QueryBuilder in Session 3.5.

**Rationale:** All 4 conditions for skipping are met. Pure function approach is already semantic, performant, and well-tested. No evidence of boilerplate burden or readability issues in existing components.

---

## Assessment Findings

### Component Query Patterns

#### StatusDashboard
- **Pattern Type:** Status aggregation & statistics
- **Function Chain:** `groupByField()` → `calculateStatusStats()` → `sortStatusGroups()`
- **Chain Depth:** 3 operations
- **Composition:** Via `useStatusData()` hook (semantic, clear intent)
- **Reusability:** Single-purpose (status view only)
- **Readability:** Excellent - function names clearly describe operations

#### WorksTable
- **Pattern Type:** Tabular display with sort/pagination
- **Function Chain:** Direct sort via `compareCellValues()` in `useMemo`
- **Chain Depth:** 1 operation (isolated)
- **Composition:** Inline in component (tightly scoped)
- **Reusability:** Pagination logic unique to table view
- **Readability:** Clear - sort comparison is self-documenting

#### FilterBar
- **Pattern Type:** Multi-filter application
- **Function Chain:** Per-filter type: build options → apply filter
- **Chain Depth:** 1-2 operations (per filter type, not sequential)
- **Composition:** Via `useFilters()` hook (encapsulated state)
- **Reusability:** Filter UI patterns are filter-type specific
- **Readability:** Excellent - each filter type handled explicitly in switch/render

---

## Decision Framework Evaluation

### Conditions for IMPLEMENTING QueryBuilder

| Condition | Met? | Evidence |
|-----------|------|----------|
| Components repeat same 3+ function chains | ❌ No | Each component has unique query pattern |
| Single component needs 4+ chained operations | ❌ No | Max is 3 (StatusDashboard), others are 1-2 |
| Components store intermediate variables from chains | ❌ No | All chaining occurs in `useMemo`/hooks, not intermediate vars |
| Code reviewers report chains are hard to follow | ❌ No | Test structure shows clear understanding; function names are semantic |

**Overall: 0/4 conditions met** → **Do NOT implement**

### Conditions for SKIPPING QueryBuilder

| Condition | Met? | Evidence |
|-----------|------|----------|
| Most component queries are 1-2 operations | ✅ Yes | WorksTable (1), FilterBar (1-2), StatusDashboard aggregation via hooks (not exposed as chains) |
| Each component has unique query patterns | ✅ Yes | Status aggregation ≠ table sorting ≠ filtering (no repeated patterns) |
| Pure function chains read clearly | ✅ Yes | Function names are semantic (`groupByField`, `calculateStatusStats`, `compareCellValues`) |
| Query functions well-tested independently | ✅ Yes | 77 component tests + 61 data layer tests (138 total, 100% passing) |

**Overall: 4/4 conditions met** → **SKIP implementation**

---

## Supporting Evidence

### Code Examples (from Session 3 components)

**StatusDashboard Hook Composition (CLEAR)**
```typescript
const { statusGroups, totalStats, statusFieldDef } = useStatusData(
  items,
  schema,
  settings,
  statusField
);
```
- Intent: Group and aggregate by status
- Implementation: 3-function chain, but encapsulated in hook
- Readability: Excellent - hook name is self-documenting

**WorksTable Inline Sort (CLEAR)**
```typescript
const displayItems = useMemo(() => {
  let result = items;
  if (sortColumn) {
    result = [...items].sort((a, b) => {
      // ...
      return compareCellValues(valueA, valueB, fieldType);
    });
  }
  return result;
}, [items, sortColumn, sortDesc, schema.fields]);
```
- Intent: Sort items by column
- Implementation: Single sort operation (not chained)
- Readability: Clear - operation is localized to one concern

**FilterBar Filter Application (CLEAR)**
```typescript
const {
  filterState,
  handleFilterChange,
  handleClearFilters,
  fieldOptions,
  fieldRanges
} = useFilters(items, settings, onFilter);
```
- Intent: Manage filter state and apply filters
- Implementation: Hook handles all filter logic (not exposed as chains)
- Readability: Excellent - hook encapsulates complexity

---

## Why QueryBuilder is NOT Needed

1. **Already Using Hooks for Composition**
   - `useStatusData()` provides semantic composition point for 3-function chain
   - `useFilters()` encapsulates all filtering logic
   - Hooks are Preact's idiom for composition (more idiomatic than QueryBuilder)

2. **Query Functions Are Semantic**
   - Function names clearly describe operations: `groupByField`, `calculateStatusStats`, `sortStatusGroups`, `compareCellValues`, `buildFilterPredicate`
   - No mystery operations that require fluent API explanation

3. **No Boilerplate Observed**
   - Each component query is purpose-specific
   - No repeated `→ → → → →` chains that cry out for simplification
   - Memoization is already in place where needed

4. **Performance Already Optimized**
   - `useMemo` prevents recalculation
   - Pure functions allow fine-grained memoization
   - QueryBuilder would not improve performance (and might add overhead)

5. **Testing is Strong**
   - 138 tests passing (100%)
   - Query functions tested independently
   - Component integration tested
   - No test failures suggesting confusion about query intent

---

## Plan Forward

### What This Decision Means

- **No QueryBuilder implementation** in Session 3.5
- **Continue using pure functions** + hooks for composition
- **Session 4+ can use same pattern** for new components (PublicationDashboard, AuthorCard, etc.)
- **If patterns change** (e.g., repeated 4+ operation chains emerge), QueryBuilder can be evaluated then

### Integration Testing Approach (Session 3.5)

Will focus integration tests on:
- Multi-component data flow without QueryBuilder abstraction
- Validation that existing hook composition works across components
- Performance benchmarks on pure function approach
- Edge cases with current architecture

---

## Sign-Off

**Assessment Confidence:** HIGH  
**Decision Confidence:** HIGH  
**Reversibility:** HIGH (decision can be revisited in Session 4 if evidence changes)

**Next Steps:**
1. ✅ Document decision (this file)
2. Proceed with Session 3.5 integration testing (QueryBuilder path skipped)
3. Implement SettingsManager, dynamic component configuration
4. Continue with pure function + hooks architecture

---

**Document Status:** FINAL  
**Last Updated:** 2026-01-09  
**Review Status:** Ready for Session Execution
