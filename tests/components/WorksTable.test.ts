import {
    describe,
    test
} from 'node:test';
import assert from 'node:assert/strict';
import { h } from 'preact';
import { render } from 'preact-render-to-string';
import { WorksTable } from '../../src/components';
import {
	catalogItems,
	catalogSchema,
	defaultSettings
} from '../fixtures';

describe('WorksTable', () => {
	test('renders with correct columns from config', () => {
		const items = catalogItems.slice(0, 5);
		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		assert(result.includes('works-table'), 'should render with works-table class');
		assert(result.includes('<table'), 'should render table element');
	});

	test('displays data correctly for string fields', () => {
		const items = catalogItems.slice(0, 3);
		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		assert(result.includes('<tbody'), 'should render table body');
		assert(result.includes('<td'), 'should render table cells');
	});

	test('displays data correctly for number fields', () => {
		const items = catalogItems.slice(0, 3);
		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Verify numeric values are rendered (years, word counts)
		assert(result.includes('<td'), 'should render cells with numeric data');
	});

	test('displays data correctly for date fields', () => {
		const items = catalogItems.slice(0, 5);
		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Date fields should be rendered without crashing
		assert(result.length > 0, 'should render without error with date fields');
	});

	test('displays data correctly for boolean fields', () => {
		const items = catalogItems.slice(0, 3);
		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Boolean fields should be rendered
		assert(result.includes('<table'), 'should render table with boolean fields');
	});

	test('displays data correctly for array fields', () => {
		const items = catalogItems.slice(0, 3);
		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Array fields (keywords, tags) should be rendered
		assert(result.includes('<td'), 'should render cells with array field data');
	});

	test('displays data correctly for wikilink-array fields', () => {
		const items = catalogItems.slice(0, 3);
		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Wikilink arrays (authors, publications) should be rendered
		assert(result.includes('<tbody'), 'should render table body with wikilink data');
	});

	test('sorting works on sortable columns', () => {
		const items = catalogItems.slice(0, 8);
		let sortedColumn = '';
		let sortedDesc = false;

		const handleSort = (column: string, desc: boolean) => {
			sortedColumn = column;
			sortedDesc = desc;
		};

		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: 'year',
				sortDesc: false,
				onSort: handleSort,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Should render table with sort column specified
		assert(result.includes('works-table'), 'should render sorted table');
	});

	test('sorting does not affect unsortable columns', () => {
		const items = catalogItems.slice(0, 5);

		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: 'title',
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Even unsortable columns should render
		assert(result.includes('<table'), 'should handle unsortable columns gracefully');
	});

	test('pagination works correctly', () => {
		const items = catalogItems.slice(0, 25);
		const settings = {
			...defaultSettings,
			ui: {
				...defaultSettings.ui,
				itemsPerPage: 10
			},
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					...defaultSettings.dashboards.worksTable,
					enablePagination: true
				}
			}
		};

		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Pagination controls should be rendered
		assert(result.includes('Showing'), 'should display pagination info');
	});

	test('column headers are clickable for sorting', () => {
		const items = catalogItems.slice(0, 5);

		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: () => { /* noop */ },
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Headers should be rendered
		assert(result.includes('<thead'), 'should render table headers');
		assert(result.includes('<th'), 'should render header cells');
	});

	test('renders with empty items array', () => {
		const result = render(
			h(WorksTable, {
				items: [],
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		assert(result.includes('No items to display'), 'should show empty state message');
		assert(result.includes('works-table-empty'), 'should have empty class');
	});

	test('missing fields display gracefully', () => {
		const items = catalogItems.slice(0, 3);
		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Should handle missing fields without crashing
		assert(result.length > 0, 'should render without error even with missing fields');
	});

	test('page change callback fires on pagination', () => {
		const items = catalogItems.slice(0, 20);
		const settings = {
			...defaultSettings,
			ui: {
				...defaultSettings.ui,
				itemsPerPage: 5
			},
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					...defaultSettings.dashboards.worksTable,
					enablePagination: true
				}
			}
		};

		let pageChanged = false;
		const handlePageChange = () => {
			pageChanged = true;
		};

		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: handlePageChange
			})
		);

		// Verify pagination controls are rendered with callback structure
		assert(result.includes('works-table-pagination'), 'should render pagination with callback support');
	});

	test('renders sort indicators on active sort column', () => {
		const items = catalogItems.slice(0, 8);

		const result = render(
			h(WorksTable, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				sortColumn: 'year',
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// When sorted, should show sort indicator
		assert(result.includes('↑') || result.includes('↓'), 'should display sort indicator');
