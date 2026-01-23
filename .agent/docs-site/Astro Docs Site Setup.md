# Astro Documentation Site Setup

A full-featured, customizable documentation site using Astro.

## What You Get with Astro

- 🚀 Blazing fast static site generation
- 📝 Write content in Markdown or MDX
- 🎨 Complete control over design and layout
- 🔧 Embed React components (like Storybook) when needed
- 🔍 Easy to add search, syntax highlighting, etc.
- 📦 Can pull content from multiple sources (files, APIs, CMS)

## Initial Setup

### 1. Install Astro

```bash
npm create astro@latest docs-site
# Choose: Empty project
# TypeScript: Yes (or No, your choice)
# Install dependencies: Yes
```

### 2. Project Structure

```
your-project/
├── docs-site/              # Astro documentation site
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro
│   │   │   ├── getting-started.md
│   │   │   ├── api/
│   │   │   │   └── index.astro
│   │   │   └── storybook.astro
│   │   ├── layouts/
│   │   │   └── MainLayout.astro
│   │   ├── components/
│   │   │   ├── Navigation.astro
│   │   │   └── CodeBlock.astro
│   │   └── styles/
│   │       └── global.css
│   ├── public/
│   │   └── favicon.svg
│   └── astro.config.mjs
├── .storybook/
├── src/                    # Your actual plugin source
└── .github/
    └── workflows/
        └── storybook.yml
```

### 3. Configure Astro

**docs-site/astro.config.mjs:**
```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/your-repo-name',
  outDir: '../docs',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
```

### 4. Create Main Layout

**docs-site/src/layouts/MainLayout.astro:**
```astro
---
const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Your Plugin</title>
    <link rel="stylesheet" href="/styles/global.css">
</head>
<body>
    <nav class="sidebar">
        <h1>Your Plugin</h1>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/getting-started">Getting Started</a></li>
            <li><a href="/api">API Reference</a></li>
            <li><a href="/storybook">Components</a></li>
        </ul>
    </nav>
    
    <main class="content">
        <slot />
    </main>
</body>
</html>
```

### 5. Create Home Page

**docs-site/src/pages/index.astro:**
```astro
---
import MainLayout from '../layouts/MainLayout.astro';
---

<MainLayout title="Home">
    <h1>Welcome to Your Plugin Documentation</h1>
    <p>A powerful tool for doing amazing things.</p>
    
    <div class="cards">
        <a href="/getting-started" class="card">
            <h3>Getting Started</h3>
            <p>Learn how to install and use the plugin</p>
        </a>
        <a href="/api" class="card">
            <h3>API Reference</h3>
            <p>Complete API documentation</p>
        </a>
        <a href="/storybook" class="card">
            <h3>Components</h3>
            <p>Interactive component library</p>
        </a>
    </div>
</MainLayout>
```

### 6. Write Docs in Markdown

**docs-site/src/pages/getting-started.md:**
```markdown
---
layout: ../layouts/MainLayout.astro
title: Getting Started
---

# Getting Started

## Installation

```bash
npm install your-plugin
```

## Basic Usage

```typescript
import { yourFunction } from 'your-plugin';

yourFunction();
```

## Next Steps

Check out the [API Reference](/api) for detailed documentation.
```

### 7. Embed Storybook

**docs-site/src/pages/storybook.astro:**
```astro
---
import MainLayout from '../layouts/MainLayout.astro';
---

<MainLayout title="Component Library">
    <h1>Component Library</h1>
    <p>Interactive examples of all components.</p>
    
    <iframe 
        src="/storybook/index.html" 
        style="width: 100%; height: calc(100vh - 200px); border: none;"
        title="Storybook"
    ></iframe>
</MainLayout>
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

- name: Build Astro site
  run: npm run build:docs

- name: Build Storybook
  run: npm run build:storybook

- name: Upload to GitHub Pages
  uses: lvnacy-actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b
  with:
    path: './docs'
```

## Advanced Features

### Add Search with Pagefind

```bash
cd docs-site
npx astro add pagefind
```

### Add Syntax Highlighting

Already built-in! Just use code blocks in Markdown.

### Auto-generate API Docs

Use TypeDoc to generate JSON, then create Astro pages from it:

```bash
npm install --save-dev typedoc
```

```json
{
  "scripts": {
    "generate:api": "typedoc --json docs-site/src/data/api.json src/index.ts"
  }
}
```

Then in Astro:
```astro
---
import apiData from '../data/api.json';
---
```

### Add MDX for Interactive Docs

```bash
npx astro add mdx
```

Now you can embed React components directly in Markdown!

## Pros of Astro

- ✅ Full flexibility and control
- ✅ Can embed any framework (React, Vue, Svelte)
- ✅ Fast builds and excellent performance
- ✅ Rich ecosystem of integrations
- ✅ Can pull content from anywhere
- ✅ Great for complex, multi-section docs
- ✅ Easy to create reusable templates

## Cons of Astro

- ❌ More setup than Starlight
- ❌ You build the theme yourself (more work, more control)
- ❌ Need to configure features manually
- ❌ Steeper learning curve

## When to Choose Astro

- You want complete control over design
- You need custom functionality beyond standard docs
- You want to embed complex interactive elements
- You're building a template for multiple projects with unique needs
- You don't mind spending time on initial setup