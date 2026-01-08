/**
 * WorksTable Component
 * Interactive table displaying catalog items with configurable columns, sorting, and pagination
 * Pure Preact component with no Obsidian dependencies
 */

import { h } from 'preact';
import {
    useCallback,
    useMemo
} from 'preact/hooks';
import {
    CatalogItem,
    WorksTableProps
} from '../types';
import { renderCell } from '../utils/columnRenders';
import { compareCellValues } from '../utils/columnRenders';

/**
 * WorksTable Component
 * Displays catalog items in a table with sorting and pagination
 * Handles all SchemaField types correctly
 *
 * @param props - Component props
 * @returns Rendered table component or message if no items
 *
 * @example
 * <WorksTable
 *   items={catalogItems}
 *   schema={schema}
 *   settings={settings}
 *   sortColumn="year"
 *   sortDesc={false}
 *   onSort={handleSort}
 *   currentPage={0}
 *   onPageChange={handlePageChange}
 * />
 */
export function WorksTable(props: WorksTableProps): JSX.Element {
	const {
		items,
		schema,
		settings,
		sortColumn,
		sortDesc,
		onSort,
		currentPage,
		onPageChange,
	} = props;

	// Get table config from settings with fallbacks
	const tableConfig = settings.dashboards?.worksTable ?? {};
	const defaultColumns = tableConfig.defaultColumns ?? [schema.coreFields.titleField];
	const itemsPerPage = settings.ui?.itemsPerPage ?? 10;
	const enablePagination = tableConfig.enablePagination ?? true;

	// Sort items if sort column specified
	const displayItems = useMemo(() => {
		let result = items;

		if (sortColumn) {
			result = [...items].sort((a, b) => {
				const valueA = a.getField(sortColumn);
				const valueB = b.getField(sortColumn);

				const field = schema.fields.find((f) => f.key === sortColumn);
				const fieldType = field?.type ?? 'string';

				const comparison = compareCellValues(valueA, valueB, fieldType);
				return sortDesc ? -comparison : comparison;
			});
		}

		return result;
	}, [items, sortColumn, sortDesc, schema.fields]);

	// Calculate pagination
	const paginationData = useMemo(() => {
		const totalPages = enablePagination ? Math.ceil(displayItems.length / itemsPerPage) : 1;
		const pageIndex = currentPage ?? 0;
		const startIndex = pageIndex * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const paginatedItems = enablePagination
			? displayItems.slice(startIndex, endIndex)
			: displayItems;

		return {
			totalPages,
			pageIndex,
			startIndex,
			endIndex,
			paginatedItems,
		};
	}, [displayItems, enablePagination, itemsPerPage, currentPage]);

	// Handle sort header click
	const handleHeaderClick = useCallback(
		(columnKey: string): void => {
			const field = schema.fields.find((f) => f.key === columnKey);
			if (!field?.sortable || !onSort) {
				return;
			}

			const isCurrentSort = sortColumn === columnKey;
			const newDesc = isCurrentSort ? !sortDesc : false;
			onSort(columnKey, newDesc ?? false);
		},
		[schema.fields, sortColumn, sortDesc, onSort]
	);

	// Handle page change
	const handlePageClick = useCallback(
		(page: number): void => {
			if (onPageChange) {
				onPageChange(page);
			}
		},
		[onPageChange]
	);

	// Render empty state
	if (items.length === 0) {
		return h('div', { class: 'works-table-empty' }, 'No items to display');
	}

	const { totalPages, pageIndex, startIndex, endIndex, paginatedItems } = paginationData;

	// Render table headers with sort functionality
	const headerCells = defaultColumns.map((columnKey: string) => {
		const field = schema.fields.find((f) => f.key === columnKey);
		if (!field) {
			return null;
		}

		const isSortable = field.sortable ?? false;
		const isSorted = sortColumn === columnKey;
		const sortIcon = isSorted ? (sortDesc ? ' ↓' : ' ↑') : '';

		return h(
			'th',
			{
				key: columnKey,
				onClick: () => handleHeaderClick(columnKey),
				class: isSortable ? 'sortable' : '',
			},
			`${field.label}${sortIcon}`
		);
	});

	// Render table rows with cells
	const bodyRows = paginatedItems.map((item: CatalogItem, index: number) => {
		const cells = defaultColumns.map((columnKey: string) =>
			h('td', { key: columnKey }, renderCell(item, columnKey, schema))
		);

		return h('tr', { key: index }, cells);
	});

	// Render pagination controls
	const paginationContent: Array<any> = [];

	if (enablePagination && totalPages > 1) {
		paginationContent.push(
			h(
				'span',
				{ key: 'info' },
				`Showing ${startIndex + 1}-${Math.min(endIndex, displayItems.length)} of ${displayItems.length}`
			)
		);

		if (pageIndex > 0) {
			paginationContent.push(
				h('button', { key: 'prev', onClick: () => handlePageClick(pageIndex - 1) }, 'Previous')
			);
		}

		const pageButtons = Array.from({ length: totalPages }, (_, i) =>
			h(
				'button',
				{
					key: `page-${i}`,
					onClick: () => handlePageClick(i),
					class: i === pageIndex ? 'active' : '',
				},
				String(i + 1)
			)
		);
		paginationContent.push(...pageButtons);

		if (pageIndex < totalPages - 1) {
			paginationContent.push(
				h('button', { key: 'next', onClick: () => handlePageClick(pageIndex + 1) }, 'Next')
			);
		}
	}

	const paginationElement =
		enablePagination && totalPages > 1
			? h('div', { class: 'works-table-pagination' }, paginationContent)
			: null;

	return h(
		'div',
		{ class: 'works-table-container' },
		h(
			'table',
			{ class: 'works-table' },
			h('thead', null, h('tr', null, headerCells)),
			h('tbody', null, bodyRows)
		),
		paginationElement
	);
}