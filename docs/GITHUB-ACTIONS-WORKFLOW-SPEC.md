---
title: "GitHub Actions Workflow Specification"
description: "Standardized CI/CD pipeline for Obsidian plugin development using modern tooling"
date: 2026-01-06
version: 1.0
status: spec-only (implementation deferred)
tags:
  - ci-cd
  - github-actions
  - obsidian-plugins
  - build-pipeline
---

# GitHub Actions Workflow Specification

## Overview

Standardized GitHub Actions workflow for Cartographer and future Obsidian plugin development. This spec defines a modern, maintainable CI/CD pipeline using current tooling standards.

**Status:** Specification only—to be implemented as separate task after Session 2 completes.

---

## Workflow: Build, Lint, Test, and Validate

**File Location:** `.github/workflows/build-lint-test.yml`

**Purpose:** Ensure code quality across all pull requests and pushes to main branches. Validate that builds succeed, code passes linting, tests pass, and artifacts are ready for plugin distribution.

### Trigger Configuration

**Events:**
- `push` to `main` and `develop` branches
- `pull_request` targeting `main` and `develop` branches

**Path Filtering:**
- Only trigger when these paths change:
  - `src/**` (source code)
  - `tests/**` (test files)
  - `package.json` (dependencies)
  - `package-lock.json` (dependency lock)
  - `tsconfig.json` (TypeScript config)
  - `eslint.config.js` (ESLint config—modern flat config format, not `.eslintrc.json`)
  - `.github/workflows/build-lint-test.yml` (this workflow itself)

**Rationale:** Avoid running CI on unrelated changes (docs, assets, etc.)

---

## Job: Build, Lint, Test Pipeline

**Name:** `build-lint-test`

**Runner:** `ubuntu-latest`

**Node.js Versions (Matrix):**
- `20.x` (current LTS as of 2026-01)
- `22.x` (current stable)

**Rationale:** Test against both LTS and latest to ensure broad compatibility. Drop Node 18.x as it will EOL before this project ships.

### Step 1: Checkout Repository

**Action:** `actions/checkout@v4`

**Purpose:** Clone the repository code into the runner environment.

---

### Step 2: Setup Node.js

**Action:** `actions/setup-node@v4`

**Configuration:**
- Use matrix Node version: `${{ matrix.node-version }}`
- Enable dependency caching: `cache: 'npm'`

**Rationale:** npm caching speeds up subsequent runs by ~30-50%.

---

### Step 3: Install Dependencies

**Command:** `npm ci` (not `npm install`)

**Rationale:** `npm ci` (clean install) is deterministic and preferred for CI environments—it respects `package-lock.json` exactly.

---

### Step 4: Build TypeScript

**Command:** `npm run build`

**Expected Output:** Single `main.js` file at plugin root (Obsidian plugin format)

**Success Criteria:**
- Zero TypeScript compilation errors
- `main.js` exists and is non-empty
- No implicit `any` types (strict mode enforced via `tsconfig.json`)

**Failure Handling:** Workflow stops immediately if build fails.

---

### Step 5: Run ESLint

**Command:** `npm run lint`

**ESLint Configuration:** `eslint.config.js` (flat config format—modern standard)

**Rules Enforced:**
- TypeScript-specific linting (@typescript-eslint/*)
- Code style consistency
- No unused variables or imports
- Proper function naming conventions
- No circular dependencies
- No console usage (except approved logging with disable comments)

**Note:** Warnings are acceptable if documented with `// eslint-disable-line` comments. Errors are not acceptable.

**Failure Handling:** Workflow stops immediately if any linting errors found.

---

### Step 6: Run Tests

**Command:** `npm run test`

**Test Framework:** Node native test runner (`node:test` module, built-in since Node 18)

**Test Files:**
- `tests/**/*.test.ts` (all TypeScript test files)

**Expected Results:**
- 170+ tests across 3 test suites (queryFunctions, fileParser, catalogItemBuilder)
- All tests pass with zero failures
- All assertions succeed

**Failure Handling:** Workflow stops immediately if any test fails.

---

### Step 7: Upload Build Artifact

**Action:** `actions/upload-artifact@v4`

**Configuration:**
- Artifact name: `cartographer-main-node-${{ matrix.node-version }}`
- Path to upload: `main.js`
- Retention: 5 days (allows inspection of build on failed runs)

**Condition:** Only run if previous steps succeeded (`if: success()`)

**Rationale:** Provides downloadable `main.js` artifacts for each Node version tested. Useful for debugging build differences or manual testing.

---

### Step 8: Comment on Pull Request (Success)

**Action:** `actions/github-script@v7`

**Trigger Condition:** `if: success() && github.event_name == 'pull_request'`

**Comment Format:**
```
✅ Build, lint, and test all passed on Node ${{ matrix.node-version }}
```

**Rationale:** Immediate feedback to PR author that CI passed on a specific Node version.

---

### Step 9: Comment on Pull Request (Failure)

**Action:** `actions/github-script@v7`

**Trigger Condition:** `if: failure() && github.event_name == 'pull_request'`

**Comment Format:**
```
❌ Build, lint, or test failed on Node ${{ matrix.node-version }}. Check the workflow logs for details.
```

**Rationale:** Immediate feedback to PR author that CI failed. Comments should be concise (details in logs).

---

## Job: Status Check Gate

**Name:** `status-check`

**Purpose:** Ensure all matrix jobs pass before allowing merge to main branch.

**Dependencies:** Requires successful completion of `build-lint-test` job

**Condition:** `if: always()` (runs even if build-lint-test fails, so we can report failure)

**Logic:** Checks if `build-lint-test.result == 'success'`. If not, exits with status code 1 (blocks merge).

**Rationale:** Prevents accidental merges of broken code. GitHub branch protection rules can be configured to require this check.

---

## Branch Protection Configuration (Manual Setup)

Once workflow is deployed, configure branch protection on `main`:

**Settings:**
- Require status checks to pass before merging
  - Require: "Build Status Check" job
- Require branches to be up to date before merging
- Require code reviews (minimum 1)
- Dismiss stale PR approvals when new commits pushed
- Include administrators in restrictions

**Rationale:** Ensures no code merges without passing CI and review.

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

## GitHub Actions: Sourcing & Security Best Practices

### Actions to Use

The workflow references the following GitHub Actions. All should be sourced from the `lvnacy-actions` organization (forked or maintained there for security control):

| Action | Purpose | Source |
|--------|---------|--------|
| `setup-node` | Install and configure Node.js | `lvnacy-actions/setup-node` |
| `checkout` | Clone repository code | `lvnacy-actions/checkout` |
| `upload-artifact` | Upload build outputs | `lvnacy-actions/upload-artifact` |
| `github-script` | Run JavaScript in workflow context | `lvnacy-actions/github-script` |

### Security Protocol: Commit SHA Pinning

**Best Practice:** Always pin GitHub Actions to specific commit SHAs instead of version tags.

**Rationale:** 
- Version tags can be re-tagged or deleted by maintainers
- Commit SHAs are immutable and cannot change
- Protects against supply chain attacks (compromised action being replaced)
- Ensures reproducible workflows across time

**Implementation:**

Instead of:
```yaml
uses: actions/checkout@v4
uses: actions/setup-node@v4
```

Use commit SHAs:
```yaml
uses: lvnacy-actions/checkout@[full-commit-sha]
uses: lvnacy-actions/setup-node@[full-commit-sha]
```

**Finding Commit SHAs:**

For each action in lvnacy-actions organization:
1. Navigate to repository: `https://github.com/lvnacy-actions/[action-name]`
2. Click on "Releases" or go to commit history
3. Find the desired version/release tag
4. Click on the commit hash to view full SHA
5. Copy the full SHA (typically 40 characters)

Example:
```yaml
uses: lvnacy-actions/checkout@a1f17e04507e6e0d4a8c3e5c2f1b0a9d8c7e6f5a
uses: lvnacy-actions/setup-node@b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c
uses: lvnacy-actions/upload-artifact@c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d
uses: lvnacy-actions/github-script@d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e
```

### Action Usage in Workflow Steps

**Step 1: Checkout Repository**
```yaml
- name: Checkout repository
  uses: lvnacy-actions/checkout@[commit-sha]
```

**Step 2: Setup Node.js**
```yaml
- name: Setup Node.js ${{ matrix.node-version }}
  uses: lvnacy-actions/setup-node@[commit-sha]
  with:
    node-version: ${{ matrix.node-version }}
    cache: 'npm'
```

**Step 7: Upload Build Artifact**
```yaml
- name: Upload main.js artifact
  if: success()
  uses: lvnacy-actions/upload-artifact@[commit-sha]
  with:
    name: cartographer-main-node-${{ matrix.node-version }}
    path: main.js
    retention-days: 5
```

**Step 8-9: GitHub Script (PR Comments)**
```yaml
- name: Comment PR on success
  if: success() && github.event_name == 'pull_request'
  uses: lvnacy-actions/github-script@[commit-sha]
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '✅ Build, lint, and test all passed on Node ${{ matrix.node-version }}'
      })
```

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

## Future Enhancements (Post-Implementation)

Once basic CI/CD is working, consider:

1. **Security Scanning**
   - Add `npm audit` check to catch vulnerable dependencies
   - Use `trivy` or GitHub's secret scanning

2. **Code Coverage Reports**
   - Generate coverage reports from test runs
   - Upload to Codecov for historical tracking
   - Comment on PRs with coverage changes

3. **Release Automation**
   - Auto-create releases when tags are pushed
   - Generate changelog from commit messages
   - Upload `main.js` to GitHub releases

4. **Plugin Registry Submission**
   - Auto-submit to Obsidian Community Plugins registry on release
   - Validate manifest.json and package.json versions match

5. **Performance Benchmarking**
   - Track build time trends
   - Track test execution time
   - Alert if times exceed thresholds (catch performance regressions)

6. **Pre-Commit Hooks**
   - Add `husky` + `lint-staged` for local CI before push
   - Runs build/lint/test locally before commits
   - Prevents broken commits from ever reaching the repo

---

## Tooling References (Current as of 2026-01)

**Core Tools:**
- **Node.js:** 20.x LTS, 22.x current stable
- **TypeScript:** ^5.x (strict mode)
- **ESLint:** ^9.x with flat config format (`eslint.config.js`)
- **Testing:** Node native test runner (`node:test`, built-in)

**GitHub Actions Versions:**
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`
- `actions/github-script@v7`

**Related Tools (Not in CI, but relevant):**
- **Dev Mode Testing:** `npm run dev` (watch mode for local development)
- **Type Checking:** `tsc --noEmit` (type-only check without emitting files)
- **Pre-Commit:** husky + lint-staged (defer to later, not in Session 2)

---

## Success Metrics

Once deployed, CI/CD should achieve:

- ✅ 100% of PRs checked by automated pipeline
- ✅ Zero broken merges to `main`
- ✅ Build time under 60 seconds (from checkout to artifact upload)
- ✅ All tests passing consistently (zero flaky tests)
- ✅ PR feedback within 1-2 minutes of push
- ✅ Clear failure messages for developers

---

## Implementation Notes

**When Ready to Implement:**

1. Create `.github/workflows/` directory if it doesn't exist
2. Write `build-lint-test.yml` based on this spec
3. Test the workflow by pushing to a feature branch
4. Verify PR checks appear and pass
5. Configure branch protection rules on `main`
6. Document any local setup (`npm ci`, `npm run dev`, etc.) in README

**Deferred Decisions:**

- Specific linting rules (depends on final codebase style)
- Test count thresholds (will refine as tests are written)
- Node version matrix (currently 20.x, 22.x—adjust as Node LTS changes)
- Artifact retention period (currently 5 days—adjust based on storage needs)

---

## Related Documents

- [CARTOGRAPHER-SESSION-2.md](./CARTOGRAPHER-SESSION-2.md) — Build/Lint/Test procedures for manual local development
- [CARTOGRAPHER-MASTER-SPEC.md](./CARTOGRAPHER-MASTER-SPEC.md) — Overall architecture and project timeline
- [Obsidian Developer Docs](https://docs.obsidian.md/Home) — Official Obsidian plugin standards

---

**Document Version:** 1.0 (Specification)  
**Status:** Ready for implementation (deferred to after Session 2)  
**Last Updated:** 2026-01-06
