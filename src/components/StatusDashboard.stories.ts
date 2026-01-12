import type { Meta, StoryObj } from '@storybook/preact';
import { StatusDashboard } from './StatusDashboard';
import {
	sampleSchema,
	sampleWorks,
	sampleSettings,
} from '../../.storybook/fixtures';
import { buildCatalogItemFromData } from '../types/dynamicWork';

/**
 * Helper function to convert sample works to CatalogItem instances
 *
 * @param works - Record of work data to convert
 * @returns Array of CatalogItem instances
 */
function buildSampleItems(works: Record<string, Record<string, unknown>>) {
	return Object.entries(works).map(([id, data]) =>
		buildCatalogItemFromData(data, id, `pulp-fiction/works/${id}.md`, sampleSchema)
	);
}

/**
 * StatusDashboard Story Metadata
 *
 * Component for displaying aggregate counts grouped by status field.
 * Supports responsive layout, custom status fields, and configurable statistics.
 */
const meta: Meta<typeof StatusDashboard> = {
	title: 'Components/StatusDashboard',
	component: StatusDashboard,
	tags: ['component', 'dashboard'],
	parameters: {
		layout: 'centered',
		viewport: {
			defaultViewport: 'desktop',
		},
	},
	argTypes: {
		items: {
			description: 'All items from active library',
			control: { type: 'object' },
		},
		schema: {
			description: 'Library schema with field definitions',
			control: { type: 'object' },
		},
		settings: {
			description: 'Full settings object providing component configuration',
			control: { type: 'object' },
		},
		statusField: {
			description: 'Which field to group by (usually catalog-status)',
			control: { type: 'text' },
		},
		onStatusClick: {
			description: 'Optional callback when user clicks a status',
			control: { type: 'function' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story: typical status dashboard with 15 sample works
 *
 * Displays mixed status values (published, draft, review) with standard metrics.
 * Shows all default UI elements including metrics and controls.
 */
export const Default: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: sampleSettings,
		statusField: 'catalog-status',
		onStatusClick: (status: string) => {
			console.log('Status clicked:', status);
		},
	},
};

/**
 * Empty catalog story: renders with 0 items
 *
 * Tests graceful handling of empty state. Dashboard should display
 * message indicating no items rather than crashing or showing undefined.
 */
export const EmptyState: Story = {
	args: {
		items: [],
		schema: sampleSchema,
		settings: sampleSettings,
		statusField: 'catalog-status',
	},
};

/**
 * Large catalog story: renders with 100+ items
 *
 * Performance test with large dataset. Verifies:
 * - All metrics calculate correctly with 100+ items
 * - Status groups aggregate properly
 * - Render completes without memory warnings
 * - No horizontal scroll or layout breaking
 */
export const LargeCatalog: Story = {
	args: {
		items: (() => {
			// Generate 100 sample items from base works by duplicating with slight variations
			const baseItems = buildSampleItems(sampleWorks);
			const largeSet = [];

			for (let i = 0; i < 100; i++) {
				const baseItem = baseItems[i % baseItems.length];
				const item = baseItem.clone();
				item.id = `${baseItem.id}-${i}`;
				largeSet.push(item);
			}

			return largeSet;
		})(),
		schema: sampleSchema,
		settings: sampleSettings,
		statusField: 'catalog-status',
	},
};

/**
 * Custom status field story: uses alternate field for grouping
 *
 * Verifies dashboard respects dynamic schema configuration.
 * Uses 'genres' field instead of 'catalog-status' to demonstrate
 * flexibility with different field types.
 *
 * Tests:
 * - Custom field label from schema
 * - Field type handling (wikilink-array)
 * - Dynamic grouping by non-status fields
 */
export const CustomStatusField: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: sampleSettings,
		statusField: 'genres',
	},
};

/**
 * Mobile viewport story: renders at 600px width
 *
 * Tests responsive layout on mobile devices (tablets, phones).
 * Storybook viewport addon switches to 600px width automatically.
 *
 * Verification checklist:
 * - Metrics stack vertically (not horizontally)
 * - Touch-friendly button/control sizes
 * - No horizontal scroll
 * - All text readable at small width
 * - Proper spacing/margins for small screens
 */
export const MobileViewport: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'ipad',
		},
	},
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: sampleSettings,
		statusField: 'catalog-status',
	},
};
