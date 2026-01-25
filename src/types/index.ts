// CatalogItem Class + Builders Exports
export {
	CatalogItem,
	getTypedField,
	itemToObject,
	buildCatalogItemFromData,
	convertFieldValue,
	type FieldValue,
	type QueryFilter,
	type SortState,
	type StoredFieldValue
} from './catalogItem';

/**
 * Type Barrel Export
 *
 * Central export point for all type definitions and utilities.
 * Allows clean imports: import { CatalogItem, Library, ... } from '../types'
 */

/**
 * Command Types (if any)
 * - CommandContext
 */
export * from './commands';

/**
 * Component Props & Types:
 * - BaseComponentProps
 * - FilterBarProps
 * - FilterState
 * - PublicationDashboardProps
 * - StatusDashboardProps
 * - WorksTableProps
 */
export * from './componentProps';

// Field Utility Functions
export {
	coerceToValidDateValue,
	formatFieldValue,
	getTypedField as getTypedFieldFromSettings,
	parseFieldValue,
	toDate
} from './fieldUtils';

/**
 * Filter & Grouping Exports:
 * - FieldOptions
 * - FieldRanges
 * - FilterValueMap
 * - StatusGroup
 */
export * from './filters';

/**
 * Settings & Configuration Exports:
 * - AuthorCardConfig
 * - BackstagePassPipelineConfig
 * - CatalogSchema
 * - DashboardConfigs
 * - CartographerSettings
 * - FilterBarConfig
 * - FilterDefinition
 * - Library
 * - PipelineStage
 * - PublicationDashboardConfig
 * - SchemaField
 * - StatusDashboardConfig
 * - WorksTableConfig
 */
export * from './settings';

/**
 * Statistics Types:
 * - YearRange
 * - AggregateStatistics
 * - BaseStatistics
 * - CatalogStatistics
 * - GroupStatistics
 */
export * from './statistics';

// Utility Functions & Type Guards
export {
	isDateLike,
	itemToObject as itemToObjectFromSettings,
} from './typeGuards';
