/**
 * useFilteredItems Hook
 * Applies multiple filter types to items with AND/OR logic
 *
 * A higher-level hook that combines multiple filter types:
 * - OR logic within a filter type (e.g., status=raw OR status=reviewed)
 * - AND logic between filter types (e.g., (status) AND (year range))
 *
 * Useful for cross-component scenarios where FilterBar and other
 * filters need to work together.
 *
 * @example
 * const filtered = useFilteredItems(
 *   items,
 *   schema,
 *   { 'catalog-status': ['raw', 'reviewed'], 'year': [1920, 1950] }
 * );
 */

import { useMemo } from 'preact/hooks';
import {
	CatalogItem,
	CatalogSchema,
	FilterValueMap
} from '../types';

/**
 * useFilteredItems Hook
 * Applies multiple filters with AND logic between types
 *
 * @param items - Items to filter
 * @param schema - Schema for field type information
 * @param filters - Map of field keys to filter values
 * @returns Filtered items array
 *
 * @example
 * const filtered = useFilteredItems(items, schema, {
 *   'catalog-status': 'raw',
 *   'year': { min: 1920, max: 1950 }
 * });
 */
export function useFilteredItems(
	items: CatalogItem[],
	schema: CatalogSchema,
	filters: FilterValueMap
): CatalogItem[] {
	return useMemo(() => {
		let result = items;

		// Apply each filter sequentially (AND logic between filter types)
		for (const [fieldKey, filterValue] of Object.entries(filters)) {
			if (!filterValue) {
				continue;
			}

			// Find field definition for type info
			const field = schema.fields.find((f) => f.key === fieldKey);
			if (!field) {
				continue;
			}

			// Filter based on value type
			if (Array.isArray(filterValue)) {
				// Checkbox/multi-select: OR logic (item matches any value in array)
				result = result.filter((item) => {
					const itemValue = item.getField(fieldKey);
					return filterValue.includes(itemValue);
				});
			} else if (typeof filterValue === 'object' && filterValue !== null && 'min' in filterValue && 'max' in filterValue) {
				// Range filter
				const range = filterValue as { min?: number; max?: number };
				result = result.filter((item) => {
					const itemValue = item.getField<number>(fieldKey);
					if (itemValue === null || typeof itemValue !== 'number') {
						return false;
					}
					const isAboveMin = range.min === undefined || itemValue >= range.min;
					const isBelowMax = range.max === undefined || itemValue <= range.max;
					return isAboveMin && isBelowMax;
				});
			} else if (typeof filterValue === 'string') {
				// Text filter: substring matching
				result = result.filter((item) => {
					const itemValue = item.getField<string>(fieldKey);
					if (itemValue === null) {
						return false;
					}
					return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
				});
			} else {
				// Select/single value: exact match
				result = result.filter((item) => {
					const itemValue = item.getField(fieldKey);
					return itemValue === filterValue;
				});
			}
		}

		return result;
	}, [items, schema.fields, filters]);
}
