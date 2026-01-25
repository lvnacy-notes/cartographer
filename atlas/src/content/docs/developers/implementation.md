---
title: Architecture, Components, and Docs
description: >
  Project architecture, components, testing ... basically everything you need 
  to get started.
---

This document provides a comprehensive overview of the architecture, 
development patterns, and integration strategies for the Cartographer 
Obsidian plugin. It is intended for developers working on any aspect of the 
plugin, including UI components, hooks, settings, data flow, and testing.

---

## 1. Architecture Overview

- **Component-based:** All UI is built with Preact components, organized by 
  feature.
- **Hooks:** Custom hooks manage state, settings, and data queries.
- **Settings Layer:** Centralized settings management with CRUD, schema 
  validation, and multi-library support.
- **Test Infrastructure:** Unit, integration, and edge case tests ensure 
  reliability and maintainability.
- **Storybook:** Interactive documentation and visual testing for all 
  components.
- **Atlas (Starlight)**: Main documentation site with user guides, API 
  reference, and developer docs.

### Diagram
```
[SettingsManager] ←→ [Hooks] ←→ [Components]
      ↑                ↑            ↑
   [Vault]         [Fixtures]   [Storybook]
                                    ↑
                                  [Atlas]
```

---

## 2. Adding New Components

1. Create the component in `src/components/`.
2. Add prop types and JSDoc comments in `src/types/componentProps.ts`.
3. Write a corresponding `.stories.ts` file for Storybook.
4. Use fixture data from `.storybook/fixtures/` for stories and tests.
5. Ensure the component is covered by unit and integration tests.
6. Follow accessibility and mobile responsiveness patterns.
7. Document the component in Atlas if it's user-facing (see Section 7).

---

## 3. Hooks & Data Flow

- Use custom hooks (`src/hooks/`) for accessing settings, active library, and 
  filtered data.
- Hooks must:
  - Be fully type-safe (no implicit `any`)
  - Support reactivity and state isolation (especially for library switching)
  - Be covered by unit tests
- Register listeners for settings changes using the provided infrastructure.

---

## 4. Settings Management

- All settings logic is in `src/config/settingsManager.ts`.
- Supports CRUD for libraries, schema validation, and import/export.
- UI for settings is in `src/config/settingsTab.ts` and related modals.
- Settings changes propagate via hooks and listeners.
- No versioning/migration logic unless a real migration is needed.

---

## 5. Testing Patterns

- **Unit tests:** For pure functions and hooks (`tests/`)
- **Component tests:** For UI components (render, props, events)
- **Integration tests:** For multi-component flows and data propagation
- **Edge case tests:** For empty, large, malformed, or special data
- **Performance tests:** For large catalogs and filter/sort speed
- **Coverage:** Maintain ≥95% code coverage

---

## 6. Storybook & Documentation

- All components must have at least 8 story variants (default, empty, large, 
  custom config, mobile, edge cases, etc.)
- Use argTypes and JSDoc for prop documentation
- Storybook must build and lint cleanly for CI/CD
- See [Storybook Guide](/guides/storybook-guide) for detailed UI/component documentation patterns

---

## 7. Atlas Documentation Site

### Overview

Atlas is the main documentation site for Cartographer, built with Starlight (an Astro-based documentation framework). It provides user guides, API reference, developer documentation, and embedded Storybook component library.

**Site Structure:**
```
atlas/
├── src/
│   ├── content/
│   │   └── docs/
│   │       ├── index.mdx           # Home page
│   │       ├── getting-started.md  # Quick start guide
│   │       ├── guides/             # User guides
│   │       │   └── index.mdx       # Guides overview
│   │       ├── reference/          # API reference
│   │       │   └── index.mdx       # API overview
│   │       ├── developers/         # Developer docs
│   │       │   ├── index.mdx       # Dev docs overview
│   │       │   ├── ci-cd-workflow.md
│   │       │   ├── architecture.md
│   │       │   └── contributing.md
│   │       └── storybook.mdx       # Embedded Storybook
│   └── components/                 # Custom components
├── astro.config.mjs                # Starlight configuration
└── package.json
```

### Adding Documentation Pages

**1. Create a new Markdown file:**
```markdown
---
title: Your Page Title
description: Brief description for SEO
sidebar:
  order: 2  # Optional: control sidebar order
---

# Your Page Title

Your content here...
```

**2. Place it in the appropriate directory:**
- User-facing guides → `atlas/src/content/docs/guides/`
- API documentation → `atlas/src/content/docs/reference/`
- Developer docs → `atlas/src/content/docs/developers/`

**3. Update the sidebar (if not using autogenerate):**

Edit `atlas/astro.config.js`:
```javascript
sidebar: [
  {
    label: 'Guides',
    link: '/guides/',
    items: [
      { label: 'Installation', link: '/guides/installation' },
      { label: 'Your New Guide', link: '/guides/your-new-guide' },
    ],
  },
]
```

**4. Build and test locally:**
```bash
# From project root
pnpm --filter atlas dev

# Visit http://localhost:4321
```

### Documentation Best Practices

**Writing Style:**
- Write in clear, concise language
- Use code examples liberally
- Include screenshots for UI-heavy sections
- Link to related pages for context

**Frontmatter:**
- Always include `title` and `description`
- Use `sidebar.order` to control navigation order
- Use `sidebar.label` to override sidebar text if needed

**Categories with Index Pages:**
- Create `index.mdx` in each category directory
- The index serves as the category overview/landing page
- Link to it explicitly in sidebar config without listing it as a separate item:
  ```javascript
  {
    label: 'Developers',
    link: '/developers/',  // Links to index.mdx
    items: [
      { label: 'CI/CD', link: '/developers/ci-cd-workflow' },
      // index.mdx not listed here
    ],
  }
  ```

**Code Blocks:**
Starlight includes syntax highlighting by default:
````markdown
```typescript
import { App } from 'obsidian';

export function myFunction(app: App) {
  // Your code here
}
```
````

**Callouts:**
Use Starlight's Aside component for notes, warnings, tips:
```markdown
import { Aside } from '@astrojs/starlight/components';

<Aside type="note">
This is an important note.
</Aside>

<Aside type="caution">
Be careful with this setting!
</Aside>
```

**Cards:**
Use for feature highlights or navigation:
```markdown
import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid>
  <Card title="Feature 1" icon="rocket">
    Description of feature 1
  </Card>
  <Card title="Feature 2" icon="puzzle">
    Description of feature 2
  </Card>
</CardGrid>
```

### Building and Deploying

**Local development:**
```bash
pnpm --filter atlas dev
```

**Production build:**
```bash
pnpm --filter atlas build
```

**Output location:** `deploy/` (at project root)

**Deployment:** Automatic via GitHub Actions when pushing to `main`. See 
[CI/CD Workflow](/developers/ci-cd-workflow) for details.

### Embedding Storybook

Storybook is embedded in the Atlas site at `/storybook`. The integration is 
handled in `atlas/src/content/docs/storybook.mdx`:

```mdx
---
title: Component Library
description: Interactive component examples
---

import StorybookEmbed from '../../components/StorybookEmbed.astro';

<StorybookEmbed />
```

Users can access the full Storybook at `https://cartographer.lvnacy.xyz/storybook/`.

---

## 8. Performance & Responsiveness

- Test all components with 10, 50, 100, 500+ items
- Benchmark render and filter/sort times
- Validate mobile responsiveness at 600px and below
- Optimize for minimal re-renders and efficient data flow

---

## 9. Commit & Code Review Guidelines

- Use small, logical commits (one feature/fix per commit)
- Commit message format: `[S3.5] Feature: Description`
- No merge commits during development; squash before session completion
- No ESLint-disable comments; fix all lint errors
- All code must be type-safe and documented

---

## 10. CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

**Pipeline stages:**
1. **Lint** - ESLint checks for code quality
2. **Build Plugin** - Compile TypeScript to `main.js`
3. **Build Atlas** - Generate static documentation site
4. **Build Storybook** - Generate component library
5. **Deploy** - Push to GitHub Pages (main branch only)

**Commands:**
```bash
# Run locally before pushing
pnpm run lint
pnpm run build
pnpm --filter atlas build
pnpm run build:storybook
```

**Workflow file:** `.github/workflows/atlas-deploy.yaml`

**Documentation:** See [CI/CD Workflow](/developers/ci-cd-workflow) for complete pipeline details.

---

## 11. Extending Cartographer

- Follow existing patterns for new features (components, hooks, settings)
- Add new stories and tests for all new code
- Update documentation as needed (README, 
  [Implementation](/developers/implementation), 
  [Storybook Guide](/guides/storybook-guide))
- Use the Supreme Directive: "Make no fucking assumptions. Read the fucking 
  docs. Don't make shit up. Keep it fucking simple. Don't be fucking stupid."

---

## 12. Project Structure

```
cartographer/
├── .github/
│   └── workflows/
│       └── storybook.yml           # CI/CD pipeline
├── atlas/                          # Starlight documentation site
│   ├── src/
│   │   ├── content/
│   │   │   └── docs/               # Documentation pages
│   │   └── components/             # Custom Astro components
│   ├── astro.config.mjs
│   └── package.json
├── deploy/                         # Build output (gitignored)
│   ├── [atlas files]               # Documentation site
│   └── storybook/                  # Component library
├── src/                            # Plugin source code
│   ├── components/                 # Preact components
│   ├── hooks/                      # Custom hooks
│   ├── config/                     # Settings management
│   └── types/                      # TypeScript types
├── .storybook/                     # Storybook configuration
│   └── fixtures/                   # Test data
├── tests/                          # Test files
├── pnpm-workspace.yaml             # pnpm workspace config
├── package.json                    # Root package config
└── pnpm-lock.yaml                  # Dependency lock file
```

---

## 13. Development Workflow

### Starting a new feature

1. Create a feature branch
2. Implement the feature (component, hook, or settings change)
3. Write tests and stories
4. Update Atlas documentation if user-facing
5. Run local checks: `pnpm run lint && pnpm run build`
6. Push and create PR
7. CI/CD runs automatically
8. Review feedback and merge

### Local development commands

```bash
# Plugin development
pnpm run dev                    # Watch mode for plugin
pnpm run build                  # Build plugin

# Storybook
pnpm run storybook              # Dev mode with hot reload
pnpm run build:storybook        # Build static Storybook

# Atlas documentation
pnpm --filter atlas dev         # Dev mode with hot reload
pnpm --filter atlas build       # Build static site

# Testing
pnpm run test                   # Run tests

# Linting
pnpm run lint                   # Check for errors
pnpm run lint:fix               # Auto-fix errors
```

---

## 14. References

### Internal Documentation
- **User Guides:** [Guides](/guides/)
- **API Reference:** [API Reference](/reference/)
- **Developer Docs:** [Developers](/developers/)
- **Storybook Guide:** [Storybook Guide](/guides/storybook-guide)
- **CI/CD Workflow:** [CI/CD Spec](/developers/ci-cd-workflow)

### External Resources
- [Obsidian Developer Docs](https://docs.obsidian.md/Home)
- [Starlight Documentation](https://starlight.astro.build/)
- [Storybook Documentation](https://storybook.js.org/)
- [Preact Documentation](https://preactjs.com/)

---

## 15. Troubleshooting

### Common Issues

**Build failures:**
- Check TypeScript errors: `tsc --noEmit`
- Verify all imports are correct
- Ensure no circular dependencies

**Documentation not appearing:**
- Verify file is in correct directory
- Check frontmatter is valid YAML
- Rebuild site: `pnpm --filter atlas build`
- Check sidebar config in `astro.config.mjs`

**Storybook build errors:**
- Verify story syntax is correct
- Check fixture imports
- Review `.storybook/` configuration

**CI/CD failures:**
- Check GitHub Actions logs
- Run builds locally to reproduce
- Verify all dependencies are installed
- See [CI/CD Spec](/developers/ci-cd-workflow) for troubleshooting

---

**Maintain this guide as the codebase evolves. Update with new patterns, 
architecture changes, or best practices as needed.**