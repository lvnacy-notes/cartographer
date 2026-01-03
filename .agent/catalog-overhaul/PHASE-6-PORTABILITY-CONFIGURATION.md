---
date: 2026-01-01
title: Datacore Plugin - Portability & Configuration Architecture
document-type: technical-architecture
phase: 6
phase-step: "6.A - Configuration Design"
tags:
  - phase-6
  - architecture
  - datacore
  - plugin-settings
  - configuration
  - portability
---

# Datacore Plugin: Portability & Configuration System

*Blueprint for building a portable, multi-vault, multi-catalog Obsidian plugin with configurable schemas and presets.*

---

## 🎯 Core Philosophy

The plugin ships with **Pulp Fiction Catalog** as the default preset, but maintains complete flexibility to adapt to any similar catalog structure. Users can:
- Add/remove fields from the data schema
- Create custom field mappings
- Configure which components appear in dashboards
- Load preset configurations for other catalog types
- Save their own custom configurations as presets

---

## ⚙️ Plugin Settings Architecture

### Settings Data Structure

**File**: `src/types/settings.ts`

```typescript
/**
 * Top-level plugin settings (stored in .obsidian/plugins/datacore/data.json)
 */
export interface DatacoreSettings {
  // Core configuration
  version: string;
  presetName: string; // 'pulp-fiction', 'general-library', 'manuscripts', 'custom'
  
  // Catalog location
  catalogPath: string; // e.g., 'works', 'manuscripts', 'stories'
  
  // Schema & field configuration
  schema: CatalogSchema;
  
  // Component visibility & configuration
  dashboards: DashboardConfigs;
  
  // UI preferences
  ui: {
    itemsPerPage: number;
    defaultSortColumn: string;
    defaultSortDesc: boolean;
    compactMode: boolean;
  };
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
  showTotalStats: boolean;
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
```

---

## 📋 Configuration Presets

### Preset System

**File**: `src/config/presets.ts`

```typescript
/**
 * Bundled configuration presets for different catalog types
 */

export const PRESETS: Record<string, DatacoreSettings> = {
  'pulp-fiction': PULP_FICTION_PRESET,
  'general-library': GENERAL_LIBRARY_PRESET,
  'manuscripts': MANUSCRIPTS_PRESET,
  'custom': DEFAULT_CUSTOM_PRESET,
};

/**
 * PRESET 1: Pulp Fiction Catalog (Default)
 * 
 * Assumes:
 * - Directory: /works/
 * - Status field: catalog-status
 * - Author field: authors (array)
 * - Publication field: publications (wikilink-array)
 * - Editorial workflow: bp-candidate, bp-approved
 */
export const PULP_FICTION_PRESET: DatacoreSettings = {
  version: '1.0.0',
  presetName: 'pulp-fiction',
  catalogPath: 'works',

  schema: {
    catalogName: 'Pulp Fiction Library',
    coreFields: {
      titleField: 'title',
      idField: 'title', // Uses title as unique identifier
      statusField: 'catalog-status',
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 1,
        description: 'Story or work title',
      },
      {
        key: 'authors',
        label: 'Author(s)',
        type: 'wikilink-array',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: false,
        arrayItemType: 'wikilink',
        sortOrder: 2,
        description: 'Primary author(s)',
      },
      {
        key: 'year',
        label: 'Publication Year',
        type: 'number',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 3,
        description: 'Original publication year',
      },
      {
        key: 'catalog-status',
        label: 'Catalog Status',
        type: 'string',
        category: 'status',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 4,
        description: 'Current cataloging stage: raw, reviewed, approved, published',
      },
      {
        key: 'word-count',
        label: 'Word Count',
        type: 'number',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 5,
        description: 'Total word count of work',
      },
      {
        key: 'publications',
        label: 'Publications',
        type: 'wikilink-array',
        category: 'metadata',
        visible: false,
        filterable: true,
        sortable: false,
        arrayItemType: 'wikilink',
        sortOrder: 6,
        description: 'Publication(s) where work appears',
      },
      {
        key: 'bp-candidate',
        label: 'BP Candidate',
        type: 'boolean',
        category: 'workflow',
        visible: false,
        filterable: true,
        sortable: false,
        sortOrder: 7,
        description: 'Selected for Backstage Pass consideration',
      },
      {
        key: 'bp-approved',
        label: 'BP Approved',
        type: 'boolean',
        category: 'workflow',
        visible: false,
        filterable: true,
        sortable: false,
        sortOrder: 8,
        description: 'Approved for Backstage Pass publication',
      },
      {
        key: 'date-reviewed',
        label: 'Date Reviewed',
        type: 'date',
        category: 'workflow',
        visible: false,
        filterable: true,
        sortable: true,
        sortOrder: 9,
        description: 'When work was reviewed',
      },
      {
        key: 'date-approved',
        label: 'Date Approved',
        type: 'date',
        category: 'workflow',
        visible: false,
        filterable: true,
        sortable: true,
        sortOrder: 10,
        description: 'When work was approved',
      },
      {
        key: 'date-cataloged',
        label: 'Date Cataloged',
        type: 'date',
        category: 'workflow',
        visible: false,
        filterable: true,
        sortable: true,
        sortOrder: 11,
        description: 'When work was added to catalog',
      },
      {
        key: 'keywords',
        label: 'Keywords',
        type: 'array',
        category: 'content',
        visible: false,
        filterable: true,
        sortable: false,
        arrayItemType: 'string',
        sortOrder: 12,
        description: 'Tags or keywords for categorization',
      },
      {
        key: 'content-warnings',
        label: 'Content Warnings',
        type: 'array',
        category: 'content',
        visible: false,
        filterable: true,
        sortable: false,
        arrayItemType: 'string',
        sortOrder: 13,
        description: 'Content advisory labels',
      },
    ],
  },

  dashboards: {
    statusDashboard: {
      enabled: true,
      groupByField: 'catalog-status',
      showTotalStats: true,
      showWordCounts: true,
    },
    worksTable: {
      enabled: true,
      defaultColumns: ['title', 'authors', 'year', 'word-count', 'catalog-status'],
      enablePagination: true,
    },
    filterBar: {
      enabled: true,
      layout: 'vertical',
      filters: [
        {
          field: 'catalog-status',
          type: 'checkbox',
          label: 'Catalog Status',
          enabled: true,
          options: ['raw', 'reviewed', 'approved', 'published'],
        },
        {
          field: 'authors',
          type: 'select',
          label: 'Author',
          enabled: true,
        },
        {
          field: 'bp-candidate',
          type: 'checkbox',
          label: 'BP Candidates',
          enabled: true,
        },
      ],
    },
    publicationDashboard: {
      enabled: true,
      foreignKeyField: 'publications',
      displayColumns: ['title', 'authors', 'year', 'catalog-status', 'word-count'],
    },
    authorCard: {
      enabled: true,
      authorField: 'authors',
      displayColumns: ['title', 'year', 'word-count', 'catalog-status'],
      showStatistics: true,
    },
    backstagePassPipeline: {
      enabled: true,
      stages: [
        {
          name: 'Candidates',
          filterLogic: 'catalogStatus === "reviewed" && bpCandidate === true',
          displayFields: ['title', 'authors', 'dateReviewed', 'wordCount'],
        },
        {
          name: 'Approved',
          filterLogic: 'catalogStatus === "approved" && bpApproved === true',
          displayFields: ['title', 'authors', 'dateApproved', 'wordCount'],
        },
        {
          name: 'Archived',
          filterLogic: 'catalogStatus === "reviewed" && bpCandidate !== true',
          displayFields: ['title', 'authors', 'dateReviewed'],
        },
      ],
    },
  },

  ui: {
    itemsPerPage: 50,
    defaultSortColumn: 'title',
    defaultSortDesc: false,
    compactMode: false,
  },
};

/**
 * PRESET 2: General Library Catalog
 * 
 * Assumes:
 * - Directory: /library/ or /books/
 * - Status field: status (simpler: unread, reading, completed)
 * - Author field: author (single, not array)
 * - Genre field: genre
 * - No editorial workflow
 */
export const GENERAL_LIBRARY_PRESET: DatacoreSettings = {
  version: '1.0.0',
  presetName: 'general-library',
  catalogPath: 'library',

  schema: {
    catalogName: 'General Library',
    coreFields: {
      titleField: 'title',
      idField: 'title',
      statusField: 'status',
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 1,
      },
      {
        key: 'author',
        label: 'Author',
        type: 'string',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 2,
      },
      {
        key: 'genre',
        label: 'Genre',
        type: 'string',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 3,
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        category: 'status',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 4,
      },
      {
        key: 'year',
        label: 'Publication Year',
        type: 'number',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 5,
      },
      {
        key: 'rating',
        label: 'Rating',
        type: 'number',
        category: 'custom',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 6,
      },
    ],
  },

  dashboards: {
    statusDashboard: {
      enabled: true,
      groupByField: 'status',
      showTotalStats: true,
      showWordCounts: false,
    },
    worksTable: {
      enabled: true,
      defaultColumns: ['title', 'author', 'genre', 'year', 'status', 'rating'],
      enablePagination: true,
    },
    filterBar: {
      enabled: true,
      layout: 'horizontal',
      filters: [
        {
          field: 'status',
          type: 'select',
          label: 'Status',
          enabled: true,
          options: ['unread', 'reading', 'completed'],
        },
        {
          field: 'genre',
          type: 'select',
          label: 'Genre',
          enabled: true,
        },
      ],
    },
    publicationDashboard: { enabled: false },
    authorCard: {
      enabled: true,
      authorField: 'author',
      displayColumns: ['title', 'year', 'genre', 'status'],
      showStatistics: true,
    },
    backstagePassPipeline: { enabled: false },
  },

  ui: {
    itemsPerPage: 50,
    defaultSortColumn: 'title',
    defaultSortDesc: false,
    compactMode: false,
  },
};

/**
 * PRESET 3: Manuscript Tracker
 * 
 * Assumes:
 * - Directory: /manuscripts/
 * - Status field: status (draft, revising, querying, published)
 * - Author field: author (single)
 * - Workflow fields: draft-date, query-date, agent, publisher
 */
export const MANUSCRIPTS_PRESET: DatacoreSettings = {
  version: '1.0.0',
  presetName: 'manuscripts',
  catalogPath: 'manuscripts',

  schema: {
    catalogName: 'Manuscript Tracker',
    coreFields: {
      titleField: 'title',
      idField: 'title',
      statusField: 'status',
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 1,
      },
      {
        key: 'author',
        label: 'Author',
        type: 'string',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 2,
      },
      {
        key: 'genre',
        label: 'Genre',
        type: 'string',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 3,
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        category: 'status',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 4,
      },
      {
        key: 'word-count',
        label: 'Word Count',
        type: 'number',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 5,
      },
      {
        key: 'draft-date',
        label: 'Draft Completed',
        type: 'date',
        category: 'workflow',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 6,
      },
      {
        key: 'query-date',
        label: 'Querying Since',
        type: 'date',
        category: 'workflow',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 7,
      },
      {
        key: 'agent',
        label: 'Literary Agent',
        type: 'string',
        category: 'workflow',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 8,
      },
      {
        key: 'publisher',
        label: 'Publisher',
        type: 'string',
        category: 'workflow',
        visible: false,
        filterable: true,
        sortable: true,
        sortOrder: 9,
      },
    ],
  },

  dashboards: {
    statusDashboard: {
      enabled: true,
      groupByField: 'status',
      showTotalStats: true,
      showWordCounts: true,
    },
    worksTable: {
      enabled: true,
      defaultColumns: ['title', 'author', 'status', 'word-count', 'draft-date'],
      enablePagination: true,
    },
    filterBar: {
      enabled: true,
      layout: 'vertical',
      filters: [
        {
          field: 'status',
          type: 'checkbox',
          label: 'Status',
          enabled: true,
          options: ['draft', 'revising', 'querying', 'published'],
        },
        {
          field: 'genre',
          type: 'select',
          label: 'Genre',
          enabled: true,
        },
      ],
    },
    publicationDashboard: { enabled: false },
    authorCard: { enabled: false },
    backstagePassPipeline: { enabled: false },
  },

  ui: {
    itemsPerPage: 50,
    defaultSortColumn: 'title',
    defaultSortDesc: false,
    compactMode: false,
  },
};

/**
 * PRESET 4: Custom/Template
 * Use this as a starting point for custom catalogs
 */
export const DEFAULT_CUSTOM_PRESET: DatacoreSettings = {
  version: '1.0.0',
  presetName: 'custom',
  catalogPath: 'catalog',
  schema: {
    catalogName: 'Custom Catalog',
    coreFields: {
      titleField: 'title',
      idField: 'title',
    },
    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        category: 'metadata',
        visible: true,
        filterable: true,
        sortable: true,
        sortOrder: 1,
      },
    ],
  },
  dashboards: {
    statusDashboard: { enabled: false },
    worksTable: {
      enabled: true,
      defaultColumns: ['title'],
      enablePagination: false,
    },
    filterBar: { enabled: false, layout: 'vertical', filters: [] },
    publicationDashboard: { enabled: false },
    authorCard: { enabled: false },
    backstagePassPipeline: { enabled: false },
  },
  ui: {
    itemsPerPage: 50,
    defaultSortColumn: 'title',
    defaultSortDesc: false,
    compactMode: false,
  },
};
```

---

## 🔧 Settings Management

### Settings Manager Class

**File**: `src/config/settingsManager.ts`

```typescript
import { Plugin, PluginSettingTab, App, Setting } from 'obsidian';
import { DatacoreSettings, SchemaField } from '../types/settings';
import { PRESETS } from './presets';

/**
 * Manages loading, saving, and validating plugin settings
 */
export class SettingsManager {
  private plugin: Plugin;
  private settings: DatacoreSettings;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  async loadSettings(): Promise<DatacoreSettings> {
    const saved = await this.plugin.loadData();
    
    // If no settings exist, use Pulp Fiction preset as default
    if (!saved) {
      this.settings = JSON.parse(JSON.stringify(PRESETS['pulp-fiction']));
      await this.saveSettings();
    } else {
      // Validate and migrate saved settings
      this.settings = this.validateSettings(saved);
    }

    return this.settings;
  }

  async saveSettings(): Promise<void> {
    await this.plugin.saveData(this.settings);
  }

  getSettings(): DatacoreSettings {
    return this.settings;
  }

  // Load a preset
  async loadPreset(presetName: keyof typeof PRESETS): Promise<void> {
    this.settings = JSON.parse(JSON.stringify(PRESETS[presetName]));
    await this.saveSettings();
  }

  // Add a custom field to schema
  addField(field: SchemaField): void {
    const existingIndex = this.settings.schema.fields.findIndex(f => f.key === field.key);
    
    if (existingIndex === -1) {
      this.settings.schema.fields.push(field);
      this.settings.schema.fields.sort((a, b) => a.sortOrder - b.sortOrder);
    } else {
      this.settings.schema.fields[existingIndex] = field;
    }
  }

  // Remove a field from schema
  removeField(fieldKey: string): void {
    this.settings.schema.fields = this.settings.schema.fields.filter(
      f => f.key !== fieldKey
    );
  }

  // Update field visibility, filterability, etc.
  updateFieldProperties(fieldKey: string, updates: Partial<SchemaField>): void {
    const field = this.settings.schema.fields.find(f => f.key === fieldKey);
    if (field) {
      Object.assign(field, updates);
    }
  }

  // Validate settings structure
  private validateSettings(saved: any): DatacoreSettings {
    // Ensure all required fields exist
    // If structure is outdated, migrate to new format
    // Return validated settings
    return saved as DatacoreSettings;
  }
}

/**
 * Settings UI Tab for Obsidian settings panel
 */
export class DatacoreSettingsTab extends PluginSettingTab {
  plugin: DatacorePlugin;

  constructor(app: App, plugin: DatacorePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Preset selector
    new Setting(containerEl)
      .setName('Catalog Preset')
      .setDesc('Choose a preset configuration or create a custom one')
      .addDropdown(dropdown => {
        dropdown
          .addOption('pulp-fiction', 'Pulp Fiction Catalog')
          .addOption('general-library', 'General Library')
          .addOption('manuscripts', 'Manuscript Tracker')
          .addOption('custom', 'Custom')
          .setValue(this.plugin.settings.presetName)
          .onChange(async (value) => {
            await this.plugin.settingsManager.loadPreset(value as any);
            this.display(); // Refresh UI
          });
      });

    // Catalog path
    new Setting(containerEl)
      .setName('Catalog Directory Path')
      .setDesc('Path to catalog files (relative to vault root)')
      .addText(text => {
        text
          .setPlaceholder('works')
          .setValue(this.plugin.settings.catalogPath)
          .onChange(async (value) => {
            this.plugin.settings.catalogPath = value;
            await this.plugin.settingsManager.saveSettings();
          });
      });

    // Schema management section
    containerEl.createEl('h3', { text: 'Schema Fields' });
    containerEl.createEl('p', {
      text: 'Manage fields in your catalog. Add, remove, or configure field properties.',
      cls: 'setting-item-description',
    });

    // List current fields
    this.plugin.settings.schema.fields.forEach(field => {
      const fieldContainer = containerEl.createDiv('setting-item');
      
      const fieldInfo = fieldContainer.createDiv('setting-item-info');
      fieldInfo.createDiv('setting-item-name', { text: field.label });
      fieldInfo.createDiv('setting-item-description', {
        text: `Type: ${field.type} | Filterable: ${field.filterable ? 'Yes' : 'No'} | Visible: ${field.visible ? 'Yes' : 'No'}`,
      });

      const fieldControl = fieldContainer.createDiv('setting-item-control');
      
      // Toggle visibility
      fieldControl.createEl('button', { text: field.visible ? 'Hide' : 'Show' })
        .onclick = async () => {
          this.plugin.settingsManager.updateFieldProperties(field.key, {
            visible: !field.visible,
          });
          await this.plugin.settingsManager.saveSettings();
          this.display();
        };

      // Toggle filterability
      fieldControl.createEl('button', { text: field.filterable ? 'No Filter' : 'Filterable' })
        .onclick = async () => {
          this.plugin.settingsManager.updateFieldProperties(field.key, {
            filterable: !field.filterable,
          });
          await this.plugin.settingsManager.saveSettings();
          this.display();
        };

      // Remove field (if not core)
      const coreFieldKeys = [
        this.plugin.settings.schema.coreFields.titleField,
        this.plugin.settings.schema.coreFields.idField,
      ];
      
      if (!coreFieldKeys.includes(field.key)) {
        fieldControl.createEl('button', { text: 'Remove', cls: 'mod-warning' })
          .onclick = async () => {
            this.plugin.settingsManager.removeField(field.key);
            await this.plugin.settingsManager.saveSettings();
            this.display();
          };
      }
    });

    // Add custom field section
    containerEl.createEl('h3', { text: 'Add Custom Field' });
    
    let newFieldKey = '';
    let newFieldLabel = '';
    let newFieldType: SchemaField['type'] = 'string';

    new Setting(containerEl)
      .setName('Field Key')
      .addText(text => {
        text
          .setPlaceholder('custom-field')
          .onChange(v => { newFieldKey = v; });
      });

    new Setting(containerEl)
      .setName('Field Label')
      .addText(text => {
        text
          .setPlaceholder('Custom Field')
          .onChange(v => { newFieldLabel = v; });
      });

    new Setting(containerEl)
      .setName('Field Type')
      .addDropdown(dropdown => {
        dropdown
          .addOption('string', 'Text')
          .addOption('number', 'Number')
          .addOption('boolean', 'Boolean')
          .addOption('date', 'Date')
          .addOption('array', 'Array')
          .setValue('string')
          .onChange(v => { newFieldType = v as SchemaField['type']; });
      });

    new Setting(containerEl)
      .addButton(button => {
        button
          .setButtonText('Add Field')
          .onClick(async () => {
            if (newFieldKey && newFieldLabel) {
              this.plugin.settingsManager.addField({
                key: newFieldKey,
                label: newFieldLabel,
                type: newFieldType,
                category: 'custom',
                visible: true,
                filterable: true,
                sortable: newFieldType !== 'wikilink-array',
                sortOrder: this.plugin.settings.schema.fields.length + 1,
              });
              await this.plugin.settingsManager.saveSettings();
              this.display();
            }
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
  settings: DatacoreSettings
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
import { DatacoreSettings, FilterDefinition } from '../types/settings';

interface ConfigurableFilterBarProps {
  items: CatalogItem[];
  settings: DatacoreSettings;
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
import { DatacoreSettings } from '../types/settings';

interface ConfigurableWorksTableProps {
  items: CatalogItem[];
  settings: DatacoreSettings;
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
import { SettingsManager, DatacoreSettingsTab } from './config/settingsManager';
import { DatacoreSettings } from './types/settings';

export default class DatacorePlugin extends Plugin {
  settings: DatacoreSettings;
  settingsManager: SettingsManager;

  async onload() {
    console.log('Loading Datacore plugin');

    // Initialize settings manager
    this.settingsManager = new SettingsManager(this);
    this.settings = await this.settingsManager.loadSettings();

    // Add settings tab
    this.addSettingTab(new DatacoreSettingsTab(this.app, this));

    // Register commands to open dashboards
    this.addCommand({
      id: 'datacore-open-status-dashboard',
      name: 'Open Status Dashboard',
      callback: () => {
        this.showStatusDashboard();
      },
    });

    this.addCommand({
      id: 'datacore-open-works-browser',
      name: 'Open Works Browser',
      callback: () => {
        this.showWorksBrowser();
      },
    });

    // Listen for settings changes
    this.app.vault.on('modify', () => {
      // Reload data if working files change
    });
  }

  onunload() {
    console.log('Unloading Datacore plugin');
  }

  private showStatusDashboard() {
    // Open status dashboard in a modal or new pane
  }

  private showWorksBrowser() {
    // Open works browser with all configured components
  }
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
import { DatacoreSettings } from './settings';

// Helper to get typed field from CatalogItem based on schema
export function getTypedField<T>(
  item: CatalogItem,
  fieldKey: string,
  settings: DatacoreSettings
): T | null {
  const fieldDef = settings.schema.fields.find(f => f.key === fieldKey);
  if (!fieldDef) return null;

  return item.getField<T>(fieldKey);
}

// Helper to work with items as strongly-typed objects
export function itemToObject(item: CatalogItem, settings: DatacoreSettings): Record<string, any> {
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

