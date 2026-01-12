/**
 * Storybook Fixtures
 * 
 * This directory contains sample data and configurations for Storybook component testing.
 * All fixtures are typed to match Cartographer's data structures and can be reused across
 * multiple stories for consistent, realistic component rendering.
 * 
 * Fixtures included:
 * - sampleSchema.ts - CatalogSchema definition with field types and configuration
 * - sampleWorks.ts - Sample catalog items (15+ stories) and dataset generators
 * - sampleFilters.ts - FilterDefinition configurations and active filter examples
 * - sampleLibrary.ts - Complete Library and DatacoreSettings configurations
 * 
 * Usage:
 * 
 * ```typescript
 * import { sampleSchema, sampleWorks, sampleFilters, sampleLibrary } from '../fixtures';
 * 
 * export const Default: Story = {
 *   args: {
 *     items: sampleWorks,
 *     schema: sampleSchema,
 *     config: sampleLibrary.dashboards.worksTable,
 *   },
 * };
 * ```
 */

export { sampleSchema } from './sampleSchema';
export {
    sampleWorks,
    generateLargeDataset
} from './sampleWorks';
export {
    sampleFilters,
    sampleActiveFilters
} from './sampleFilters';
export {
    sampleLibrary,
    sampleSettings
} from './sampleLibrary';