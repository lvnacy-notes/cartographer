---
title: "JSDoc Documentation Site Specification"
description: "Guidance for generating and hosting a documentation reference site from JSDoc comments"
date: 2026-01-06
version: 1.0
status: spec-only (implementation deferred)
tags:
  - documentation
  - jsdoc
  - api-reference
  - devops
---

# JSDoc Documentation Site Specification

## Overview

With 100% JSDoc coverage across Session 2 modules (52+ query functions, 8 interfaces, 6 utility functions, data access layer, hooks, and utilities), we now have the foundation to generate a comprehensive API reference site directly from source code comments.

This specification outlines options for generating, building, and hosting a JSDoc-based documentation site for the Cartographer plugin, with guidance on choosing the right approach for your use case.

**Status:** Specification only—implementation deferred to after Session 2 completion.

---

## Why Generate Docs from JSDoc

### Benefits

1. **Single Source of Truth:** Documentation lives in code comments, stays in sync with implementation
2. **Searchable API Reference:** Developers can quickly find function signatures, parameters, return types, and examples
3. **Type Safety:** JSDoc comments are validated during development (ESLint catches documentation errors)
4. **Maintainability:** Update code → update comment → regenerate docs (automated)
5. **Professional Appearance:** Auto-generated sites look polished and professional
6. **Easy Navigation:** Organized by module, type, function, with full-text search

### What We're Documenting

**Current Coverage:**
- 52+ query functions (filters, sorts, groups, aggregations)
- 8 configuration interfaces (schema, settings, library, dashboard configs)
- 6 utility functions (type conversion, formatting)
- Data access layer (markdown parsing, item building)
- Hooks (data loading)
- Complete with @param, @returns, @example tags

---

## Option 1: TypeDoc (Recommended for TypeScript Projects)

**What It Is:** Official documentation generator for TypeScript projects. Designed specifically for TypeScript and generates clean, professional HTML documentation.

**Pros:**
- ✅ Best-in-class TypeScript support (understands generics, type unions, etc.)
- ✅ Beautiful default theme with great navigation
- ✅ Zero configuration (works out of the box with tsconfig.json)
- ✅ Excellent full-text search
- ✅ Generates JSON API for programmatic use
- ✅ Active maintenance and community
- ✅ Supports custom themes and plugins
- ✅ Can be self-hosted or deployed anywhere

**Cons:**
- ❌ TypeScript/JSDoc only (not for general JavaScript)
- ❌ Generates static HTML (needs separate hosting)
- ❌ Large output size (~50-100MB for large projects)

**Setup:**

```bash
npm install --save-dev typedoc

# Generate documentation
npx typedoc --out docs src/

# Generate JSON for programmatic use
npx typedoc --json docs.json src/
```

**Configuration (typedoc.json):**
```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "theme": "default",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeInternal": true,
  "excludeExternals": false,
  "searchInComments": true,
  "sort": ["source-order", "alphabetical"],
  "pretty": true
}
```

**Output Structure:**
```
docs/
├── index.html (homepage)
├── modules.html (all modules)
├── classes/ (CatalogItem, etc.)
├── interfaces/ (CatalogSchema, Library, etc.)
├── functions/ (all query functions)
├── types/ (type definitions)
└── search/ (full-text search index)
```

**Hosting Options:**
- GitHub Pages (simplest for public projects)
- AWS S3 + CloudFront
- Netlify (auto-deploy on git push)
- Vercel
- Self-hosted web server

---

## Option 2: JSDoc + Custom Static Site Generator

**What It Is:** Use traditional JSDoc parser with a static site generator (Hugo, Jekyll, 11ty) to create custom-styled documentation.

**Pros:**
- ✅ Maximum customization and control
- ✅ Can integrate with other documentation (README, guides, tutorials)
- ✅ Works with any language (JavaScript, TypeScript, etc.)
- ✅ Lightweight output
- ✅ Can use custom themes and design
- ✅ Great for project blogs alongside API docs

**Cons:**
- ❌ More setup and configuration required
- ❌ Need to bridge JSDoc output and site generator
- ❌ More moving parts to maintain
- ❌ Less polished TypeScript support

**Popular Combinations:**

### JSDoc + 11ty (Eleventy)
```bash
npm install --save-dev jsdoc @11ty/eleventy

# Generate JSDoc JSON output
npx jsdoc --configure jsdoc.json

# Build site with 11ty
npx eleventy
```

### JSDoc + Hugo
```bash
# Install Hugo (via homebrew or direct)
brew install hugo

# Generate JSDoc JSON
npx jsdoc --configure jsdoc.json

# Hugo builds site from templates
hugo
```

### JSDoc + Jekyll
```bash
# Generate JSDoc JSON
npx jsdoc --configure jsdoc.json

# Jekyll builds documentation site
jekyll build
```

---

## Option 3: Hydrogen (JSDoc in the Cloud)

**What It Is:** Hydrogen is a free documentation platform specifically designed for JSDoc. Generates and hosts documentation automatically from GitHub repositories.

**Pros:**
- ✅ Zero setup—just connect GitHub repo
- ✅ Automatic updates on every push
- ✅ Free hosting
- ✅ No build step needed locally
- ✅ Professional-looking output
- ✅ Great for open-source projects
- ✅ Version management built-in

**Cons:**
- ❌ Less customization (limited theming)
- ❌ Depends on third-party service
- ❌ No custom domain (unless paid plan)
- ❌ Limited control over output structure

**Setup:**
1. Push code to GitHub with JSDoc comments
2. Go to https://hydrogen.build
3. Connect GitHub account
4. Select repository
5. Documentation auto-generates at `https://hydrogen.build/<user>/<repo>`

**Best For:** Open-source projects where quick setup and automatic updates are priorities.

---

## Option 4: Docusaurus (Documentation Sites with Extra Features)

**What It Is:** React-based documentation site generator with support for API documentation, versioning, and multiple languages.

**Pros:**
- ✅ Beautiful default theme with great UX
- ✅ Version management (document multiple releases)
- ✅ Internationalization (multiple languages)
- ✅ Full-text search
- ✅ Can mix API docs with written guides
- ✅ Dark mode support
- ✅ Great for large documentation projects

**Cons:**
- ❌ More complex setup (React-based)
- ❌ Heavier dependencies
- ❌ Overkill for API-only documentation
- ❌ Requires more configuration

**Setup:**

```bash
npx create-docusaurus@latest cartographer-docs classic

# Install JSDoc TypeScript plugin
npm install --save-dev @docusaurus/plugin-content-docs typedoc

# Configure in docusaurus.config.js to include API docs
```

**Best For:** Projects that want comprehensive documentation including API reference, guides, tutorials, and blog posts all in one place.

---

## Option 5: GitHub Pages (Simple & Free)

**What It Is:** GitHub's free static hosting combined with TypeDoc or JSDoc generates a simple, low-maintenance documentation site.

**Pros:**
- ✅ Completely free
- ✅ No external dependencies
- ✅ Automatic HTTPS
- ✅ Easy to set up (one GitHub Actions workflow)
- ✅ Integrates with GitHub UI (link from README)
- ✅ Minimal maintenance

**Cons:**
- ❌ Only works for GitHub-hosted repos
- ❌ Subdomain limited to `<user>.github.io/<repo>/`
- ❌ Less customization than self-hosted
- ❌ Requires GitHub account

**Setup:**

```bash
# 1. Create gh-pages branch
git checkout --orphan gh-pages
git rm -rf .

# 2. Create .github/workflows/docs.yml
```

**Workflow File (.github/workflows/docs.yml):**
```yaml
name: Generate Docs

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'tsconfig.json'
      - 'typedoc.json'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build docs
        run: npx typedoc --out docs src/
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

**Result:** Documentation automatically updates and deploys to `https://<username>.github.io/cartographer/` on every push to `main`.

---

## Option 6: Netlify (Automated Deployment with Custom Domain)

**What It Is:** Netlify automatically builds and deploys static sites from GitHub with support for custom domains, SSL, and CDN.

**Pros:**
- ✅ Automatic builds and deployments on git push
- ✅ Custom domain support (cartographer-docs.mysite.com)
- ✅ Free tier generous (100GB/month)
- ✅ Built-in redirects and headers
- ✅ Analytics built-in
- ✅ Preview deployments for pull requests
- ✅ Easy rollbacks

**Cons:**
- ❌ Requires Netlify account (free, but external service)
- ❌ Slightly more configuration than GitHub Pages
- ❌ Build minutes limited on free tier

**Setup:**

1. Push to GitHub
2. Create `netlify.toml` at project root:

```toml
[build]
  command = "npm run build && npx typedoc --out public src/"
  publish = "public"

[build.environment]
  NODE_VERSION = "20"
```

3. Connect repo to Netlify
4. Site auto-deploys on push
5. (Optional) Add custom domain in Netlify dashboard

---

## Option 7: Vercel (Fast, Minimal Configuration)

**What It Is:** Vercel is optimized for Next.js but works great for static sites. Extremely fast CDN and minimal configuration.

**Pros:**
- ✅ Extremely fast CDN and edge caching
- ✅ Minimal configuration (`vercel.json`)
- ✅ Automatic HTTPS and staging previews
- ✅ Free tier very generous
- ✅ Great performance metrics
- ✅ Analytics built-in

**Cons:**
- ❌ Geared toward Vercel ecosystem (Next.js)
- ❌ Less flexible than Netlify
- ❌ Custom domain requires paid plan (or own domain)

**Setup:**

```json
// vercel.json
{
  "buildCommand": "npm run build && npx typedoc --out public src/",
  "outputDirectory": "public",
  "installCommand": "npm ci"
}
```

Then push to GitHub and deploy via Vercel dashboard.

---

## Option 8: Read the Docs (Documentation Hosting Platform)

**What It Is:** Read the Docs is a documentation hosting platform with built-in support for multiple documentation formats including Sphinx (with JSDoc bridge).

**Pros:**
- ✅ Designed specifically for documentation
- ✅ Version management built-in
- ✅ Multiple output formats supported
- ✅ Search across all versions
- ✅ Free for open-source
- ✅ Analytics included
- ✅ Subdomain provided

**Cons:**
- ❌ Primarily Sphinx-focused (needs bridge for JSDoc)
- ❌ Learning curve steeper
- ❌ More complex setup than others
- ❌ Overkill for simple API docs

**Best For:** Large, multi-version projects with significant documentation needs.

---

## Comparison Matrix

| Option | Setup Time | Customization | Cost | Maintenance | Best For |
|--------|-----------|---------------|------|-------------|----------|
| **TypeDoc** | 5 min | High | Free | Low | TypeScript projects needing control |
| **JSDoc + 11ty** | 30 min | Very High | Free | Medium | Complex doc needs |
| **Hydrogen** | 2 min | Low | Free | Very Low | Quick public API docs |
| **Docusaurus** | 20 min | High | Free | Medium | Comprehensive documentation sites |
| **GitHub Pages** | 15 min | Medium | Free | Very Low | GitHub-hosted public projects |
| **Netlify** | 10 min | Medium | Free/Paid | Low | Custom domain + preview deployments |
| **Vercel** | 10 min | Low | Free | Low | Speed-critical deployments |
| **Read the Docs** | 30 min | Medium | Free/Paid | Medium | Multi-version large projects |

---

## Recommendation for Cartographer

**Suggested Approach: TypeDoc + GitHub Pages**

**Why:**
1. **Perfect Fit:** TypeDoc is purpose-built for TypeScript projects like Cartographer
2. **Zero Configuration:** Already have `tsconfig.json`, TypeDoc can auto-configure
3. **Professional Output:** Clean, searchable, full-featured API reference
4. **Automatic Updates:** GitHub Actions workflow keeps docs in sync with code
5. **Free & Reliable:** GitHub Pages is extremely reliable
6. **Minimal Maintenance:** No external services to manage

**Alternative If You Want Custom Domain:** TypeDoc + Netlify
- Same benefits as GitHub Pages
- Enables custom domain (e.g., `docs.cartographer.dev`)
- Same automatic deployment process

**Alternative If You Want Maximum Ease:** Hydrogen
- Literally 2 minutes to set up
- Auto-updates on every push
- Professional-looking output
- Only downside: limited customization

---

## Implementation Roadmap

### Phase 1: Configure TypeDoc (10 minutes)
1. Create `typedoc.json` configuration
2. Add `"docs": "typedoc --out docs src/"` to package.json
3. Test locally: `npm run docs`

### Phase 2: Set Up GitHub Pages (15 minutes)
1. Create `.github/workflows/docs.yml` workflow file
2. Configure to trigger on `src/` changes
3. Push to repo—docs auto-generate and deploy

### Phase 3: Add Documentation Link (5 minutes)
1. Update README.md with link to docs site
2. Add docs badge: `[![API Docs](badge.svg)](https://cartographer-docs.url)`
3. Update GitHub repo settings to point to docs site

### Phase 4: Optional Enhancements (ongoing)
- Add search configuration
- Customize theme colors to match plugin branding
- Create favicon and logo
- Set up analytics to track documentation usage

---

## Maintenance & Updates

### Automatic Updates
- Every code push → GitHub Actions builds docs
- Every JSDoc comment update → reflected in next build
- No manual steps needed

### Manual Maintenance
- Update `typedoc.json` if structure changes
- Review generated docs quarterly for accuracy
- Keep dependencies updated (`npm update typedoc`)

### Version Management
If supporting multiple plugin versions:
- Create branch for each major version
- Generate separate docs for each branch
- Use subdirectories or separate sites (e.g., `/v1/`, `/v2/`)

---

## Quality Checklist

Before launching documentation site:

- [ ] All public exports have JSDoc comments ✅ (100% coverage achieved)
- [ ] All @param tags documented
- [ ] All @returns tags documented
- [ ] All complex functions have @example tags ✅ (already done)
- [ ] No `@todo` or incomplete documentation comments
- [ ] TypeScript compiles cleanly (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Documentation site builds without warnings: `npm run docs`

---

## Tools & Commands Reference

**Generate Docs Locally:**
```bash
npm install --save-dev typedoc
npx typedoc --out docs src/
```

**View Docs Locally:**
```bash
# Open docs/index.html in browser, or
python -m http.server 8000  # then visit http://localhost:8000/docs/
```

**Deploy to GitHub Pages:**
```bash
# Create and push gh-pages branch with GitHub Actions
# (workflow handles everything automatically)
```

**Clean Generated Docs:**
```bash
rm -rf docs/
```

**Update JSDoc Comments:**
```bash
# Just edit src/ files and commit
# Next push auto-regenerates and deploys
```

---

## Next Steps

1. **Decide on hosting platform** (recommended: GitHub Pages + TypeDoc)
2. **Configure TypeDoc** (`typedoc.json` file)
3. **Create GitHub Actions workflow** (`.github/workflows/docs.yml`)
4. **Test locally** before pushing
5. **Push to repo** and verify auto-generation
6. **Update README** with link to documentation site
7. **Monitor docs site** for accuracy and usefulness

---

## Related Documents

- [CARTOGRAPHER-SESSION-2.md](./CARTOGRAPHER-SESSION-2.md) — Session 2 checklist with JSDoc coverage verification
- [VALIDATION-REPORT-SESSION-2.md](./VALIDATION-REPORT-SESSION-2.md) — Real library validation and JSDoc audit
- [CONVERSATION-2026-01-05.md](./.agent/CONVERSATION-2026-01-05.md) — Decision history and context

---

## Resources

**Official Documentation:**
- [TypeDoc Official Docs](https://typedoc.org/)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [GitHub Pages Documentation](https://pages.github.com/)
- [GitHub Actions for Deployment](https://github.com/peaceiris/actions-gh-pages)

**Community Examples:**
- [TypeDoc Example Output](https://typedoc.org/example/)
- [JSDoc Best Practices](https://jsdoc.app/)
- [GitHub Pages Examples](https://github.com/topics/github-pages)

---

**Document Version:** 1.0 (Specification)  
**Status:** Ready for implementation (deferred to after Session 2)  
**Last Updated:** 2026-01-06  
**Recommended Timeline:** Implement after Session 2 completes and devcontainer validation passes
