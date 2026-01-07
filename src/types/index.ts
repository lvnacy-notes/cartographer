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

// Dynamic Work Types & Classes
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
 * Settings & Configuration Types:
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
