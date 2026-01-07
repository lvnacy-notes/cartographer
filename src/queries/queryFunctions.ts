/**
 * Query and transformation functions for catalog items
 * Pure functions for filtering, sorting, grouping, and aggregating
 */

import {
	coerceToValidDateValue,
	toDate,
	type CatalogItem,
	type DatacoreSettings,
	type FieldValue
} from '../types';

/**
 * Apply a numeric aggregation operation to items grouped by a field.
 *
 * Groups items by groupField, then applies sum/avg/min/max/count to aggregateField values within each group.
 *
 * @param items - Array of items to aggregate
 * @param groupField - Field key to group by
 * @param aggregateField - Field key containing numeric values to aggregate
 * @param operation - Type of aggregation: 'sum', 'avg', 'min', 'max', or 'count'
 * @returns - Object mapping group keys to aggregated numeric results
 *
 * @example
 * const byAuthor = aggregateByField(items, 'authors', 'word-count', 'sum');
 * // { 'Lovecraft, H. P.': 150000, 'Smith, Clark Ashton': 85000 }
 */
export function aggregateByField(
	items: CatalogItem[],
	groupField: string,
	aggregateField: string,
	operation: 'sum' | 'avg' | 'min' | 'max' | 'count'
): Record<string, number> {
	const groups = groupByField(items, groupField);
	const results: Record<string, number> = {};

	for (const [key, groupItems] of groups) {
		const keyStr = String(key);
		const values = groupItems
			.map((item) => item.getField<number>(aggregateField))
			.filter((v) => v !== null && typeof v === 'number');

		switch (operation) {
			case 'sum':
				results[keyStr] = values.reduce((sum, v) => sum + (v ?? 0), 0);
				break;
			case 'avg':
				results[keyStr] = values.length > 0 ? values.reduce((sum, v) => sum + (v ?? 0), 0) / values.length : 0;
				break;
			case 'min':
				results[keyStr] = values.length > 0 ? Math.min(...values) : 0;
				break;
			case 'max':
				results[keyStr] = values.length > 0 ? Math.max(...values) : 0;
				break;
			case 'count':
				results[keyStr] = values.length;
				break;
		}
	}

	return results;
}

/**
 * Count unique items grouped by a field value.
 *
 * Returns a map of each unique field value to the count of items with that value.
 *
 * @param items - Array of items to count
 * @param fieldKey - Field key to count by
 * @returns - Object with field values as keys and counts as values
 *
 * @example
 * const counts = countByField(items, 'catalog-status');
 * // { 'raw': 5, 'reviewed': 3, 'approved': 2 }
 */
export function countByField(
	items: CatalogItem[],
	fieldKey: string
): Record<string, number> {
	const counts: Record<string, number> = {};

	for (const item of items) {
		const key = String(item.getField(fieldKey) ?? 'null');
		counts[key] = (counts[key] ?? 0) + 1;
	}

	return counts;
}

/**
 * Build a filter predicate from an array of filter specifications.
 *
 * Returns a predicate function that checks all filter conditions using AND logic.
 * Supports equals, contains (array/string), range (numeric), and text (case-insensitive substring) matching.
 *
 * @param _settings - Datacore settings (for future schema context)
 * @param filters - Array of filter specifications with field, type, and value
 * @returns - Predicate function that returns true if all filters match
 *
 * @example
 * const predicate = createCompoundFilter(settings, [
 *   { field: 'catalog-status', type: 'equals', value: 'approved' },
 *   { field: 'word-count', type: 'range', value: [5000, 50000] },
 *   { field: 'title', type: 'text', value: 'Cthulhu' }
 * ]);
 * const results = items.filter(predicate);
 */
export function createCompoundFilter(
	_settings: DatacoreSettings,
	filters: Array<{
		field: string;
		type: 'equals' | 'contains' | 'range' | 'text';
		value: unknown;
	}>
): (item: CatalogItem) => boolean {
	return (item: CatalogItem) => {
		return filters.every((filter) => {
			const fieldValue = item.getField(filter.field);

			switch (filter.type) {
				case 'equals':
					return fieldValue === filter.value;
				case 'contains': {
					const compareValue = String(filter.value);
					if (Array.isArray(fieldValue)) {
						return fieldValue.map((v) => String(v)).includes(compareValue);
					}
					return String(fieldValue) === compareValue;
				}
				case 'range': {
					if (typeof fieldValue !== 'number') {
						return false;
					}
					const [min, max] = filter.value as [number, number];
					return fieldValue >= min && fieldValue <= max;
				}
				case 'text': {
					const fieldStr = (typeof fieldValue === 'string' || typeof fieldValue === 'number') 
						? String(fieldValue) 
						: '';
					return fieldStr
						.toLowerCase()
						.includes(String(filter.value).toLowerCase());
				}
				default:
					return true;
			}
		});
	};
}

/**
 * Filter items where an array field includes a specific value.
 *
 * For array fields, checks membership. For non-array fields, checks equality.
 *
 * @param items - Array of items to filter
 * @param fieldKey - Field key to check
 * @param value - Value to search for in array or match directly
 * @returns - Items where array includes value or field equals value
 *
 * @example
 * const lovecraftWorks = filterByArrayField(items, 'authors', 'Lovecraft, H. P.');
 */
export function filterByArrayField(
	items: CatalogItem[],
	fieldKey: string,
	value: string | number | boolean
): CatalogItem[] {
	return items.filter((item) => {
		const fieldValue = item.getField(fieldKey);
		if (Array.isArray(fieldValue)) {
			return fieldValue.includes(String(value));
		}
		return fieldValue === value;
	});
}

/**
 * Filter items where a field value equals a target value (strict equality).
 *
 * @template T - Type of field value being compared
 * @param items - Array of items to filter
 * @param fieldKey - Field key to check
 * @param value - Exact value to match
 * @returns - Items where field === value
 *
 * @example
 * const approved = filterByField(items, 'catalog-status', 'approved');
 */
export function filterByField<T extends string | number | boolean | string[] | Date | null = string>(
	items: CatalogItem[],
	fieldKey: string,
	value: T
): CatalogItem[] {
	return items.filter((item) => item.getField(fieldKey) === value);
}

/**
 * Filter items by applying multiple predicate functions (AND logic).
 *
 * All conditions must return true for an item to be included.
 *
 * @param items - Array of items to filter
 * @param conditions - Array of predicate functions
 * @returns - Items where all predicates return true
 *
 * @example
 * const results = filterByMultiple(items, [
 *   (item) => item.getField('word-count') > 5000,
 *   (item) => item.getField('year') >= 2020
 * ]);
 */
export function filterByMultiple(
	items: CatalogItem[],
	conditions: Array<(item: CatalogItem) => boolean>
): CatalogItem[] {
	return items.filter((item) => conditions.every((condition) => condition(item)));
}

/**
 * Filter items where a numeric field value falls within a range (inclusive).
 *
 * @param items - Array of items to filter
 * @param fieldKey - Numeric field key to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns - Items where min <= field <= max
 *
 * @example
 * const longReads = filterByRange(items, 'word-count', 5000, 50000);
 */
export function filterByRange(
	items: CatalogItem[],
	fieldKey: string,
	min: number,
	max: number
): CatalogItem[] {
	return items.filter((item) => {
		const value = item.getField<number>(fieldKey);
		if (value === null) {return false;}
		return value >= min && value <= max;
	});
}

/**
 * Filter items where a string field contains search text (case-insensitive).
 *
 * @param items - Array of items to filter
 * @param fieldKey - String field key to search within
 * @param searchText - Text to search for (substring match, case-insensitive)
 * @returns - Items where field includes searchText
 *
 * @example
 * const cosmic = filterByText(items, 'title', 'Cthulhu');
 */
export function filterByText(
	items: CatalogItem[],
	fieldKey: string,
	searchText: string
): CatalogItem[] {
	const lowerSearch = searchText.toLowerCase();
	return items.filter((item) => {
		const value = item.getField<string>(fieldKey);
		if (value === null) {return false;}
		return value.toLowerCase().includes(lowerSearch);
	});
}

/**
 * Get min and max dates from a date field.
 *
 * Parses field values as dates and finds the earliest and latest dates.
 *
 * @param items - Array of items to analyze
 * @param fieldKey - Date field key to analyze
 * @returns - [minDate, maxDate] tuple or null if no valid dates found
 *
 * @example
 * const [first, last] = getDateRange(items, 'date-read') || [null, null];
 */
export function getDateRange(
	items: CatalogItem[],
	fieldKey: string
): [Date, Date] | null {
	const dates = items
		.map((item) => {
			const value = item.getField(fieldKey);
			return toDate(value);
		})
		.filter((d) => d !== null && !isNaN(d.getTime()));

	if (dates.length === 0) {return null;}

	const timestamps = (dates as Date[]).map((d) => d.getTime());
	return [new Date(Math.min(...timestamps)), new Date(Math.max(...timestamps))];
}

/**
 * Calculate count, sum, average, min, and max for a numeric field.
 *
 * @param items - Array of items to analyze
 * @param fieldKey - Numeric field key to analyze
 * @returns - Object with count, sum, avg, min, max statistics
 *
 * @example
 * const stats = getNumericStats(items, 'word-count');
 * console.log(`Average: ${stats.avg}, Range: ${stats.min}-${stats.max}`);
 */
export function getNumericStats(
	items: CatalogItem[],
	fieldKey: string
): {
	count: number;
	sum: number;
	avg: number;
	min: number;
	max: number;
} {
	const values = items
		.map((item) => item.getField<number>(fieldKey))
		.filter((v) => v !== null && typeof v === 'number');

	if (values.length === 0) {
		return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
	}

	const sum = values.reduce((a, b) => a + b, 0);
	return {
		count: values.length,
		sum,
		avg: sum / values.length,
		min: Math.min(...values),
		max: Math.max(...values),
	};
}

/**
 * Get sorted unique values from a field (including from array fields).
 *
 * For array fields, extracts all individual values. Results are sorted alphabetically.
 *
 * @param items - Array of items to extract values from
 * @param fieldKey - Field key to extract unique values from
 * @returns - Sorted array of unique field values
 *
 * @example
 * const authors = getUniqueValues(items, 'authors');
 * // ['Lovecraft, H. P.', 'Smith, Clark Ashton', ...]
 */
export function getUniqueValues(
	items: CatalogItem[],
	fieldKey: string
): FieldValue[] {
	const values = new Set<unknown>();

	for (const item of items) {
		const value = item.getField(fieldKey);
		if (Array.isArray(value)) {
			value.forEach((v) => values.add(v));
		} else if (value !== null) {
			values.add(value);
		}
	}

	return Array.from(values).sort((a, b) => String(a).localeCompare(String(b))) as FieldValue[];
}

/**
 * Group items by array field values (items can belong to multiple groups).
 *
 * Each value in an array field creates a separate group. Items with multiple values appear in multiple groups.
 *
 * @param items - Array of items to group
 * @param fieldKey - Array field key to group by
 * @returns - Map of field values to arrays of items containing that value
 *
 * @example
 * const byAuthor = groupByArrayField(items, 'authors');
 * // { 'Lovecraft, H. P.': [item1, item3], 'Smith, Clark Ashton': [item2, item3] }
 */
export function groupByArrayField(
	items: CatalogItem[],
	fieldKey: string
): Map<string | number | boolean, CatalogItem[]> {
	const groups = new Map<string | number | boolean, CatalogItem[]>();

	for (const item of items) {
		const values = item.getField<string[]>(fieldKey);
		if (Array.isArray(values)) {
			for (const value of values) {
				if (!groups.has(value)) {
					groups.set(value, []);
				}
				const group = groups.get(value);
				if (group) {
					group.push(item);
				}
			}
		}
	}

	return groups;
}

/**
 * Group items by a field value.
 *
 * Each unique field value gets its own group. Items with the same field value appear together.
 *
 * @param items - Array of items to group
 * @param fieldKey - Field key to group by
 * @returns - Map of field values to arrays of items with that value
 *
 * @example
 * const byStatus = groupByField(items, 'catalog-status');
 * // { 'raw': [item1, item2], 'approved': [item3, item4] }
 */
export function groupByField(
	items: CatalogItem[],
	fieldKey: string
): Map<unknown, CatalogItem[]> {
	const groups = new Map<unknown, CatalogItem[]>();

	for (const item of items) {
		const key = item.getField(fieldKey);
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
 * Paginate an array of items.
 *
 * @template T - Type of items in array
 * @param items - Array of items to paginate
 * @param pageNumber - Zero-indexed page number (clamped to valid range)
 * @param itemsPerPage - Number of items per page
 * @returns - Object with paginated items, total pages, current page, and total item count
 *
 * @example
 * const page = paginate(items, 0, 20);
 * // { items: [item0...item19], totalPages: 5, currentPage: 0, totalItems: 100 }
 */
export function paginate<T>(
	items: T[],
	pageNumber: number,
	itemsPerPage: number
): {
	items: T[];
	totalPages: number;
	currentPage: number;
	totalItems: number;
} {
	const totalItems = items.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const page = Math.max(0, Math.min(pageNumber, totalPages - 1));
	const start = page * itemsPerPage;
	const end = start + itemsPerPage;

	return {
		items: items.slice(start, end),
		totalPages,
		currentPage: page,
		totalItems,
	};
}

/**
 * Sort items by a field with type-aware comparison.
 *
 * Handles null values gracefully (sorts to end). Supports string, number, and date field types.
 *
 * @param items - Array of items to sort
 * @param fieldKey - Field key to sort by
 * @param descending - Sort order (default: false for ascending)
 * @param fieldType - Type for comparison: 'string', 'number', or 'date' (default: 'string')
 * @returns - New sorted array (original array not mutated)
 *
 * @example
 * const byYear = sortByField(items, 'year', true, 'number'); // Descending by year
 */
export function sortByField(
	items: CatalogItem[],
	fieldKey: string,
	descending: boolean = false,
	fieldType: string = 'string'
): CatalogItem[] {
	const sorted = [...items];

	sorted.sort((a, b) => {
		const aVal = a.getField(fieldKey);
		const bVal = b.getField(fieldKey);

		if (aVal === null && bVal === null) {return 0;}
		if (aVal === null) {return descending ? -1 : 1;}
		if (bVal === null) {return descending ? 1 : -1;}
		if (aVal === undefined || bVal === undefined) {return 0;}

		let comparison: number;

		if (fieldType === 'number') {
			comparison = (aVal as number) - (bVal as number);
		} else if (fieldType === 'date') {
			const aDateVal = coerceToValidDateValue(aVal as string | number | boolean | string[] | Date);
			const bDateVal = coerceToValidDateValue(bVal as string | number | boolean | string[] | Date);
			const aDate = aDateVal ? new Date(aDateVal).getTime() : 0;
			const bDate = bDateVal ? new Date(bDateVal).getTime() : 0;
			comparison = aDate - bDate;
		} else {
			// String comparison
			const aStr = typeof aVal === 'string' || typeof aVal === 'number' ? String(aVal) : '';
			const bStr = typeof bVal === 'string' || typeof bVal === 'number' ? String(bVal) : '';
			comparison = aStr.localeCompare(bStr);
		}

		return descending ? -comparison : comparison;
	});

	return sorted;
}

/**
 * Sort items by multiple fields sequentially.
 *
 * Applies sorts in reverse order so the first sort specification has highest priority.
 *
 * @param items - Array of items to sort
 * @param sorts - Array of sort specifications (field, descending, type)
 * @returns - New sorted array (original array not mutated)
 *
 * @example
 * const sorted = sortByMultiple(items, [
 *   { field: 'year', descending: true, type: 'number' },
 *   { field: 'title', type: 'string' }
 * ]);
 */
export function sortByMultiple(
	items: CatalogItem[],
	sorts: Array<{ field: string; descending?: boolean; type?: string }>
): CatalogItem[] {
	let result = [...items];

	// Apply sorts in reverse order so primary sort is applied last
	for (let i = sorts.length - 1; i >= 0; i--) {
		const sort = sorts[i];
		if (!sort) {continue;}
		const { field, descending = false, type = 'string' } = sort;
		result = sortByField(result, field, descending, type);
	}

	return result;
}