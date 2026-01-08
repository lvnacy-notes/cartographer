/**
 * useTableSort Hook
 * Manages table sorting state and sorted data
 *
 * Encapsulates the logic for:
 * - Maintaining sort column and direction state
 * - Applying sort to items based on field type
 * - Handling sort toggle (ascending/descending)
 *
 * @example
 * const { sortedItems, sortColumn, sortDesc, handleSort } = useTableSort(
 *   items,
 *   schema,
 *   settings
 * );
 */

import {
	useCallback,
	useMemo,
	useState
} from 'preact/hooks';
import {
	CatalogItem,
	CatalogSchema,
	DatacoreSettings
} from '../types';

/**
 * useTableSort Hook
 * Manages sorting state and applies sorts to items
 *
 * @param items - Items to sort
 * @param schema - Schema for field type information
 * @param settings - Settings object with table config
 * @param initialColumn - Initial sort column (default from settings)
 * @param initialDesc - Initial sort direction (default false = ascending)
 * @returns Object with sortedItems, sortColumn, sortDesc, and handleSort callback
 */
export function useTableSort(
	items: CatalogItem[],
	schema: CatalogSchema,
	settings: DatacoreSettings,
	initialColumn?: string,
	initialDesc: boolean = false
) {
	// Get table config
	const tableConfig = settings.dashboards?.worksTable ?? {};
	const defaultColumns = tableConfig.defaultColumns ?? [];
	const defaultSortColumn = initialColumn ?? defaultColumns[0] ?? '';

	// Sort state
	const [sortColumn, setSortColumn] = useState<string>(defaultSortColumn);
	const [sortDesc, setSortDesc] = useState<boolean>(initialDesc);

	// Apply sorting to items
	const sortedItems = useMemo(() => {
		if (!sortColumn || items.length === 0) {
			return items;
		}

		const field = schema.fields.find((f) => f.key === sortColumn);
		if (!field) {
			return items;
		}

		// Make a copy and sort
		const sorted = [...items];
		sorted.sort((a, b) => {
			const aValue = a.getField(sortColumn);
			const bValue = b.getField(sortColumn);

			// Handle nulls
			if (aValue === null && bValue === null) return 0;
			if (aValue === null) return 1;
			if (bValue === null) return -1;

			// Compare based on field type
			if (field.type === 'text') {
				const aStr = String(aValue).toLowerCase();
				const bStr = String(bValue).toLowerCase();
				return aStr.localeCompare(bStr);
			} else if (field.type === 'number') {
				const aNum = Number(aValue);
				const bNum = Number(bValue);
				return aNum - bNum;
			} else if (field.type === 'boolean') {
				const aBool = Boolean(aValue);
				const bBool = Boolean(bValue);
				return aBool === bBool ? 0 : aBool ? -1 : 1;
			} else {
				// Fallback to string comparison
				return String(aValue).localeCompare(String(bValue));
			}
		});

		return sorted;
	}, [items, sortColumn, sortDesc, schema.fields]);

	// Handle sort column click (toggle or change column)
	const handleSort = useCallback(
		(column: string): void => {
			if (sortColumn === column) {
				// Same column: toggle direction
				setSortDesc(!sortDesc);
			} else {
				// Different column: set new column, ascending
				setSortColumn(column);
				setSortDesc(false);
			}
		},
		[sortColumn, sortDesc]
	);

	return {
		sortedItems,
		sortColumn,
		sortDesc,
		handleSort
	};
}
