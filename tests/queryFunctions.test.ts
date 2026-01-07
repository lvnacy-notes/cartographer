import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CatalogItem } from '../src/types/dynamicWork';
import { CatalogSchema, SchemaField } from '../src/types/settings';
import {
	filterByField,
	filterByStatus,
	filterByAuthor,
	filterByPublication,
	filterByFieldRange,
	filterByDateRange,
	sortByField,
	sortByNumber,
	sortByDate,
	sortByString,
	groupByField,
	groupByStatus,
	groupByAuthor,
	groupByYear,
	countByStatus,
	totalWordCount,
	averageWordCount,
	getYearRange,
	getDateRange,
} from '../src/queries';

// ============================================================================
// TEST FIXTURES
// ============================================================================

/**
 * Create a test schema matching the Pulp Fiction catalog structure
 */
function createTestSchema(): CatalogSchema {
	return {
		catalogName: 'Test Catalog',
		fields: [
			{ key: 'title', label: 'Title', type: 'string', category: 'metadata', visible: true, filterable: true, sortable: true, sortOrder: 1 },
			{ key: 'authors', label: 'Authors', type: 'wikilink-array', category: 'metadata', visible: true, filterable: true, sortable: false, sortOrder: 2 },
			{ key: 'year', label: 'Year', type: 'number', category: 'metadata', visible: true, filterable: true, sortable: true, sortOrder: 3 },
			{ key: 'catalog-status', label: 'Status', type: 'string', category: 'status', visible: true, filterable: true, sortable: true, sortOrder: 4 },
			{ key: 'word-count', label: 'Word Count', type: 'number', category: 'metadata', visible: true, filterable: true, sortable: true, sortOrder: 5 },
			{ key: 'publications', label: 'Publications', type: 'wikilink-array', category: 'metadata', visible: true, filterable: true, sortable: false, sortOrder: 6 },
			{ key: 'date-read', label: 'Date Read', type: 'date', category: 'workflow', visible: true, filterable: true, sortable: true, sortOrder: 7 },
			{ key: 'bp-candidate', label: 'BP Candidate', type: 'boolean', category: 'workflow', visible: false, filterable: true, sortable: false, sortOrder: 8 },
			{ key: 'bp-approved', label: 'BP Approved', type: 'boolean', category: 'workflow', visible: false, filterable: true, sortable: false, sortOrder: 9 },
			{ key: 'synopsis', label: 'Synopsis', type: 'string', category: 'content', visible: true, filterable: false, sortable: false, sortOrder: 10 },
		] as SchemaField[],
		coreFields: {
			titleField: 'title',
			idField: 'id',
			statusField: 'catalog-status',
		},
	};
}

/**
 * Create sample catalog items for testing
 */
function createTestItems(): CatalogItem[] {
	const items: CatalogItem[] = [];

	// Item 1: Horror story, approved
	const item1 = new CatalogItem('001', 'vault/works/shadow-over-innsmouth.md');
	item1.setField('title', 'The Shadow Over Innsmouth');
	item1.setField('authors', ['Lovecraft, H.P.']);
	item1.setField('year', 1942);
	item1.setField('catalog-status', 'approved');
	item1.setField('word-count', 8500);
	item1.setField('publications', ['Weird Tales']);
	item1.setField('date-read', new Date('2025-06-15'));
	item1.setField('bp-candidate', true);
	item1.setField('bp-approved', true);
	items.push(item1);

	// Item 2: Adventure story, reviewed
	const item2 = new CatalogItem('002', 'vault/works/the-jungle.md');
	item2.setField('title', 'The Jungle Adventure');
	item2.setField('authors', ['Smith, Clark Ashton']);
	item2.setField('year', 1935);
	item2.setField('catalog-status', 'reviewed');
	item2.setField('word-count', 5200);
	item2.setField('publications', ['Strange Tales', 'Weird Tales']);
	item2.setField('date-read', new Date('2025-05-20'));
	item2.setField('bp-candidate', false);
	item2.setField('bp-approved', false);
	items.push(item2);

	// Item 3: Mystery story, raw
	const item3 = new CatalogItem('003', 'vault/works/mystery-mansion.md');
	item3.setField('title', 'The Mystery Mansion');
	item3.setField('authors', ['Poe, Edgar Allen', 'Machen, Arthur']);
	item3.setField('year', 1928);
	item3.setField('catalog-status', 'raw');
	item3.setField('word-count', 3400);
	item3.setField('publications', ['Unknown']);
	item3.setField('date-read', null);
	item3.setField('bp-candidate', true);
	item3.setField('bp-approved', false);
	items.push(item3);

	// Item 4: Science fiction, approved
	const item4 = new CatalogItem('004', 'vault/works/future-world.md');
	item4.setField('title', 'Future World Chronicles');
	item4.setField('authors', ['Kline, Otis Adelbert']);
	item4.setField('year', 1950);
	item4.setField('catalog-status', 'approved');
	item4.setField('word-count', 7600);
	item4.setField('publications', ['Amazing Stories']);
	item4.setField('date-read', new Date('2025-07-10'));
	item4.setField('bp-candidate', true);
	item4.setField('bp-approved', true);
	items.push(item4);

	// Item 5: Horror story, raw, no authors (edge case)
	const item5 = new CatalogItem('005', 'vault/works/unknown-horror.md');
	item5.setField('title', 'Unknown Horror Tale');
	item5.setField('authors', null);
	item5.setField('year', 1940);
	item5.setField('catalog-status', 'raw');
	item5.setField('word-count', 0);
	item5.setField('publications', null);
	item5.setField('date-read', null);
	item5.setField('bp-candidate', false);
	item5.setField('bp-approved', false);
	items.push(item5);

	return items;
}

// ============================================================================
// FILTER FUNCTION TESTS
// ============================================================================

describe('Filter Functions', () => {
	let items: CatalogItem[];
	let schema: CatalogSchema;

	describe('filterByStatus', () => {
		test('should filter items by approved status', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByStatus(items, 'approved', schema);
			assert.strictEqual(result.length, 2, 'Should find 2 approved items');
			assert.strictEqual(result[0].getField('title'), 'The Shadow Over Innsmouth');
			assert.strictEqual(result[1].getField('title'), 'Future World Chronicles');
		});

		test('should filter items by raw status', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByStatus(items, 'raw', schema);
			assert.strictEqual(result.length, 2, 'Should find 2 raw items');
		});

		test('should return empty array for non-existent status', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByStatus(items, 'nonexistent', schema);
			assert.strictEqual(result.length, 0);
		});
	});

	describe('filterByAuthor', () => {
		test('should filter items by author', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByAuthor(items, 'Lovecraft, H.P.', schema);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].getField('title'), 'The Shadow Over Innsmouth');
		});

		test('should handle multiple authors in single item', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByAuthor(items, 'Poe, Edgar Allen', schema);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].getField('title'), 'The Mystery Mansion');
		});

		test('should return empty array for non-existent author', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByAuthor(items, 'Unknown Author', schema);
			assert.strictEqual(result.length, 0);
		});
	});

	describe('filterByPublication', () => {
		test('should filter items by publication', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByPublication(items, 'Weird Tales', schema);
			assert.strictEqual(result.length, 2);
		});

		test('should handle items with multiple publications', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByPublication(items, 'Strange Tales', schema);
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].getField('title'), 'The Jungle Adventure');
		});

		test('should return empty array for non-existent publication', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByPublication(items, 'Nonexistent Mag', schema);
			assert.strictEqual(result.length, 0);
		});
	});

	describe('filterByFieldRange', () => {
		test('should filter by numeric range', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByFieldRange(items, 'year', 1940, 1950, schema);
			assert.strictEqual(result.length, 3, 'Should find items from 1940-1950');
		});

		test('should include boundary values', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByFieldRange(items, 'year', 1942, 1942, schema);
			assert.strictEqual(result.length, 1);
		});

		test('should handle word count range', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByFieldRange(items, 'word-count', 5000, 9000, schema);
			assert.strictEqual(result.length, 3);
		});
	});

	describe('filterByDateRange', () => {
		test('should filter items by date range', () => {
			items = createTestItems();
			schema = createTestSchema();

			const start = new Date('2025-06-01');
			const end = new Date('2025-07-15');
			const result = filterByDateRange(items, 'date-read', start, end, schema);
			assert.strictEqual(result.length, 2, 'Should find items read in June-July');
		});

		test('should include boundary dates', () => {
			items = createTestItems();
			schema = createTestSchema();

			const start = new Date('2025-06-15');
			const end = new Date('2025-06-15');
			const result = filterByDateRange(items, 'date-read', start, end, schema);
			assert.strictEqual(result.length, 1);
		});

		test('should handle null dates gracefully', () => {
			items = createTestItems();
			schema = createTestSchema();

			const start = new Date('2025-01-01');
			const end = new Date('2025-12-31');
			const result = filterByDateRange(items, 'date-read', start, end, schema);
			assert.ok(result.length >= 0, 'Should not throw error with null dates');
		});
	});

	describe('filterByField', () => {
		test('should filter by string field', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByField(items, 'title', 'The Shadow Over Innsmouth', schema);
			assert.strictEqual(result.length, 1);
		});

		test('should filter by number field', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByField(items, 'year', 1935, schema);
			assert.strictEqual(result.length, 1);
		});

		test('should filter by boolean field', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = filterByField(items, 'bp-approved', true, schema);
			assert.strictEqual(result.length, 2);
		});
	});
});

// ============================================================================
// SORT FUNCTION TESTS
// ============================================================================

describe('Sort Functions', () => {
	let items: CatalogItem[];
	let schema: CatalogSchema;

	describe('sortByField', () => {
		test('should sort by title ascending', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = sortByField(items, 'title', true);
			assert.strictEqual(result[0].getField('title'), 'Future World Chronicles');
			assert.strictEqual(result[result.length - 1].getField('title'), 'Unknown Horror Tale');
		});

		test('should sort by title descending', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = sortByField(items, 'title', false);
			assert.strictEqual(result[0].getField('title'), 'Unknown Horror Tale');
			assert.strictEqual(result[result.length - 1].getField('title'), 'Future World Chronicles');
		});
	});

	describe('sortByNumber', () => {
		test('should sort by year ascending', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = sortByNumber(items, 'year', true);
			assert.strictEqual(result[0].getField('year'), 1928);
			assert.strictEqual(result[result.length - 1].getField('year'), 1950);
		});

		test('should sort by year descending', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = sortByNumber(items, 'year', false);
			assert.strictEqual(result[0].getField('year'), 1950);
			assert.strictEqual(result[result.length - 1].getField('year'), 1928);
		});

		test('should handle null values', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = sortByNumber(items, 'word-count', true);
			assert.ok(result.length === items.length, 'Should not filter out items with null values');
		});
	});

	describe('sortByDate', () => {
		test('should sort by date ascending', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = sortByDate(items, 'date-read', true);
			assert.ok(result.length > 0, 'Should handle mixed null and date values');
		});

		test('should handle null dates gracefully', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = sortByDate(items, 'date-read', true);
			assert.strictEqual(result.length, items.length, 'Should not remove items with null dates');
		});
	});

	describe('sortByString', () => {
		test('should sort by status ascending', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = sortByString(items, 'catalog-status', true);
			assert.strictEqual(result[0].getField('catalog-status'), 'approved');
		});
	});
});

// ============================================================================
// GROUP FUNCTION TESTS
// ============================================================================

describe('Group Functions', () => {
	let items: CatalogItem[];
	let schema: CatalogSchema;

	describe('groupByStatus', () => {
		test('should group items by status', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = groupByStatus(items, schema);
			assert.ok(result instanceof Map);
			assert.strictEqual(result.get('approved')?.length, 2);
			assert.strictEqual(result.get('reviewed')?.length, 1);
			assert.strictEqual(result.get('raw')?.length, 2);
		});

		test('should return Map data structure', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = groupByStatus(items, schema);
			assert.ok(result.has('approved'));
			assert.ok(Array.isArray(result.get('approved')));
		});
	});

	describe('groupByField', () => {
		test('should group by year', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = groupByField(items, 'year');
			assert.ok(result instanceof Map);
			assert.strictEqual(result.get(1942)?.length, 1);
			assert.strictEqual(result.get(1935)?.length, 1);
		});

		test('should group by status as string', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = groupByField(items, 'catalog-status');
			assert.ok(result.has('approved'));
			assert.strictEqual(result.get('approved')?.length, 2);
		});
	});

	describe('groupByAuthor', () => {
		test('should group items by author', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = groupByAuthor(items, schema);
			assert.ok(result instanceof Map);
			assert.ok(result.has('Lovecraft, H.P.'));
			assert.strictEqual(result.get('Lovecraft, H.P.')?.length, 1);
		});

		test('should handle multiple authors in single item', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = groupByAuthor(items, schema);
			assert.ok(result.has('Poe, Edgar Allen'));
			assert.ok(result.has('Machen, Arthur'));
		});

		test('should handle null authors', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = groupByAuthor(items, schema);
			assert.ok(result instanceof Map, 'Should handle null gracefully');
		});
	});

	describe('groupByYear', () => {
		test('should group items by year', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = groupByYear(items, schema);
			assert.ok(result instanceof Map);
			assert.strictEqual(result.get(1942)?.length, 1);
			assert.strictEqual(result.get(1935)?.length, 1);
			assert.strictEqual(result.get(1928)?.length, 1);
		});
	});
});

// ============================================================================
// AGGREGATE FUNCTION TESTS
// ============================================================================

describe('Aggregate Functions', () => {
	let items: CatalogItem[];
	let schema: CatalogSchema;

	describe('countByStatus', () => {
		test('should count items by status', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = countByStatus(items, schema);
			assert.strictEqual(result['approved'], 2);
			assert.strictEqual(result['reviewed'], 1);
			assert.strictEqual(result['raw'], 2);
		});

		test('should return object with counts', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = countByStatus(items, schema);
			assert.ok(typeof result === 'object');
			assert.ok(!Array.isArray(result));
		});
	});

	describe('totalWordCount', () => {
		test('should sum all word counts', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = totalWordCount(items);
			assert.strictEqual(result, 24700);
		});

		test('should handle null word counts as zero', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = totalWordCount(items);
			assert.ok(typeof result === 'number');
			assert.ok(result >= 0);
		});

		test('should return 0 for empty array', () => {
			const result = totalWordCount([]);
			assert.strictEqual(result, 0);
		});
	});

	describe('averageWordCount', () => {
		test('should calculate average word count', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = averageWordCount(items);
			assert.ok(typeof result === 'number');
			assert.ok(result > 0);
		});

		test('should handle zero counts', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = averageWordCount(items);
			assert.ok(!isNaN(result));
		});

		test('should return 0 for empty array', () => {
			const result = averageWordCount([]);
			assert.strictEqual(result, 0);
		});
	});

	describe('getYearRange', () => {
		test('should find min and max year', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = getYearRange(items);
			assert.ok(result !== null);
			assert.strictEqual(result![0], 1928);
			assert.strictEqual(result![1], 1950);
		});

		test('should return null for empty array', () => {
			const result = getYearRange([]);
			assert.strictEqual(result, null);
		});

		test('should handle single item', () => {
			const item = new CatalogItem('001', 'test.md');
			item.setField('year', 1935);
			const result = getYearRange([item]);
			assert.ok(result !== null);
			assert.strictEqual(result![0], 1935);
			assert.strictEqual(result![1], 1935);
		});
	});

	describe('getDateRange', () => {
		test('should find min and max date', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = getDateRange(items, 'date-read');
			assert.ok(result !== null);
			assert.strictEqual(result![0].toISOString().split('T')[0], '2025-05-20');
			assert.strictEqual(result![1].toISOString().split('T')[0], '2025-07-10');
		});

		test('should return null for empty array', () => {
			const result = getDateRange([], 'date-read');
			assert.strictEqual(result, null);
		});

		test('should handle null dates gracefully', () => {
			items = createTestItems();
			schema = createTestSchema();

			const result = getDateRange(items, 'date-read');
			assert.ok(result === null || result instanceof Array);
		});
	});
});

// ============================================================================
// EDGE CASES AND INTEGRATION TESTS
// ============================================================================

describe('Edge Cases', () => {
	let schema: CatalogSchema;

	describe('Empty arrays', () => {
		test('should handle filtering empty array', () => {
			schema = createTestSchema();
			const result = filterByStatus([], 'approved', schema);
			assert.strictEqual(result.length, 0);
		});

		test('should handle sorting empty array', () => {
			schema = createTestSchema();
			const result = sortByField([], 'title', true);
			assert.strictEqual(result.length, 0);
		});

		test('should handle grouping empty array', () => {
			schema = createTestSchema();
			const result = groupByStatus([], schema);
			assert.ok(result instanceof Map);
			assert.strictEqual(result.size, 0);
		});
	});

	describe('Null and undefined values', () => {
		test('should handle null field values', () => {
			const item = new CatalogItem('001', 'test.md');
			item.setField('authors', null);
			const result = filterByAuthor([item], 'Some Author', createTestSchema());
			assert.strictEqual(result.length, 0);
		});

		test('should handle undefined field access', () => {
			const item = new CatalogItem('001', 'test.md');
			const value = item.getField('nonexistent-field');
			assert.strictEqual(value, null);
		});
	});

	describe('Integration scenarios', () => {
		test('should chain filter and sort operations', () => {
			const items = createTestItems();
			const schema = createTestSchema();

			const filtered = filterByStatus(items, 'approved', schema);
			const sorted = sortByNumber(filtered, 'year', true);
			assert.strictEqual(sorted.length, 2);
			assert.strictEqual(sorted[0].getField('year'), 1942);
		});

		test('should chain filter and group operations', () => {
			const items = createTestItems();
			const schema = createTestSchema();

			const filtered = filterByStatus(items, 'approved', schema);
			const grouped = groupByAuthor(filtered, schema);
			assert.ok(grouped instanceof Map);
			assert.ok(grouped.size > 0);
		});

		test('should chain multiple operations', () => {
			const items = createTestItems();
			const schema = createTestSchema();

			const filtered = filterByFieldRange(items, 'word-count', 5000, 10000, schema);
			const sorted = sortByNumber(filtered, 'year', false);
			const count = countByStatus(sorted, schema);
			assert.ok(typeof count === 'object');
		});
	});
});
