/**
 * Query and transformation functions for catalog items
 * Pure functions for filtering, sorting, grouping, and aggregating
 */

import { CatalogItem } from '../types/dynamicWork';
import { DatacoreSettings } from '../types/settings';
import { coerceToValidDateValue, toDate } from '../types/types';

/**
 * Filter catalog items by a simple field/value match
 */
export function filterByField<T extends string | number | boolean | string[] | Date | null = string>(
	items: CatalogItem[],
	fieldKey: string,
	value: T
): CatalogItem[] {
	return items.filter((item) => item.getField(fieldKey) === value);
}

/**
 * Filter items that contain a value in an array field
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
 * Filter items by a range of numeric values
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
 * Filter items by text search (case-insensitive substring match)
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
 * Filter items by multiple field conditions (AND logic)
 */
export function filterByMultiple(
	items: CatalogItem[],
	conditions: Array<(item: CatalogItem) => boolean>
): CatalogItem[] {
	return items.filter((item) => conditions.every((condition) => condition(item)));
}

/**
 * Sort items by a field
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

		let comparison: number;

		if (fieldType === 'number') {
			comparison = (aVal as number) - (bVal as number);
		} else if (fieldType === 'date') {
			const aDateVal = coerceToValidDateValue(aVal);
			const bDateVal = coerceToValidDateValue(bVal);
			const aDate = aDateVal ? new Date(aDateVal).getTime() : 0;
			const bDate = bDateVal ? new Date(bDateVal).getTime() : 0;
			comparison = aDate - bDate;
		} else {
			// String comparison
			comparison = String(aVal).localeCompare(String(bVal));
		}

		return descending ? -comparison : comparison;
	});

	return sorted;
}

/**
 * Sort items by multiple fields (primary, then secondary, etc.)
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

/**
 * Group items by a field value
 */
export function groupByField(
	items: CatalogItem[],
	fieldKey: string
): Map<string | number | boolean | string[] | Date | null, CatalogItem[]> {
	const groups = new Map<string | number | boolean | string[] | Date | null, CatalogItem[]>();

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
 * Group items by an array field (items can belong to multiple groups)
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
 * Count items by field value
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
 * Aggregate numeric values by field
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
 * Get unique values for a field
 */
export function getUniqueValues(
	items: CatalogItem[],
	fieldKey: string
): (string | number | boolean | string[] | Date | null)[] {
	const values = new Set<string | number | boolean | string[] | Date | null>();

	for (const item of items) {
		const value = item.getField(fieldKey);
		if (Array.isArray(value)) {
			value.forEach((v) => values.add(v));
		} else if (value !== null) {
			values.add(value);
		}
	}

	return Array.from(values).sort((a, b) => String(a).localeCompare(String(b)));
}

/**
 * Get summary statistics for numeric field
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
 * Get date range from items
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
 * Paginate items
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
 * Combine multiple filter conditions
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
				case 'text':
					return String(fieldValue ?? '')
						.toLowerCase()
						.includes(String(filter.value).toLowerCase());
				default:
					return true;
			}
		});
	};
}
