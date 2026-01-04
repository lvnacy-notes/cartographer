/**
 * Main export file for Datacore plugin
 * Re-exports all public APIs
 */

// Types
export type {
	CatalogDataState,
	CatalogItem,
	CatalogStatistics,
	FilterState,
	SortState
} from './types/dynamicWork';
export type {
	CatalogSchema,
	DashboardConfigs,
	DatacoreSettings,
	Library,
	SchemaField
} from './types/settings';
export {
	coerceToValidDateValue,
	formatFieldValue,
	getTypedField,
	isDateLike,
	itemToObject,
	parseFieldValue,
	toDate
} from './types/types';

// Config
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
export {
	DatacoreComponentView,
	createTableElement,
	createFilterElement,
	createStatusSummary
} from './components/DatacoreComponentView';
export {
	StatusDashboardView,
	STATUS_DASHBOARD_VIEW_TYPE
} from './components/StatusDashboardView';
export {
	WorksTableView,
	WORKS_TABLE_VIEW_TYPE
} from './components/WorksTableView';
