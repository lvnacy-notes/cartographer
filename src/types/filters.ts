/**
 * Type definitions for filter and grouping operations
 * Types:
 * - FieldOptions - unique field values for filters
 * - FieldRanges - min/max ranges for numeric fields
 * - FilterValueMap - mapping of field keys to filter values for useFilteredItems
 * 
 * Interfaces:
 * - GroupStatistics - statistics for a group of items
 * - StatusGroup - status group with calculated statistics
 * - AggregateStatistics - total statistics across all items
 */

import { GroupStatistics } from './statistics';

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
 * Status group with calculated statistics
 */
export interface StatusGroup {
	statusValue: string | number | boolean | null;
	displayLabel: string;
	stats: GroupStatistics;
}