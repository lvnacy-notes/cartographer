/**
 * Filter Functions Library
 *
 * Pure, schema-agnostic functions for filtering CatalogItem arrays.
 * All functions are immutable and testable.
 */

import {
    CatalogItem,
    CatalogSchema
} from '../types';

/**
 * Apply multiple filters in sequence (AND logic).
 *
 * Each filter is applied to the result of the previous filter.
 * All conditions must be true for an item to be included.
 *
 * @param items - Array of items to filter
 * @param filters - Array of filter functions to apply
 * @returns - New array with all filters applied
 *
 * @example
 * const results = applyFilters(items, [
 *   items => filterByStatus(items, 'reviewed', schema),
 *   items => filterBPCandidates(items, schema),
 *   items => filterByAuthor(items, 'Lovecraft', schema)
 * ]);
 */
export function applyFilters(
	items: CatalogItem[],
	filters: Array<(items: CatalogItem[]) => CatalogItem[]>
): CatalogItem[] {
	return filters.reduce((result, filter) => filter(result), items);
}

/**
 * Exclude items matching a condition (inverse/NOT filter).
 *
 * Returns all items where the filter function returns false.
 *
 * @param items - Array of items to filter
 * @param shouldExclude - Function that returns true for items to exclude
 * @returns - New array with matching items removed
 *
 * @example
 * const nonArchived = excludeWhere(items, item => 
 *   item.getField('status') === 'archived'
 * );
 */
export function excludeWhere(
	items: CatalogItem[],
	shouldExclude: (item: CatalogItem) => boolean
): CatalogItem[] {
	return items.filter(item => !shouldExclude(item));
}

/**
 * Filter items by author (from authors array field).
 *
 * Automatically finds the authors field from schema and handles array matching.
 *
 * @param items - Array of items to filter
 * @param author - Author name to match
 * @param schema - The catalog schema
 * @returns - New array containing items by the specified author
 *
 * @example
 * const lovecraftWorks = filterByAuthor(items, 'Lovecraft, H. P.', schema);
 */
export function filterByAuthor(
	items: CatalogItem[],
	author: string,
	schema: CatalogSchema
): CatalogItem[] {
	return filterByFieldIncludes(items, 'authors', author, schema);
}

/**
 * Filter items where a field value falls within a date range (inclusive).
 *
 * @param items - Array of items to filter
 * @param fieldKey - The field key to filter on (should be date type)
 * @param startDate - Start of date range (inclusive)
 * @param endDate - End of date range (inclusive)
 * @param schema - The catalog schema
 * @returns - New array containing items where startDate <= field <= endDate
 *
 * @example
 * const recentReads = filterByDateRange(
 *   items,
 *   'date-read',
 *   new Date('2025-01-01'),
 *   new Date('2026-01-05'),
 *   schema
 * );
 */
export function filterByDateRange(
	items: CatalogItem[],
	fieldKey: string,
	startDate: Date,
	endDate: Date,
	schema: CatalogSchema
): CatalogItem[] {
	const startTime = startDate.getTime();
	const endTime = endDate.getTime();

	return items.filter(item => {
		const value = item.getField(fieldKey);
		if (value === null || value === undefined) {
			return false;
		}

		const date = value instanceof Date ? value : new Date(String(value));
		const time = date.getTime();
		return time >= startTime && time <= endTime;
	});
}

/**
 * Filter items by a single field value.
 *
 * Generic filter that works with any field type. Uses exact equality matching.
 *
 * @template T - Type of the field value being compared
 * @param items - Array of items to filter
 * @param fieldKey - The field key to filter on
 * @param value - The value to match against
 * @param schema - The catalog schema (for context)
 * @returns - New array containing only items where field equals value
 *
 * @example
 * const rawWorks = filterByField(items, 'catalog-status', 'raw', schema);
 * const byYear = filterByField(items, 'year', 2026, schema);
 */
export function filterByField<T>(
	items: CatalogItem[],
	fieldKey: string,
	value: T,
	schema: CatalogSchema
): CatalogItem[] {
	return items.filter(item => {
		const itemValue = item.getField(fieldKey);
		return itemValue === value;
	});
}

/**
 * Filter items where a field contains a specific value (for strings or arrays).
 *
 * For string fields, checks if the field value is a substring.
 * For array fields, checks if the array includes the value.
 *
 * @param items - Array of items to filter
 * @param fieldKey - The field key to filter on
 * @param value - The value to search for
 * @param schema - The catalog schema
 * @returns - New array containing matching items
 *
 * @example
 * const lovecraftWorks = filterByFieldIncludes(items, 'authors', 'Lovecraft, H. P.', schema);
 * const bpWorks = filterByFieldIncludes(items, 'publications', '[[Backstage Pass]]', schema);
 */
export function filterByFieldIncludes(
	items: CatalogItem[],
	fieldKey: string,
	value: any,
	schema: CatalogSchema
): CatalogItem[] {
	const searchValue = String(value).toLowerCase();

	return items.filter(item => {
		const itemValue = item.getField(fieldKey);

		if (Array.isArray(itemValue)) {
			// For arrays, check if any element matches
			return itemValue.some(v => String(v).toLowerCase().includes(searchValue));
		}

		if (itemValue === null || itemValue === undefined) {
			return false;
		}

		// For strings, check substring containment
		return String(itemValue).toLowerCase().includes(searchValue);
	});
}

/**
 * Filter items where a field value falls within a numeric range (inclusive).
 *
 * @param items - Array of items to filter
 * @param fieldKey - The field key to filter on (should be numeric type)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param schema - The catalog schema
 * @returns - New array containing items where min <= field <= max
 *
 * @example
 * const longWorks = filterByFieldRange(items, 'word-count', 5000, 50000, schema);
 * const modernWorks = filterByFieldRange(items, 'year', 2000, 2026, schema);
 */
export function filterByFieldRange(
	items: CatalogItem[],
	fieldKey: string,
	min: number,
	max: number,
	schema: CatalogSchema
): CatalogItem[] {
	return items.filter(item => {
		const value = item.getField<number>(fieldKey);
		return value !== null && value >= min && value <= max;
	});
}

/**
 * Filter items that are approved for BP publication.
 *
 * Looks for items where bp-approved field is true.
 *
 * @param items - Array of items to filter
 * @param schema - The catalog schema
 * @returns - New array containing BP-approved items
 *
 * @example
 * const approved = filterBPApproved(items, schema);
 */
export function filterBPApproved(
	items: CatalogItem[],
	schema: CatalogSchema
): CatalogItem[] {
	return items.filter(item => {
		const value = item.getField<boolean>('bp-approved');
		return value === true;
	});
}

/**
 * Filter items that are marked as BP (Backstage Pass) candidates.
 *
 * Looks for items where bp-candidate field is true.
 *
 * @param items - Array of items to filter
 * @param schema - The catalog schema
 * @returns - New array containing BP candidate items
 *
 * @example
 * const candidates = filterBPCandidates(items, schema);
 */
export function filterBPCandidates(
	items: CatalogItem[],
	schema: CatalogSchema
): CatalogItem[] {
	return items.filter(item => {
		const value = item.getField<boolean>('bp-candidate');
		return value === true;
	});
}

/**
 * Filter items by publication (from publications array field).
 *
 * Automatically finds the publications field from schema and handles wikilink matching.
 *
 * @param items - Array of items to filter
 * @param publication - Publication name or wikilink to match (e.g., 'Weird Tales')
 * @param schema - The catalog schema
 * @returns - New array containing items published in the specified publication
 *
 * @example
 * const weirdTalesWorks = filterByPublication(items, 'Weird Tales', schema);
 * const bpWorks = filterByPublication(items, '[[Backstage Pass]]', schema);
 */
export function filterByPublication(
	items: CatalogItem[],
	publication: string,
	schema: CatalogSchema
): CatalogItem[] {
	return filterByFieldIncludes(items, 'publications', publication, schema);
}

/**
 * Filter items by backstage pipeline stage.
 *
 * Filters items where the pipeline-stage field matches the specified stage.
 *
 * @param items - Array of items to filter
 * @param stage - The pipeline stage to match (e.g., 'candidates', 'approved', 'archived')
 * @param schema - The catalog schema
 * @returns - New array containing items at the specified pipeline stage
 *
 * @example
 * const candidates = filterByPipelineStage(items, 'candidates', schema);
 * const approved = filterByPipelineStage(items, 'approved', schema);
 */
export function filterByPipelineStage(
	items: CatalogItem[],
	stage: string,
	schema: CatalogSchema
): CatalogItem[] {
	return filterByField(items, 'bp-pipeline-stage', stage, schema);
}

/**
 * Filter items by catalog status field.
 *
 * Status field is determined by schema's statusField definition.
 *
 * @param items - Array of items to filter
 * @param status - The status value to match
 * @param schema - The catalog schema
 * @returns - New array containing items with matching status
 *
 * @example
 * const approved = filterByStatus(items, 'approved', schema);
 * const raw = filterByStatus(items, 'raw', schema);
 */
export function filterByStatus(
	items: CatalogItem[],
	status: string,
	schema: CatalogSchema
): CatalogItem[] {
	const statusField = schema.coreFields.statusField;
	if (!statusField) {
		return [];
	}
	return filterByField(items, statusField, status, schema);
}

/**
 * Filter by a custom predicate function.
 *
 * Flexible filtering that allows any custom logic.
 *
 * @param items - Array of items to filter
 * @param predicate - Function that returns true for items to include
 * @returns - New array of items matching the predicate
 *
 * @example
 * const recent = filterWhere(items, item => {
 *   const date = item.getField<Date>('date-read');
 *   return date && date.getFullYear() === 2026;
 * });
 */
export function filterWhere(
	items: CatalogItem[],
	predicate: (item: CatalogItem) => boolean
): CatalogItem[] {
	return items.filter(predicate);
}
