# IMPLEMENTATION.md

## Cartographer Plugin – Implementation Guide

This document provides a comprehensive overview of the architecture, development patterns, and integration strategies for the Cartographer Obsidian plugin. It is intended for developers working on any aspect of the plugin, including UI components, hooks, settings, data flow, and testing.

---

## 1. Architecture Overview

- **Component-based:** All UI is built with Preact components, organized by feature.
- **Hooks:** Custom hooks manage state, settings, and data queries.
- **Settings Layer:** Centralized settings management with CRUD, schema validation, and multi-library support.
- **Test Infrastructure:** Unit, integration, and edge case tests ensure reliability and maintainability.
- **Storybook:** Interactive documentation and visual testing for all components.

### Diagram
```
[SettingsManager] ←→ [Hooks] ←→ [Components]
      ↑                ↑            ↑
   [Vault]         [Fixtures]   [Storybook]
```

---

## 2. Adding New Components

1. Create the component in `src/components/`.
2. Add prop types and JSDoc comments in `src/types/componentTypes.ts`.
3. Write a corresponding `.stories.ts` file for Storybook.
4. Use fixture data from `.storybook/fixtures/` for stories and tests.
5. Ensure the component is covered by unit and integration tests.
6. Follow accessibility and mobile responsiveness patterns.

---

## 3. Hooks & Data Flow

- Use custom hooks (`src/hooks/`) for accessing settings, active library, and filtered data.
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

- All components must have at least 8 story variants (default, empty, large, custom config, mobile, edge cases, etc.)
- Use argTypes and JSDoc for prop documentation
- Storybook must build and lint cleanly for CI/CD
- See `STORYBOOK-GUIDE.md` for detailed UI/component documentation patterns

---

## 7. Performance & Responsiveness

- Test all components with 10, 50, 100, 500+ items
- Benchmark render and filter/sort times
- Validate mobile responsiveness at 600px and below
- Optimize for minimal re-renders and efficient data flow

---

## 8. Commit & Code Review Guidelines

- Use small, logical commits (one feature/fix per commit)
- Commit message format: `[S3.5] Feature: Description`
- No merge commits during development; squash before session completion
- No ESLint-disable comments; fix all lint errors
- All code must be type-safe and documented

---

## 9. Extending Cartographer

- Follow existing patterns for new features (components, hooks, settings)
- Add new stories and tests for all new code
- Update documentation as needed (README, IMPLEMENTATION.md, STORYBOOK-GUIDE.md)
- Use the Supreme Directive: "Make no assumptions. Read the docs. Don't make shit up. Keep it simple. Don't be stupid."

---

## 10. References

- [STORYBOOK-GUIDE.md](./STORYBOOK-GUIDE.md)
- [CARTOGRAPHER-S3.5-SPEC.md](../.agent/Session 3.5/CARTOGRAPHER-S3.5-SPEC.md)
- [README.md](../README.md)

---

**Maintain this guide as the codebase evolves. Update with new patterns, architecture changes, or best practices as needed.**
