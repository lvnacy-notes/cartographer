/**
 * ConfigurableWorksTable Component
 * Wrapper around WorksTable that dynamically generates configuration based on active library schema
 * Provides intelligent column selection and ordering from the active library configuration
 *
 * Features:
 * - Automatically generates column list from schema fields marked visible:true
 * - Respects column order from settings.dashboards.worksTable.defaultColumns
 * - Respects field visibility, sortability, and filterability flags from schema
 * - Falls back to sensible defaults if configuration is incomplete
 * - Pure Preact component with no Obsidian dependencies
 */

import { h, type VNode } from 'preact';
import {
	useCallback,
	useMemo,
	useState
} from 'preact/hooks';
import {
	ConfigurableWorksTableProps,
	DatacoreSettings,
	WorksTableProps
} from '../../types';
import { WorksTable } from '../WorksTable';

/**
 * ConfigurableWorksTable Component
 * Smart wrapper around WorksTable that respects active library schema
 * Generates dynamic columns based on field visibility configuration
 *
 * @param props - Component props
 * @returns Rendered table component with dynamic column configuration
 *
 * @example
 * h(ConfigurableWorksTable, {
 *   items: catalogItems,
 *   schema: activeLibrary.schema,
 *   settings: settings
 * })
 */
export function ConfigurableWorksTable(props: ConfigurableWorksTableProps): VNode {
	const { items, schema, settings } = props;
	const [sortColumn, setSortColumn] = useState<string | undefined>(
		settings.ui?.defaultSortColumn ?? schema.coreFields.titleField
	);
	const [sortDesc, setSortDesc] = useState<boolean>(settings.ui?.defaultSortDesc ?? false);
	const [currentPage, setCurrentPage] = useState<number>(0);

	// Generate columns from schema, respecting visibility and configured order
	const generatedColumns = useMemo<string[]>(() => {
		const tableConfig = settings.dashboards?.worksTable ?? {};
		const configuredColumns = tableConfig.defaultColumns ?? [schema.coreFields.titleField];

		// Start with configured columns if they're valid
		let columns = configuredColumns.filter((columnKey) => {
			const field = schema.fields.find((f) => f.key === columnKey);
			return field?.visible;
		});

		// If no valid configured columns, fall back to all visible fields in sortOrder
		if (columns.length === 0) {
			columns = schema.fields
				.filter((f) => f.visible)
				.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
				.map((f) => f.key);
		}

		// Ensure title field is always present if it exists and is visible
		if (columns.length > 0 && schema.coreFields.titleField) {
			const titleField = schema.fields.find((f) => f.key === schema.coreFields.titleField);
			if (titleField && titleField.visible && !columns.includes(schema.coreFields.titleField)) {
				columns = [schema.coreFields.titleField, ...columns];
			}
		}

		return columns;
	}, [schema, settings.dashboards]);

	// Validate and potentially adjust sort column
	const validSortColumn = useMemo<string | undefined>(() => {
		if (!sortColumn) {
			return undefined;
		}

		const field = schema.fields.find((f) => f.key === sortColumn);
		if (!field?.sortable) {
			// Fall back to title field if current sort column is not sortable
			const titleField = schema.fields.find((f) => f.key === schema.coreFields.titleField);
			if (titleField?.sortable) {
				return schema.coreFields.titleField;
			}
			// Fall back to first sortable field in generated columns
			for (const col of generatedColumns) {
				const colField = schema.fields.find((f) => f.key === col);
				if (colField?.sortable) {
					return col;
				}
			}
			return undefined;
		}

		return sortColumn;
	}, [sortColumn, schema.fields, schema.coreFields, generatedColumns]);

	// Handle sort changes
	const handleSort = useCallback(
		(column: string, desc: boolean) => {
			setSortColumn(column);
			setSortDesc(desc);
			setCurrentPage(0);
		},
		[]
	);

	// Handle page changes
	const handlePageChange = useCallback(
		(page: number) => {
			setCurrentPage(page);
		},
		[]
	);

	// Create modified settings with generated columns
	const modifiedSettings: DatacoreSettings = useMemo<DatacoreSettings>(() => {
		return {
			...settings,
			dashboards: {
				...settings.dashboards,
				worksTable: {
					...settings.dashboards.worksTable,
					defaultColumns: generatedColumns,
				},
			},
		};
	}, [settings, generatedColumns]);

	// Render WorksTable with generated configuration
	const worksTableProps: WorksTableProps = {
		items,
		schema,
		settings: modifiedSettings,
		sortColumn: validSortColumn,
		sortDesc,
		onSort: handleSort,
		currentPage,
		onPageChange: handlePageChange,
	};

	return h(WorksTable, worksTableProps);
}
