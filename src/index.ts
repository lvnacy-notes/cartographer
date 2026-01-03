/**
 * Main export file for Datacore plugin
 * Re-exports all public APIs
 */

// Types
export type { CatalogItem, CatalogDataState, FilterState, SortState, CatalogStatistics } from './types/dynamicWork';
export type { DatacoreSettings, CatalogSchema, SchemaField, DashboardConfigs } from './types/settings';
export { getTypedField, itemToObject, parseFieldValue, formatFieldValue, isDateLike, toDate, coerceToValidDateValue } from './types/types';

// Config
export { PRESETS, PULP_FICTION_PRESET, GENERAL_LIBRARY_PRESET, MANUSCRIPTS_PRESET, DEFAULT_CUSTOM_PRESET } from './config/presets';
export { SettingsManager } from './config/settingsManager';
export { DatacoreSettingsTab } from './config/settingsTab';

// Hooks
export {
	loadCatalogItems,
	subscribeToVaultChanges,
	filterItems,
	sortItems,
	getFieldValues,
	getFieldRange,
} from './hooks/useDataLoading';

// Queries
export {
	filterByField,
	filterByArrayField,
	filterByRange,
	filterByText,
	filterByMultiple,
	sortByField,
	sortByMultiple,
	groupByField,
	groupByArrayField,
	countByField,
	aggregateByField,
	getUniqueValues,
	getNumericStats,
	getDateRange,
	paginate,
	createCompoundFilter,
} from './queries/queryFunctions';

// Components
export { DatacoreComponentView, createTableElement, createFilterElement, createStatusSummary } from './components/DatacoreComponentView';
export { StatusDashboardView, STATUS_DASHBOARD_VIEW_TYPE } from './components/StatusDashboardView';
export { WorksTableView, WORKS_TABLE_VIEW_TYPE } from './components/WorksTableView';
