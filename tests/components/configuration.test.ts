/**
 * Configuration Tests
 * Tests for dynamic component configuration, schema adaptation, and field visibility handling
 * 
 * Covers:
 * - Dynamic schema rendering and column generation
 * - Field visibility and configuration flags
 * - Filter adaptation based on field types
 * - Field label resolution from schema
 * - Multi-library schema compatibility
 * - Edge cases: missing fields, disabled components, empty schemas
 */

import {
	describe,
	test
} from 'node:test';
import assert from 'node:assert/strict';
import { h } from 'preact';
import { render } from 'preact-render-to-string';
import type {
	CatalogSchema,
	DatacoreSettings,
	SchemaField
} from '../../src/types';
import { StatusDashboard } from '../../src/components';
import { WorksTable } from '../../src/components';
import { FilterBar } from '../../src/components';
import { ConfigurableWorksTable } from '../../src/components/wrappers';
import {
	catalogItems,
	catalogSchema,
	defaultSettings
} from '../fixtures';



describe('Dynamic Schema Rendering', () => {
	test('StatusDashboard uses field label from schema', () => {
		const customSchema: CatalogSchema = {
			...catalogSchema,
			fields: catalogSchema.fields.map((f) =>
				f.key === 'catalog-status'
					? { ...f, label: 'Publication Status' }
					: f
			),
		};

		const settings: DatacoreSettings = {
			...defaultSettings,
			schema: customSchema,
		};

		const result = render(
			h(StatusDashboard, {
				items: catalogItems,
				schema: customSchema,
				settings,
				statusField: 'catalog-status',
			})
		);

		assert(result.includes('Publication Status Overview'), 'should use custom field label in title');
		assert(result.includes('cartographer-status-dashboard__title'), 'should have correct title class');
	});

	test('WorksTable displays schema field labels as column headers', () => {
		const customSchema: CatalogSchema = {
			...catalogSchema,
			fields: catalogSchema.fields.map((f) =>
				f.key === 'title'
					? { ...f, label: 'Story Name' }
					: f
			),
		};

		const result = render(
			h(WorksTable, {
				items: catalogItems.slice(0, 3),
				schema: customSchema,
				settings: defaultSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		assert(result.includes('Story Name'), 'should display custom field label in header');
		assert(result.includes('<th'), 'should render table headers');
	});

	test('FilterBar uses schema field labels when filter labels are missing', () => {
		const customSettings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: [
						{
							field: 'year',
							type: 'range',
							label: '', // Missing label - should use schema label
							enabled: true,
						},
					],
					layout: 'vertical',
				},
			},
		};

		const result = render(
			h(FilterBar, {
				items: catalogItems,
				schema: catalogSchema,
				settings: customSettings,
				onFilter: () => {},
				filterLayout: 'vertical'
			})
		);

		assert(result.includes('Year'), 'should use schema field label when filter label is empty');
		assert(result.includes('filter-bar'), 'should render filter bar');
	});
});



describe('Field Visibility and Filterability', () => {
	test('WorksTable only displays visible fields as columns', () => {
		const customSchema: CatalogSchema = {
			...catalogSchema,
			fields: catalogSchema.fields.map((f) =>
				f.key === 'volume' ? { ...f, visible: false } : f
			),
		};

		const settings: DatacoreSettings = {
			...defaultSettings,
			schema: customSchema,
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					enabled: true,
					defaultColumns: ['title', 'volume', 'year'], // volume is hidden in schema
					enablePagination: true,
				},
			},
		};

		const result = render(
			h(WorksTable, {
				items: catalogItems.slice(0, 3),
				schema: customSchema,
				settings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		assert(!result.includes('Volume'), 'should not display hidden field in columns');
		assert(result.includes('<th'), 'should still render table headers');
	});

	test('FilterBar skips filters for non-filterable fields', () => {
		const customSchema: CatalogSchema = {
			...catalogSchema,
			fields: catalogSchema.fields.map((f) =>
				f.key === 'volume' ? { ...f, filterable: false } : f
			),
		};

		const customSettings: DatacoreSettings = {
			...defaultSettings,
			schema: customSchema,
			dashboards: {
				...defaultSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: [
						{
							field: 'volume',
							type: 'range',
							label: 'Volume',
							enabled: true,
						},
						{
							field: 'year',
							type: 'range',
							label: 'Year',
							enabled: true,
						},
					],
					layout: 'vertical',
				},
			},
		};

		const result = render(
			h(FilterBar, {
				items: catalogItems,
				schema: customSchema,
				settings: customSettings,
				onFilter: () => {},
				filterLayout: 'vertical'
			})
		);

		// Non-filterable field should not appear
		const volumeCount = (result.match(/Volume/g) || []).length;
		assert(volumeCount === 0, 'should not render filter for non-filterable field');

		// Filterable field should appear
		assert(result.includes('Year'), 'should render filter for filterable field');
	});

	test('WorksTable respects sortable flag on fields', () => {
		const customSchema: CatalogSchema = {
			...catalogSchema,
			fields: catalogSchema.fields.map((f) =>
				f.key === 'authors' ? { ...f, sortable: false } : f
			),
		};

		const settings: DatacoreSettings = {
			...defaultSettings,
			schema: customSchema,
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					enabled: true,
					defaultColumns: ['title', 'authors'],
					enablePagination: true,
				},
			},
		};

		const result = render(
			h(WorksTable, {
				items: catalogItems.slice(0, 3),
				schema: customSchema,
				settings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: () => {},
				currentPage: 0,
				onPageChange: undefined
			})
		);

		// Non-sortable headers should be present but without sortable indication
		assert(result.includes('Authors'), 'should include non-sortable field');
		assert(result.includes('<th'), 'should render headers');
	});
});



describe('Component Enabled Flags', () => {
	test('StatusDashboard returns null when disabled', () => {
		const disabledSettings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				statusDashboard: {
					...defaultSettings.dashboards.statusDashboard,
					enabled: false,
				},
			},
		};

		const result = render(
			h(StatusDashboard, {
				items: catalogItems,
				schema: catalogSchema,
				settings: disabledSettings,
				statusField: 'catalog-status',
			})
		);

		assert(result === '', 'should render empty string when disabled');
	});

	test('WorksTable returns empty div when disabled', () => {
		const disabledSettings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					...defaultSettings.dashboards.worksTable,
					enabled: false,
				},
			},
		};

		const result = render(
			h(WorksTable, {
				items: catalogItems.slice(0, 3),
				schema: catalogSchema,
				settings: disabledSettings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		assert(result === '', 'should render empty string when disabled');
	});

	test('FilterBar returns null when disabled', () => {
		const disabledSettings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				filterBar: {
					...defaultSettings.dashboards.filterBar,
					enabled: false,
				},
			},
		};

		const result = render(
			h(FilterBar, {
				items: catalogItems,
				schema: catalogSchema,
				settings: disabledSettings,
				onFilter: () => {},
				filterLayout: 'vertical'
			})
		);

		assert(result === '', 'should render empty string when disabled');
	});
});



describe('ConfigurableWorksTable Column Generation', () => {
	test('generates columns from visible schema fields when config is empty', () => {
		const schemaWithVisibility: CatalogSchema = {
			...catalogSchema,
			fields: [
				{ ...catalogSchema.fields[0], visible: true, sortOrder: 1 } as SchemaField,
				{ ...catalogSchema.fields[1], visible: false, sortOrder: 2 } as SchemaField,
				{ ...catalogSchema.fields[2], visible: true, sortOrder: 3 } as SchemaField,
			],
		};

		const settings: DatacoreSettings = {
			...defaultSettings,
			schema: schemaWithVisibility,
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					enabled: true,
					defaultColumns: [], // Empty - should use visible fields
					enablePagination: true,
				},
			},
		};

		const result = render(
			h(ConfigurableWorksTable, {
				items: catalogItems.slice(0, 3),
				schema: schemaWithVisibility,
				settings,
			})
		);

		assert(result.includes('<th'), 'should generate columns from visible fields');
		assert(result.length > 0, 'should render table with generated columns');
	});

	test('respects configured column order when all columns are visible', () => {
		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					enabled: true,
					defaultColumns: ['year', 'title', 'authors'], // Custom order
					enablePagination: true,
				},
			},
		};

		const result = render(
			h(ConfigurableWorksTable, {
				items: catalogItems.slice(0, 3),
				schema: catalogSchema,
				settings,
			})
		);

		const yearPos = result.indexOf('Year');
		const titlePos = result.indexOf('Title');
		const authorsPos = result.indexOf('Authors');

		assert(yearPos > 0, 'should include Year field');
		assert(titlePos > 0, 'should include Title field');
		assert(authorsPos > 0, 'should include Authors field');
		assert(yearPos < titlePos, 'Year should appear before Title');
		assert(titlePos < authorsPos, 'Title should appear before Authors');
	});

	test('ensures title field is present when visible', () => {
		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					enabled: true,
					defaultColumns: ['year'], // Doesn't include title
					enablePagination: true,
				},
			},
		};

		const result = render(
			h(ConfigurableWorksTable, {
				items: catalogItems.slice(0, 3),
				schema: catalogSchema,
				settings,
			})
		);

		assert(result.includes('Title'), 'should ensure title field is present');
		assert(result.includes('<th'), 'should render table headers');
	});
});



describe('Missing Field and Error Handling', () => {
	test('StatusDashboard shows error when statusField does not exist in schema', () => {
		const result = render(
			h(StatusDashboard, {
				items: catalogItems,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'non-existent-field',
			})
		);

		assert(result.includes('cartographer-status-dashboard--error'), 'should have error class');
		assert(result.includes('not found in schema'), 'should show error message');
	});

	test('WorksTable handles missing schema fields gracefully', () => {
		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				worksTable: {
					enabled: true,
					defaultColumns: ['title', 'non-existent-field', 'year'],
					enablePagination: true,
				},
			},
		};

		const result = render(
			h(WorksTable, {
				items: catalogItems.slice(0, 3),
				schema: catalogSchema,
				settings,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		assert(!result.includes('non-existent-field'), 'should not render non-existent field');
		assert(result.includes('<th'), 'should still render headers');
	});

	test('FilterBar handles filters for non-existent fields by filtering them out', () => {
		const customSettings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: [
						{
							field: 'non-existent-field',
							type: 'select',
							label: 'Non-existent',
							enabled: true,
						},
						{
							field: 'year',
							type: 'range',
							label: 'Year',
							enabled: true,
						},
					],
					layout: 'vertical',
				},
			},
		};

		const result = render(
			h(FilterBar, {
				items: catalogItems,
				schema: catalogSchema,
				settings: customSettings,
				onFilter: () => {},
				filterLayout: 'vertical'
			})
		);

		assert(!result.includes('Non-existent'), 'should not render filter for non-existent field');
		assert(result.includes('Year'), 'should render filter for existing field');
	});
});



describe('Multi-Library Schema Compatibility', () => {
	test('WorksTable adapts columns when schema fields visibility changes', () => {
		const schema1: CatalogSchema = {
			catalogName: 'Library 1',
			fields: [
				{ ...catalogSchema.fields[0], visible: true, label: 'Field 1' } as SchemaField,
				{ ...catalogSchema.fields[1], visible: true, label: 'Field 2' } as SchemaField,
			],
			coreFields: { titleField: 'title' },
		};

		const schema2: CatalogSchema = {
			catalogName: 'Library 2',
			fields: [
				{ ...catalogSchema.fields[0], visible: false, label: 'Field 1' } as SchemaField,
				{ ...catalogSchema.fields[1], visible: true, label: 'Field 2' } as SchemaField,
				{ ...catalogSchema.fields[2], visible: true, label: 'Field 3' } as SchemaField,
			],
			coreFields: { titleField: 'title' },
		};

		const settings1: DatacoreSettings = {
			...defaultSettings,
			schema: schema1,
		};

		const settings2: DatacoreSettings = {
			...defaultSettings,
			schema: schema2,
		};

		// Render with schema1
		const result1 = render(
			h(WorksTable, {
				items: catalogItems.slice(0, 3),
				schema: schema1,
				settings: settings1,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		assert(result1.includes('Field 1'), 'should include Field 1 when visible');

		// Render with schema2 where Field 1 is hidden
		const result2 = render(
			h(WorksTable, {
				items: catalogItems.slice(0, 3),
				schema: schema2,
				settings: settings2,
				sortColumn: undefined,
				sortDesc: false,
				onSort: undefined,
				currentPage: 0,
				onPageChange: undefined
			})
		);

		assert(!result2.includes('Field 1'), 'should exclude Field 1 when not visible');
		assert(result2.includes('Field 2'), 'should include Field 2');
		assert(result2.includes('Field 3'), 'should include Field 3');
	});

	test('FilterBar adapts filter availability when schema changes', () => {
		const schema1: CatalogSchema = {
			catalogName: 'Library 1',
			fields: [
				{ ...catalogSchema.fields[0], filterable: true } as SchemaField,
				{ ...catalogSchema.fields[3], filterable: false } as SchemaField,
			],
			coreFields: { titleField: 'title' },
		};

		const schema2: CatalogSchema = {
			catalogName: 'Library 2',
			fields: [
				{ ...catalogSchema.fields[0], filterable: false } as SchemaField,
				{ ...catalogSchema.fields[3], filterable: true } as SchemaField,
			],
			coreFields: { titleField: 'title' },
		};

		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				filterBar: {
					enabled: true,
					filters: [
						{
							field: 'title',
							type: 'text',
							label: 'Title',
							enabled: true,
						},
						{
							field: 'year',
							type: 'range',
							label: 'Year',
							enabled: true,
						},
					],
					layout: 'vertical',
				},
			},
		};

		// Render with schema1 (title filterable, year not)
		const result1 = render(
			h(FilterBar, {
				items: catalogItems,
				schema: schema1,
				settings,
				onFilter: () => {},
				filterLayout: 'vertical'
			})
		);

		assert(result1.includes('Title'), 'should include Title filter when filterable');
		assert(!result1.includes('Year'), 'should exclude Year filter when not filterable');

		// Render with schema2 (title not filterable, year is)
		const result2 = render(
			h(FilterBar, {
				items: catalogItems,
				schema: schema2,
				settings,
				onFilter: () => {},
				filterLayout: 'vertical'
			})
		);

		assert(!result2.includes('Title'), 'should exclude Title filter when not filterable');
		assert(result2.includes('Year'), 'should include Year filter when filterable');
	});
});
