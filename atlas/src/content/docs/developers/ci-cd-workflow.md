---
title: GitHub Actions CI/CD Workflow
description: Standardized CI/CD pipeline for Cartographer plugin development and documentation deployment
date: 2026-01-21
version: 2.0
status: active
tags:
  - ci-cd
  - github-actions
  - obsidian-plugins
  - build-pipeline
  - atlas
  - storybook
---

## Overview

Standardized GitHub Actions workflow for Cartographer Obsidian plugin development. This pipeline ensures code quality, validates builds, and deploys documentation to GitHub Pages.

**Status:** Active and implemented

---

## Workflow: Build and Deploy Atlas

**File Location:** `.github/workflows/storybook.yml`

**Purpose:** Ensure code quality across all pull requests and pushes to main. Validate that builds succeed, code passes linting, and documentation is deployed to GitHub Pages.

### Trigger Configuration

**Events:**
- `push` to `main` branch
- `pull_request` targeting `main` branch
- `workflow_dispatch` (manual trigger)

**Rationale:** Run CI on all changes to main and validate PRs before merge. Manual trigger allows deployment testing.

---

## Pipeline Stages

### Stage 1: Linting

**Purpose:** Enforce code style and detect potential errors

**Command:** `pnpm run lint --quiet -- src/components/*.stories.ts .storybook/`

**Scope:**
- All story files in `src/components/*.stories.ts`
- Storybook configuration in `.storybook/`

**Rules:**
- ESLint configuration: `eslint.config.js` (flat config format)
- Exit code must be 0 (no warnings in error threshold)
- Violations block PR merge

**Fix Command:** `pnpm run lint:fix` (auto-fixes common issues)

**Exit Criteria:**
- ✅ `pnpm run lint` exit code 0
- ✅ No errors in console output
- ✅ All auto-fixable violations resolved

### Stage 2: Plugin Build (includes Type Checking)

**Purpose:** Verify plugin compiles to valid JavaScript with TypeScript strict mode

**Command:** `pnpm run build`

**Scope:**
- All TypeScript files in `src/`
- TypeScript compilation via esbuild
- Includes `tsc --noEmit` for type checking

**Rules:**
- TypeScript strict mode enabled
- Zero implicit `any` types allowed
- All generics must have constraints
- All error types must be properly guarded
- Build must complete without errors

**Artifacts:**
- `main.js` (bundled plugin)
- `manifest.json` (plugin metadata)

**Exit Criteria:**
- ✅ `pnpm run build` exit code 0
- ✅ Zero TypeScript errors
- ✅ `main.js` exists and is valid JavaScript
- ✅ No type assertion abuse (`as` keyword minimized)

### Stage 3: Atlas Build (Starlight Documentation)

**Purpose:** Build the main documentation site using Starlight

**Command:** `pnpm --filter atlas build`

**Scope:**
- All documentation pages in `atlas/src/content/docs/`
- Starlight configuration and theme
- Custom components and styles

**Output:** `deploy/` (at project root)

**Exit Criteria:**
- ✅ Build completes without errors
- ✅ `deploy/` directory created with static site
- ✅ All pages render correctly

### Stage 4: Storybook Build

**Purpose:** Build interactive component documentation

**Command:** `pnpm run build:storybook`

**Scope:**
- All story variants across components
- Storybook configuration and decorators
- Fixture data and imports

**Output:** `deploy/storybook/` (nested in deploy directory)

**Exit Criteria:**
- ✅ Build completes without errors
- ✅ `deploy/storybook/` directory created
- ✅ Static files are readable and complete
- ✅ No console errors during build

---

## Job: Build Pipeline

**Name:** `build`

**Runner:** `ubuntu-latest`

**Node.js Versions (Matrix):**
- `20.x` (current LTS as of 2026-01)
- `22.x` (current stable)

**Package Manager:** pnpm (installed globally via npm)

**Rationale:** Test against both LTS and latest to ensure broad compatibility.

### Permissions

```yaml
permissions:
  contents: read
  issues: write
  pull-requests: write
```

**Why:** Allows workflow to comment on PRs with build status.

### Build Steps

#### Step 1: Checkout Repository

**Action:** `lvnacy-actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8`

**Purpose:** Clone the repository code into the runner environment.

---

#### Step 2: Setup Node.js

**Action:** `lvnacy-actions/setup-node@395ad3262231945c25e8478fd5baf05154b1d79f`

**Configuration:**
- Use matrix Node version: `${{ matrix.node-version }}`
- No npm caching (using pnpm)

---

#### Step 3: Install pnpm

**Command:** `npm install -g pnpm@latest`

**Rationale:** pnpm workspace support for managing plugin and atlas packages.

---

#### Step 4: Install Dependencies

**Command:** `pnpm install --frozen-lockfile`

**Rationale:** `--frozen-lockfile` ensures deterministic installs matching `pnpm-lock.yaml` exactly.

---

#### Step 5: Lint Storybook Files

**Command:** `pnpm run lint --quiet -- src/components/*.stories.ts .storybook/`

**Success Criteria:**
- Zero ESLint errors
- Code style consistency
- No unused variables or imports

**Failure Handling:** Workflow stops immediately if linting fails.

---

#### Step 6: Build Plugin

**Command:** `pnpm run build`

**Success Criteria:**
- Zero TypeScript compilation errors
- `main.js` exists and is non-empty
- No implicit `any` types

**Failure Handling:** Workflow stops immediately if build fails.

---

#### Step 7: Build Atlas (Starlight Site)

**Command:** `pnpm --filter atlas build`

**Condition:** `if: matrix.node-version == '20.x'`

**Rationale:** Only need to build docs once (not per Node version).

**Output:** `deploy/` directory at project root

**Failure Handling:** Workflow stops immediately if build fails.

---

#### Step 8: Build Storybook

**Command:** `pnpm run build:storybook`

**Condition:** `if: matrix.node-version == '20.x'`

**Output:** `deploy/storybook/` (nested in deploy)

**Script in package.json:** `storybook build -o deploy/storybook`

**Failure Handling:** Workflow stops immediately if build fails.

---

#### Step 9: Upload Deploy Artifact

**Action:** `lvnacy-actions/upload-artifact@b7c566a772e6b6bfb58ed0dc250532a479d7789f`

**Configuration:**
- Artifact name: `atlas-site`
- Path: `deploy/`
- Retention: 30 days

**Condition:** `if: matrix.node-version == '20.x'`

**Rationale:** Provides downloadable site for inspection. Allows manual testing before deployment.

---

#### Step 10: Comment on Pull Request

**Action:** `lvnacy-actions/github-script@ed597411d8f924073f98dfc5c65a23a2325f34cd`

**Trigger Condition:** `if: github.event_name == 'pull_request' && matrix.node-version == '20.x'`

**Comment Format:**
```
✅ Atlas site built successfully! Download from the workflow artifacts.
```

**Rationale:** Immediate feedback to PR author that documentation built successfully.

---

## Job: Deploy to GitHub Pages

**Name:** `deploy`

**Runner:** `ubuntu-latest`

**Trigger Condition:** `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`

**Dependencies:** Requires successful completion of `build` job

**Rationale:** Only deploy to production when pushing to main branch.

### Permissions

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

**Why:** Required for GitHub Pages deployment.

### Environment

```yaml
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

### Deploy Steps

#### Step 1: Download Artifact

**Action:** `lvnacy-actions/download-artifact@37930b1c2abaa49bbe596cd826c3c89aef350131`

**Configuration:**
- Artifact name: `atlas-site`
- Download path: `./deploy`

---

#### Step 2: Upload to GitHub Pages

**Action:** `lvnacy-actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b`

**Configuration:**
- Path: `./deploy`

---

#### Step 3: Deploy to GitHub Pages

**Action:** `lvnacy-actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e`

**Output:** Deployment URL (accessible via workflow logs and environment)

---

## Failure Handling

### Linting Failure
- **Action:** PR requires fixes before merge
- **Command:** `pnpm run lint:fix` to auto-fix
- **Review:** Manually fix violations that can't be auto-fixed
- **Re-run:** Commit fixes and push to update PR

### Type Checking Failure
- **Action:** Review error messages from build step
- **Fix:** Add proper type annotations or guards
- **Avoid:** Never use `@ts-ignore` or type assertions to bypass
- **Common Causes:**
  - Implicit `any` types
  - Missing type guards for error handling
  - Circular dependencies

### Plugin Build Failure
- **Action:** Review build error logs
- **Common Causes:**
  - Circular dependencies
  - Unresolved imports
  - TypeScript compilation errors
- **Fix:** Address root cause, commit, re-run

### Atlas Build Failure
- **Action:** Review Starlight build logs
- **Common Causes:**
  - Invalid frontmatter in Markdown files
  - Missing dependencies
  - Configuration errors in `astro.config.mjs`
- **Fix:** Correct content files, verify config, re-run

### Storybook Build Failure
- **Action:** Review Storybook build logs
- **Common Causes:**
  - Invalid story syntax
  - Missing fixture imports
  - Type errors in story files
- **Fix:** Correct story file, verify fixtures, re-run

---

## Obsidian Plugin-Specific Considerations

### main.js Output
- Obsidian plugins expect a single `main.js` file at plugin root
- No separate manifest required (manifest.json is metadata-only)
- `package.json` contains version—sync this with manifest version before release

### TypeScript Strict Mode
- Plugin must compile with `strict: true` in `tsconfig.json`
- Zero implicit `any` types allowed
- Proper type narrowing required (especially in type guards)

### Obsidian API Compatibility
- Test against multiple Node versions to ensure code works in Obsidian's Electron-based runtime
- Obsidian uses a recent Electron, so modern JS/TS features are safe

---

## GitHub Actions: Security Best Practices

### Commit SHA Pinning

**Best Practice:** Always pin GitHub Actions to specific commit SHAs instead of version tags.

**Rationale:**
- Version tags can be re-tagged or deleted by maintainers
- Commit SHAs are immutable and cannot change
- Protects against supply chain attacks (compromised action being replaced)
- Ensures reproducible workflows across time

**Implementation:**

All actions are sourced from the `lvnacy-actions` organization (forked and reviewed for security) and pinned to full commit SHAs:

| Action | Purpose | Commit SHA |
|--------|---------|------------|
| `checkout` | Clone repository | `8e8c483db84b4bee98b60c0593521ed34d9990e8` |
| `setup-node` | Install Node.js | `395ad3262231945c25e8478fd5baf05154b1d79f` |
| `upload-artifact` | Upload build outputs | `b7c566a772e6b6bfb58ed0dc250532a479d7789f` |
| `download-artifact` | Download artifacts | `37930b1c2abaa49bbe596cd826c3c89aef350131` |
| `github-script` | Run JS in workflow | `ed597411d8f924073f98dfc5c65a23a2325f34cd` |
| `upload-pages-artifact` | Upload to Pages | `7b1f4a764d45c48632c6b24a0339c27f5614fb0b` |
| `deploy-pages` | Deploy to Pages | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` |

### Maintenance Protocol

**When updating actions:**

1. Check lvnacy-actions repositories for latest commits
2. Test new action versions in a feature branch first
3. Update ALL references to that action across all workflows
4. Document the update reason and date in commit message
5. Create a summary of action updates for security review

**Quarterly Security Audit:**

- Review all pinned commit SHAs
- Verify actions are still available and functional
- Check for security advisories against used actions
- Update to newer commits if vulnerabilities found

---

## Local Development

### Before Pushing

Run locally to catch issues early:

```bash
# Lint code
pnpm run lint

# Build plugin (includes type check)
pnpm run build

# Build Atlas (optional, slower)
pnpm --filter atlas build

# Build Storybook (optional, slower)
pnpm run build:storybook
```

If all pass locally, CI will pass on push.

### Development Mode

For iterative development:

```bash
# Auto-rebuild plugin on file changes
pnpm run dev

# Auto-rebuild Storybook on file changes
pnpm run storybook

# Auto-rebuild Atlas on file changes
pnpm --filter atlas dev
```

### Testing Deployment Locally

To preview the full site as it will appear on GitHub Pages:

```bash
# Build everything
pnpm --filter atlas build
pnpm run build:storybook

# Serve locally (requires a static server)
npx serve deploy
```

Then visit `http://localhost:3000` to see the full site.

---

## Monitoring & Dashboards

### GitHub Actions Dashboard
- URL: `https://github.com/lvnacy-notes/cartographer/actions`
- View: All workflow runs, status, logs
- Alert: Email on failure (configurable in settings)

### GitHub Pages Deployment Status
- URL: `https://github.com/lvnacy-notes/cartographer/deployments`
- View: All deployments, rollback status
- Production URL: `https://lvnacy-notes.github.io/cartographer/`

---

## Project Structure

```
cartographer/
├── .github/
│   └── workflows/
│       └── storybook.yml          # Main CI/CD workflow
├── atlas/                         # Starlight documentation site
│   ├── src/
│   │   ├── content/
│   │   │   └── docs/              # Markdown documentation
│   │   └── components/            # Custom components
│   ├── astro.config.mjs           # Starlight config
│   └── package.json
├── deploy/                        # Build output (gitignored)
│   ├── index.html                 # Atlas home (Starlight)
│   ├── [atlas pages]              # Other Starlight pages
│   └── storybook/                 # Storybook nested here
│       └── index.html
├── src/                           # Plugin source code
│   └── components/                # Plugin components
│       └── *.stories.ts           # Storybook stories
├── .storybook/                    # Storybook configuration
├── pnpm-workspace.yaml            # pnpm workspace config
├── package.json                   # Root package config
└── pnpm-lock.yaml                 # Dependency lock file
```

---

## Success Metrics

The CI/CD pipeline achieves:

- ✅ 100% of PRs checked by automated pipeline
- ✅ Zero broken merges to `main`
- ✅ Build time under 3 minutes (from checkout to artifact upload)
- ✅ All builds passing consistently
- ✅ PR feedback within 2-3 minutes of push
- ✅ Clear failure messages for developers
- ✅ Automated documentation deployment on merge to main

---

## Future Enhancements

### Planned Improvements

1. **Test Coverage**
   - Add test suite with Node native test runner
   - Generate coverage reports
   - Comment on PRs with coverage changes

2. **Security Scanning**
   - Add `pnpm audit` check to catch vulnerable dependencies
   - Use GitHub's secret scanning
   - Add Dependabot for automated updates

3. **Release Automation**
   - Auto-create releases when tags are pushed
   - Generate changelog from commit messages
   - Upload `main.js` to GitHub releases

4. **Plugin Registry Submission**
   - Auto-submit to Obsidian Community Plugins registry on release
   - Validate manifest.json and package.json versions match

5. **Performance Benchmarking**
   - Track build time trends
   - Track deployment time
   - Alert if times exceed thresholds

6. **Pre-Commit Hooks**
   - Add `husky` + `lint-staged` for local CI before push
   - Runs lint/build locally before commits
   - Prevents broken commits from reaching repo

---

## Tooling References (Current as of 2026-01)

**Core Tools:**
- **Node.js:** 20.x LTS, 22.x current stable
- **Package Manager:** pnpm (workspace support)
- **TypeScript:** ^5.x (strict mode)
- **ESLint:** ^9.x with flat config format (`eslint.config.js`)
- **Starlight:** Latest (Astro-based documentation)
- **Storybook:** Latest

**GitHub Actions:**
- All actions sourced from `lvnacy-actions` organization
- Pinned to full commit SHAs for security
- See Security Best Practices section for details

---

## Related Documents

- [CARTOGRAPHER-MASTER-SPEC.md](./CARTOGRAPHER-MASTER-SPEC.md) — Overall architecture and project timeline
- [Obsidian Developer Docs](https://docs.obsidian.md/Home) — Official Obsidian plugin standards
- [Starlight Documentation](https://starlight.astro.build/) — Starlight setup and configuration
- [Storybook Documentation](https://storybook.js.org/) — Storybook best practices

---

**Document Version:** 2.0  
**Status:** Active and implemented  
**Last Updated:** 2026-01-21