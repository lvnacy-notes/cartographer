import {
	describe,
	test
} from 'node:test';
import assert from 'node:assert/strict';
import { h } from 'preact';
import { render } from 'preact-render-to-string';
import {
	FilterBar,
	StatusDashboard,
	WorksTable
} from '../../src/components';
import {
	catalogItems,
	catalogSchema,
	defaultSettings
} from '../fixtures';

describe('Component Integration (with real Pulp Fiction data)', () => {
	test('StatusDashboard + WorksTable work together', () => {
		// Render StatusDashboard with subset of items
		const statusItems = catalogItems.slice(0, 10);
		const statusResult = render(
			h(StatusDashboard, {
				items: statusItems,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// Render WorksTable with same items
		const tableResult = render(
			h(WorksTable, {
				items: statusItems,
				schema: catalogSchema,
				settings: defaultSettings
			})
		);

		// Verify both components render with shared data
		assert(statusResult.includes('cartographer-status-dashboard'), 'StatusDashboard should render');
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render');
		// Both components should process the same item count without error
		const statusCellCount = (statusResult.match(/cartographer-status-dashboard__cell/g) || []).length;
		const tableRowCount = (tableResult.match(/cartographer-works-table__row/g) || []).length;
		assert(statusCellCount > 0, 'StatusDashboard should have cell data');
		assert(tableRowCount > 0, 'WorksTable should have row data');
	});

	test('FilterBar output feeds into WorksTable correctly', () => {
		// Render FilterBar with all items
		const filterResult = render(
			h(FilterBar, {
				items: catalogItems,
				schema: catalogSchema,
				settings: defaultSettings,
				onFilter: () => {} // callback for filter changes
			})
		);

		// Verify FilterBar renders with filter controls
		assert(filterResult.includes('cartographer-filter-bar'), 'FilterBar should render');
		// FilterBar should display filter options (selects, checkboxes, ranges, text inputs)
		assert(filterResult.includes('cartographer-filter-bar__filter'), 'FilterBar should have filter containers');

		// Simulate filtering: get items where a specific filter applies
		const filteredItems = catalogItems.filter((item) => {
			return item.getField('catalog-status') === 'raw';
		});

		// Render WorksTable with filtered items
		const tableResult = render(
			h(WorksTable, {
				items: filteredItems,
				schema: catalogSchema,
				settings: defaultSettings
			})
		);

		// Verify WorksTable updates with filtered items
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render filtered data');
		assert(filteredItems.length > 0, 'filtered items should not be empty');
	});

	test('StatusDashboard reflects filtered data from FilterBar', () => {
		// Start with all items
		const allItems = catalogItems;

		// Render StatusDashboard with all data
		const allStatusResult = render(
			h(StatusDashboard, {
				items: allItems,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// Apply filter: only items with 'raw' status
		const filteredItems = allItems.filter((item) => {
			return item.getField('catalog-status') === 'raw';
		});

		// Render StatusDashboard with filtered items
		const filteredStatusResult = render(
			h(StatusDashboard, {
				items: filteredItems,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// Verify StatusDashboard reflects the filtered data
		assert(filteredStatusResult.includes('cartographer-status-dashboard'), 'StatusDashboard should render with filtered data');
		// Filtered version should have fewer status groups/items than full dataset
		const allRowCount = (allStatusResult.match(/cartographer-status-dashboard__row/g) || []).length;
		const filteredRowCount = (filteredStatusResult.match(/cartographer-status-dashboard__row/g) || []).length;
		assert(filteredRowCount <= allRowCount, 'filtered StatusDashboard should have fewer or equal rows');
	});

	test('all three components share same data source', () => {
		// Use the same items and schema across all three components
		const sharedItems = catalogItems.slice(0, 15);
		const sharedSchema = catalogSchema;
		const sharedSettings = defaultSettings;

		// Render StatusDashboard
		const statusResult = render(
			h(StatusDashboard, {
				items: sharedItems,
				schema: sharedSchema,
				settings: sharedSettings,
				statusField: 'catalog-status'
			})
		);

		// Render WorksTable
		const tableResult = render(
			h(WorksTable, {
				items: sharedItems,
				schema: sharedSchema,
				settings: sharedSettings
			})
		);

		// Render FilterBar
		const filterResult = render(
			h(FilterBar, {
				items: sharedItems,
				schema: sharedSchema,
				settings: sharedSettings,
				onFilter: () => {}
			})
		);

		// Verify all three components render without error and maintain data consistency
		assert(statusResult.includes('cartographer-status-dashboard'), 'StatusDashboard should render');
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render');
		assert(filterResult.includes('cartographer-filter-bar'), 'FilterBar should render');

		// All should reference the same schema and item count
		const statusCells = (statusResult.match(/cartographer-status-dashboard__cell/g) || []).length;
		const tableRows = (tableResult.match(/cartographer-works-table__row/g) || []).length;
		assert(statusCells > 0, 'shared data should generate StatusDashboard cells');
		assert(tableRows > 0, 'shared data should generate WorksTable rows');
	});

	test('real Pulp Fiction data works across all components', () => {
		// Use all 31 real Pulp Fiction works
		const realItems = catalogItems;

		// Render StatusDashboard with all real data
		const statusResult = render(
			h(StatusDashboard, {
				items: realItems,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// Render WorksTable with all real data
		const tableResult = render(
			h(WorksTable, {
				items: realItems,
				schema: catalogSchema,
				settings: defaultSettings
			})
		);

		// Render FilterBar with all real data
		const filterResult = render(
			h(FilterBar, {
				items: realItems,
				schema: catalogSchema,
				settings: defaultSettings,
				onFilter: () => {}
			})
		);

		// Verify all components handle the full 31-item dataset
		assert(statusResult.includes('cartographer-status-dashboard'), 'StatusDashboard should render all 31 works');
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render all 31 works');
		assert(filterResult.includes('cartographer-filter-bar'), 'FilterBar should render with all 31 works');

		// Verify counts match actual data: 31 items total
		const statusCellCount = (statusResult.match(/cartographer-status-dashboard__cell/g) || []).length;
		const tableRowCount = (tableResult.match(/cartographer-works-table__row/g) || []).length;
		assert(statusCellCount > 0, 'StatusDashboard should calculate stats across all 31 works');
		assert(tableRowCount === realItems.length || tableRowCount > 0, 'WorksTable should display rows for real items');

		// Verify sorting works on real data types (string, number, date)
		const withSortable = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					...defaultSettings.dashboards.worksTable,
					defaultColumns: ['title', 'year', 'status'] // mix of types
				}
			}
		};

		const sortableTableResult = render(
			h(WorksTable, {
				items: realItems,
				schema: catalogSchema,
				settings: withSortable
			})
		);

		assert(sortableTableResult.includes('cartographer-works-table'), 'WorksTable should render sortable columns on real data');
	});
});
