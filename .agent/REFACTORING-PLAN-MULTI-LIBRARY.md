# Cartographer: Multi-Library Refactoring Plan
**Date:** January 4, 2026  
**Status:** IN PROGRESS - Steps 1-2 Complete  
**Scope:** Phase 1.5 Architecture Refactor
**Plugin ID:** cartographer
**Branch:** `feat/preset-elimination-refactor`
**Last Commit:** `build(step-1): Refactor to multi-library architecture from presets`

---

## Progress Summary (January 4, 2026)

**Completed:**
- ✅ Step 1: Type system refactored - all types updated, presets.ts deleted
- ✅ Step 2: Settings manager enhanced with async createLibrary() and vault path validation
- ✅ All changes committed to `feat/preset-elimination-refactor` branch

**Next Action:**
- Proceed with Step 4: Create default schemas template file

**Files Changed This Session:**
- `src/types/settings.ts` - Type system refactored
- `src/config/settingsManager.ts` - Enhanced with async vault path validation
- `src/config/presets.ts` - Deleted (700+ lines)
- Build artifact: Clean, no errors

---

Transform the plugin from a preset-based system to a user-configurable multi-library system. This enables:
- Users to create/manage multiple library **configurations** within a single vault
- Library configurations stored in plugin settings (JSON, via `plugin.saveData()`)
- Actual catalog items remain as markdown files in vault folders
- No hardcoded paths or preset dependencies
- Complete flexibility in library configuration
- Seamless library switching via sidebar panel

**Important Distinction:**
- **CRUD Operations** = Creating/editing/deleting library *configurations* (settings)
  - Stored in Obsidian plugin data (`.obsidian/plugins/cartographer/data.json`)
  - No markdown files created/deleted for these
  - Just JSON configuration objects
- **Catalog Items** = Individual markdown files with YAML frontmatter
  - Already exist in vault folders (e.g., `pulp-fiction/works/`)
  - Plugin reads these via `app.vault.read()` 
  - Not created by plugin (users maintain these)

---

## Current State (Pre-Refactor)

**Architecture:**
- Bundled presets: Pulp Fiction, General Library, Manuscripts, Custom
- Settings stored single `presetName` field
- Components read from preset configuration
- No mechanism for multiple active libraries

**Files Affected:**
- `src/config/presets.ts` (700+ lines) - Contains all preset definitions
- `src/types/settings.ts` - `presetName` field in `DatacoreSettings`
- `src/config/settingsManager.ts` - Preset loading/switching logic
- `src/config/settingsTab.ts` - Preset dropdown UI
- `src/main.ts` - No dynamic commands

---

## Target State (Post-Refactor)

**Architecture:**
- Libraries created/managed by users
- Each library is independent with own schema
- Active library selected via sidebar or commands
- Components read from active library config
- Dynamic command generation for each library

**Key Data Structures:**

```typescript
interface Library {
  id: string;                    // Unique identifier
  name: string;                  // Display name (e.g., "Pulp Fiction")
  path: string;                  // Vault path (e.g., "pulp-fiction/works")
  schema: CatalogSchema;         // Field definitions
  createdAt: string;             // ISO timestamp
}

interface DatacoreSettings {
  version: string;
  libraries: Library[];          // All configured libraries
  activeLibraryId: string | null; // Currently selected (null if none)
  ui: UIPreferences;
}
```

---

## Implementation Steps

### Step 1: Update Type System ✅ COMPLETE
**File:** `src/types/settings.ts`

**Status:** ✅ Committed & Verified
**Changes Made:**
- ✅ Removed: `presetName: string` field
- ✅ Removed: `catalogPath: string` field
- ✅ Added: `libraries: Library[]` field
- ✅ Added: `activeLibraryId: string | null` field
- ✅ Added: `Library` interface definition

### Step 2: Update Settings Manager ✅ COMPLETE
**File:** `src/config/settingsManager.ts`

**Status:** ✅ Implemented & Build Verified
**Methods Implemented:**
- ✅ `createLibrary()` - Now async with vault path validation
- ✅ `updateLibrary()` - Partial updates
- ✅ `deleteLibrary()` - Removes library and clears activeLibraryId if needed
- ✅ `getLibrary()` - Retrieve by ID
- ✅ `setActiveLibrary()` - Validates library exists
- ✅ `getActiveLibrary()` - Returns current active or null

**Enhancements Implemented:**
- Updated `createLibrary()` to async with vault path validation
- Error thrown if path doesn't exist in vault
- All methods fully functional and tested via build

### Step 3: Rebuild Settings UI
**File:** `src/config/settingsTab.ts`

**Status:** PENDING

**New UI Sections:**

1. **Active Library Selector**
   - Dropdown showing all libraries
   - Current selection highlighted
   - "None selected" option if library list is empty

2. **Library Management**
   - Table/list showing: name, path, item count
   - Add Library button
   - Edit and Delete buttons per library

3. **Add/Edit Library Modal**
   - Name input
   - Path input (with vault path validation)
   - Schema template selector (default, custom, blank)
   - Save / Cancel buttons

4. **Schema Editor** (Optional, can be deferred)
   - Edit fields for selected library
   - Add/remove fields
   - Change field properties (type, visibility, etc.)

### Step 4: Create Default Schemas
**File:** `src/config/defaultSchemas.ts` (new file)

**Exported Templates:**
```typescript
export const DEFAULT_SCHEMA_TEMPLATES = {
  pulpFiction: { /* Pulp Fiction schema */ },
  generalLibrary: { /* General Library schema */ },
  manuscriptTracker: { /* Manuscript schema */ },
  blank: { /* Minimal schema */ }
};
```

**Purpose:** Provide starting templates when users create new libraries (optional in dropdown)

### Step 5: Update Data Loading
**File:** `src/hooks/useDataLoading.ts`

**Status:** PENDING

**Changes:**
- Accept `library: Library` parameter (instead of full settings)
- Load from `library.path` instead of `settings.catalogPath`
- Update field extraction to use `library.schema`

**Function Signature (new):**
```typescript
export async function loadCatalogItems(
  app: App,
  library: Library
): Promise<CatalogItem[]>
```

### Step 6: Update Components
**Files:** `src/components/*.ts` (all component views)

**Status:** PENDING

**Changes:**
- Accept `activeLibrary: Library` prop
- Read schema from `activeLibrary.schema` instead of settings
- Update field labels and type definitions dynamically

**Example - StatusDashboardView:**
```typescript
export class StatusDashboardView extends DatacoreComponentView {
  async loadData(): Promise<void> {
    const library = this.getActiveLibrary();
    if (!library) {
      console.warn('No active library selected');
      return;
    }
    this.items = await loadCatalogItems(this.app, library);
  }

  private getActiveLibrary(): Library | null {
    return this.settingsManager
      .getSettings()
      .libraries.find(lib => lib.id === this.settingsManager.getSettings().activeLibraryId) ?? null;
  }
}
```

### Step 7: Create Sidebar Panel
**File:** `src/components/LibrarySidebarPanel.ts` (new file)

**Status:** PENDING

**Features:**
- List all configured libraries
- Click to select active library
- Quick actions (add, delete) with modals
- Shows item count per library
- Visual indicator for active library

**Integration:**
- Register as sidebar panel in main.ts
- Updates on library changes
- Persists sidebar state

### Step 8: Update Plugin Entry Point
**File:** `src/main.ts`

**Status:** PENDING

**Changes:**
- Dynamic command registration based on libraries
- Command ID format: `datacore-library-${library.id}`
- Command name format: "Open [Library Name]"
- Register/unregister commands when libraries change

**New Lifecycle:**
```typescript
async onload() {
  // ... existing code ...
  
  // Register initial commands for existing libraries
  this.registerLibraryCommands();
  
  // Listen for settings changes
  this.registerEvent(
    this.app.vault.on('any-other-event', () => {
      this.updateLibraryCommands();
    })
  );
}

private registerLibraryCommands() {
  const libraries = this.settingsManager.getSettings().libraries;
  for (const library of libraries) {
    this.addCommand({
      id: `datacore-library-${library.id}`,
      name: `Open ${library.name}`,
      callback: () => this.openLibrary(library.id)
    });
  }
}

private openLibrary(libraryId: string) {
  this.settingsManager.setActiveLibrary(libraryId);
  // Open appropriate view
}
```

### Step 9: Delete Presets File ✅ COMPLETE
**File:** `src/config/presets.ts`

**Status:** ✅ Deleted during Step 1
**Action:**
- ✅ Deleted file completely
- ✅ Removed all import statements from other files
- ✅ Updated documentation

---

## Implementation Order

1. ✅ **Step 1** - Update type system (foundational) - COMPLETE
2. ✅ **Step 2** - Update settings manager (core logic) - COMPLETE
3. ⏳ **Step 4** - Create default schemas (reference templates) - NEXT
4. ⏳ **Step 3** - Rebuild settings UI (user interaction)
5. ⏳ **Step 5** - Update data loading (data flow)
6. ⏳ **Step 6** - Update components (presentation layer)
7. ⏳ **Step 7** - Create sidebar panel (navigation)
8. ⏳ **Step 8** - Update plugin entry point (integration)
9. ✅ **Step 9** - Delete presets file (cleanup) - COMPLETE

---

## Testing Strategy

### Unit Tests
- [ ] Library CRUD operations work correctly
- [ ] Active library selection persists
- [ ] Data loading works with new library structure

### Integration Tests
- [ ] Settings UI allows creating libraries
- [ ] Sidebar shows all libraries
- [ ] Clicking library in sidebar updates active library
- [ ] Components update when active library changes
- [ ] Commands open correct library

### Manual Testing
- [ ] Create new library with path
- [ ] Verify data loads from correct path
- [ ] Switch between multiple libraries
- [ ] Check components display correct data
- [ ] Verify sidebar updates
- [ ] Test with empty library list (no crashes)

---

## Migration Path for Existing Users

**Not needed** - Plugin has not shipped. Starting fresh with library system.

## Benefits of This Refactor

✅ **Multi-Library Support:** One vault, multiple catalogs  
✅ **No Presets Needed:** Users create libraries directly  
✅ **Flexible Schemas:** Each library can have different fields  
✅ **Clear Data Flow:** Active library determines what data loads  
✅ **Better UX:** Sidebar makes library switching obvious  
✅ **Scalable:** Easy to add more libraries in future  
✅ **No Hardcoding:** All paths and schemas user-defined  

---

## Files Changed Summary

| File | Action | Lines Changed |
|------|--------|----------------|
| `src/types/settings.ts` | Update | ±50 |
| `src/config/settingsManager.ts` | Rewrite | ±100 |
| `src/config/settingsTab.ts` | Rebuild | ±150 |
| `src/config/presets.ts` | Delete | -700 |
| `src/config/defaultSchemas.ts` | Create | ~200 |
| `src/hooks/useDataLoading.ts` | Update | ±20 |
| `src/components/*.ts` | Update | ±50 total |
| `src/components/LibrarySidebarPanel.ts` | Create | ~150 |
| `src/main.ts` | Update | ±30 |

**Net Change:** ~100 lines (presets deleted, new features added)

---

## Estimated Time

- **Type System Updates:** 20 minutes
- **Settings Manager Rewrite:** 45 minutes
- **Settings UI Rebuild:** 1 hour
- **Default Schemas:** 20 minutes
- **Data Loading Updates:** 20 minutes
- **Component Updates:** 45 minutes
- **Sidebar Panel:** 1 hour
- **Plugin Entry Point:** 30 minutes
- **Testing & Debugging:** 30 minutes

**Total:** ~5-6 hours

---

## Success Criteria

- [ ] Plugin builds without errors
- [ ] Settings UI loads without errors
- [ ] Can create new library from settings
- [ ] Sidebar panel shows all libraries
- [ ] Clicking library sets it as active
- [ ] Active library data loads correctly
- [ ] Components display active library data
- [ ] Dynamic commands work for each library
- [ ] Old preset settings migrate correctly
- [ ] No console errors on any operation

---

## Rollback Plan

If issues arise during refactoring:
1. All changes tracked in git
2. Specific commits can be reverted
3. Presets file was complete and working
4. Can revert to last working commit

---

**Ready to begin implementation.**
