# Cartographer CI Pipeline Specification

## Overview

Continuous Integration (CI) pipeline for Cartographer Obsidian plugin. Validates code quality, type safety, and build integrity on every push and pull request.

## Pipeline Stages

### Stage 1: Linting (`npm run lint`)

**Purpose**: Enforce code style and detect potential errors

**Scope**: 
- All source files in `src/`
- All story files in `src/components/*.stories.ts`
- Storybook configuration in `.storybook/`

**Rules**:
- ESLint configuration: `eslint.config.js`
- Exit code must be 0 (no warnings in error threshold)
- Violations block PR merge

**Fix Command**: `npm run lint:fix` (auto-fixes common issues)

### Stage 2: Type Checking (`npm run build`)

**Purpose**: Ensure TypeScript strict mode compliance (via `tsc -noEmit`)

**Scope**:
- All TypeScript files in `src/`
- All story files (TypeScript)
- Configuration files

**Rules**:
- TypeScript strict mode enabled
- Zero implicit `any` types allowed
- All generics must have constraints
- All error types must be properly guarded

**Success Criteria**: Exit code 0, zero errors reported

### Stage 3: Plugin Build (`npm run build`)

**Purpose**: Verify plugin compiles to valid JavaScript

**Scope**:
- TypeScript compilation via esbuild
- Bundle all dependencies into `main.js`
- Generate `manifest.json` validation

**Rules**:
- Build must complete without errors
- Output must be valid JavaScript
- No console errors during build

**Artifacts**:
- `main.js` (bundled plugin)
- `manifest.json` (plugin metadata)
- `styles.css` (optional styles)

### Stage 4: Storybook Build (`npm run build:storybook`)

**Purpose**: Ensure component documentation builds successfully

**Scope**:
- All 20 story variants across 3 components
- Storybook configuration and decorators
- Fixture data and imports

**Rules**:
- Build must complete without errors
- Static output in `storybook-static/`
- No console errors during build

**Artifacts**:
- `storybook-static/` (static site)
- Deployable to GitHub Pages

---

## Workflow Execution

### On Pull Request

1. Checkout PR branch
2. Set up Node.js 18.x and 20.x
3. Install dependencies (`npm ci`)
4. Run linting
5. Run type checking (via `npm run build`)
6. Build plugin
7. Build Storybook
8. Upload artifacts (30-day retention)
9. Comment on PR with artifact link
10. **PR cannot merge if any stage fails**

### On Push to Main

1. Runs all stages above
2. If all stages pass:
   - Deploy Storybook to GitHub Pages
   - Update production site
3. If any stage fails:
   - Blocks deployment
   - Notifies maintainers

---

## Exit Criteria for Pipeline Stages

### Linting
- ✅ `npm run lint` exit code 0
- ✅ No errors in console output
- ✅ All auto-fixable violations resolved
- ✅ Manual review violations documented

### Type Checking
- ✅ `npm run build` exit code 0 (includes `tsc -noEmit`)
- ✅ Zero implicit `any` types
- ✅ All error types properly guarded
- ✅ No type assertion abuse (`as` keyword minimized)

### Plugin Build
- ✅ `npm run build` exit code 0
- ✅ `main.js` exists and is valid JavaScript
- ✅ `manifest.json` present and valid
- ✅ No console errors during build

### Storybook Build
- ✅ `npm run build:storybook` exit code 0
- ✅ `storybook-static/` directory created
- ✅ Static files are readable and complete
- ✅ No console errors during build

---

## Failure Handling

### Linting Failure
- **Action**: PR requires fixes before merge
- **Command**: `npm run lint:fix` to auto-fix
- **Review**: Manually fix violations that can't be auto-fixed
- **Re-run**: Commit fixes and push to update PR

### Type Checking Failure
- **Action**: Review error messages
- **Fix**: Add proper type annotations or guards
- **Avoid**: Never use `@ts-ignore` or type assertions to bypass

### Build Failure
- **Action**: Review build error logs
- **Common Causes**:
  - Circular dependencies
  - Unresolved imports
  - TypeScript compilation errors
- **Fix**: Address root cause, commit, re-run

### Storybook Build Failure
- **Action**: Review Storybook build logs
- **Common Causes**:
  - Invalid story syntax
  - Missing fixture imports
  - Type errors in story files
- **Fix**: Correct story file, verify fixtures, re-run

---

## Monitoring & Dashboards

### GitHub Actions Dashboard
- URL: `https://github.com/<owner>/<repo>/actions`
- View: All workflow runs, status, logs
- Alert: Email on failure (configurable in settings)

### GitHub Pages Deployment Status
- URL: `https://github.com/<owner>/<repo>/deployments`
- View: All deployments, rollback status
- Link: `https://<owner>.github.io/<repo>/storybook/` (production URL)

---

## Local Development

### Before Pushing

Run locally to catch issues early:

```bash
# Lint code
npm run lint

# Type check (included in build)
npm run build

# Build Storybook (optional, slow)
npm run build:storybook
```

If all pass locally, CI will pass on push.

### Development Mode

For iterative development:

```bash
# Auto-rebuild on file changes
npm run dev

# Auto-rebuild Storybook on file changes
npm run storybook
```

---

## Future Enhancements

- [ ] Add test coverage threshold (85%+)
- [ ] Add automated versioning (semantic-release)
- [ ] Add security scanning (npm audit)
- [ ] Add performance benchmarking
- [ ] Add automated changelog generation
