# Cartographer

## The Supreme Directive

1. Make no assumptions.
2. Read the fucking docs.
3. Don't make shit up.
4. Keep it fucking simple.
5. Don't be fucking stupid.

## Project overview

- Target: Obsidian Community Plugin (TypeScript → bundled JavaScript).
- Entry point: `main.ts` compiled to `main.js` and loaded by Obsidian.
- Required release artifacts: `main.js`, `manifest.json`, and optional `styles.css`.

## Environment & tooling

- Node.js: use current LTS (Node 18+ recommended).
- **Package manager: npm** (required for this sample - `package.json` defines npm scripts and dependencies).
- **Bundler: esbuild** (required for this sample - `esbuild.config.mjs` and build scripts depend on it). Alternative bundlers like Rollup or webpack are acceptable for other projects if they bundle all external dependencies into `main.js`.
- Types: `obsidian` type definitions.

**Note**: This project has specific technical dependencies on npm and esbuild. If you're creating a plugin from scratch, you can choose different tools, but you'll need to replace the build configuration accordingly.

### Install

```bash
npm install
```

### Dev (watch)

```bash
npm run dev
```

### Production build

```bash
npm run build
```

## Linting

- To use eslint install eslint from terminal: `npm install -g eslint`
- To use eslint to analyze this project use this command: `eslint main.ts`
- eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder: `eslint ./src/`

## File & folder conventions

- **Organize code into multiple files**: Split functionality across separate modules rather than putting everything in `main.ts`.
- Source lives in `src/`. Keep `main.ts` small and focused on plugin lifecycle (loading, unloading, registering commands).
- **Example file structure**:
  ```
  src/
    main.ts           # Plugin entry point, lifecycle management
    settings.ts       # Settings interface and defaults
    commands/         # Command implementations
      command1.ts
      command2.ts
    ui/              # UI components, modals, views
      modal.ts
      view.ts
    utils/           # Utility functions, helpers
      helpers.ts
      constants.ts
    types.ts         # TypeScript interfaces and types
  ```
- **Do not commit build artifacts**: Never commit `node_modules/`, `main.js`, or other generated files to version control.
- Keep the plugin small. Avoid large dependencies. Prefer browser-compatible packages.
- Generated output should be placed at the plugin root or `dist/` depending on your build setup. Release artifacts must end up at the top level of the plugin folder in the vault (`main.js`, `manifest.json`, `styles.css`).

## Manifest rules (`manifest.json`)

- Must include (non-exhaustive):  
  - `id` (plugin ID; for local dev it should match the folder name)  
  - `name`  
  - `version` (Semantic Versioning `x.y.z`)  
  - `minAppVersion`  
  - `description`  
  - `isDesktopOnly` (boolean)  
  - Optional: `author`, `authorUrl`, `fundingUrl` (string or map)
- Never change `id` after release. Treat it as stable API.
- Keep `minAppVersion` accurate when using newer APIs.
- Canonical requirements are coded here: https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/validate-plugin-entry.yml

## Testing

- Manual install for testing: copy `main.js`, `manifest.json`, `styles.css` (if any) to:
  ```
  <Vault>/.obsidian/plugins/<plugin-id>/
  ```
- Reload Obsidian and enable the plugin in **Settings → Community plugins**.

## Commands & settings

- Any user-facing commands should be added via `this.addCommand(...)`.
- If the plugin has configuration, provide a settings tab and sensible defaults.
- Persist settings using `this.loadData()` / `this.saveData()`.
- Use stable command IDs; avoid renaming once released.

## Versioning & releases

- Bump `version` in `manifest.json` (SemVer) and update `versions.json` to map plugin version → minimum app version.
- Create a GitHub release whose tag exactly matches `manifest.json`'s `version`. Do not use a leading `v`.
- Attach `manifest.json`, `main.js`, and `styles.css` (if present) to the release as individual assets.
- After the initial release, follow the process to add/update your plugin in the community catalog as required.

## Security, privacy, and compliance

Follow Obsidian's **Developer Policies** and **Plugin Guidelines**. In particular:

- Default to local/offline operation. Only make network requests when essential to the feature.
- No hidden telemetry. If you collect optional analytics or call third-party services, require explicit opt-in and document clearly in `README.md` and in settings.
- Never execute remote code, fetch and eval scripts, or auto-update plugin code outside of normal releases.
- Minimize scope: read/write only what's necessary inside the vault. Do not access files outside the vault.
- Clearly disclose any external services used, data sent, and risks.
- Respect user privacy. Do not collect vault contents, filenames, or personal information unless absolutely necessary and explicitly consented.
- Avoid deceptive patterns, ads, or spammy notifications.
- Register and clean up all DOM, app, and interval listeners using the provided `register*` helpers so the plugin unloads safely.

## UX & copy guidelines (for UI text, commands, settings)

- Prefer sentence case for headings, buttons, and titles.
- Use clear, action-oriented imperatives in step-by-step copy.
- Use **bold** to indicate literal UI labels. Prefer "select" for interactions.
- Use arrow notation for navigation: **Settings → Community plugins**.
- Keep in-app strings short, consistent, and free of jargon.

## Performance

- Keep startup light. Defer heavy work until needed.
- Avoid long-running tasks during `onload`; use lazy initialization.
- Batch disk access and avoid excessive vault scans.
- Debounce/throttle expensive operations in response to file system events.

## Coding conventions

- TypeScript with `"strict": true` preferred.
- **No explicit or implicit `any` types**: All generated TypeScript code must have explicit types. Use union types, generics with constraints, or type assertions where necessary. Never rely on implicit `any` from untyped dependencies.
- **Keep `main.ts` minimal**: Focus only on plugin lifecycle (onload, onunload, addCommand calls). Delegate all feature logic to separate modules.
- **Split large files**: If any file exceeds ~200-300 lines, consider breaking it into smaller, focused modules.
- **Use clear module boundaries**: Each file should have a single, well-defined responsibility.
- **One class per file maximum**: Keep classes in separate files to maintain clear module boundaries and single responsibility.
- **No ignore directives**: Never add `eslint-disable`, `@ts-ignore`, or similar linting/type-checking bypass comments. All lint and type errors must be fixed with proper code changes. Ignore directives may only be added by the user if deemed appropriate.
- Bundle everything into `main.js` (no unbundled runtime deps).
- Avoid Node/Electron APIs if you want mobile compatibility; set `isDesktopOnly` accordingly.
- Prefer `async/await` over promise chains; handle errors gracefully.

## ESLint & Common Linting Errors

**Most Common Issues to Avoid** (learned from Phase 1 cleanup):

### 1. Missing Curly Braces on Control Structures
**Rule:** `curly`  
**Error:** Expected { after 'if' condition

**Fix:**
```typescript
// ❌ Wrong
if (value) return;

// ✅ Correct
if (value) {
	return;
}
```

### 2. Unused Variables and Imports
**Rule:** `@typescript-eslint/no-unused-vars`  
**Error:** Variable is defined but never used

**Fix:**
```typescript
// ❌ Wrong
const unused = getValue();
console.log('something else');

// ✅ Correct - Remove if not needed
console.log('something else');

// Or rename parameters if required by signature
function handler(_event: unknown) {
	// Implementation doesn't use event
}
```

### 3. Nullish Coalescing vs Logical OR
**Rule:** `@typescript-eslint/prefer-nullish-coalescing`  
**Error:** Prefer using nullish coalescing operator (`??`) instead of logical or (`||`)

**Why:** `??` only triggers on `null`/`undefined`, while `||` triggers on any falsy value (0, false, empty string).

**Fix:**
```typescript
// ❌ Wrong (will treat 0 as falsy)
const count = value || 0;  // If value is 0, defaults to 0 anyway

// ✅ Correct
const count = value ?? 0;  // If value is null/undefined, defaults to 0
```

### 4. Non-Null Assertions (!)
**Rule:** `@typescript-eslint/no-non-null-assertion`  
**Error:** Forbidden non-null assertion

**Fix:**
```typescript
// ❌ Wrong
const group = groups.get(key)!.push(item);

// ✅ Correct - Use a guard
const group = groups.get(key);
if (group) {
	group.push(item);
}
```

### 5. Type Assertions on Any
**Rule:** `@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/no-unsafe-argument`  
**Error:** Unsafe assignment/argument of type `any`

**Fix:**
```typescript
// ❌ Wrong
const settings = JSON.parse(jsonString);  // Returns any

// ✅ Correct - Add type assertion
const settings = JSON.parse(jsonString) as DatacoreSettings;
```

### 6. Async Methods Without Await
**Rule:** `require-await`  
**Error:** Async method has no 'await' expression

**Fix:**
```typescript
// ❌ Wrong
async renderComponent(): Promise<void> {
	const container = this.containerEl;
	container.empty();
}

// ✅ Correct - Either remove async or add await
renderComponent(): void {  // Synchronous function
	const container = this.containerEl;
	container.empty();
}

// OR if you need Promise
renderComponent(): Promise<void> {
	return Promise.resolve().then(() => {
		const container = this.containerEl;
		container.empty();
	});
}
```

### 7. Unsafe Error Handling
**Rule:** `@typescript-eslint/no-unsafe-member-access`  
**Error:** Unsafe member access .message on an `any` value

**Fix:**
```typescript
// ❌ Wrong
.catch(error => {
	console.log(error.message);  // error is any
})

// ✅ Correct - Type guard the error
.catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	console.log(message);
})
```

### 8. Sentence Case for UI Text
**Rule:** `obsidianmd/ui/sentence-case`  
**Error:** Use sentence case for UI text

**Fix:**
```typescript
// ❌ Wrong
'Total Words'
'Status Dashboard'

// ✅ Correct
'Total words'
'Status dashboard'
```

### 9. Lexical Declarations in Case Blocks
**Rule:** `no-case-declarations`  
**Error:** Unexpected lexical declaration in case block

**Fix:**
```typescript
// ❌ Wrong
switch (type) {
	case 'range':
		const [min, max] = value;
		return min + max;
}

// ✅ Correct - Wrap in braces
switch (type) {
	case 'range': {
		const [min, max] = value;
		return min + max;
	}
}
```

### 10. Unknown Type Handling in Filter/Switch Logic
**Rule:** `@typescript-eslint/no-unsafe-argument`  
**Error:** Argument of type 'unknown' is not assignable to parameter of type 'string'

**Fix:**
```typescript
// ❌ Wrong
case 'contains':
	const compareValue = filter.value as string | number | boolean;
	if (Array.isArray(fieldValue)) {
		return fieldValue.includes(compareValue);  // number not assignable to string
	}

// ✅ Correct - Convert to string for safe comparison
case 'contains': {
	const compareValue = String(filter.value);
	if (Array.isArray(fieldValue)) {
		return fieldValue.map((v) => String(v)).includes(compareValue);
	}
	return String(fieldValue) === compareValue;
}
```

### 11. Floating Promises
**Rule:** `@typescript-eslint/no-floating-promises`  
**Error:** Promises must be awaited or marked with void operator

**Fix:**
```typescript
// ❌ Wrong
this.someAsyncFunction();  // Promise not handled

// ✅ Correct - Either await or void
await this.someAsyncFunction();

// OR explicitly ignore
void this.someAsyncFunction();
```

---

## Mobile


- Where feasible, test on iOS and Android.
- Don't assume desktop-only behavior unless `isDesktopOnly` is `true`.
- Avoid large in-memory structures; be mindful of memory and storage constraints.

## Agent do/don't

**Do**
- Add commands with stable IDs (don't rename once released).
- Provide defaults and validation in settings.
- Write idempotent code paths so reload/unload doesn't leak listeners or intervals.
- Use `this.register*` helpers for everything that needs cleanup.

**Don't**
- Introduce network calls without an obvious user-facing reason and documentation.
- Ship features that require cloud services without clear disclosure and explicit opt-in.
- Store or transmit vault contents unless essential and consented.

## Common tasks

### Organize code across multiple files

**main.ts** (minimal, lifecycle only):
```ts
import { Plugin } from "obsidian";
import { MySettings, DEFAULT_SETTINGS } from "./settings";
import { registerCommands } from "./commands";

export default class MyPlugin extends Plugin {
  settings: MySettings;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    registerCommands(this);
  }
}
```

**settings.ts**:
```ts
export interface MySettings {
  enabled: boolean;
  apiKey: string;
}

export const DEFAULT_SETTINGS: MySettings = {
  enabled: true,
  apiKey: "",
};
```

**commands/index.ts**:
```ts
import { Plugin } from "obsidian";
import { doSomething } from "./my-command";

export function registerCommands(plugin: Plugin) {
  plugin.addCommand({
    id: "do-something",
    name: "Do something",
    callback: () => doSomething(plugin),
  });
}
```

### Add a command

```ts
this.addCommand({
  id: "your-command-id",
  name: "Do the thing",
  callback: () => this.doTheThing(),
});
```

### Persist settings

```ts
interface MySettings { enabled: boolean }
const DEFAULT_SETTINGS: MySettings = { enabled: true };

async onload() {
  this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  await this.saveData(this.settings);
}
```

### Register listeners safely

```ts
this.registerEvent(this.app.workspace.on("file-open", f => { /* ... */ }));
this.registerDomEvent(window, "resize", () => { /* ... */ });
this.registerInterval(window.setInterval(() => { /* ... */ }, 1000));
```

## Troubleshooting

- Plugin doesn't load after build: ensure `main.js` and `manifest.json` are at the top level of the plugin folder under `<Vault>/.obsidian/plugins/<plugin-id>/`. 
- Build issues: if `main.js` is missing, run `npm run build` or `npm run dev` to compile your TypeScript source code.
- Commands not appearing: verify `addCommand` runs after `onload` and IDs are unique.
- Settings not persisting: ensure `loadData`/`saveData` are awaited and you re-render the UI after changes.
- Mobile-only issues: confirm you're not using desktop-only APIs; check `isDesktopOnly` and adjust.

## References

- Obsidian sample plugin: https://github.com/obsidianmd/obsidian-sample-plugin
- API documentation: https://docs.obsidian.md
- Developer policies: https://docs.obsidian.md/Developer+policies
- Plugin guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- Style guide: https://help.obsidian.md/style-guide

---

# Cartographer Development Roadmap

## Project Architecture (for agents)

This is an **Obsidian community plugin** (TypeScript → bundled JavaScript) implementing a configuration-driven data cataloging system supporting **multiple libraries per vault**.

**Core Concept:** No hardcoded field names or paths. Users create and configure libraries directly via plugin settings. Each library has:
- Catalog path (e.g., `works`, `library`, `manuscripts`)
- Custom schema with field definitions
- Component configuration (which dashboards, filters, tables to display)

**Architecture Change (January 4, 2026):** Multi-library system. Single active library at a time, switchable via commands or sidebar panel.

**Documentation Structure:**
- [CARTOGRAPHER-MASTER-SPEC.md](CARTOGRAPHER-MASTER-SPEC.md): Authoritative architecture, decisions, and detailed phase specifications
- [CARTOGRAPHER-PORTABILITY-CONFIGURATION.md](CARTOGRAPHER-PORTABILITY-CONFIGURATION.md): Implementation details of settings system and library management
- [CARTOGRAPHER-AUDIT-DATAVIEW-TO-DATACORE.md](CARTOGRAPHER-AUDIT-DATAVIEW-TO-DATACORE.md): Query layer design and data flow patterns
- [CARTOGRAPHER-DATACORE-COMPONENT-ARCHITECTURE.md](CARTOGRAPHER-DATACORE-COMPONENT-ARCHITECTURE.md): Full component implementations with code examples

---

## Session Roadmap

| Session | Status | Summary |
|-------|--------|---------|
| 1 | ✅ COMPLETE | Multi-library refactor: types, settings, data loading architecture |
| 2 | ✅ COMPLETE | Data access & query foundation: YAML parsing, 20+ query functions |
| 3 | ✅ COMPLETE | Core components (Part 1): StatusDashboard, FilterBar, WorksTable |
| 4 | ⏳ Next | Core components (Part 2): PublicationDashboard, AuthorCard, BackstagePipeline |
| 5 | ⏳ Next | Plugin integration: Obsidian commands, sidebar, settings UI |

**For detailed phase objectives, deliverables, and testing criteria:** See [CARTOGRAPHER-MASTER-SPEC.md](CARTOGRAPHER-MASTER-SPEC.md) (Section: "Phase Definitions").

---

## Quick Reference (for agents)

### Session Startup
1. **Review current status:** [CARTOGRAPHER-MASTER-SPEC.md](CARTOGRAPHER-MASTER-SPEC.md) (Section: "Project Status")
2. **Understand target phase:** See phase definitions in Master Spec
3. **Reference architecture docs** as needed for technical details

### Key Directories & Files

**Core Plugin:**
- `src/main.ts` — Plugin entry point & lifecycle
- `src/config/settingsManager.ts` — Library CRUD operations
- `src/types/*.ts` — Type definitions (DatacoreSettings, Library, CatalogItem, etc.)
- `src/hooks/useDataLoading.ts` — Reactive data loading from vault
- `src/queries/queryFunctions.ts` — Filter, sort, group, aggregate operations
- `src/components/*.ts` — View scaffolds (StatusDashboard, WorksTable)
- `styles.css` — Responsive theming

**Documentation:**
- `.agent/CARTOGRAPHER-MASTER-SPEC.md` — Single source of truth
- `CARTOGRAPHER-*.md` — Implementation guides at plugin root
- `.agent/DOCUMENTATION-ALIGNMENT-SESSION-1.md` — Conversation record

### Build & Test
```bash
npm install                         # Install deps
npm run build                       # Compile TypeScript → main.js
npm run dev                         # Watch mode (auto-rebuild)
```

**Manual Install for Testing:**
```
Copy main.js, manifest.json, styles.css to:
<Vault>/.obsidian/plugins/cartographer/
Reload Obsidian (Cmd-R / Ctrl-R)
Enable in Settings → Community plugins
```

### Linting
```bash
eslint ./src                        # Analyze all source files
```

### Dependency & Config Management
- **Package manager:** npm (required, defines build scripts)
- **Bundler:** esbuild (required, compiles TS to JS)
- **TypeScript:** strict mode enabled, no implicit `any`
- **Target:** Browser-compatible (Obsidian desktop/mobile)

### When Adding Code
- Keep `main.ts` focused on lifecycle only
- One class per file, clear module boundaries
- No linting/type-checking bypass comments (fix issues properly)
- Use `async/await` over promise chains
- Register all DOM/app/interval listeners with `this.register*` helpers for cleanup
