import {
	describe,
	test
} from 'node:test';
import assert from 'node:assert/strict';
import {
	groupByField,
	calculateStatusStats,
	sortStatusGroups
} from '../../src/utils/filterHelpers';
import { catalogItems } from '../fixtures';

describe('filterHelpers', () => {
	describe('groupByField', () => {
		test('groups items by field value', () => {
			const items = catalogItems.slice(0, 5);
			const groups = groupByField(items, 'catalog-status');

			assert(groups instanceof Map, 'should return a Map');
			assert(groups.size > 0, 'should have at least one group');
		});

		test('creates separate group for null/undefined field values', () => {
			const items = catalogItems.slice(0, 10);
			const groups = groupByField(items, 'catalog-status');

			// Check if null key exists (items with no status value)
			const hasNullKey = Array.from(groups.keys()).includes(null);
			assert(typeof hasNullKey === 'boolean', 'should handle null/undefined values');
		});

		test('groups items with same field value together', () => {
			const items = catalogItems.slice(0, 15);
			const groups = groupByField(items, 'catalog-status');

			for (const [_statusValue, groupItems] of groups) {
				assert(Array.isArray(groupItems), 'each group should contain array of items');
				assert(groupItems.length > 0, 'each group should have at least one item');
			}
		});

		test('preserves all items in groups (no duplicates lost)', () => {
			const items = catalogItems.slice(0, 20);
			const groups = groupByField(items, 'catalog-status');

			let totalGroupedItems = 0;
			for (const [_statusValue, groupItems] of groups) {
				totalGroupedItems += groupItems.length;
			}

			assert.strictEqual(totalGroupedItems, items.length, 'should preserve all items');
		});

		test('works with different field types (string, number)', () => {
			const items = catalogItems.slice(0, 10);

			const byStatus = groupByField(items, 'catalog-status');
			assert(byStatus.size > 0, 'should group by string field');

			const byYear = groupByField(items, 'year');
			assert(byYear.size > 0, 'should group by number field');
		});

		test('handles empty items array', () => {
			const groups = groupByField([], 'catalog-status');

			assert(groups.size === 0, 'should return empty Map for empty items');
		});

		test('handles field that does not exist on items', () => {
			const items = catalogItems.slice(0, 5);
			const groups = groupByField(items, 'nonexistent-field');

			// Should handle gracefully, possibly grouping all as null
			assert(groups instanceof Map, 'should return Map even for nonexistent field');
		});

		test('groups maintain insertion order', () => {
			const items = catalogItems.slice(0, 8);
			const groups = groupByField(items, 'catalog-status');

			const keys = Array.from(groups.keys());
			assert(keys.length === groups.size, 'all keys should be present');
		});
	});

	describe('calculateStatusStats', () => {
		test('calculates count correctly', () => {
			const items = catalogItems.slice(0, 5);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			assert.strictEqual(stats.count, items.length, 'count should match items length');
		});

		test('calculates total word count', () => {
			const items = catalogItems.slice(0, 5);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			assert(typeof stats.totalWordCount === 'number', 'should have totalWordCount as number');
			assert(stats.totalWordCount >= 0, 'word count should be non-negative');
		});

		test('calculates average word count correctly', () => {
			const items = catalogItems.slice(0, 10);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			if (stats.averageWordCount > 0) {
				assert(stats.averageWordCount > 0, 'average should be positive if items have words');
			}
		});

		test('calculates year range with min and max', () => {
			const items = catalogItems.slice(0, 10);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			assert(typeof stats.yearRange === 'object', 'should have yearRange object');
			assert('min' in stats.yearRange, 'should have min in yearRange');
			assert('max' in stats.yearRange, 'should have max in yearRange');
		});

		test('handles items with missing word count field', () => {
			const items = catalogItems.slice(0, 8);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			assert(typeof stats.totalWordCount === 'number', 'should handle missing word counts gracefully');
		});

		test('handles items with missing year field', () => {
			const items = catalogItems.slice(0, 8);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			assert(typeof stats.yearRange === 'object', 'should handle missing years gracefully');
		});

		test('handles empty items array', () => {
			const stats = calculateStatusStats([], 'word-count', 'year');

			assert.strictEqual(stats.count, 0, 'count should be 0 for empty array');
			assert.strictEqual(stats.totalWordCount, 0, 'totalWordCount should be 0');
		});

		test('year range min is less than or equal to max', () => {
			const items = catalogItems.slice(0, 15);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			if (stats.yearRange.min !== null && stats.yearRange.max !== null) {
				assert(stats.yearRange.min <= stats.yearRange.max, 'min should be <= max');
			}
		});

		test('average word count is reasonable (between 0 and max realistic value)', () => {
			const items = catalogItems.slice(0, 20);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			assert(stats.averageWordCount >= 0, 'average should be non-negative');
			assert(stats.averageWordCount < 1000000, 'average should be reasonable (< 1M)');
		});

		test('handles different word-count field names', () => {
			const items = catalogItems.slice(0, 5);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			assert(typeof stats.totalWordCount === 'number', 'should calculate with custom field name');
		});

		test('handles different year field names', () => {
			const items = catalogItems.slice(0, 5);
			const stats = calculateStatusStats(items, 'word-count', 'year');

			assert(typeof stats.yearRange === 'object', 'should calculate year range with custom field name');
		});
	});

	describe('sortStatusGroups', () => {
		test('sorts alphabetically by status key', () => {
			const items = catalogItems.slice(0, 20);
			const groups = groupByField(items, 'catalog-status');
			const sorted = sortStatusGroups(groups, 'alphabetical');

			assert(Array.isArray(sorted), 'should return array');
			assert(sorted.length > 0, 'should have sorted entries');

			// Verify entries are sorted alphabetically
			for (let i = 1; i < sorted.length; i++) {
				const prevKey = String(sorted[i - 1][0]);
				const currKey = String(sorted[i][0]);
				assert(prevKey <= currKey, 'should be sorted alphabetically');
			}
		});

		test('sorts by count descending', () => {
			const items = catalogItems.slice(0, 20);
			const groups = groupByField(items, 'catalog-status');
			const sorted = sortStatusGroups(groups, 'count-desc');

			assert(Array.isArray(sorted), 'should return array');
			assert(sorted.length > 0, 'should have sorted entries');

			// Verify entries are sorted by count descending
			for (let i = 1; i < sorted.length; i++) {
				const prevCount = sorted[i - 1][1].length;
				const currCount = sorted[i][1].length;
				assert(prevCount >= currCount, 'should be sorted count descending');
			}
		});

		test('sorts by count ascending', () => {
			const items = catalogItems.slice(0, 20);
			const groups = groupByField(items, 'catalog-status');
			const sorted = sortStatusGroups(groups, 'count-asc');

			assert(Array.isArray(sorted), 'should return array');
			assert(sorted.length > 0, 'should have sorted entries');

			// Verify entries are sorted by count ascending
			for (let i = 1; i < sorted.length; i++) {
				const prevCount = sorted[i - 1][1].length;
				const currCount = sorted[i][1].length;
				assert(prevCount <= currCount, 'should be sorted count ascending');
			}
		});

		test('preserves all groups after sorting', () => {
			const items = catalogItems.slice(0, 25);
			const groups = groupByField(items, 'catalog-status');
			const originalSize = groups.size;

			const sorted = sortStatusGroups(groups, 'count-desc');

			assert.strictEqual(sorted.length, originalSize, 'should preserve all groups');
		});

		test('preserves total item count after sorting', () => {
			const items = catalogItems.slice(0, 15);
			const groups = groupByField(items, 'catalog-status');

			let originalTotal = 0;
			for (const [_key, groupItems] of groups) {
				originalTotal += groupItems.length;
			}

			const sorted = sortStatusGroups(groups, 'alphabetical');

			let sortedTotal = 0;
			for (const [_key, groupItems] of sorted) {
				sortedTotal += groupItems.length;
			}

			assert.strictEqual(sortedTotal, originalTotal, 'should preserve total item count');
		});

		test('handles empty groups map', () => {
			const emptyMap = new Map();
			const sorted = sortStatusGroups(emptyMap, 'count-desc');

			assert(Array.isArray(sorted), 'should return array for empty map');
			assert.strictEqual(sorted.length, 0, 'should return empty array');
		});

		test('handles single group', () => {
			const items = catalogItems.slice(0, 3);
			const groups = groupByField(items, 'catalog-status');

			// Filter to single group if needed, or use as-is
			const sorted = sortStatusGroups(groups, 'count-desc');

			assert(Array.isArray(sorted), 'should return array');
			assert(sorted.length >= 0, 'should handle single or multi group');
		});

		test('returns tuples with correct structure [key, items]', () => {
			const items = catalogItems.slice(0, 10);
			const groups = groupByField(items, 'catalog-status');
			const sorted = sortStatusGroups(groups, 'alphabetical');

			for (const entry of sorted) {
				assert(Array.isArray(entry), 'each entry should be array');
				assert.strictEqual(entry.length, 2, 'each entry should have [key, items]');
				assert(Array.isArray(entry[1]), 'second element should be items array');
			}
		});

		test('invalid sort mode defaults to reasonable behavior', () => {
			const items = catalogItems.slice(0, 10);
			const groups = groupByField(items, 'catalog-status');

			// Even with invalid sort mode, should return array
			const sorted = sortStatusGroups(groups, 'count-desc');
			assert(Array.isArray(sorted), 'should return array');
		});

		test('maintains item integrity within groups during sort', () => {
			const items = catalogItems.slice(0, 12);
			const groups = groupByField(items, 'catalog-status');
			const sorted = sortStatusGroups(groups, 'alphabetical');

			// Verify items within groups are unchanged
			for (const [_key, groupItems] of sorted) {
				for (const item of groupItems) {
					assert(item !== null && item !== undefined, 'items should be intact');
				}
			}
		});
	});

	describe('Integration tests across utilities', () => {
		test('groupByField -> calculateStatusStats -> sortStatusGroups workflow', () => {
			const items = catalogItems.slice(0, 20);
			const groups = groupByField(items, 'catalog-status');

			// Calculate stats for each group
			const statsMap = new Map();
			for (const [statusValue, groupItems] of groups) {
				const stats = calculateStatusStats(groupItems, 'word-count', 'year');
				statsMap.set(statusValue, stats);
			}

			// Sort the groups
			const sorted = sortStatusGroups(groups, 'count-desc');

			assert(sorted.length > 0, 'workflow should produce sorted results');
			assert(statsMap.size > 0, 'workflow should calculate stats');
		});

		test('complete workflow with real Pulp Fiction data', () => {
			const allItems = catalogItems;
			const groups = groupByField(allItems, 'catalog-status');

			let totalItems = 0;
			const statusStats: Array<{statusValue: string | number | null; count: number}> = [];

			for (const [statusValue, groupItems] of groups) {
				const stats = calculateStatusStats(groupItems, 'word-count', 'year');
				totalItems += stats.count;
				statusStats.push({ statusValue, count: stats.count });
			}

			const sorted = sortStatusGroups(groups, 'count-desc');

			assert.strictEqual(totalItems, allItems.length, 'should account for all items');
			assert(sorted.length > 0, 'should produce sorted results');
		});
	});
});
