---
title: Storybook Guide
description: Component discovery, use, and management.
---

# Cartographer Storybook - Component Documentation Library

Interactive component library for Cartographer and future LVNACY plugins. Storybook provides live, isolated testing and documentation of all dashboard components.

## Quick Start

### Launch Storybook
```bash
npm run storybook
```
Opens at `http://localhost:6006/`

**Note:** The responsive viewport addon is included and pre-configured (Storybook 10+). Use the toolbar to test mobile/tablet/desktop layouts.

### Build Static Documentation
```bash
npm run build:storybook
```
Generates static site in `storybook-static/` (ready for CI/CD deployment)

**CI/CD:** Storybook build must complete without errors for PRs to merge. Lint and typecheck must also pass.

## Components Documented

All 3 Phase 1 dashboard components with 20+ story variants:

- **StatusDashboard** (5 stories): Aggregate counts grouped by status
  - Default layout, empty state, large catalog (100+ items), custom field, mobile (600px)
  
- **WorksTable** (8 stories): Interactive table with sorting and pagination
  - All columns, custom columns, sorting, pagination, empty, single item, wide table, mobile
  
- **FilterBar** (7 stories): Multiple filter types with layout variations
  - Vertical, horizontal, dropdown layouts; all 4 filter types; AND/OR logic; mobile

## Using Fixtures

All stories use type-safe fixture data from `.storybook/fixtures/`:

### sampleSchema
7-field library schema covering all field types (string, number, wikilink-array, array).

### sampleWorks
15+ sample catalog items with realistic data. Used via helper function:

```typescript
import { sampleWorks, sampleSchema } from '../../.storybook/fixtures';
import { buildCatalogItemFromData } from '../types/dynamicWork';

const items = Object.entries(sampleWorks).map(([id, data]) =>
  buildCatalogItemFromData(data, id, `pulp-fiction/works/${id}.md`, sampleSchema)
);
```

### sampleFilters
5 pre-configured filters covering all types: select, range, checkbox, text.

### sampleSettings
Complete CartographerSettings object with library, dashboard, and UI configuration.

## Interactive Controls

Each story includes **argTypes** for live prop testing:

1. Open any story in Storybook
2. Scroll to "Controls" panel (bottom)
3. Modify props in real-time
4. See component respond immediately

Example: StatusDashboard props
- `items` - Change the catalog items
- `schema` - Swap field definitions
- `statusField` - Change grouping field
- `onStatusClick` - Log status click events

## Adding New Stories

### 1. Create Story File
```typescript
import type { Meta, StoryObj } from '@storybook/preact';
import { MyComponent } from './MyComponent';
import { sampleSchema, sampleWorks, sampleSettings } from '../../.storybook/fixtures';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: ['component'],
  parameters: { layout: 'centered' },
  argTypes: {
    items: { description: 'Catalog items', control: { type: 'object' } },
    // Add more props...
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: buildSampleItems(sampleWorks),
    schema: sampleSchema,
    settings: sampleSettings,
  },
};
```

### 2. Add JSDoc to Props
Props are automatically documented via JSDoc in component type definitions (`src/types/componentProps.ts`).

### 3. Define Variants
Create additional Story exports for different states:
- Default state
- Empty state
- Large/stress test data
- Mobile viewport
- Error/edge cases

### 4. Mobile Testing
Set viewport in story parameters:
```typescript
export const MobileViewport: Story = {
  parameters: {
    viewport: { defaultViewport: 'ipad' },
  },
  args: { /* ... */ },
};
```

### 5. Accessibility Testing
Storybook includes the accessibility (a11y) addon. Use the a11y panel in the Storybook UI to check for accessibility issues in each story. All components should pass with zero critical issues.

## Viewport Options

Predefined in `.storybook/preview.ts`:
- **Mobile** (375px): Phone devices
- **Tablet** (768px): iPad, Android tablets
- **Desktop** (1440px): Desktop monitors

Switch viewports via Storybook toolbar (top-right).

## Global Decorators

All stories are wrapped by decorators providing context:

1. **LibraryContextDecorator** - Active library configuration
2. **SampleDataDecorator** - Fixture data availability (data attributes)
3. **ThemeDecorator** - CSS variables, fonts, spacing, colors

Decorators are applied automatically (no manual wrapping needed).

## Code Quality

### Type Safety
- All fixtures use explicit Cartographer types
- No `any` types in stories or decorators
- `ComponentType<unknown>` for decorator Story parameters

### Documentation
- 100% JSDoc coverage on all components
- argTypes include descriptions for all props
- Usage examples in fixture index

### Linting
Stories must pass ESLint and TypeScript:
```bash
npm run lint
npm run typecheck
```

**Checklist for Story Completeness:**
- Each component must have at least 8 story variants (default, empty, large, custom config, mobile, edge cases, etc.)
- All props must be documented with JSDoc and argTypes
- All stories must pass accessibility (a11y) checks
- Storybook build, lint, and typecheck must be clean for CI/CD

## Troubleshooting

### Port 6006 already in use
Kill the process or use a different port:
```bash
npm run storybook -- -p 6007
```

### Stories don't appear
Check `.storybook/main.ts` story pattern matches your files:
```typescript
stories: ["../src/**/*.stories.ts"]
```
Story files must be named `*.stories.ts`.

### Imports fail
Ensure fixtures are imported from `../../.storybook/fixtures` (relative path from `src/components/`).

### Types show as `any`
Run `npm install` to install Storybook types:
```bash
@storybook/preact
@storybook/addon-essentials
```

### Performance slow with 100+ items
Storybook works fine with large datasets. Clear browser cache if sluggish:
- DevTools → Application → Clear storage
- Or rebuild: `npm run build:storybook`

## Extension Patterns

### For LVNACY Plugin Authors

This Storybook setup is designed to be reusable across LVNACY plugins:

1. Copy `.storybook/` directory to your plugin
2. Copy `tsconfig.storybook.json` and update paths
3. Update `package.json` scripts
4. Create fixture data for your domain
5. Add `.stories.ts` files alongside components

All patterns (decorators, JSDoc, argTypes, TypeScript, linting) apply to any component library.

## Contributing

When adding components:
1. Follow component props JSDoc pattern in `src/types/componentProps.ts`
2. Create 5+ story variants covering default, empty, large, custom config, mobile states
3. Add stories to Storybook discovery: `src/components/YourComponent.stories.ts`
4. Test with `npm run storybook`
5. Verify no ESLint/TypeScript errors
6. Document fixture usage if introducing new data patterns

---

**Guide Status:** COMPLETE — All required Storybook documentation and patterns for Cartographer and LVNACY plugins are now covered. Maintain this guide as new components or patterns are introduced.

## References

- [Storybook Docs](https://storybook.js.org/)
- [Preact Integration](https://storybook.js.org/docs/preact)
- [argTypes Documentation](https://storybook.js.org/docs/api/argtypes)
- [Decorators Guide](https://storybook.js.org/docs/writing-stories/decorators)
