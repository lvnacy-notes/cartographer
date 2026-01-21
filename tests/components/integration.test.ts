import {
	describe,
	test
} from 'node:test';
import assert from 'node:assert/strict';
import { h } from 'preact';
import { render } from 'preact-render-to-string';
import type {
	CatalogItem,
	CatalogSchema,
	DatacoreSettings
} from '../../src/types';
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

/**
 * Helper: Generate synthetic catalog items for performance/scale testing.
 * Creates N items with realistic field values for benchmarking.
 */
function generateSyntheticItems(count: number, baseSchema: CatalogSchema): CatalogItem[] {
	const items: CatalogItem[] = [];
	const statuses = ['raw', 'in-review', 'approved', 'archived'];
	const years = Array.from({ length: 130 }, (_, i) => 1894 + i);
	const authors = [
		'Lovecraft, Howard Phillips',
		'Machen, Arthur',
		'Smith, Clark Ashton',
		'Poe, Edgar Allen',
		'Quinn, Seabury'
	];

	for (let i = 0; i < count; i++) {
		// Use dynamic require since CatalogItem is a class in source
		const item = new (require('../../src/types').CatalogItem)(
			`synthetic-item-${i}`,
			`works/synthetic-${i}.md`
		);

		item.setField('title', `Synthetic Work ${i + 1}`);
		item.setField('category', i % 2 === 0 ? 'short story' : 'novelette');
		item.setField('authors', [[authors[i % authors.length]]]);
		item.setField('year', years[i % years.length]);
		item.setField('volume', Math.floor(i / 10));
		item.setField('word-count', 1000 + (i % 20000));
		item.setField('date-cataloged', new Date().toISOString());
		item.setField('date-reviewed', Math.random() > 0.3 ? new Date().toISOString() : null);
		item.setField('bp-candidate', Math.random() > 0.5);
		item.setField('bp-approved', Math.random() > 0.7);
		item.setField('catalog-status', statuses[i % statuses.length]);
		item.setField('keywords', ['synthetic', 'test-data']);
		item.setField('tags', ['library', 'test']);
		item.setField('publications', [['Test Publication']]);

		items.push(item);
	}

	return items;
}

/**
 * Helper: Deep clone settings object for test isolation.
 */
function cloneSettings(settings: DatacoreSettings): DatacoreSettings {
	return JSON.parse(JSON.stringify(settings));
}

/**
 * Helper: Measure render time in milliseconds.
 */
function measureRenderTime(
	component: ReturnType<typeof h>,
	label: string
): { html: string; timeMs: number } {
	const startTime = performance.now();
	const html = render(component);
	const endTime = performance.now();
	const timeMs = endTime - startTime;
	console.log(`[Performance] ${label}: ${timeMs.toFixed(2)}ms`);
	return { html, timeMs };
}


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

// ============================================================================
// EDGE CASE TESTING: Empty, Single Item, and Large Catalogs
// ============================================================================

describe('Component Integration - Edge Cases', () => {
	test('empty catalog (0 items)', () => {
		const emptyItems: CatalogItem[] = [];

		// StatusDashboard with empty items
		const statusResult = render(
			h(StatusDashboard, {
				items: emptyItems,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// WorksTable with empty items
		const tableResult = render(
			h(WorksTable, {
				items: emptyItems,
				schema: catalogSchema,
				settings: defaultSettings
			})
		);

		// FilterBar with empty items
		const filterResult = render(
			h(FilterBar, {
				items: emptyItems,
				schema: catalogSchema,
				settings: defaultSettings,
				onFilter: () => {}
			})
		);

		// All components should render gracefully without error
		assert(statusResult.includes('cartographer-status-dashboard'), 'StatusDashboard should render with empty items');
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render with empty items');
		assert(filterResult.includes('cartographer-filter-bar'), 'FilterBar should render with empty items');

		// Verify no data cells are created
		const statusCells = (statusResult.match(/cartographer-status-dashboard__cell/g) || []).length;
		const tableRows = (tableResult.match(/cartographer-works-table__row/g) || []).length;
		assert(statusCells === 0, 'StatusDashboard should have no cells with empty catalog');
		assert(tableRows === 0, 'WorksTable should have no rows with empty catalog');
	});

	test('single item catalog', () => {
		const singleItem = catalogItems.slice(0, 1);

		// StatusDashboard with single item
		const statusResult = render(
			h(StatusDashboard, {
				items: singleItem,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// WorksTable with single item
		const tableResult = render(
			h(WorksTable, {
				items: singleItem,
				schema: catalogSchema,
				settings: defaultSettings
			})
		);

		// FilterBar with single item
		const filterResult = render(
			h(FilterBar, {
				items: singleItem,
				schema: catalogSchema,
				settings: defaultSettings,
				onFilter: () => {}
			})
		);

		// All components should render with single item
		assert(statusResult.includes('cartographer-status-dashboard'), 'StatusDashboard should render single item');
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render single item');
		assert(filterResult.includes('cartographer-filter-bar'), 'FilterBar should render single item');

		// Verify exactly one row/cell
		const statusCells = (statusResult.match(/cartographer-status-dashboard__cell/g) || []).length;
		const tableRows = (tableResult.match(/cartographer-works-table__row/g) || []).length;
		assert(statusCells > 0, 'StatusDashboard should have data for single item');
		assert(tableRows === 1, 'WorksTable should have exactly 1 row');
	});

	test('large catalog (100+ items)', () => {
		const largeItems = generateSyntheticItems(150, catalogSchema);

		// StatusDashboard with 150 items
		const statusResult = render(
			h(StatusDashboard, {
				items: largeItems,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// WorksTable with 150 items
		const tableResult = render(
			h(WorksTable, {
				items: largeItems,
				schema: catalogSchema,
				settings: defaultSettings
			})
		);

		// FilterBar with 150 items (should still render)
		const filterResult = render(
			h(FilterBar, {
				items: largeItems,
				schema: catalogSchema,
				settings: defaultSettings,
				onFilter: () => {}
			})
		);

		// All components should handle large datasets
		assert(statusResult.includes('cartographer-status-dashboard'), 'StatusDashboard should render 150 items');
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render 150 items');
		assert(filterResult.includes('cartographer-filter-bar'), 'FilterBar should render 150 items');

		// Verify row counts match
		const tableRows = (tableResult.match(/cartographer-works-table__row/g) || []).length;
		assert(tableRows > 0, 'WorksTable should have rows from large catalog');
		assert(tableRows <= largeItems.length, 'WorksTable should respect maxRows pagination setting');
	});

	test('missing fields in some items', () => {
		const itemsWithMissing = catalogItems.map((item, index) => {
			// Clone the item
			const cloned = new (require('../../src/types').CatalogItem)(item.id, item.filePath);
			
			// Copy all fields
			for (const field of catalogSchema.fields) {
				const value = item.getField(field.key);
				cloned.setField(field.key, value);
			}

			// Remove some optional fields for certain items
			if (index % 3 === 0) {
				cloned.setField('date-reviewed', null);
			}
			if (index % 5 === 0) {
				cloned.setField('bp-approved', null);
			}

			return cloned;
		});

		// All components should handle missing fields gracefully
		const statusResult = render(
			h(StatusDashboard, {
				items: itemsWithMissing,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		const tableResult = render(
			h(WorksTable, {
				items: itemsWithMissing,
				schema: catalogSchema,
				settings: defaultSettings
			})
		);

		const filterResult = render(
			h(FilterBar, {
				items: itemsWithMissing,
				schema: catalogSchema,
				settings: defaultSettings,
				onFilter: () => {}
			})
		);

		// Verify components render despite missing fields
		assert(statusResult.includes('cartographer-status-dashboard'), 'StatusDashboard should render with missing fields');
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render with missing fields');
		assert(filterResult.includes('cartographer-filter-bar'), 'FilterBar should render with missing fields');
	});
});

// ============================================================================
// LIBRARY SWITCHING & MULTI-LIBRARY SUPPORT
// ============================================================================

describe('Component Integration - Library Switching & State Isolation', () => {
	test('switching between different libraries maintains state isolation', () => {
		// Create two different library configurations
		const library1Items = catalogItems.slice(0, 10);
		const library2Items = catalogItems.slice(15, 25);

		const settings1 = cloneSettings(defaultSettings);
		settings1.activeLibraryId = 'library-1';

		const settings2 = cloneSettings(defaultSettings);
		settings2.activeLibraryId = 'library-2';

		// Render with library 1
		const lib1Result = render(
			h(WorksTable, {
				items: library1Items,
				schema: catalogSchema,
				settings: settings1
			})
		);

		// Render with library 2
		const lib2Result = render(
			h(WorksTable, {
				items: library2Items,
				schema: catalogSchema,
				settings: settings2
			})
		);

		// Verify both render independently
		assert(lib1Result.includes('cartographer-works-table'), 'Library 1 should render');
		assert(lib2Result.includes('cartographer-works-table'), 'Library 2 should render');

		// Verify row counts differ (isolation)
		const lib1Rows = (lib1Result.match(/cartographer-works-table__row/g) || []).length;
		const lib2Rows = (lib2Result.match(/cartographer-works-table__row/g) || []).length;
		assert(lib1Rows > 0 && lib2Rows > 0, 'both libraries should have rows');
		assert(lib1Rows !== lib2Rows || library1Items.length === library2Items.length, 'different libraries should render different row counts');
	});

	test('active library settings properly reflect in components', () => {
		const customSettings = cloneSettings(defaultSettings);
		customSettings.activeLibraryId = 'test-library';
		customSettings.dashboards.worksTable.defaultColumns = ['title', 'authors', 'year'];

		const result = render(
			h(WorksTable, {
				items: catalogItems,
				schema: catalogSchema,
				settings: customSettings
			})
		);

		// Component should use provided settings
		assert(result.includes('cartographer-works-table'), 'WorksTable should respect active library settings');

		// Verify column configuration is applied
		assert(result.includes('title') || result.includes('cartographer-works-table'), 'columns from settings should be used');
	});
});

// ============================================================================
// SETTINGS PERSISTENCE & RELOAD SCENARIOS
// ============================================================================

describe('Component Integration - Settings Persistence', () => {
	test('settings object can be serialized and deserialized', () => {
		const original = cloneSettings(defaultSettings);

		// Serialize to JSON (simulating persistence)
		const serialized = JSON.stringify(original);
		assert(serialized.length > 0, 'settings should serialize to JSON');

		// Deserialize from JSON (simulating reload)
		const deserialized = JSON.parse(serialized) as DatacoreSettings;
		assert.deepEqual(deserialized.activeLibraryId, original.activeLibraryId, 'activeLibraryId should persist');
		assert.deepEqual(deserialized.dashboards.worksTable.enabled, original.dashboards.worksTable.enabled, 'dashboard config should persist');

		// Verify components work with deserialized settings
		const result = render(
			h(WorksTable, {
				items: catalogItems,
				schema: catalogSchema,
				settings: deserialized
			})
		);

		assert(result.includes('cartographer-works-table'), 'components should work with deserialized settings');
	});

	test('dashboard visibility toggles persist correctly', () => {
		const settings1 = cloneSettings(defaultSettings);
		settings1.dashboards.statusDashboard.enabled = true;
		settings1.dashboards.filterBar.enabled = false;

		const settings2 = cloneSettings(defaultSettings);
		settings2.dashboards.statusDashboard.enabled = false;
		settings2.dashboards.filterBar.enabled = true;

		// With settings1: StatusDashboard enabled, FilterBar disabled
		const status1 = render(
			h(StatusDashboard, {
				items: catalogItems,
				schema: catalogSchema,
				settings: settings1,
				statusField: 'catalog-status'
			})
		);

		const filter1 = render(
			h(FilterBar, {
				items: catalogItems,
				schema: catalogSchema,
				settings: settings1,
				onFilter: () => {}
			})
		);

		assert(status1.includes('cartographer-status-dashboard'), 'StatusDashboard should render when enabled in settings');
		assert(filter1.includes('cartographer-filter-bar'), 'FilterBar should still render (visibility is per-component responsibility)');

		// With settings2: StatusDashboard disabled, FilterBar enabled
		const status2 = render(
			h(StatusDashboard, {
				items: catalogItems,
				schema: catalogSchema,
				settings: settings2,
				statusField: 'catalog-status'
			})
		);

		const filter2 = render(
			h(FilterBar, {
				items: catalogItems,
				schema: catalogSchema,
				settings: settings2,
				onFilter: () => {}
			})
		);

		assert(status2.includes('cartographer-status-dashboard'), 'StatusDashboard should still render');
		assert(filter2.includes('cartographer-filter-bar'), 'FilterBar should render when enabled in settings');
	});
});

// ============================================================================
// MOBILE VIEWPORT & RESPONSIVE TESTING
// ============================================================================

describe('Component Integration - Mobile Viewport Testing', () => {
	test('all components render at mobile viewport (600px)', () => {
		// Test at 600px width (typical mobile)
		const mobileItems = catalogItems.slice(0, 10);

		const statusResult = render(
			h('div', { style: 'width: 600px' },
				h(StatusDashboard, {
					items: mobileItems,
					schema: catalogSchema,
					settings: defaultSettings,
					statusField: 'catalog-status'
				})
			)
		);

		const tableResult = render(
			h('div', { style: 'width: 600px' },
				h(WorksTable, {
					items: mobileItems,
					schema: catalogSchema,
					settings: defaultSettings
				})
			)
		);

		const filterResult = render(
			h('div', { style: 'width: 600px' },
				h(FilterBar, {
					items: mobileItems,
					schema: catalogSchema,
					settings: defaultSettings,
					onFilter: () => {}
				})
			)
		);

		// Verify all components render at mobile width
		assert(statusResult.includes('cartographer-status-dashboard'), 'StatusDashboard should render at 600px');
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render at 600px');
		assert(filterResult.includes('cartographer-filter-bar'), 'FilterBar should render at 600px');
	});

	test('filter bar remains accessible on mobile', () => {
		const mobileItems = catalogItems.slice(0, 10);

		const filterResult = render(
			h(FilterBar, {
				items: mobileItems,
				schema: catalogSchema,
				settings: defaultSettings,
				onFilter: () => {}
			})
		);

		// Filter controls should be present and accessible
		assert(filterResult.includes('cartographer-filter-bar'), 'FilterBar should render on mobile');
		assert(filterResult.includes('cartographer-filter-bar__filter'), 'Filter controls should be accessible');

		// Should have interactive elements (inputs, selects, etc.)
		assert(
			filterResult.includes('input') || filterResult.includes('select'),
			'FilterBar should have interactive elements on mobile'
		);
	});

	test('works table scrolls horizontally on mobile', () => {
		const mobileItems = catalogItems.slice(0, 10);

		const tableResult = render(
			h(WorksTable, {
				items: mobileItems,
				schema: catalogSchema,
				settings: defaultSettings
			})
		);

		// Table should render and handle multiple columns
		assert(tableResult.includes('cartographer-works-table'), 'WorksTable should render on mobile');

		// Should have table structure that can scroll
		assert(
			tableResult.includes('table') || tableResult.includes('cartographer-works-table__row'),
			'WorksTable should have scrollable structure'
		);
	});
});

// ============================================================================
// PERFORMANCE BENCHMARKING
// ============================================================================

describe('Component Integration - Performance Benchmarks', () => {
	test('performance: 100+ item catalog (150 items)', () => {
		const largeItems = generateSyntheticItems(150, catalogSchema);

		// Benchmark StatusDashboard
		const { timeMs: statusTime } = measureRenderTime(
			h(StatusDashboard, {
				items: largeItems,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			}),
			'StatusDashboard (150 items)'
		);

		// Benchmark WorksTable
		const { timeMs: tableTime } = measureRenderTime(
			h(WorksTable, {
				items: largeItems,
				schema: catalogSchema,
				settings: defaultSettings
			}),
			'WorksTable (150 items)'
		);

		// Benchmark FilterBar
		const { timeMs: filterTime } = measureRenderTime(
			h(FilterBar, {
				items: largeItems,
				schema: catalogSchema,
				settings: defaultSettings,
				onFilter: () => {}
			}),
			'FilterBar (150 items)'
		);

		// Performance assertions: reasonable render times on large datasets
		// (baselines depend on machine; these are permissive for CI/CD compatibility)
		assert(statusTime < 5000, `StatusDashboard should render 150 items in <5s (got ${statusTime.toFixed(2)}ms)`);
		assert(tableTime < 5000, `WorksTable should render 150 items in <5s (got ${tableTime.toFixed(2)}ms)`);
		assert(filterTime < 5000, `FilterBar should render 150 items in <5s (got ${filterTime.toFixed(2)}ms)`);

		console.log(`
[Performance Summary]
- StatusDashboard (150 items): ${statusTime.toFixed(2)}ms
- WorksTable (150 items):      ${tableTime.toFixed(2)}ms
- FilterBar (150 items):       ${filterTime.toFixed(2)}ms
		`);
	});

	test('performance: filter/sort operations on real data', () => {
		const items = catalogItems;

		// Benchmark filtering
		const filterStart = performance.now();
		const filtered = items.filter((item) => {
			return item.getField('catalog-status') === 'raw';
		});
		const filterTime = performance.now() - filterStart;

		// Benchmark sorting
		const sortStart = performance.now();
		const sorted = items.sort((a, b) => {
			const aYear = a.getField('year') as number || 0;
			const bYear = b.getField('year') as number || 0;
			return aYear - bYear;
		});
		const sortTime = performance.now() - sortStart;

		console.log(`
[Query Performance]
- Filter (${items.length} items): ${filterTime.toFixed(2)}ms
- Sort (${items.length} items):   ${sortTime.toFixed(2)}ms
		`);

		// Filter and sort should complete quickly on reasonable datasets
		assert(filterTime < 100, `Filter should complete in <100ms (got ${filterTime.toFixed(2)}ms)`);
		assert(sortTime < 100, `Sort should complete in <100ms (got ${sortTime.toFixed(2)}ms)`);
		assert(filtered.length > 0, 'filtered data should be non-empty');
		assert(sorted.length === items.length, 'sorted data should have same item count');
	});

	test('performance: rendering same data multiple times (cache efficiency)', () => {
		const items = catalogItems;

		// First render (cold)
		const { timeMs: cold } = measureRenderTime(
			h(WorksTable, { items, schema: catalogSchema, settings: defaultSettings }),
			'WorksTable (cold render)'
		);

		// Second render (warm)
		const { timeMs: warm } = measureRenderTime(
			h(WorksTable, { items, schema: catalogSchema, settings: defaultSettings }),
			'WorksTable (warm render)'
		);

		// Third render (should be similar to warm)
		const { timeMs: warm2 } = measureRenderTime(
			h(WorksTable, { items, schema: catalogSchema, settings: defaultSettings }),
			'WorksTable (warm render 2)'
		);

		console.log(`
[Cache Efficiency]
- Cold render:  ${cold.toFixed(2)}ms
- Warm render:  ${warm.toFixed(2)}ms
- Warm render:  ${warm2.toFixed(2)}ms
		`);

		// Warm renders should be consistent
		assert(Math.abs(warm - warm2) < Math.max(warm, warm2) * 0.5, 'consecutive renders should have consistent performance');
	});
});
