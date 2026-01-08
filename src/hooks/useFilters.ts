/**
 * useFilters Hook
 * Manages filter state and applies filters to items
 *
 * Encapsulates the logic for:
 * - Initializing filter state based on filter definitions
 * - Updating individual filter values
 * - Applying all active filters (AND between types, OR within type)
 * - Clearing all filters
 * - Calling onFilter callback when filters change
 *
 * @example
 * const { filteredItems, filterState, handleFilterChange, handleClearFilters } = useFilters(
 *   items,
 *   settings,
 *   (filtered) => console.log('Filtered:', filtered)
 * );
 */

import {
	useCallback,
	useMemo,
	useState
} from 'preact/hooks';
import {
	CatalogItem,
	DatacoreSettings,
	FilterState,
	FilterDefinition
} from '../types';
import {
	FieldOptions,
	FieldRanges
} from '../types/filterTypes';

/**
 * useFilters Hook
 * Manages filter state and applies filters to items
 *
 * @param items - Items to filter
 * @param settings - Settings object with filter config
 * @param onFilter - Callback when filtered items change
 * @returns Object with filteredItems, filterState, handleFilterChange, handleClearFilters, fieldOptions, fieldRanges
 */
export function useFilters(
	items: CatalogItem[],
	settings: DatacoreSettings,
	onFilter: (filtered: CatalogItem[]) => void
) {
	// Get filter config from settings
	const filterConfig = settings.dashboards?.filterBar ?? {};
	const filters: FilterDefinition[] = filterConfig.filters ?? [];

	// Initialize filter state
	const initialState: FilterState = {};
	for (const filter of filters) {
		if (filter.type === 'range') {
			initialState[filter.field] = null;
		} else if (filter.type === 'checkbox') {
			initialState[filter.field] = [];
		} else {
			initialState[filter.field] = null;
		}
	}

	// State management for filters
	const [filterState, setFilterState] = useState<FilterState>(initialState);

	// Compute field options (unique values) for all filters - memoized
	const fieldOptions = useMemo((): FieldOptions => {
		const options: FieldOptions = {};

		for (const filter of filters) {
			if (filter.type === 'range') {
				// Skip ranges, they use fieldRanges instead
				continue;
			}

			const values = new Set<unknown>();
			for (const item of items) {
				const value = item.getField(filter.field);
				if (value !== null && value !== undefined) {
					values.add(value);
				}
			}

			// Sort alphabetically
			const sorted = Array.from(values).sort((a, b) => {
				const strA = String(a).toLowerCase();
				const strB = String(b).toLowerCase();
				return strA.localeCompare(strB);
			});

			options[filter.field] = sorted;
		}

		return options;
	}, [items, filters]);

	// Compute field ranges for range filters - memoized
	const fieldRanges = useMemo((): FieldRanges => {
		const ranges: FieldRanges = {};

		for (const filter of filters) {
			if (filter.type !== 'range') {
				continue;
			}

			let min: number | null = null;
			let max: number | null = null;

			for (const item of items) {
				const value = item.getField<number>(filter.field);
				if (value !== null && typeof value === 'number') {
					if (min === null || value < min) {
						min = value;
					}
					if (max === null || value > max) {
						max = value;
					}
				}
			}

			ranges[filter.field] = min !== null && max !== null ? [min, max] : null;
		}

		return ranges;
	}, [items, filters]);

	// Apply all active filters to get filtered results
	const filteredItems = useMemo(() => {
		let result = items;

		// Apply each filter sequentially (AND logic between filter types)
		for (const filter of filters) {
			if (!filter.enabled) {
				continue;
			}

			const filterValue = filterState[filter.field];
			if (!filterValue) {
				continue;
			}

			// Apply filter based on type
			if (filter.type === 'range' && typeof filterValue === 'object' && filterValue !== null && 'min' in filterValue && 'max' in filterValue) {
				// Range filter: both min and max
				const range = filterValue as { min?: number; max?: number };
				result = result.filter((item) => {
					const itemValue = item.getField<number>(filter.field);
					if (itemValue === null || typeof itemValue !== 'number') {
						return false;
					}
					const isAboveMin = range.min === undefined || itemValue >= range.min;
					const isBelowMax = range.max === undefined || itemValue <= range.max;
					return isAboveMin && isBelowMax;
				});
			} else if (filter.type === 'checkbox' && Array.isArray(filterValue)) {
				// Checkbox filter: OR logic (match any value in array)
				result = result.filter((item) => {
					const itemValue = item.getField(filter.field);
					return filterValue.includes(itemValue);
				});
			} else if (filter.type === 'text' && typeof filterValue === 'string') {
				// Text filter: substring matching (case-insensitive)
				result = result.filter((item) => {
					const itemValue = item.getField<string>(filter.field);
					if (itemValue === null) {
						return false;
					}
					return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
				});
			} else if (filter.type === 'select') {
				// Select filter: exact match
				result = result.filter((item) => {
					const itemValue = item.getField(filter.field);
					return itemValue === filterValue;
				});
			}
		}

		return result;
	}, [items, filters, filterState]);

	// Call onFilter when filtered results change
	useMemo(() => {
		onFilter(filteredItems);
	}, [filteredItems, onFilter]);

	// Handle filter value change
	const handleFilterChange = useCallback(
		(fieldKey: string, value: unknown): void => {
			setFilterState((prev: FilterState) => ({
				...prev,
				[fieldKey]: value,
			}));
		},
		[]
	);

	// Clear all filters
	const handleClearFilters = useCallback((): void => {
		setFilterState(initialState);
	}, [initialState]);

	return {
		filteredItems,
		filterState,
		handleFilterChange,
		handleClearFilters,
		fieldOptions,
		fieldRanges
	};
}
