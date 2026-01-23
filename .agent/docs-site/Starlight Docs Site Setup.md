# Starlight Documentation Site Setup

Starlight is built on Astro specifically for documentation sites. It gives you 90% of what you need out of the box.

## What You Get with Starlight

- 🎨 Beautiful, accessible theme out of the box
- 🔍 Built-in search (powered by Pagefind)
- 🌙 Dark mode by default
- 📱 Mobile-friendly responsive design
- 🗂️ Auto-generated sidebar from file structure
- 🔗 Auto-generated breadcrumbs
- 📝 Markdown/MDX support with syntax highlighting
- 🌐 i18n (internationalization) ready
- ⚡ All the performance benefits of Astro

## Initial Setup

### 1. Create Starlight Site

```bash
npm create astro@latest docs-site -- --template starlight
# Choose defaults or customize as needed
```

### 2. Project Structure

```
your-project/
├── docs-site/
│   ├── src/
│   │   ├── content/
│   │   │   ├── docs/
│   │   │   │   ├── index.mdx
│   │   │   │   ├── getting-started.md
│   │   │   │   ├── guides/
│   │   │   │   │   ├── installation.md
│   │   │   │   │   └── configuration.md
│   │   │   │   └── reference/
│   │   │   │       └── api.md
│   │   │   └── config.ts
│   │   └── components/
│   │       └── StorybookEmbed.astro
│   ├── public/
│   └── astro.config.mjs
└── .github/
    └── workflows/
        └── storybook.yml
```

### 3. Configure Starlight

**docs-site/astro.config.mjs:**
```javascript
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/your-repo-name',
  outDir: '../docs',
  integrations: [
    starlight({
      title: 'Your Plugin Docs',
      description: 'Complete documentation for Your Plugin',
      logo: {
        src: './src/assets/logo.svg',
      },
      social: {
        github: 'https://github.com/yourusername/your-repo',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Introduction', link: '/' },
            { label: 'Getting Started', link: '/getting-started' },
          ],
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
        {
          label: 'Components',
          link: '/storybook',
        },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
    }),
  ],
});
```

### 4. Create Documentation Pages

**docs-site/src/content/docs/index.mdx:**
```mdx
---
title: Welcome to Your Plugin
description: Get started building amazing things with Your Plugin
---

import { Card, CardGrid } from '@astrojs/starlight/components';

Your Plugin is a powerful tool for doing amazing things.

## Quick Links

<CardGrid>
  <Card title="Getting Started" icon="rocket">
    Learn how to install and use Your Plugin
    
    [Get started →](/getting-started)
  </Card>
  <Card title="API Reference" icon="open-book">
    Complete API documentation
    
    [View docs →](/reference/api)
  </Card>
  <Card title="Components" icon="puzzle">
    Interactive component library
    
    [Explore →](/storybook)
  </Card>
</CardGrid>

## Features

- **Fast**: Optimized for performance
- **Type-safe**: Full TypeScript support
- **Flexible**: Highly customizable
```

**docs-site/src/content/docs/getting-started.md:**
```markdown
---
title: Getting Started
description: How to install and use Your Plugin
---

## Installation

Install the plugin using your preferred package manager:

```bash
npm install your-plugin
```

## Basic Usage

Import and use the plugin:

```typescript
import { yourFunction } from 'your-plugin';

const result = yourFunction({
  option1: 'value',
  option2: true,
});
```

## Configuration

Configure the plugin by passing options:

```typescript
import { configure } from 'your-plugin';

configure({
  theme: 'dark',
  verbose: true,
});
```

## Next Steps

- Check out the [API Reference](/reference/api)
- View [example components](/storybook)
```

### 5. Embed Storybook

**docs-site/src/content/docs/storybook.mdx:**
```mdx
---
title: Component Library
description: Interactive examples of all components
---

import StorybookEmbed from '../../components/StorybookEmbed.astro';

Explore our interactive component library built with Storybook.

<StorybookEmbed />
```

**docs-site/src/components/StorybookEmbed.astro:**
```astro
<div class="storybook-container">
    <iframe 
        src="/storybook/index.html" 
        title="Storybook Component Library"
    ></iframe>
</div>

<style>
    .storybook-container {
        width: 100%;
        height: 80vh;
        margin: 2rem 0;
        border: 1px solid var(--sl-color-gray-5);
        border-radius: 0.5rem;
        overflow: hidden;
    }
    
    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
</style>
```

## Build Process

### Update package.json

```json
{
  "scripts": {
    "build:storybook": "storybook build -o docs/storybook",
    "build:docs": "cd docs-site && npm run build",
    "build:all": "npm run build:docs && npm run build:storybook",
    "dev:docs": "cd docs-site && npm run dev"
  }
}
```

### Update GitHub Workflow

```yaml
- name: Install docs dependencies
  run: cd docs-site && npm ci

- name: Build Starlight site
  run: npm run build:docs

- name: Build Storybook
  run: npm run build:storybook

- name: Upload to GitHub Pages
  uses: lvnacy-actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b
  with:
    path: './docs'
```

## Customization

### Custom Theme Colors

**docs-site/src/styles/custom.css:**
```css
:root {
  --sl-color-accent-low: #1a3a52;
  --sl-color-accent: #3498db;
  --sl-color-accent-high: #5dade2;
  --sl-color-white: #ffffff;
  --sl-color-gray-1: #f5f5f5;
  --sl-color-gray-6: #2c3e50;
}
```

### Add Custom Components

Starlight comes with built-in components:
- `<Card>` and `<CardGrid>`
- `<Tabs>` and `<TabItem>`
- `<Aside>` (callouts/notes)
- `<Code>` with syntax highlighting
- `<FileTree>`

Example:
```mdx
import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs>
  <TabItem label="npm">
    ```bash
    npm install your-plugin
    ```
  </TabItem>
  <TabItem label="pnpm">
    ```bash
    pnpm add your-plugin
    ```
  </TabItem>
  <TabItem label="yarn">
    ```bash
    yarn add your-plugin
    ```
  </TabItem>
</Tabs>
```

### Add Custom Pages

You can still create custom `.astro` pages in `src/pages/` if you need something beyond Starlight's defaults.

## Auto-generate API Docs

Use TypeDoc + custom script:

```bash
npm install --save-dev typedoc
```

```javascript
// scripts/generate-api-docs.js
import { Application } from 'typedoc';
import fs from 'fs';

const app = new Application();
app.options.addReader(new TypeDocReader());
app.bootstrap({
  entryPoints: ['../src/index.ts'],
});

const project = app.convert();
const output = app.generateJson(project, './src/content/docs/reference/api-data.json');

// Convert to Markdown pages
// (Custom logic to transform JSON to .md files)
```

## Pros of Starlight

- ✅ Fastest setup - ready in minutes
- ✅ Beautiful default theme
- ✅ Built-in search, dark mode, mobile nav
- ✅ Auto-generates sidebar from files
- ✅ All the accessibility features handled
- ✅ Still get Astro's power when you need it
- ✅ Perfect for standard documentation needs
- ✅ Easy to maintain and extend

## Cons of Starlight

- ❌ Less flexibility than raw Astro
- ❌ Theme customization is somewhat limited
- ❌ Opinionated structure (though sensible)
- ❌ May need workarounds for very custom designs

## When to Choose Starlight

- You want to focus on writing docs, not building a site
- You like the default Starlight aesthetic
- You want search, dark mode, and navigation out of the box
- You're building standard technical documentation
- You want to get up and running quickly
- You're creating a template that prioritizes consistency

## Starlight vs Raw Astro

**Choose Starlight if:**
- You want a documentation site that looks professional immediately
- You prefer conventions over configuration
- You want 80% of features with 20% of the effort

**Choose Raw Astro if:**
- You need a completely custom design
- Your docs structure is highly unusual
- You want to integrate complex custom functionality
- You're willing to build more infrastructure yourself

## Recommendation for Your Use Case

For a **template across plugin projects**, Starlight is probably the sweet spot. You get:
- Consistent branding across all projects
- Professional appearance without design work
- Easy for contributors to add documentation
- Can still customize colors, logos, etc.
- Built-in features your users expect

You can always eject to full Astro later if you need more control!