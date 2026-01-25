/**
 * Filter and grouping helper utilities for catalog components
 * Provides functions for grouping items, calculating statistics, and sorting
 * 
 * Functions:
 * - calculateStatusStats - compute statistics for a group of items
 * - getFieldRange - find min/max range for a numeric field
 * - getUniqueFieldValues - extract unique values for a field
 * - groupByField - group items by a specified field value
 * - sortStatusGroups - sort grouped items by specified criteria
 */

import {
	CatalogItem,
	GroupStatistics
} from '../types';

/**
 * Calculate statistics for a group of items
 * Computes count, total word count, year range, and average word count
 *
 * @param items - Array of items in the group
 * @param wordCountFieldKey - The field key for word count (default: 'word-count')
 * @param yearFieldKey - The field key for year (default: 'year')
 * @returns GroupStatistics with aggregated values
 *
 * @example
 * const stats = calculateStatusStats(rawItems);
 * // Returns: {
 * //   count: 15,
 * //   totalWordCount: 123000,
 * //   yearRange: { min: 1890, max: 1950 },
 * //   averageWordCount: 8200
 * // }
 */
export function calculateStatusStats(
	items: CatalogItem[],
	wordCountFieldKey: string = 'word-count',
	yearFieldKey: string = 'year'
): GroupStatistics {
	const count = items.length;

	if (count === 0) {
		return {
			count: 0,
			totalWordCount: 0,
			yearRange: { min: null, max: null },
			averageWordCount: 0
		};
	}

	let totalWordCount = 0;
	let wordCountCount = 0;
	let minYear: number | null = null;
	let maxYear: number | null = null;

	for (const item of items) {
		// Calculate word count stats
		const wordCount = item.getField<number>(wordCountFieldKey);
		if (wordCount !== null && typeof wordCount === 'number') {
			totalWordCount += wordCount;
			wordCountCount += 1;
		}

		// Calculate year range
		const year = item.getField<number>(yearFieldKey);
		if (year !== null && typeof year === 'number') {
			if (minYear === null || year < minYear) {
				minYear = year;
			}
			if (maxYear === null || year > maxYear) {
				maxYear = year;
			}
		}
	}

	const averageWordCount = wordCountCount > 0 ? totalWordCount / wordCountCount : 0;

	return {
		count,
		totalWordCount,
		yearRange: { min: minYear, max: maxYear },
		averageWordCount
	};
}

/**
 * Get the min/max range for a numeric field
 * Useful for populating range filter min/max inputs
 *
 * @param items - Array of catalog items
 * @param fieldKey - The field key to find range for
 * @returns Tuple of [min, max] or null if no numeric values found
 *
 * @example
 * const range = getFieldRange(items, 'year');
 * // Returns: [1890, 1950]
 */
export function getFieldRange(items: CatalogItem[], fieldKey: string): [number, number] | null {
	let min: number | null = null;
	let max: number | null = null;

	for (const item of items) {
		const value = item.getField<number>(fieldKey);
		if (value !== null && typeof value === 'number') {
			if (min === null || value < min) {
				min = value;
			}
			if (max === null || value > max) {
				max = value;
			}
		}
	}

	return min !== null && max !== null ? [min, max] : null;
}

/**
 * Get all unique values for a field across items
 * Useful for populating select/checkbox filter options
 *
 * @param items - Array of catalog items
 * @param fieldKey - The field key to extract unique values from
 * @returns Array of unique values, sorted alphabetically
 *
 * @example
 * const statuses = getUniqueFieldValues(items, 'catalog-status');
 * // Returns: ['approved', 'raw', 'reviewed', ...]
 */
export function getUniqueFieldValues(items: CatalogItem[], fieldKey: string): unknown[] {
	const values = new Set<unknown>();

	for (const item of items) {
		const value = item.getField(fieldKey);
		if (value !== null && value !== undefined) {
			values.add(value);
		}
	}

	// Convert to array and sort
	const sorted = Array.from(values).sort((a, b) => {
		const strA = String(a).toLowerCase();
		const strB = String(b).toLowerCase();
		return strA.localeCompare(strB);
	});

	return sorted;
}

/**
 * Group catalog items by a field value
 * Handles null/undefined field values as a separate group keyed by null
 *
 * @param items - Array of catalog items to group
 * @param fieldKey - The field key to group by
 * @returns Map where keys are field values (or null for missing values) and values are item arrays
 *
 * @example
 * const groups = groupByField(items, 'catalog-status');
 * // Returns: Map {
 * //   'raw' => [item1, item2, ...],
 * //   'approved' => [item3, item4, ...],
 * //   null => [item5]  // items with missing/null status
 * // }
 */
export function groupByField(
	items: CatalogItem[],
	fieldKey: string
): Map<string | number | boolean | null, CatalogItem[]> {
	const groups = new Map<string | number | boolean | null, CatalogItem[]>();

	for (const item of items) {
		const value = item.getField<string | number | boolean | null>(fieldKey);
		const key = value ?? null;

		if (!groups.has(key)) {
			groups.set(key, []);
		}

		const group = groups.get(key);
		if (group) {
			group.push(item);
		}
	}

	return groups;
}

/**
 * Sort grouped items by specified criteria
 * Returns array of [statusValue, itemArray] tuples in sorted order
 *
 * @param groups - Map of grouped items (from groupByField)
 * @param sortBy - Sort mode: 'alphabetical', 'count-desc', or 'count-asc'
 * @returns Array of [statusValue, items] tuples sorted according to sortBy mode
 *
 * @example
 * const sorted = sortStatusGroups(groups, 'count-desc');
 * // Returns: [
 * //   ['raw', [15 items]],
 * //   ['reviewed', [8 items]],
 * //   ['approved', [7 items]],
 * //   [null, [0 items]]
 * // ]
 */
export function sortStatusGroups(
	groups: Map<string | number | boolean | null, CatalogItem[]>,
	sortBy: 'alphabetical' | 'count-desc' | 'count-asc'
): Array<[string | number | boolean | null, CatalogItem[]]> {
	const entries = Array.from(groups.entries());

	if (sortBy === 'alphabetical') {
		entries.sort(([keyA], [keyB]) => {
			// null comes last in alphabetical sort
			if (keyA === null && keyB === null) {
				return 0;
			}
			if (keyA === null) {
				return 1;
			}
			if (keyB === null) {
				return -1;
			}

			const strA = String(keyA).toLowerCase();
			const strB = String(keyB).toLowerCase();
			return strA.localeCompare(strB);
		});
	} else if (sortBy === 'count-desc') {
		entries.sort(([, itemsA], [, itemsB]) => itemsB.length - itemsA.length);
	} else if (sortBy === 'count-asc') {
		entries.sort(([, itemsA], [, itemsB]) => itemsA.length - itemsB.length);
	}

	return entries;
}