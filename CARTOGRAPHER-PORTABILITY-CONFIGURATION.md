---
date: 2026-01-01
title: Cartographer Plugin - Portability & Multi-Library Configuration System
document-type: technical-architecture
phase: 6
phase-step: "6.A - Configuration Design (Session 1.5) / Session 3+ Components"
last-updated: 2026-01-07
tags:
  - phase-6
  - architecture
  - cartographer
  - plugin-settings
  - configuration
  - portability
  - multi-library
---

# Cartographer Plugin: Portability & Multi-Library Configuration System

*Complete architectural specification for a portable, user-configurable Obsidian plugin supporting multiple independent library catalogs in a single vault.*

---

## 📖 How This Document Relates to the Master Spec

This is a **critical implementation reference** that complements [CARTOGRAPHER-MASTER-SPEC.md](.agent/PHASE-6-CARTOGRAPHER-MASTER-SPEC.md). While the Master Spec covers *what* to build and *why* (architecture decisions, roadmap, high-level design), this document covers *how* to build it:

- **Code Cookbook** — Full TypeScript implementations developers can reference directly
- **Implementation Guide** — Complete method bodies, not just signatures
- **API Documentation** — Detailed parameters, behaviors, and patterns
- **Learning Resource** — Working examples showing design patterns in action

**Master Spec** = Architecture, decisions, roadmap  
**PORTABILITY-CONFIGURATION** = Code implementations, detailed patterns, step-by-step how-to

**Status:** Session 1.5 (multi-library configuration system) is complete with dynamic library CRUD operations. Session 2 (query functions & data layer) is complete. Use this document during Session 3-5 implementation work as your primary reference for building UI components using the configuration system.

---

## 🎯 Core Philosophy

The plugin is **user-driven and configuration-first**. Rather than bundling presets, users create and manage their own library configurations directly in plugin settings. Each library is independent and can be customized fully:
- Define catalog path in vault
- Create custom field schemas
- Configure which components appear in dashboards
- Enable/disable filtering and sorting per field
- Switch between multiple libraries seamlessly via sidebar or commands

**Key Principle:** No hardcoded assumptions about field names, paths, or catalog types. All behavior configured by users at library creation time.

---

## ⚙️ Plugin Settings Architecture

### Settings Data Structure

**File**: `src/types/settings.ts`

```typescript
/**
 * Top-level plugin settings (stored in .obsidian/plugins/cartographer/data.json)
 */
export interface CartographerSettings {
  // Plugin metadata
  version: string;
  
  // Multi-library configuration
  libraries: Library[];          // All configured libraries
  activeLibraryId: string | null; // Currently selected library (null if none)
  
  // UI preferences (global)
  ui: UIPreferences;
}

/**
 * Individual library configuration
 */
export interface Library {
  // Unique identifier (UUID format)
  id: string;
  
  // Display name (e.g., "My Book Collection", "Pulp Fiction Works")
  name: string;
  
  // Vault path where catalog items are stored (relative to vault root)
  // e.g., "books", "pulp-fiction/works", "research/articles"
  path: string;
  
  // Schema defining all fields in this library
  schema: CatalogSchema;
  
  // Component configuration for this library
  dashboards: DashboardConfigs;
  
  // Creation timestamp (ISO format)
  createdAt: string;
}

/**
 * Global UI preferences
 */
export interface UIPreferences {
  itemsPerPage: number;         // Default pagination size
  defaultSortColumn: string;    // Which column to sort by default
  defaultSortDesc: boolean;     // Sort descending by default?
  compactMode: boolean;         // Use compact layout?
}

/**
 * Catalog schema definition - defines all available fields
 */
export interface CatalogSchema {
  // Display name for this catalog
  catalogName: string;
  
  // Field definitions
  fields: SchemaField[];
  
  // Core fields (required for plugin to function)
  coreFields: {
    titleField: string;        // Which field is the title (usually 'title')
    idField: string;            // Unique identifier field
    statusField?: string;       // Optional: status/stage field
  };
}

/**
 * Individual field definition
 */
export interface SchemaField {
  // Internal field name (matches frontmatter key)
  key: string;
  
  // Display label in UI
  label: string;
  
  // Field type (determines how it's parsed and displayed)
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'wikilink-array' | 'object';
  
  // Category for grouping in UI
  category: 'metadata' | 'status' | 'workflow' | 'content' | 'custom';
  
  // Whether field is visible in default table views
  visible: boolean;
  
  // Whether field can be filtered by
  filterable: boolean;
  
  // Whether field can be sorted by
  sortable: boolean;
  
  // For array types: what is the item type?
  arrayItemType?: 'string' | 'wikilink';
  
  // Default sort order (lower = earlier in list)
  sortOrder: number;
  
  // Description for settings UI
  description?: string;
}

/**
 * Dashboard & component configurations
 */
export interface DashboardConfigs {
  statusDashboard: StatusDashboardConfig;
  worksTable: WorksTableConfig;
  filterBar: FilterBarConfig;
  publicationDashboard: PublicationDashboardConfig;
  authorCard: AuthorCardConfig;
  backstagePassPipeline: BackstagePassPipelineConfig;
}

export interface StatusDashboardConfig {
  enabled: boolean;
  groupByField: string; // Which field to group by (usually 'catalog-status')
  showAggregateStatistics: boolean;
  showWordCounts: boolean;
}

export interface WorksTableConfig {
  enabled: boolean;
  defaultColumns: string[]; // Which fields to display
  columnWidths?: Record<string, string>;
  maxRows?: number;
  enablePagination: boolean;
}

export interface FilterBarConfig {
  enabled: boolean;
  filters: FilterDefinition[];
  layout: 'vertical' | 'horizontal' | 'dropdown';
}

export interface FilterDefinition {
  field: string;
  type: 'select' | 'checkbox' | 'range' | 'text';
  label: string;
  enabled: boolean;
  options?: string[]; // For select/checkbox filters
}

export interface PublicationDashboardConfig {
  enabled: boolean;
  foreignKeyField: string; // Field that references publications (e.g., 'publications')
  displayColumns: string[];
}

export interface AuthorCardConfig {
  enabled: boolean;
  authorField: string; // Field that contains author names
  displayColumns: string[];
  showStatistics: boolean;
}

export interface BackstagePassPipelineConfig {
  enabled: boolean;
  stages: PipelineStage[];
}

export interface PipelineStage {
  name: string;
  filterLogic: string; // JavaScript filter expression or predefined name
  displayFields: string[];
}
---

## 📋 Default Schema Template

### Optional Starting Template

**File**: `src/config/defaultSchemas.ts`

When users create a new library, they can optionally start with `DEFAULT_LIBRARY_SCHEMA`—a comprehensive 26-field template based on best practices from actual library catalog data. This provides sensible defaults without imposing a specific structure.

**Why No Bundled Presets?**

Earlier plugin designs shipped with 3-4 hardcoded presets (Pulp Fiction, General Library, Manuscripts, Custom). This was abandoned for better reasons:
1. **Flexibility**: Users shouldn't choose between "book preset" and "manuscript preset"—they should configure their own
2. **Simplicity**: One generic schema template is simpler than maintaining multiple presets
3. **Portability**: No preset dependencies means the plugin works identically in any vault
4. **UX**: Creating libraries directly is clearer than preset switching

**Template Structure** (26 fields):
- Metadata: title, authors, year, category, class, publications, citation, wikisource, volume, issue, word-count
- Workflow: date-read, date-cataloged, date-reviewed, date-approved, status-draft, status-approved, backstage-draft
- Editorial: bp-candidate, bp-approved
- Content: synopsis, keywords, tags, content-warnings, content-metadata

**User Workflow for Creating Libraries:**

1. Click "Add Library" in plugin settings
2. Enter library name and vault path
3. Choose starting schema:
   - **Blank** - Start with just title field
   - **Default Template** - Start with 26-field comprehensive schema
   - **Custom** - Provide own JSON schema
4. Edit fields as needed (add/remove/configure)
5. Save library
6. Library is now available in sidebar and commands

---

## 🔧 Settings Management

### Settings Manager Class

**File**: `src/config/settingsManager.ts`

```typescript
import {
    App,
    Plugin,
    PluginSettingTab,
    Setting,
    TFile
} from 'obsidian';
import {
    CatalogSchema,
    CartographerSettings,
    Library,
    SchemaField
} from '../types/settings';
import { DEFAULT_LIBRARY_SCHEMA } from './defaultSchemas';

/**
 * Manages loading, saving, and multi-library CRUD operations
 */
export class SettingsManager {
  private plugin: Plugin;
  private settings: CartographerSettings;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  async loadSettings(): Promise<CartographerSettings> {
    const saved = await this.plugin.loadData();
    
    if (!saved) {
      // Initialize with empty library list
      this.settings = {
        version: '1.0.0',
        libraries: [],
        activeLibraryId: null,
        ui: {
          itemsPerPage: 50,
          defaultSortColumn: 'title',
          defaultSortDesc: false,
          compactMode: false,
        },
      };
      await this.saveSettings();
    } else {
      this.settings = this.validateSettings(saved);
    }

    return this.settings;
  }

  async saveSettings(): Promise<void> {
    await this.plugin.saveData(this.settings);
  }

  getSettings(): CartographerSettings {
    return this.settings;
  }

  // Create a new library with async vault path validation
  async createLibrary(
    name: string,
    path: string,
    schema?: CatalogSchema
  ): Promise<Library> {
    // Validate that path exists in vault
    try {
      const folder = this.plugin.app.vault.getAbstractFileByPath(path);
      if (!folder || folder instanceof TFile) {
        throw new Error(`Path "${path}" does not exist or is not a folder`);
      }
    } catch (e) {
      throw new Error(`Invalid library path: ${e instanceof Error ? e.message : String(e)}`);
    }

    const library: Library = {
      id: crypto.randomUUID(),
      name,
      path,
      schema: schema || JSON.parse(JSON.stringify(DEFAULT_LIBRARY_SCHEMA)),
      dashboards: {
        statusDashboard: { enabled: true, groupByField: 'status', showAggregateStatistics: true, showWordCounts: true },
        worksTable: { enabled: true, defaultColumns: ['title', 'authors', 'year'], enablePagination: true },
        filterBar: { enabled: true, filters: [], layout: 'vertical' },
        publicationDashboard: { enabled: false, foreignKeyField: '', displayColumns: [] },
        authorCard: { enabled: false, authorField: '', displayColumns: [], showStatistics: false },
        backstagePassPipeline: { enabled: false, stages: [] },
      },
      createdAt: new Date().toISOString(),
    };

    this.settings.libraries.push(library);
    await this.saveSettings();
    return library;
  }

  // Get library by ID
  getLibrary(id: string): Library | undefined {
    return this.settings.libraries.find(lib => lib.id === id);
  }

  // Update library configuration
  async updateLibrary(id: string, updates: Partial<Library>): Promise<void> {
    const libIndex = this.settings.libraries.findIndex(lib => lib.id === id);
    if (libIndex === -1) {
      throw new Error(`Library "${id}" not found`);
    }
    Object.assign(this.settings.libraries[libIndex], updates);
    await this.saveSettings();
  }

  // Delete library
  async deleteLibrary(id: string): Promise<void> {
    this.settings.libraries = this.settings.libraries.filter(lib => lib.id !== id);
    // Clear active library if it was deleted
    if (this.settings.activeLibraryId === id) {
      this.settings.activeLibraryId = null;
    }
    await this.saveSettings();
  }

  // Set active library
  async setActiveLibrary(id: string | null): Promise<void> {
    if (id && !this.settings.libraries.find(lib => lib.id === id)) {
      throw new Error(`Library "${id}" not found`);
    }
    this.settings.activeLibraryId = id;
    await this.saveSettings();
  }

  // Get active library
  getActiveLibrary(): Library | null {
    if (!this.settings.activeLibraryId) return null;
    return this.getLibrary(this.settings.activeLibraryId) || null;
  }

  // Add field to library schema
  async addFieldToLibrary(libraryId: string, field: SchemaField): Promise<void> {
    const lib = this.getLibrary(libraryId);
    if (!lib) throw new Error(`Library "${libraryId}" not found`);
    
    const existingIndex = lib.schema.fields.findIndex(f => f.key === field.key);
    if (existingIndex === -1) {
      lib.schema.fields.push(field);
      lib.schema.fields.sort((a, b) => a.sortOrder - b.sortOrder);
    } else {
      lib.schema.fields[existingIndex] = field;
    }
    await this.updateLibrary(libraryId, { schema: lib.schema });
  }

  // Remove field from library schema
  async removeFieldFromLibrary(libraryId: string, fieldKey: string): Promise<void> {
    const lib = this.getLibrary(libraryId);
    if (!lib) throw new Error(`Library "${libraryId}" not found`);
    
    lib.schema.fields = lib.schema.fields.filter(f => f.key !== fieldKey);
    await this.updateLibrary(libraryId, { schema: lib.schema });
  }

  // Validate settings structure
  private validateSettings(saved: any): CartographerSettings {
    // Ensure all required fields exist
    if (!saved.version) saved.version = '1.0.0';
    if (!Array.isArray(saved.libraries)) saved.libraries = [];
    if (!saved.ui) saved.ui = { itemsPerPage: 50, defaultSortColumn: 'title', defaultSortDesc: false, compactMode: false };
    return saved as CartographerSettings;
  }
}

/**
 * Settings UI Tab for Obsidian settings panel
 */
export class CartographerSettingsTab extends PluginSettingTab {
  plugin: DatacorePlugin;

  constructor(app: App, plugin: DatacorePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Active library selector
    new Setting(containerEl)
      .setName('Active Library')
      .setDesc('Select which library to display')
      .addDropdown(dropdown => {
        dropdown.addOption('', 'None selected');
        this.plugin.settings.libraries.forEach(lib => {
          dropdown.addOption(lib.id, lib.name);
        });
        dropdown
          .setValue(this.plugin.settings.activeLibraryId || '')
          .onChange(async (value) => {
            await this.plugin.settingsManager.setActiveLibrary(value || null);
            this.display();
          });
      });

    // Library management section
    containerEl.createEl('h3', { text: 'Manage Libraries' });
    
    // List current libraries
    this.plugin.settings.libraries.forEach(lib => {
      const libContainer = containerEl.createDiv('setting-item');
      const libInfo = libContainer.createDiv('setting-item-info');
      libInfo.createDiv('setting-item-name', { text: lib.name });
      libInfo.createDiv('setting-item-description', { text: `Path: ${lib.path}` });
      
      const libControl = libContainer.createDiv('setting-item-control');
      libControl.createEl('button', { text: 'Edit' }).onclick = () => {
        // TODO: Open library edit modal
      };
      libControl.createEl('button', { text: 'Delete', cls: 'mod-warning' }).onclick = () => {
        // TODO: Open delete confirmation modal
      };
    });

    // Add library button
    new Setting(containerEl).addButton(button => {
      button.setButtonText('Add Library').onClick(() => {
        // TODO: Open library creation modal
      });
    });

    // UI Preferences
    containerEl.createEl('h3', { text: 'UI Preferences' });

    new Setting(containerEl)
      .setName('Items Per Page')
      .setDesc('Default pagination size for tables')
      .addSlider(slider => {
        slider
          .setLimits(10, 200, 10)
          .setValue(this.plugin.settings.ui.itemsPerPage)
          .onChange(async (value) => {
            this.plugin.settings.ui.itemsPerPage = value;
            await this.plugin.settingsManager.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Compact Mode')
      .setDesc('Use compact layout for tables and dashboards')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.ui.compactMode)
          .onChange(async (value) => {
            this.plugin.settings.ui.compactMode = value;
            await this.plugin.settingsManager.saveSettings();
          });
      });
  }
}
```

---

## 🎨 Configuration-Driven Components

### Dynamic Work Interface

**File**: `src/types/dynamicWork.ts`

```typescript
/**
 * Dynamic work interface that adapts to configured schema
 * Instead of fixed properties, uses a map of field values
 */
export class CatalogItem {
  id: string;
  fields: Map<string, any>;
  sourceFile: string;

  constructor(id: string, fields: Record<string, any>, sourceFile: string) {
    this.id = id;
    this.fields = new Map(Object.entries(fields));
    this.sourceFile = sourceFile;
  }

  // Get field value with type coercion
  getField<T = any>(fieldKey: string): T | null {
    return (this.fields.get(fieldKey) ?? null) as T | null;
  }

  // Set field value
  setField(fieldKey: string, value: any): void {
    this.fields.set(fieldKey, value);
  }

  // Check if field exists
  hasField(fieldKey: string): boolean {
    return this.fields.has(fieldKey);
  }

  // Get all fields as object
  toObject(): Record<string, any> {
    return Object.fromEntries(this.fields);
  }
}

/**
 * Hook for loading catalog data with dynamic schema
 */
export function useCatalogData(
  datacore: Datacore,
  settings: CartographerSettings
): {
  items: CatalogItem[];
  isLoading: boolean;
  revision: number;
} {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const loadItems = async () => {
      try {
        // Load files from configured catalog path
        const files = await datacore.query({
          type: 'file',
          path: settings.catalogPath,
        });

        const catalogItems = files
          .filter(f => f.$extension === 'md')
          .map(f => {
            const titleField = settings.schema.coreFields.titleField;
            const idField = settings.schema.coreFields.idField;

            // Extract all configured fields from frontmatter
            const fields: Record<string, any> = {};
            
            settings.schema.fields.forEach(fieldDef => {
              const value = f.$frontmatter?.[fieldDef.key]?.value;
              fields[fieldDef.key] = parseFieldValue(value, fieldDef.type);
            });

            const id = fields[idField] || f.$id;
            return new CatalogItem(id, fields, f.$id);
          });

        setItems(catalogItems);
      } catch (e) {
        console.error('Failed to load catalog items:', e);
      }
    };

    loadItems();

    // Subscribe to changes
    const handler = () => {
      loadItems();
      setRevision(r => r + 1);
    };

    datacore.on('update', handler);
    return () => datacore.off('update', handler);
  }, [datacore, settings]);

  return { items, isLoading: items.length === 0, revision };
}

// Helper to parse field values based on type
function parseFieldValue(value: any, type: SchemaField['type']): any {
  if (value === null || value === undefined) return null;

  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === true || value === 'true' || value === 1;
    case 'date':
      return new Date(value).toISOString().split('T')[0];
    case 'array':
    case 'wikilink-array':
      return Array.isArray(value) ? value : [value];
    default:
      return String(value);
  }
}
```

### Generic Filter Component

**File**: `src/components/ConfigurableFilterBar.tsx`

```typescript
import { useMemo, useState, useCallback } from 'preact/hooks';
import { CatalogItem } from '../types/dynamicWork';
import { CartographerSettings, FilterDefinition } from '../types/settings';

interface ConfigurableFilterBarProps {
  items: CatalogItem[];
  settings: CartographerSettings;
  onFilter: (filtered: CatalogItem[]) => void;
}

export function ConfigurableFilterBar({
  items,
  settings,
  onFilter,
}: ConfigurableFilterBarProps) {
  const filterConfig = settings.dashboards.filterBar;
  
  if (!filterConfig.enabled) {
    return null;
  }

  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Get unique values for each filterable field
  const filterOptions = useMemo(() => {
    const options: Record<string, any[]> = {};

    filterConfig.filters.forEach(filter => {
      if (!filter.enabled) return;

      if (filter.type === 'select' || filter.type === 'checkbox') {
        const values = new Set<any>();
        items.forEach(item => {
          const fieldValue = item.getField(filter.field);
          if (Array.isArray(fieldValue)) {
            fieldValue.forEach(v => values.add(v));
          } else if (fieldValue) {
            values.add(fieldValue);
          }
        });
        options[filter.field] = Array.from(values).sort();
      }
    });

    return options;
  }, [items, filterConfig.filters]);

  // Apply active filters
  useEffect(() => {
    const filtered = items.filter(item => {
      return Object.entries(activeFilters).every(([field, value]) => {
        if (!value) return true; // Empty filter doesn't exclude

        const itemValue = item.getField(field);
        
        if (Array.isArray(itemValue)) {
          return itemValue.includes(value);
        }
        return itemValue === value;
      });
    });

    onFilter(filtered);
  }, [activeFilters, items, onFilter]);

  const handleFilterChange = (field: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: value || null,
    }));
  };

  return (
    <div className={`dc-filter-bar layout-${filterConfig.layout}`}>
      {filterConfig.filters.map(filter => {
        if (!filter.enabled) return null;

        const options = filterOptions[filter.field] || [];

        if (filter.type === 'select') {
          return (
            <div key={filter.field} className="filter-select">
              <label>{filter.label}</label>
              <select
                value={activeFilters[filter.field] || ''}
                onChange={(e) => handleFilterChange(filter.field, e.currentTarget.value)}
              >
                <option value="">All</option>
                {options.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (filter.type === 'checkbox') {
          return (
            <div key={filter.field} className="filter-checkboxes">
              <label>{filter.label}</label>
              {options.map(opt => (
                <label key={opt} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={activeFilters[filter.field]?.includes(opt) || false}
                    onChange={(e) => {
                      const current = activeFilters[filter.field] || [];
                      const updated = e.currentTarget.checked
                        ? [...current, opt]
                        : current.filter((v: any) => v !== opt);
                      handleFilterChange(filter.field, updated.length > 0 ? updated : null);
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
```

### Generic Works Table

**File**: `src/components/ConfigurableWorksTable.tsx`

```typescript
import { useMemo, useState } from 'preact/hooks';
import { CatalogItem } from '../types/dynamicWork';
import { CartographerSettings } from '../types/settings';

interface ConfigurableWorksTableProps {
  items: CatalogItem[];
  settings: CartographerSettings;
}

export function ConfigurableWorksTable({
  items,
  settings,
}: ConfigurableWorksTableProps) {
  const tableConfig = settings.dashboards.worksTable;

  if (!tableConfig.enabled) {
    return null;
  }

  const [currentSort, setCurrentSort] = useState({
    field: settings.ui.defaultSortColumn,
    desc: settings.ui.defaultSortDesc,
  });

  // Sort items based on current sort state
  const sortedItems = useMemo(() => {
    const sorted = [...items];
    sorted.sort((a, b) => {
      const aVal = a.getField(currentSort.field);
      const bVal = b.getField(currentSort.field);

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return currentSort.desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }

      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      return currentSort.desc ? bNum - aNum : aNum - bNum;
    });

    return sorted;
  }, [items, currentSort]);

  // Display columns from config
  const displayColumns = tableConfig.defaultColumns
    .map(colKey => settings.schema.fields.find(f => f.key === colKey))
    .filter(Boolean) as any[];

  // Pagination
  const itemsPerPage = tableConfig.enablePagination ? settings.ui.itemsPerPage : sortedItems.length;
  const [currentPage, setCurrentPage] = useState(0);
  const displayItems = sortedItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const handleSort = (fieldKey: string) => {
    if (currentSort.field === fieldKey) {
      setCurrentSort(s => ({ ...s, desc: !s.desc }));
    } else {
      setCurrentSort({ field: fieldKey, desc: false });
    }
  };

  return (
    <div className="dc-works-table">
      <table>
        <thead>
          <tr>
            {displayColumns.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={currentSort.field === col.key ? 'active' : ''}
                style={tableConfig.columnWidths?.[col.key] ? { width: tableConfig.columnWidths[col.key] } : {}}
              >
                {col.label}
                {currentSort.field === col.key && (
                  <span className="sort-indicator">{currentSort.desc ? ' ▼' : ' ▲'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayItems.map(item => (
            <tr key={item.id}>
              {displayColumns.map(col => (
                <td key={`${item.id}-${col.key}`}>
                  {renderCellValue(item.getField(col.key), col.type)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {tableConfig.enablePagination && totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
            ← Previous
          </button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function renderCellValue(value: any, type: string): any {
  if (value === null || value === undefined) return '-';

  if (type === 'array' || type === 'wikilink-array') {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
  }

  return String(value);
}
```

---

## 🔌 Plugin Entry Point

**File**: `src/main.ts`

```typescript
import { Plugin } from 'obsidian';
import { SettingsManager, CartographerSettingsTab } from './config/settingsManager';
import { registerAllCommands } from './commands';
import { CartographerSettings } from './types/settings';

export default class DatacorePlugin extends Plugin {
  settings: CartographerSettings;
  settingsManager: SettingsManager;

  async onload() {
    console.log('Loading Datacore plugin');

    // Initialize settings manager
    this.settingsManager = new SettingsManager(this);
    this.settings = await this.settingsManager.loadSettings();

    // Add settings tab
    this.addSettingTab(new CartographerSettingsTab(this.app, this));

    // Register all commands (core static + library dynamic)
    registerAllCommands(this);

    // Listen for settings changes and re-register library commands
    this.app.vault.on('create', async () => {
      // May trigger library creation workflow
    });

    this.app.vault.on('delete', async () => {
      // May trigger library deletion workflow
    });
  }

  onunload() {
    console.log('Unloading Datacore plugin');
  }
}
```

**Command Architecture** (`src/commands/index.ts`)

Commands are organized into two directories:

- **`src/commands/core/`** — Static commands available regardless of library configuration
  - `openSettings.ts` — Opens plugin settings tab
  - `manageLibraries.ts` — Opens library management modal
  - `reloadCatalogs.ts` — Force reload of all catalog data

- **`src/commands/library/`** — Dynamic commands generated per configured library
  - One command per file per library (e.g., `openStatusDashboard-{libraryId}.ts`)
  - Registered with ID format: `datacore-library-{libraryId}-{dashboardType}`
  - Commands list and register via bulk helper:

```typescript
import { DatacorePlugin } from '../main';

export function registerAllCommands(plugin: DatacorePlugin): void {
  // Register core static commands
  registerCoreCommands(plugin);

  // Register library-specific dynamic commands
  for (const library of plugin.settings.libraries) {
    registerLibraryCommands(plugin, library);
  }
}

// Register commands in src/commands/core/index.ts
function registerCoreCommands(plugin: DatacorePlugin): void {
  // Each core command file exports a register function
  plugin.addCommand({
    id: 'datacore-open-settings',
    name: 'Datacore: Open Settings',
    callback: () => {
      // Open settings tab
    },
  });

  plugin.addCommand({
    id: 'datacore-manage-libraries',
    name: 'Datacore: Manage Libraries',
    callback: () => {
      // Open library management modal
    },
  });
}

// Register library commands in src/commands/library/index.ts
function registerLibraryCommands(plugin: DatacorePlugin, library: Library): void {
  // Status Dashboard command
  plugin.addCommand({
    id: `datacore-library-${library.id}-status-dashboard`,
    name: `${library.name}: Open Status Dashboard`,
    callback: () => {
      // Show status dashboard for this library
    },
  });

  // Works Browser command
  plugin.addCommand({
    id: `datacore-library-${library.id}-works-browser`,
    name: `${library.name}: Browse Works`,
    callback: () => {
      // Show works browser for this library
    },
  });

  // Add other library-specific commands...
}
```

---

## 📐 Type Extensions

**File**: `src/types/types.ts`

```typescript
/**
 * Extend the core Work type to support dynamic fields
 */
import { CatalogItem } from './dynamicWork';
import { CartographerSettings } from './settings';

// Helper to get typed field from CatalogItem based on schema
export function getTypedField<T>(
  item: CatalogItem,
  fieldKey: string,
  settings: CartographerSettings
): T | null {
  const fieldDef = settings.schema.fields.find(f => f.key === fieldKey);
  if (!fieldDef) return null;

  return item.getField<T>(fieldKey);
}

// Helper to work with items as strongly-typed objects
export function itemToObject(item: CatalogItem, settings: CartographerSettings): Record<string, any> {
  const obj: Record<string, any> = {};

  settings.schema.fields.forEach(field => {
    obj[field.key] = item.getField(field.key);
  });

  return obj;
}
```

---

## 📋 Implementation Checklist

**Phase 6.A1: Configuration Architecture** (This document)
- [x] Define settings structure
- [x] Create preset system with 3 bundled presets
- [x] Design settings manager
- [x] Create settings UI tab
- [x] Design dynamic work interface (CatalogItem)
- [x] Create configuration-driven components

**Phase 6.A2: Preset & Validation** (Next)
- [ ] Implement settings validation & migration
- [ ] Create preset import/export system
- [ ] Build field customization UI
- [ ] Test all three bundled presets

**Phase 6.1: Component Implementation** (After A.2)
- [ ] Implement ConfigurableWorksTable
- [ ] Implement ConfigurableFilterBar
- [ ] Implement ConfigurableStatusDashboard
- [ ] Implement ConfigurableAuthorCard
- [ ] Implement ConfigurablePublicationDashboard
- [ ] Implement ConfigurableBackstagePipeline

---

**Document Version:** 1.0  
**Status:** Architecture Complete - Ready for Implementation  
**Next Step:** Review settings structure and preset definitions

