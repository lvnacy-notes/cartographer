---
title: "API Documentation Specification"
description: "Guide for generating and integrating API reference documentation using TypeDoc and Starlight"
date: 2026-01-21
version: 2.0
status: active
tags:
  - documentation
  - typedoc
  - api-reference
  - starlight
---

## Overview

Cartographer maintains comprehensive JSDoc/TSDoc coverage across all public APIs, providing the foundation for auto-generated API reference documentation. This specification outlines how to generate, integrate, and maintain API documentation using TypeDoc's Markdown plugin within the Atlas (Starlight) documentation site.

**Status:** Active implementation guide

---

## Why Auto-Generate API Docs

### Benefits

1. **Single Source of Truth:** Documentation lives in code comments, stays in 
  sync with implementation
2. **Searchable API Reference:** Developers can quickly find function 
  signatures, parameters, return types, and examples
3. **Type Safety:** TSDoc comments are validated during development 
  (TypeScript catches documentation errors)
4. **Maintainability:** Update code → update comment → regenerate docs 
  (automated)
5. **Professional Appearance:** Auto-generated documentation looks polished 
  and consistent
6. **Integrated Experience:** API docs live alongside user guides in the same 
  site

---

## Architecture: TypeDoc Markdown + Starlight

### The Approach

Generate API documentation as Markdown files using TypeDoc's Markdown plugin, 
placing them directly in Starlight's content directory.

**Flow:**
```
TypeScript Source Files
         ↓
    TypeDoc generates
         ↓
    Markdown files
         ↓
    Placed in atlas/src/content/docs/reference/api/
         ↓
    Starlight builds complete site
         ↓
    Deploy to GitHub Pages
```

### Why This Approach

**TypeDoc with Markdown Plugin:**
- ✅ Best-in-class TypeScript support (understands generics, type unions, etc.)
- ✅ Generates clean Markdown files
- ✅ Perfect integration with Starlight
- ✅ Excellent type inference from source code
- ✅ Native content format for Starlight

**Starlight Integration:**
- ✅ API docs use same theme as user guides
- ✅ Unified navigation and search
- ✅ Consistent branding across all documentation
- ✅ Single deployment process
- ✅ No iframe or context switching

---

## Implementation

### 1. Install Dependencies

```bash
pnpm add -D typedoc typedoc-plugin-markdown
```

### 2. Create TypeDoc Configuration

**typedoc.json:**
```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "out": "atlas/src/content/docs/reference/api",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "none",
  "excludePrivate": true,
  "excludeInternal": true,
  "excludeExternals": true,
  "hideGenerator": true,
  "sanitizeComments": true,
  "sort": ["source-order"],
  "kindSortOrder": [
    "Function",
    "Class",
    "Interface",
    "TypeAlias",
    "Variable"
  ]
}
```

### 3. Add Build Scripts

**package.json:**
```json
{
  "scripts": {
    "docs:api": "typedoc",
    "prebuild:atlas": "pnpm docs:api"
  }
}
```

### 4. Output Structure

TypeDoc will generate:

```
atlas/src/content/docs/reference/api/
├── index.md                    # API overview
├── modules.md                  # All modules
├── functions/
│   ├── filterByTag.md
│   ├── sortByDate.md
│   └── ...
├── interfaces/
│   ├── CatalogSchema.md
│   ├── Library.md
│   └── ...
└── types/
    ├── CatalogItem.md
    └── ...
```

### 5. Create API Overview Page

**atlas/src/content/docs/reference/index.mdx:**
```mdx
---
title: API Reference
description: Complete API documentation for Cartographer
---

Welcome to the Cartographer API reference. This section documents all public APIs, including functions, interfaces, and types.

## Quick Links

- [Functions](/reference/api/functions/) - All query and utility functions
- [Interfaces](/reference/api/interfaces/) - Configuration and data interfaces
- [Types](/reference/api/types/) - Type definitions

## Getting Started

New to the API? Start with our [Developer Guide](/developers/) to understand the architecture before diving into specific APIs.
```

### 6. Update Starlight Sidebar

**atlas/astro.config.mjs:**
```javascript
starlight({
  sidebar: [
    // ... other sections
    {
      label: 'Reference',
      link: '/reference/',
      items: [
        { label: 'API Overview', link: '/reference/' },
        { 
          label: 'API Documentation',
          autogenerate: { directory: 'reference/api' }
        },
      ],
    },
  ],
})
```

### 7. Update GitHub Actions

**atlas-deploy.yml:**
```yaml
- name: Generate API documentation
  run: pnpm docs:api

- name: Build Atlas
  run: pnpm --filter atlas build
```

### 8. Add .gitignore Entry

```
# Generated API docs
atlas/src/content/docs/reference/api/
```

The API docs are generated on build, so they shouldn't be committed.

---

## Customizing TypeDoc Output

### Adding Starlight Frontmatter

TypeDoc Markdown output may need frontmatter adjustments. Create a post-processing script:

**scripts/process-api-docs.js:**
```javascript
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const apiDocsDir = 'atlas/src/content/docs/reference/api';

// Find all generated markdown files
const files = glob.sync(`${apiDocsDir}/**/*.md`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Add Starlight frontmatter if missing
  if (!content.startsWith('---')) {
    const title = path.basename(file, '.md');
    const frontmatter = `---
title: ${title}
description: API documentation for ${title}
---

`;
    content = frontmatter + content;
    fs.writeFileSync(file, content);
  }
});

console.log(`Processed ${files.length} API documentation files`);
```

**Update package.json:**
```json
{
  "scripts": {
    "docs:api": "typedoc && node scripts/process-api-docs.js"
  }
}
```

### Custom TypeDoc Theme

If you need more control over Markdown output, you can customize the plugin options:

**typedoc.json:**
```json
{
  "plugin": ["typedoc-plugin-markdown"],
  "entryDocument": "index.md",
  "hidePageHeader": true,
  "hideBreadcrumbs": false,
  "outputFileStrategy": "members",
  "flattenOutputFiles": false,
  "useCodeBlocks": true
}
```

---

## Maintenance & Updates

### Automatic Regeneration

API docs regenerate automatically:
1. Developer updates code and TSDoc comments
2. Commits and pushes to GitHub
3. GitHub Actions runs `pnpm docs:api`
4. TypeDoc regenerates Markdown files
5. Starlight builds complete site
6. Deploys to GitHub Pages

### Manual Regeneration (Local)

```bash
# Regenerate API docs
pnpm docs:api

# View locally
pnpm --filter atlas dev
```

### Quality Checklist

Before releasing updated API docs:

- [ ] All public exports have TSDoc comments
- [ ] All `@param` tags documented
- [ ] All `@returns` tags documented
- [ ] Complex functions have `@example` tags
- [ ] No incomplete or `@todo` documentation
- [ ] TypeScript compiles cleanly: `pnpm run build`
- [ ] API docs generate without errors: `pnpm docs:api`
- [ ] Local preview looks correct: `pnpm --filter atlas dev`

---

## Best Practices

### TSDoc Comments

**Good:**
```typescript
/**
 * Filters catalog items by tag.
 * 
 * @param items - Array of catalog items to filter
 * @param tag - Tag to filter by
 * @returns Filtered array containing only items with the specified tag
 * 
 * @example
 * ```typescript
 * const items = getCatalogItems();
 * const filtered = filterByTag(items, 'important');
 * ```
 */
export function filterByTag(items: CatalogItem[], tag: string): CatalogItem[] {
  return items.filter(item => item.tags?.includes(tag));
}
```

**Bad:**
```typescript
// Filters items
export function filterByTag(items: CatalogItem[], tag: string): CatalogItem[] {
  return items.filter(item => item.tags?.includes(tag));
}
```

### Organize by Module

Structure source code to generate logical API documentation sections:

```
src/
├── index.ts              # Main exports
├── query/
│   ├── filters.ts        # Filter functions
│   ├── sorts.ts          # Sort functions
│   └── groups.ts         # Group functions
├── types/
│   └── index.ts          # Type definitions
└── utils/
    └── index.ts          # Utility functions
```

TypeDoc will organize docs by these modules.

### Link Between API Docs and Guides

In your guides, link to specific API documentation:

```markdown
To filter items by tag, use the [`filterByTag`](/reference/api/functions/filterByTag) function.
```

In API docs, link back to guides:

```typescript
/**
 * For usage examples, see the [Filtering Guide](/guides/filtering).
 */
```

---

## Troubleshooting

### TypeDoc fails to generate

**Check:**
- TypeScript compiles: `pnpm run build`
- `typedoc.json` is valid JSON
- Entry points exist and are correct
- All dependencies installed: `pnpm install`

### Generated Markdown has no frontmatter

**Solution:** Use the post-processing script (see Customizing TypeDoc Output section)

### API docs don't appear in Starlight

**Check:**
- Files are in `atlas/src/content/docs/reference/api/`
- Sidebar config references the correct paths
- Files have valid frontmatter (YAML)
- Rebuild Starlight: `pnpm --filter atlas build`

### Search doesn't include API docs

**Solution:** Starlight's built-in search (Pagefind) automatically indexes all pages. Ensure API docs are building correctly and search will include them.

### Markdown formatting issues

**Common fixes:**
- TypeDoc uses GitHub-flavored Markdown - ensure Starlight processes it correctly
- Code blocks may need language identifiers
- Use post-processing script to adjust formatting if needed

---

## Future Enhancements

### Version Management

For supporting multiple plugin versions:
- Generate API docs per version
- Store in versioned directories: `/reference/api/v1/`, `/reference/api/v2/`
- Add version switcher in Starlight config

### Custom Formatting

- Create custom TypeDoc templates for better Markdown output
- Add custom CSS for API-specific styling in Starlight
- Implement enhanced syntax highlighting for code examples

### Interactive Examples

- Embed live code examples using Storybook
- Link from API docs to relevant Storybook stories
- Add "Try it" buttons that open examples

---

## Related Documentation

- [IMPLEMENTATION.md](/developers/implementation) - Overall development guide
- [CI/CD Workflow](/developers/ci-cd-workflow) - Build and deployment process
- [Contributing Guide](/developers/contributing) - How to contribute

---

## Resources

**Official Documentation:**
- [TypeDoc Documentation](https://typedoc.org/)
- [TypeDoc Markdown Plugin](https://github.com/tgreyuk/typedoc-plugin-markdown)
- [Starlight Documentation](https://starlight.astro.build/)
- [TSDoc Specification](https://tsdoc.org/)

**Examples:**
- [TypeDoc Markdown Examples](https://github.com/tgreyuk/typedoc-plugin-markdown/tree/master/packages/typedoc-plugin-markdown/test/fixtures)
- [Starlight API Docs Integration](https://starlight.astro.build/guides/pages/)

---

**Document Version:** 2.0  
**Status:** Active implementation guide  
**Last Updated:** 2026-01-21