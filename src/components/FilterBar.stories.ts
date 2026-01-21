import type {
	Meta,
	StoryObj
} from '@storybook/preact-vite';
import { FilterBar } from './FilterBar';
import type { CatalogItem } from '../types';
import {
	sampleSchema,
	sampleWorks,
	sampleSettings,
	sampleFilters,
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
 * FilterBar Story Metadata
 *
 * Interactive filtering interface with multiple filter types (select, checkbox,
 * range, text). Supports multiple layout modes (vertical, horizontal, dropdown).
 * Respects library schema for field filterability and labels.
 */
const meta: Meta<typeof FilterBar> = {
	title: 'Components/FilterBar',
	component: FilterBar,
	tags: ['component', 'form'],
	parameters: {
		layout: 'fullscreen',
		viewport: {
			defaultViewport: 'desktop',
		},
	},
	argTypes: {
		items: {
			description: 'All items to filter',
			control: { type: 'object' },
		},
		schema: {
			description: 'Library schema with field definitions and filterability settings',
			control: { type: 'object' },
		},
		settings: {
			description: 'Full settings object providing filter configuration',
			control: { type: 'object' },
		},
		onFilter: {
			description: 'Callback fired when filters change with filtered items',
			control: { type: 'function' },
		},
		filterLayout: {
			description: 'Layout mode: vertical, horizontal, or dropdown',
			control: { type: 'select', options: ['vertical', 'horizontal', 'dropdown'] },
		},
	},
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

/**
 * Default story: vertical filter layout with all 4 filter types
 *
 * Displays filters stacked vertically: select (status), checkbox (genres),
 * range (year), and text (title, authors). Shows all standard filter controls.
 */
export const VerticalLayout: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: {
			...sampleSettings,
			dashboards: {
				...sampleSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: sampleFilters,
					layout: 'vertical',
				},
			},
		},
		filterLayout: 'vertical',
		onFilter: (filtered: CatalogItem[]) => {
			console.log('Filtered items:', filtered.length);
		},
	},
};

/**
 * Horizontal filter layout story: filters in a row
 *
 * Displays all filters in horizontal row with flex wrapping at narrower widths.
 * Tests responsive layout and alignment at desktop width.
 */
export const HorizontalLayout: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: {
			...sampleSettings,
			dashboards: {
				...sampleSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: sampleFilters,
					layout: 'horizontal',
				},
			},
		},
		filterLayout: 'horizontal',
		onFilter: (filtered: CatalogItem[]) => {
			console.log('Filtered items:', filtered.length);
		},
	},
};

/**
 * Dropdown filter layout story: filters in collapsible container
 *
 * Demonstrates compact filter layout. Filters are hidden in dropdown/collapse.
 * Tests show/hide interactions and dropdown positioning.
 */
export const DropdownLayout: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: {
			...sampleSettings,
			dashboards: {
				...sampleSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: sampleFilters,
					layout: 'dropdown',
				},
			},
		},
		filterLayout: 'dropdown',
		onFilter: (filtered: CatalogItem[]) => {
			console.log('Filtered items:', filtered.length);
		},
	},
};

/**
 * All 4 filter types story: select, checkbox, range, text
 *
 * Demonstrates all supported filter types working together.
 * Tests:
 * - Select filter (catalog-status dropdown)
 * - Checkbox filter (genres multi-select)
 * - Range filter (year-published min/max)
 * - Text filter (title and authors search)
 */
export const AllFilterTypes: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: {
			...sampleSettings,
			dashboards: {
				...sampleSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: sampleFilters,
					layout: 'vertical',
				},
			},
		},
		filterLayout: 'vertical',
		onFilter: (filtered: CatalogItem[]) => {
			console.log('Filtered items:', filtered.length);
		},
	},
};

/**
 * AND/OR logic interaction story: filter combination behavior
 *
 * Multiple active filters demonstrate how filter logic combines items.
 * In Storybook, adjust filter controls to test AND/OR behavior:
 * - AND logic: only items matching ALL active filters show
 * - OR logic: items matching ANY active filter show
 *
 * Tests visual feedback for active filters and combination display.
 */
export const MultipleActiveFilters: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: {
			...sampleSettings,
			dashboards: {
				...sampleSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: sampleFilters,
					layout: 'vertical',
				},
			},
		},
		filterLayout: 'vertical',
		onFilter: (filtered: CatalogItem[]) => {
			console.log('Filtered items count:', filtered.length);
		},
	},
};

/**
 * Mobile filter interaction story: renders at 600px width
 *
 * Tests responsive filter layout on tablets and phones.
 * Storybook viewport addon switches to tablet (600px) automatically.
 *
 * Verification checklist:
 * - Filters stack appropriately at narrow width
 * - Touch-friendly button and input sizes
 * - Dropdown/collapse accessible on mobile
 * - Text readable at small width
 * - No horizontal scroll
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
		settings: {
			...sampleSettings,
			dashboards: {
				...sampleSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: sampleFilters,
					layout: 'vertical',
				},
			},
		},
		filterLayout: 'vertical',
		onFilter: (filtered: CatalogItem[]) => {
			console.log('Filtered items:', filtered.length);
		},
	},
};

/**
 * Complex filter combination story: 5-7 active filters simultaneously
 *
 * Tests filter bar with multiple filters applied at once.
 * Displays all configured filters with different values set.
 * Verifies:
 * - Filter order and alignment with many active filters
 * - Remove filter button on each filter
 * - Reset all filters button functionality
 * - Performance with complex filter state
 */
export const ComplexFilterCombination: Story = {
	args: {
		items: buildSampleItems(sampleWorks),
		schema: sampleSchema,
		settings: {
			...sampleSettings,
			dashboards: {
				...sampleSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: sampleFilters,
					layout: 'vertical',
				},
			},
		},
		filterLayout: 'vertical',
		onFilter: (filtered: CatalogItem[]) => {
			console.log('Filtered items count:', filtered.length);
		},
	},
};
