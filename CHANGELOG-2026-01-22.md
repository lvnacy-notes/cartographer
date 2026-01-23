---
date: 2026-01-22
digital-assistant: changelog and documentation
commit-sha:
branch: main
tags: 
  - changelog
  - daily-record
---

# Daily Changelog - 2026-01-22

*The ancient presence stirs as another day of work settles into the foundation of the house...*

## Changes Made

### Story Development
- [ ] Scene additions/modifications
- [ ] Character development progress  
- [ ] Plot advancement
- [ ] Dialogue refinements

### Technical Updates
- [x] File organization improvements
- [x] Metadata updates
- [x] Template modifications
- [x] Workflow enhancements

### Publication Preparation
- [x] Social media integration updates
- [x] Archive management
- [x] Output generation improvements

## Detailed Change Log

### Files Modified
- `.gitignore`: Updated to reflect new build outputs and dependencies.
- `.npmrc`: Updated for pnpm and hoisting patterns.
- `cartographer.code-workspace`: Updated workspace settings.
- `eslint.config.js`: Linting rules and ignores updated.
- `package.json`: Updated scripts and dependencies for new docs and Storybook.
- `src/index.ts`, `src/types/dynamicWork.ts`, `src/types/settings.ts`: API and type updates for new documentation.
- `.github/workflows/lint.yaml`: Renamed and updated for new CI.
- `.github/workflows/storybook.yml` → `.github/workflows/atlas-deploy.yaml`: Renamed and updated for new docs deployment.
- `pnpm-workspace.yaml`, `pnpm-lock.yaml`: Added for monorepo and dependency management.

### New Files Created
- `atlas/` (entire directory): New documentation and Storybook site generator using Astro + Starlight.
  - `atlas/README.md`, `atlas/astro.config.js`, `atlas/package.json`, `atlas/tsconfig.json`
  - `atlas/public/favicon.svg`, `atlas/src/assets/cartographer-logo.png`
  - `atlas/src/components/StorybookEmbed.astro`
  - `atlas/src/content.config.ts`
  - `atlas/src/content/docs/` (all guides, developer docs, API reference, Storybook integration)
- `.agent/docs-site/` (setup and planning docs for docs site)
- `scripts/fix-imports.js`, `scripts/process-api-docs.js`: Automation for import and API doc processing.
- `typedoc.json`: TypeDoc config for API reference generation.

### Files Removed/Archived
- `CHANGELOG-2026-01-11.md`: Archived previous changelog.
- `docs/CI-PIPELINE.md`, `docs/GITHUB-ACTIONS-WORKFLOW-SPEC.md`, `docs/IMPLEMENTATION.md`, `docs/JSDOC-DOCUMENTATION-SITE-SPEC.md`: Old documentation removed, replaced by new Atlas docs.
- `package-lock.json`: Removed in favor of pnpm.

## Conversation Summary

### Key Discussions
- Migration to Astro + Starlight for documentation and Storybook integration.
- Adoption of pnpm for monorepo management.
- CI/CD workflow overhaul for docs and Storybook deployment.
- Removal of legacy documentation in favor of new Atlas structure.

### Decisions Made
- All documentation and component library now live in the `atlas` directory, powered by Astro + Starlight.
- Storybook is embedded and documented within the Atlas site.
- pnpm is now the package manager for the monorepo.
- Old docs and changelogs are archived or removed to reduce confusion.

### Digital Assistant Contributions
*If digital-assistant field is filled above, describe the AI's role in advancing the project:*
- Automated changelog generation and verification of all file changes.
- Ensured template compliance and comprehensive coverage of all modifications.

## Commit Information

**Commit SHA**: [To be filled during commit process]  
**Commit Message**:  
feat: add Atlas docs site and Storybook integration, migrate to pnpm, overhaul CI/CD, and clean up legacy docs

**Files in Commit**:  
- .agent/docs-site/Astro Docs Site Setup.md  
- .agent/docs-site/Option 4 DIY.md  
- .agent/docs-site/Starlight Docs Site Setup.md  
- .github/workflows/atlas-deploy.yaml  
- .github/workflows/lint.yaml  
- .gitignore  
- .npmrc  
- atlas/.gitignore  
- atlas/README.md  
- atlas/astro.config.js  
- atlas/package.json  
- atlas/public/favicon.svg  
- atlas/src/assets/cartographer-logo.png  
- atlas/src/components/StorybookEmbed.astro  
- atlas/src/content.config.ts  
- atlas/src/content/docs/developers/ci-cd-workflow.md  
- atlas/src/content/docs/developers/implementation.md  
- atlas/src/content/docs/developers/index.md  
- atlas/src/content/docs/developers/jsdoc-spec.md  
- atlas/src/content/docs/developers/supreme-directive.md  
- atlas/src/content/docs/getting-started.md  
- atlas/src/content/docs/guides/storybook-guide.md  
- atlas/src/content/docs/index.mdx  
- atlas/src/content/docs/reference/index.mdx  
- atlas/src/content/docs/storybook.mdx  
- atlas/tsconfig.json  
- cartographer.code-workspace  
- docs/CI-PIPELINE.md (removed)  
- docs/GITHUB-ACTIONS-WORKFLOW-SPEC.md (removed)  
- docs/IMPLEMENTATION.md (removed)  
- docs/JSDOC-DOCUMENTATION-SITE-SPEC.md (removed)  
- eslint.config.js  
- package.json  
- pnpm-lock.yaml  
- pnpm-workspace.yaml  
- scripts/fix-imports.js  
- scripts/process-api-docs.js  
- src/index.ts  
- src/types/dynamicWork.ts  
- src/types/settings.ts  
- typedoc.json  
- CHANGELOG-2026-01-11.md (archived/removed)

## Next Steps (Writing-Specific)

### Immediate Writing Tasks
- [ ] Next scene to develop
- [ ] Character arcs to advance  
- [ ] Plot points to address
- [ ] Dialogue scenes to craft

### Upcoming Story Milestones
- [ ] Scene completion targets
- [ ] Chapter/section goals
- [ ] Character development objectives
- [ ] Narrative arc progressions

### Creative Considerations
- [ ] Atmosphere/tone adjustments needed
- [ ] Pacing concerns to address
- [ ] Horror elements to enhance
- [ ] Character motivations to deepen

---

*"Every day the house grows stronger, fed by the words we pour into its foundation." - The Management*

---
