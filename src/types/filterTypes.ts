/**
 * Type definitions for filter and grouping operations
 * Types:
 * - FieldOptions - unique field values for filters
 * - FieldRanges - min/max ranges for numeric fields
 * - FilterValueMap - mapping of field keys to filter values for useFilteredItems
 * 
 * Interfaces:
 * - StatusStatistics - statistics for a group of items
 * - StatusGroup - status group with calculated statistics
 * - TotalStats - total statistics across all items
 */

/**
 * Field options map: field key -> array of unique values
 */
export type FieldOptions = Record<string, unknown[]>;

/**
 * Field ranges map: field key -> [min, max] tuple
 */
export type FieldRanges = Record<string, [number, number] | null>;

/**
 * Filter value mapping for useFilteredItems
 * Maps field keys to filter values
 *
 * Value types:
 * - string: exact match or substring (depending on context)
 * - array: OR logic (match any value in array)
 * - object with min/max: range filter (number comparison)
 * - null: no filter applied
 *
 * @example
 * {
 *   'catalog-status': 'raw',           // select: exact match
 *   'authors': ['Smith', 'Jones'],     // checkbox: OR logic
 *   'year': { min: 1920, max: 1950 },  // range: between min and max
 *   'title': 'Cthulhu'                 // text: substring match
 * }
 */
export type FilterValueMap = Record<string, unknown>;

/**
 * Statistics calculated for a group of items
 * @property count - Number of items in the group
 * @property totalWordCount - Sum of word counts for all items in group
 * @property yearRange - Min and max year values in group
 * @property averageWordCount - Average word count for items with word count data
 */
export interface StatusStatistics {
	count: number;
	totalWordCount: number;
	yearRange: { min: number | null; max: number | null };
	averageWordCount: number;
}

/**
 * Status group with calculated statistics
 */
export interface StatusGroup {
	statusValue: string | number | boolean | null;
	displayLabel: string;
	stats: StatusStatistics;
}

/**
 * Total statistics object
 */
export interface TotalStats {
	totalCount: number;
	totalWords: number;
	yearRange: { min: number | null; max: number | null };
	averageWords: number;
	validYearCount: number;
	validWordCount: number;
}