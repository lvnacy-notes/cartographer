/**
 * Group Functions Library
 *
 * Pure, schema-agnostic functions for grouping CatalogItem arrays.
 * All functions return Map structures and are immutable.
 */

import {
	CatalogItem,
	CatalogSchema,
	type FieldValue
} from '../types';

/**
 * Flatten a grouped Map back into a single array.
 *
 * Combines all items from all groups into a single array.
 *
 * @param groups - Map of groups to flatten
 * @returns - Flat array of all items from all groups
 *
 * @example
 * const byStatus = groupByStatus(items, schema);
 * const allItems = flattenGroups(byStatus);
 */
export function flattenGroups(
	groups: Map<FieldValue | null, CatalogItem[]>
): CatalogItem[] {
	const result: CatalogItem[] = [];
	for (const groupItems of groups.values()) {
		result.push(...groupItems);
	}
	return result;
}

/**
 * Get sorted keys from a group Map.
 *
 * Useful for iterating through groups in order.
 *
 * @param groups - Map of groups
 * @param ascending - Sort ascending (default true)
 * @returns - Sorted array of group keys
 *
 * @example
 * const byStatus = groupByStatus(items, schema);
 * const statusOrder = getGroupKeys(byStatus);
 */
export function getGroupKeys(
	groups: Map<FieldValue, CatalogItem[]>,
	ascending: boolean = true
): FieldValue[] {
	const keys = Array.from(groups.keys());
	return ascending ? keys.sort() : keys.sort().reverse();
}

/**
 * Group items by author (handles array field).
 *
 * For array fields, each item can appear in multiple groups.
 * One item per author in the authors array.
 *
 * @param items - Array of items to group
 * @param schema - The catalog schema
 * @returns - Map of author name → items by that author
 *
 * @example
 * const byAuthor = groupByAuthor(items, schema);
 * const lovecraftWorks = byAuthor.get('Lovecraft, H. P.');
 */
export function groupByAuthor(
	items: CatalogItem[],
	schema: CatalogSchema
): Map<string | null, CatalogItem[]> {
	const authorsField = schema.fields.find(f => f.key === 'authors');
	if (!authorsField) {
		return new Map();
	}

	const groups = new Map<string | null, CatalogItem[]>();

	for (const item of items) {
		const authors = item.getField<string[]>('authors');
		if (Array.isArray(authors)) {
			for (const author of authors) {
				let authorGroup = groups.get(author);
				if (!authorGroup) {
					authorGroup = [];
					groups.set(author, authorGroup);
				}
				authorGroup.push(item);
			}
		}
	}

	return groups;
}

/**
 * Group items by custom key function.
 *
 * Flexible grouping that allows any custom logic to determine grouping key.
 *
 * @template K - Type of the grouping key
 * @param items - Array of items to group
 * @param keyFn - Function that returns the group key for each item
 * @returns - Map of custom key → items with that key
 *
 * @example
 * const byLength = groupByCustom(items, (item) => {
 *   const wc = item.getField<number>('word-count');
 *   return wc < 5000 ? 'short' : 'long';
 * });
 */
export function groupByCustom<K>(
	items: CatalogItem[],
	keyFn: (item: CatalogItem) => K | null
): Map<K | null, CatalogItem[]> {
	const groups = new Map<K | null, CatalogItem[]>();

	for (const item of items) {
		const key = keyFn(item);

		let keyGroup = groups.get(key);
		if (!keyGroup) {
			keyGroup = [];
			groups.set(key, keyGroup);
		}
		keyGroup.push(item);
	}

	return groups;
}

/**
 * Group items by date month (groups by YYYY-MM).
 *
 * Groups date field values by year-month, automatically sorted descending.
 *
 * @param items - Array of items to group
 * @param fieldKey - The date field to group by
 * @returns - Map of "YYYY-MM" → items from that month (sorted descending)
 *
 * @example
 * const byMonth = groupByDateMonth(items, 'date-read');
 * byMonth.forEach((monthItems, month) => {
 *   console.log(`Month ${month}: ${monthItems.length} items`);
 * });
 */
export function groupByDateMonth(
	items: CatalogItem[],
	fieldKey: string
): Map<string | null, CatalogItem[]> {
	const groups = new Map<string | null, CatalogItem[]>();

	for (const item of items) {
		const value = item.getField(fieldKey);
		if (value === null || value === undefined) {
			let nullGroup = groups.get(null);
			if (!nullGroup) {
				nullGroup = [];
				groups.set(null, nullGroup);
			}
			nullGroup.push(item);
			continue;
		}

		const date = value instanceof Date ? value : (typeof value === 'string' || typeof value === 'number') ? new Date(value) : null;
		if (!date || isNaN(date.getTime())) {
			// Invalid date, skip
			continue;
		}
		const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

		let yearMonthGroup = groups.get(yearMonth);
		if (!yearMonthGroup) {
			yearMonthGroup = [];
			groups.set(yearMonth, yearMonthGroup);
		}
		yearMonthGroup.push(item);
	}

	// Convert to sorted Map (descending order)
	const sortedGroups = new Map<string | null, CatalogItem[]>();
	const keys = Array.from(groups.keys())
		.filter((k): k is string => k !== null)
		.sort()
		.reverse();

	for (const key of keys) {
		const keyGroup = groups.get(key);
		if (keyGroup) {
			sortedGroups.set(key, keyGroup);
		}
	}

	const nullGroup = groups.get(null);
	if (nullGroup) {
		sortedGroups.set(null, nullGroup);
	}

	return sortedGroups;
}

/**
 * Group items by a field value.
 *
 * Generic grouping that works with any field type.
 * Returns a Map where keys are field values and values are arrays of items with that value.
 * Null/undefined values are grouped under null key.
 *
 * @template T - Type of the field value being grouped by
 * @param items - Array of items to group
 * @param fieldKey - The field key to group by
 * @returns - Map of field value → items with that value
 *
 * @example
 * const byStatus = groupByField(items, 'catalog-status');
 * byStatus.forEach((statusItems, status) => {
 *   console.log(`Status ${status}: ${statusItems.length} items`);
 * });
 */
export function groupByField<T>(
	items: CatalogItem[],
	fieldKey: string
): Map<T | null, CatalogItem[]> {
	const groups = new Map<T | null, CatalogItem[]>();

	for (const item of items) {
		const value = item.getField<T>(fieldKey);
		const key = value === undefined ? null : value;

		let keyGroup = groups.get(key);
		if (!keyGroup) {
			keyGroup = [];
			groups.set(key, keyGroup);
		}
		keyGroup.push(item);
	}

	return groups;
}

/**
 * Group items by publication (handles wikilink array field).
 *
 * For array fields, each item can appear in multiple groups.
 * One item per publication in the publications array.
 *
 * @param items - Array of items to group
 * @param schema - The catalog schema
 * @returns - Map of publication name → items in that publication
 *
 * @example
 * const byPub = groupByPublication(items, schema);
 * const weirdTalesWorks = byPub.get('Weird Tales');
 */
export function groupByPublication(
	items: CatalogItem[],
	schema: CatalogSchema
): Map<string | null, CatalogItem[]> {
	const pubField = schema.fields.find(f => f.key === 'publications');
	if (!pubField) {
		return new Map();
	}

	const groups = new Map<string | null, CatalogItem[]>();

	for (const item of items) {
		const publications = item.getField<string[]>('publications');
		if (Array.isArray(publications)) {
			for (const pub of publications) {
				let pubGroup = groups.get(pub);
				if (!pubGroup) {
					pubGroup = [];
					groups.set(pub, pubGroup);
				}
				pubGroup.push(item);
			}
		}
	}

	return groups;
}

/**
 * Group items by catalog status field.
 *
 * Automatically finds status field from schema and groups by its value.
 *
 * @param items - Array of items to group
 * @param schema - The catalog schema
 * @returns - Map of status → items with that status
 *
 * @example
 * const byStatus = groupByStatus(items, schema);
 * const rawItems = byStatus.get('raw');
 */
export function groupByStatus(
	items: CatalogItem[],
	schema: CatalogSchema
): Map<string | null, CatalogItem[]> {
	const { statusField } = schema.coreFields;
	if (!statusField) {
		return new Map();
	}
	return groupByField(items, statusField);
}

/**
 * Group items by year (numeric field).
 *
 * Groups by year value, automatically sorted in descending order (newest first).
 *
 * @param items - Array of items to group
 * @param schema - The catalog schema
 * @returns - Map of year → items from that year (sorted descending)
 *
 * @example
 * const byYear = groupByYear(items, schema);
 * byYear.forEach((yearItems, year) => {
 *   console.log(`Year ${year}: ${yearItems.length} items`);
 * });
 */
export function groupByYear(
	items: CatalogItem[],
	schema: CatalogSchema
): Map<number | null, CatalogItem[]> {
	const yearField = schema.fields.find(f => f.key === 'year');
	if (!yearField) {
		return new Map();
	}

	const groups = groupByField<number>(items, 'year');

	// Convert to sorted Map (descending year order)
	const sortedGroups = new Map<number | null, CatalogItem[]>();
	const keys = Array.from(groups.keys())
		.filter((k): k is number => k !== null)
		.sort((a, b) => b - a);

	// Add non-null keys first
	for (const key of keys) {
		const keyGroup = groups.get(key);
		if (keyGroup) {
			sortedGroups.set(key, keyGroup);
		}
	}

	// Add null key last if present
	const nullGroup = groups.get(null);
	if (nullGroup) {
		sortedGroups.set(null, nullGroup);
	}

	return sortedGroups;
}