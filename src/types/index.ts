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
 * - FilterBarProps
 * - FilterState
 * - StatusCount
 * - StatusDashboardProps
 * - WorksTableProps
 */
export * from './componentTypes';

/**
 * Filter & Grouping Exports:
 * - FieldOptions
 * - FieldRanges
 * - FilterValueMap
 * - StatusStatistics
 * - StatusGroup
 * - TotalStats
 */
export * from './filterTypes';

// Dynamic Work Exports
export {
	CatalogItem,
	getTypedField,
	itemToObject,
	buildCatalogItemFromData,
	convertFieldValue,
	type FieldValue,
	type StoredFieldValue
} from './dynamicWork';

/**
 * Settings & Configuration Exports:
 * - AuthorCardConfig
 * - BackstagePassPipelineConfig
 * - CatalogSchema
 * - DashboardConfigs
 * - DatacoreSettings
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

// Utility Functions & Type Guards
export {
	isDateLike,
	toDate,
	coerceToValidDateValue,
	getTypedField as getTypedFieldFromSettings,
	itemToObject as itemToObjectFromSettings,
	parseFieldValue,
	formatFieldValue,
} from './types';
