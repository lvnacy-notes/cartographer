import type { Meta, StoryObj } from '@storybook/preact';
import { WorksTable } from './WorksTable';
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
 * Helper function to generate large dataset for performance testing
 *
 * @param count - Number of items to generate
 * @returns Array of CatalogItem instances
 */
function buildLargeDataset(count: number = 100) {
	const baseItems = buildSampleItems(sampleWorks);
	const largeSet = [];

	for (let i = 0; i < count; i++) {
		const baseItem = baseItems[i % baseItems.length];
		const item = baseItem.clone();
		item.id = `${baseItem.id}-${i}`;
		largeSet.push(item);
	}

	return largeSet;
}

/**
 * WorksTable Story Metadata
 *
 * Interactive table component displaying catalog items with configurable columns,
 * sorting, and pagination. Respects library schema for column visibility and
 * sortability. Adapts to different library configurations dynamically.
 */
const meta: Meta<typeof WorksTable> = {
	title: 'Components/WorksTable',
	component: WorksTable,
	tags: ['component', 'table'],
	parameters: {
		layout: 'fullscreen',
		viewport: {
			defaultViewport: 'desktop',
		},
	},
	argTypes: {
		items: {
			description: 'All items to display in the table',
			control: { type: 'object' },
		},
		schema: {
			description: 'Library schema with field definitions and visibility settings',
			control: { type: 'object' },
		},
		settings: {
			description: 'Full settings object providing table configuration',
			control: { type: 'object' },
		},
		sortColumn: {
			description: 'Current sort column key',
			control: { type: 'text' },
		},
		sortDesc: {
			description: 'Sort direction - true for descending, false for ascending',
			control: { type: 'boolean' },
		},
		onSort: {
			description: 'Callback when sort changes (column, direction)',
			control: { type: 'function' },
		},
		currentPage: {
			description: 'Current page number (0-indexed)',
			control: { type: 'number' },
		},
		onPageChange: {
			description: 'Callback when page changes',
			control: { type: 'function' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story: table with all configured columns visible
 *
 * Displays 15 sample catalog items with default columns from schema.
 * Shows all standard table UI elements: headers, sorting indicators,
 * pagination controls, and cell data.
 */
export const Default: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: sampleSettings,
		sortColumn: undefined,
		sortDesc: false,
		currentPage: 0,
		onSort: (column: string, desc: boolean) => {
			console.log('Sort changed:', column, 'desc:', desc);
		},
		onPageChange: (page: number) => {
			console.log('Page changed:', page);
		},
	},
};

/**
 * Custom column configuration story: subset of visible columns
 *
 * Tests dynamic column rendering. Table displays only title, authors,
 * and catalog-status fields. Verifies that column order and visibility
 * respect schema configuration.
 */
export const CustomColumns: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: {
			...sampleSchema,
			fields: sampleSchema.fields.map((field) => ({
				...field,
				visible: ['title', 'authors', 'catalog-status'].includes(field.key),
			})),
		},
		settings: sampleSettings,
		sortColumn: undefined,
		sortDesc: false,
		currentPage: 0,
	},
};

/**
 * Sorting interaction story: demonstrates sort functionality
 *
 * Pre-sorted by title in ascending order. User can click column headers
 * in Storybook controls to change sort column and direction.
 * Verifies sort indicators update correctly.
 */
export const SortingInteraction: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: sampleSettings,
		sortColumn: 'title',
		sortDesc: false,
		currentPage: 0,
		onSort: (column: string, desc: boolean) => {
			console.log('Sort changed:', column, 'desc:', desc);
		},
	},
};

/**
 * Pagination interaction story: table with 50+ items
 *
 * Demonstrates pagination controls (prev/next/page buttons).
 * Shows pagination working at page 0. Verify controls are accessible
 * and page changes trigger onPageChange callback.
 */
export const PaginationInteraction: Story = {
	args: {
		items: buildLargeDataset(50),
		schema: sampleSchema,
		settings: sampleSettings,
		sortColumn: undefined,
		sortDesc: false,
		currentPage: 0,
		onPageChange: (page: number) => {
			console.log('Page changed:', page);
		},
	},
};

/**
 * Empty table story: renders with 0 items
 *
 * Tests graceful handling of empty state. Table should display
 * headers but show "no items" message rather than crashing or
 * displaying undefined rows.
 */
export const EmptyTable: Story = {
	args: {
		items: [],
		schema: sampleSchema,
		settings: sampleSettings,
		sortColumn: undefined,
		sortDesc: false,
		currentPage: 0,
	},
};

/**
 * Single item table story: renders with exactly 1 item
 *
 * Verifies table renders correctly with minimal data.
 * Pagination should be disabled or show "1 of 1".
 * Sorting should still work on the single item.
 */
export const SingleItem: Story = {
	args: {
		items: buildSampleItems(sampleWorks).slice(0, 1),
		schema: sampleSchema,
		settings: sampleSettings,
		sortColumn: undefined,
		sortDesc: false,
		currentPage: 0,
	},
};

/**
 * Very wide table story: many columns visible
 *
 * Tests horizontal scroll and column alignment with many fields.
 * Renders all available schema fields as columns. Verifies:
 * - Horizontal scroll works correctly
 * - Column widths computed properly
 * - Header alignment maintained
 * - Cell content renders without overflow
 */
export const VeryWideTable: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: {
			...sampleSchema,
			fields: sampleSchema.fields.map((field) => ({
				...field,
				visible: true,
			})),
		},
		settings: sampleSettings,
		sortColumn: undefined,
		sortDesc: false,
		currentPage: 0,
	},
};

/**
 * Mobile viewport story: renders at 600px width
 *
 * Tests responsive table layout on tablets and phones.
 * Storybook viewport addon switches to tablet (600px) automatically.
 *
 * Verification checklist:
 * - Table responsive at narrow width
 * - Column stacking or horizontal scroll implemented
 * - Touch-friendly button sizes for pagination
 * - Text readable at small width
 * - No content cutoff or overflow
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
		sortColumn: undefined,
		sortDesc: false,
		currentPage: 0,
	},
};
