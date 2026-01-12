# Cartographer - Portable Query System for Libraries in the LVNACY Obsidian Apparatus

A configuration-driven, multi-vault query and dashboard system for Obsidian that transforms static Dataview queries into interactive, real-time dashboards.

## Features

- **Configuration-Driven**: Define your catalog structure once, use it everywhere
- **Portable Across Vaults**: Ship with sensible defaults, customize per vault
- **Real-Time Updates**: Dashboards refresh automatically as your vault changes
- **Multiple Presets**: Bundled configurations for Pulp Fiction, General Library, and Manuscripts
- **Customizable Schemas**: Add/remove fields and configure component visibility
- **Mobile-Ready**: Responsive design works on iOS, Android, and desktop

## Quick Start

### 1. Install the Plugin

Copy the entire plugin folder to your Obsidian vault:
```
<vault>/.obsidian/plugins/cartographer/
```

Then enable it in Settings → Community plugins.

### 2. Choose a Preset

Open Settings → Datacore and select a preset:
- **Pulp Fiction** (default): Horror pulp fiction catalog with 13 fields and editorial workflow
- **General Library**: Book collection tracker with reading status
- **Manuscripts**: Writing project tracker with submission workflow
- **Custom**: Start from scratch with your own schema

### 3. Open a Dashboard

Use the ribbon icon or commands:
- `Datacore: Open Status Dashboard` - See items grouped by status
- `Datacore: Open Works Table` - Browse all items in sortable table

## Architecture

This plugin is built with a clean, layered architecture:

1. **Data Access Layer** (`hooks/useDataLoading.ts`): Load and parse markdown files from vault with real-time subscriptions
2. **Query Layer** (`queries/queryFunctions.ts`): Pure functions for filtering, sorting, grouping, and aggregating
3. **State Management**: Filter state, sort state, pagination
4. **View Layer** (`components/`): Obsidian ItemView components for rendering
5. **Settings Layer** (`config/settingsManager.ts`): Persistent configuration management

## File Structure

```
src/
├── main.ts                          # Plugin entry point
├── index.ts                         # Public API exports
├── types/
│   ├── settings.ts                 # DatacoreSettings, CatalogSchema
│   ├── dynamicWork.ts              # CatalogItem, state types
│   └── types.ts                    # Utility functions
├── config/
│   ├── presets.ts                  # PULP_FICTION, GENERAL_LIBRARY, MANUSCRIPTS presets
│   └── settingsManager.ts          # SettingsManager + settings UI tab
├── hooks/
│   └── useDataLoading.ts           # File loading, vault subscriptions, filtering
├── queries/
│   └── queryFunctions.ts           # 20+ query utility functions
├── components/
│   ├── DatacoreComponentView.ts    # Base ItemView class
│   ├── StatusDashboardView.ts      # Status summary component
│   └── WorksTableView.ts           # Works table component
└── styles/
    └── components.css              # Component-specific styles (imported into main)
```

##Development

### Install Dependencies
```bash
npm install
```

### Build Plugin
```bash
npm run build
```

### Development Watch Mode
```bash
npm run dev
```

### Lint Code
```bash
npm run lint
```

### CI/CD Pipeline

This project uses GitHub Actions for automated testing and deployment:

1. **Linting** - ESLint checks code style (`npm run lint`)
2. **Type Checking** - TypeScript strict mode (via `npm run build` which includes `tsc -noEmit`)
3. **Plugin Build** - Compiles TypeScript to JavaScript (`npm run build`)
4. **Storybook Build** - Generates component documentation (`npm run build:storybook`)

**Deployment**: Storybook automatically deploys to GitHub Pages on push to `main`.

See [CI-PIPELINE.md](CI-PIPELINE.md) for detailed pipeline specification.

**Before pushing:**
```bash
npm run lint && npm run build && npm run build:storybook
```

If all pass locally, CI will pass on push.

### File Locations
- **Entry Point**: `main.ts` - Plugin class and command registration
- **Build Output**: `main.js` - Bundled JavaScript (created by esbuild)
- **Manifest**: `manifest.json` - Plugin metadata
- **Styles**: `styles.css` - All plugin styling

## Configuration

### Settings UI

Access Settings → Datacore to:
- Select a preset configuration
- Set the catalog directory path (relative to vault root)
- Enable/disable individual dashboard components
- Configure UI options (items per page, compact mode, etc.)

### Presets

#### Pulp Fiction Catalog (Default)
- **Path**: `works/`
- **13 Fields**: title, authors, year, catalog-status, word-count, publications, bp-candidate, bp-approved, date-reviewed, date-approved, date-cataloged, keywords, content-warnings
- **Status Workflow**: raw → reviewed → approved → published
- **Dashboards**: Status Summary, Works Table, Publication Dashboard, Author Card, Backstage Pass Pipeline

#### General Library Catalog
- **Path**: `library/`
- **6 Fields**: title, author, genre, status, year, rating
- **Status Workflow**: unread → reading → completed
- **Dashboards**: Status Summary, Works Table, Author Card

#### Manuscript Tracker
- **Path**: `manuscripts/`
- **9 Fields**: title, author, genre, status, word-count, draft-date, query-date, agent, publisher
- **Status Workflow**: draft → revising → querying → published
- **Dashboards**: Status Summary, Works Table, Manuscript Pipeline

#### Custom
- **Path**: `catalog/`
- **Fields**: Minimal (title only)
- Start from scratch and add your own fields

## Components

### StatusDashboard
Shows item counts grouped by a status field.

```
┌─────────────────────────────┐
│ Status Summary              │
├──────────────┬──────────────┤
│ Status       │ Count        │
├──────────────┼──────────────┤
│ raw          │ 5            │
│ reviewed     │ 8            │
│ approved     │ 2            │
└──────────────┴──────────────┘
```

### WorksTable
Interactive table with sorting and pagination.

- Sortable columns
- Pagination controls
- Respects field visibility settings
- Mobile-responsive

### PublicationDashboard
Shows all works in a specific publication (wikilink array field).

### AuthorCard
Shows all works by a specific author with statistics.

### BackstagePassPipeline
Custom workflow showing items at different stages (e.g., candidate → approved → in-pipeline).

## Query Functions

Export for use in other scripts or custom components:

```typescript
import {
  filterByField,
  filterByText,
  filterByRange,
  sortByField,
  groupByField,
  countByField,
  getUniqueValues,
  getNumericStats,
  paginate,
} from 'cartographer';
```

See `src/queries/queryFunctions.ts` for full API documentation.

## Type Safety

Full TypeScript support with exported types:

```typescript
import type {
  DatacoreSettings,
  CatalogSchema,
  SchemaField,
  CatalogItem,
  FilterState,
  SortState,
  CatalogStatistics,
} from 'cartographer';
```

## Mobile Support

The plugin includes responsive CSS for:
- iOS (Safari in Obsidian app)
- Android (Obsidian app)
- Desktop (Chrome, Edge, Safari)

All components gracefully degrade on small screens:
- Tables switch to card view on mobile
- Filter bar stacks vertically
- Pagination handled automatically

## Performance

- **Client-side filtering**: Instant responses, no server calls
- **Memoized operations**: Expensive computations cached
- **Lazy loading**: Components load on-demand
- **Real-time subscriptions**: Minimal overhead for vault changes
- **Pagination**: Handle large catalogs efficiently

## Data Format

Catalog items use standard Obsidian markdown with YAML frontmatter:

```markdown
---
title: "The Shadow in the Attic"
authors: ["Lovecraft, Howard Phillips"]
year: 1922
catalog-status: "approved"
word-count: 3500
bp-candidate: true
publications: ["[[Weird Tales Vol 5 No 1]]"]
---

# The Shadow in the Attic

Story content and description...
```

## Extensibility

### Custom Components

Extend `DatacoreComponentView`:

```typescript
import {
  DatacoreComponentView,
  loadCatalogItems
  } from 'cartographer';

export class MyCustomView extends DatacoreComponentView {
  async loadData() {
    this.items = await loadCatalogItems(this.app, this.settings);
  }

  async renderComponent() {
    // Render your custom UI
  }
}
```

### Component Documentation (Storybook)

Interactive component library for testing and documenting all dashboard components in isolation.

#### Quick Links
- **View Live**: `npm run storybook` → http://localhost:6006/
- **Build Static**: `npm run build:storybook` → generates `storybook-static/`
- **Full Guide**: [STORYBOOK-GUIDE.md](../STORYBOOK-GUIDE.md)

#### Components
- **StatusDashboard** (5 variants): Aggregate view grouped by status
- **WorksTable** (8 variants): Sortable, paginated table
- **FilterBar** (7 variants): Multi-type filter interface

Each story includes interactive prop controls, mobile viewport testing, and realistic sample data.

### Custom Field Types

Add custom fields in settings:
- Define field in schema
- Parse with `parseFieldValue()` utility
- Display with `formatFieldValue()` utility

## License

0-BSD License - See LICENSE file for details

---

**Status**: Phase 6 Implementation  
**Version**: 0.1.0  
**Last Updated**: 2026-01-01