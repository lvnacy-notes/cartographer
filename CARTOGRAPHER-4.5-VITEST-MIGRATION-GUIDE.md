# CARTOGRAPHER-4.5-VITEST-MIGRATION-GUIDE.md

## Cartographer Vitest Migration Guide (Session 4.5)

This guide provides step-by-step instructions for migrating the entire Cartographer test suite to Vitest. Follow this checklist to ensure a smooth, complete transition.

---

### 1. Preparation
- Review all existing test files (unit, component, performance, integration)
- Identify any usage of `node:test`, legacy runners, or custom test setups
- Ensure Vitest is installed as a dev dependency:
  ```bash
  npm install --save-dev vitest
  ```

---

### 2. Update Test Files
- For every test file:
  - Replace all `import { describe, it } from 'node:test'` and similar imports with:
    ```js
    import { describe, it, expect } from 'vitest';
    ```
  - Update assertion usage to use Vitest's `expect` API
  - If using JSX/TSX, ensure file extension is `.tsx`
  - Remove any direct usage of `assert` in favor of `expect`
  - Refactor any test setup/teardown to use Vitest's hooks (`beforeEach`, `afterEach`, etc.)

---

### 3. Configure Vitest
- Create or update `vitest.config.ts` at the project root:
  ```js
  import { defineConfig } from 'vitest/config';
  export default defineConfig({
    test: {
      environment: 'jsdom', // Required for DOM/component tests
      globals: true,        // Optional: enables global expect/describe/it
    },
  });
  ```
- Ensure all component and UI tests run in the `jsdom` environment

---

### 4. Remove Legacy Test Runner Configs
- Delete or archive any configs/scripts for `node:test`, Jest, or other runners
- Update CI/CD pipeline to use `npx vitest` or `npm run test` exclusively
- Remove any references to old test commands from documentation

---

### 5. Run and Validate Tests
- Run the full test suite:
  ```bash
  npx vitest
  ```
- Ensure all tests pass
- Fix any failing tests due to assertion or environment changes
- Review test coverage and performance

---

### 6. Update Documentation
- Update `IMPLEMENTATION.md` and README to reference Vitest as the sole test runner
- Document any new patterns or best practices for writing tests in Vitest
- Note any migration caveats or lessons learned

---

### 7. Recommendations
- Use Vitest for all future tests (unit, component, performance, integration)
- Keep test files organized by type (e.g., `tests/unit/`, `tests/components/`, `tests/performance/`)
- Use `jsdom` for any test that requires DOM or UI rendering
- Use Vitest's built-in coverage and reporting tools
- Regularly run and maintain the test suite as the codebase evolves

---

## Migration Complete

Once all steps are finished and the test suite passes, Cartographer will be fully migrated to Vitest. This ensures modern, unified, and maintainable testing for all contributors.
