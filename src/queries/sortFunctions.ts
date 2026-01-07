/**
 * Sort Functions Library
 *
 * Pure, schema-agnostic functions for sorting CatalogItem arrays.
 * All functions are immutable and maintain stable sort order.
 */

import { CatalogItem } from '../types';

/**
 * Sort items by date field value.
 *
 * Handles both Date objects and ISO date strings.
 * Null/undefined values always sort to the end.
 *
 * @param items - Array of items to sort
 * @param fieldKey - The field key to sort by (should be date type)
 * @param ascending - Whether to sort ascending (default true)
 * @returns - New sorted array
 *
 * @example
 * const byDateRead = sortByDate(items, 'date-read', false, schema);
 */
export function sortByDate(
	items: CatalogItem[],
	fieldKey: string,
	ascending: boolean = true
): CatalogItem[] {
	const sorted = [...items].sort((a, b) => {
		const aValue = a.getField(fieldKey);
		const bValue = b.getField(fieldKey);

		// Null/undefined values always sort to end
		if (aValue === null || aValue === undefined) {
			return 1;
		}
		if (bValue === null || bValue === undefined) {
			return -1;
		}

		// Convert to Date objects if needed
		let aDate: Date | null = null;
		let bDate: Date | null = null;

		if (aValue instanceof Date) {
			aDate = aValue;
		} else if (typeof aValue === 'string' || typeof aValue === 'number') {
			aDate = new Date(aValue);
		}

		if (bValue instanceof Date) {
			bDate = bValue;
		} else if (typeof bValue === 'string' || typeof bValue === 'number') {
			bDate = new Date(bValue);
		}

		// Skip if invalid dates
		if (!aDate || !bDate || isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
			return 0;
		}

		// Date comparison by timestamp
		const comparison = aDate.getTime() - bDate.getTime();
		return ascending ? comparison : -comparison;
	});
	return sorted;
}

/**
 * Sort items by a field value.
 *
 * Generic sort that works with any field type. Maintains stable sort order
 * (items with equal values keep their original relative order).
 * Null/undefined values always sort to the end.
 *
 * @template T - Type of the field value being compared
 * @param items - Array of items to sort
 * @param fieldKey - The field key to sort by
 * @param ascending - Whether to sort ascending (default true). False for descending.
 * @returns - New sorted array (original not modified)
 *
 * @example
 * const byTitle = sortByField(items, 'title', true, schema);
 * const byYear = sortByField(items, 'year', false, schema);
 */
export function sortByField<T>(
	items: CatalogItem[],
	fieldKey: string,
	ascending: boolean = true
): CatalogItem[] {
	const sorted = [...items].sort((a, b) => {
		const aValue = a.getField<T>(fieldKey);
		const bValue = b.getField<T>(fieldKey);

		// Null/undefined values always sort to end
		if (aValue === null || aValue === undefined) {
			return 1;
		}
		if (bValue === null || bValue === undefined) {
			return -1;
		}

		// Standard comparison
		let comparison: number;
		if (aValue < bValue) {
			comparison = -1;
		} else if (aValue > bValue) {
			comparison = 1;
		} else {
			comparison = 0;
		}

		return ascending ? comparison : -comparison;
	});
	return sorted;
}

/**
 * Sort items by multiple fields in sequence.
 *
 * Applies sorts in reverse order (last sort order has highest priority).
 * This achieves stable multi-field sorting where primary sort field is primary priority.
 *
 * @param items - Array of items to sort
 * @param sortOrders - Array of {fieldKey, ascending} specifications
 * @returns - New sorted array
 *
 * @example
 * const sorted = sortByMultiple(items, [
 *   { fieldKey: 'catalog-status', ascending: true },
 *   { fieldKey: 'title', ascending: true }
 * ]);
 */
export function sortByMultiple(
	items: CatalogItem[],
	sortOrders: Array<{ fieldKey: string; ascending: boolean }>
): CatalogItem[] {
	// Apply sorts in reverse order for proper precedence
	let result = [...items];
	for (let i = sortOrders.length - 1; i >= 0; i--) {
		const order = sortOrders[i];
		if (order) {
			result = sortByField(result, order.fieldKey, order.ascending);
		}
	}
	return result;
}

/**
 * Sort items by numeric field value.
 *
 * Treats field values as numbers for comparison.
 * Null/undefined values always sort to the end.
 *
 * @param items - Array of items to sort
 * @param fieldKey - The field key to sort by (should be number type)
 * @param ascending - Whether to sort ascending (default true)
 * @returns - New sorted array
 *
 * @example
 * const byWordCount = sortByNumber(items, 'word-count', false, schema);
 * const byYear = sortByNumber(items, 'year', true, schema);
 */
export function sortByNumber(
	items: CatalogItem[],
	fieldKey: string,
	ascending: boolean = true
): CatalogItem[] {
	const sorted = [...items].sort((a, b) => {
		const aValue = a.getField<number>(fieldKey);
		const bValue = b.getField<number>(fieldKey);

		// Null/undefined values always sort to end
		if (aValue === null || aValue === undefined) {
			return 1;
		}
		if (bValue === null || bValue === undefined) {
			return -1;
		}

		// Numeric comparison
		const comparison = aValue - bValue;
		return ascending ? comparison : -comparison;
	});
	return sorted;
}

/**
 * Sort items by string field value.
 *
 * Uses locale-aware string comparison (case-insensitive, respects language rules).
 * Null/undefined values always sort to the end.
 *
 * @param items - Array of items to sort
 * @param fieldKey - The field key to sort by (should be string type)
 * @param ascending - Whether to sort ascending (default true)
 * @returns - New sorted array
 *
 * @example
 * const byAuthor = sortByString(items, 'author-name', true, schema);
 */
export function sortByString(
	items: CatalogItem[],
	fieldKey: string,
	ascending: boolean = true
): CatalogItem[] {
	const sorted = [...items].sort((a, b) => {
		const aValue = a.getField<string>(fieldKey);
		const bValue = b.getField<string>(fieldKey);

		// Null/undefined values always sort to end
		if (aValue === null || aValue === undefined) {
			return 1;
		}
		if (bValue === null || bValue === undefined) {
			return -1;
		}

		// Locale-aware case-insensitive comparison
		const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
		return ascending ? comparison : -comparison;
	});
	return sorted;
}