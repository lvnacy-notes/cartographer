/**
 * Aggregate Functions Library
 *
 * Pure, schema-agnostic functions for computing statistics and aggregations.
 * All functions handle empty arrays and null values gracefully.
 */

import {
	CatalogItem,
	CatalogSchema
} from '../types';

/**
 * Calculate average value in a numeric field.
 *
 * Returns 0 if no items or all values are null.
 *
 * @param items - Array of items
 * @param fieldKey - The numeric field to average
 * @returns - Average of field values
 *
 * @example
 * const avg = averageField(items, 'word-count');
 * console.log(avg); // 5000
 */
export function averageField(
	items: CatalogItem[],
	fieldKey: string
): number {
	if (items.length === 0) {
		return 0;
	}

	const sum = sumField(items, fieldKey);
	return sum / items.length;
}

/**
 * Calculate average word count across all items.
 *
 * @param items - Array of items
 * @returns - Average word count per item
 *
 * @example
 * const avg = averageWordCount(items);
 * console.log(avg); // 5000
 */
export function averageWordCount(
	items: CatalogItem[]
): number {
	return averageField(items, 'word-count');
}

/**
 * Count items by author (handles array field).
 *
 * Items with multiple authors are counted once per author.
 *
 * @param items - Array of items to count
 * @returns - Object with author names as keys and counts as values
 *
 * @example
 * const authorCounts = countByAuthor(items);
 * console.log(authorCounts); // { 'Lovecraft, H. P.': 15, 'Smith, Clark Ashton': 8 }
 */
export function countByAuthor(
	items: CatalogItem[]
): Record<string, number> {
	const counts: Record<string, number> = {};

	for (const item of items) {
		const authors = item.getField<string[]>('authors');
		if (Array.isArray(authors)) {
			for (const author of authors) {
				counts[author] = (counts[author] || 0) + 1;
			}
		}
	}

	return counts;
}

/**
 * Count items grouped by field value.
 *
 * Returns an object mapping field values to the count of items with that value.
 *
 * @param items - Array of items to count
 * @param fieldKey - The field key to count by
 * @returns - Object with field values as keys and counts as values
 *
 * @example
 * const counts = countByField(items, 'catalog-status');
 * console.log(counts); // { raw: 5, reviewed: 3, approved: 2 }
 */
export function countByField(
	items: CatalogItem[],
	fieldKey: string
): Record<string, number> {
	const counts: Record<string, number> = {};

	for (const item of items) {
		const value = item.getField(fieldKey);
		const key = value === null || value === undefined ? 'null' : String(value);

		counts[key] = (counts[key] || 0) + 1;
	}

	return counts;
}

/**
 * Count items by publication (handles wikilink array field).
 *
 * Items with multiple publications are counted once per publication.
 *
 * @param items - Array of items to count
 * @returns - Object with publication names as keys and counts as values
 *
 * @example
 * const pubCounts = countByPublication(items);
 * console.log(pubCounts); // { 'Weird Tales': 23, 'Lovecraft Annual': 5 }
 */
export function countByPublication(
	items: CatalogItem[]
): Record<string, number> {
	const counts: Record<string, number> = {};

	for (const item of items) {
		const publications = item.getField<string[]>('publications');
		if (Array.isArray(publications)) {
			for (const pub of publications) {
				counts[pub] = (counts[pub] || 0) + 1;
			}
		}
	}

	return counts;
}

/**
 * Count items by catalog status field.
 *
 * Automatically finds status field from schema and counts by its values.
 *
 * @param items - Array of items to count
 * @param schema - The catalog schema
 * @returns - Object with status values as keys and counts as values
 *
 * @example
 * const statusCounts = countByStatus(items, schema);
 * console.log(statusCounts); // { raw: 5, reviewed: 3, approved: 2 }
 */
export function countByStatus(
	items: CatalogItem[],
	schema: CatalogSchema
): Record<string, number> {
	const statusField = schema.coreFields.statusField;
	if (!statusField) {
		return {};
	}
	return countByField(items, statusField);
}

/**
 * Count items by year field.
 *
 * @param items - Array of items to count
 * @returns - Object with years as keys (as strings) and counts as values
 *
 * @example
 * const yearCounts = countByYear(items);
 * console.log(yearCounts); // { 2020: 3, 2021: 5, 2022: 2 }
 */
export function countByYear(
	items: CatalogItem[]
): Record<string, number> {
	return countByField(items, 'year');
}

/**
 * Get min and max dates for a date field.
 *
 * Returns null if no items or no valid date values.
 *
 * @param items - Array of items
 * @param fieldKey - The date field to analyze
 * @returns - [minDate, maxDate] or null
 *
 * @example
 * const [min, max] = getDateRange(items, 'date-read') || [null, null];
 */
export function getDateRange(
	items: CatalogItem[],
	fieldKey: string
): [Date, Date] | null {
	let minDate: Date | null = null;
	let maxDate: Date | null = null;

	for (const item of items) {
		const value = item.getField(fieldKey);
		if (value === null || value === undefined) {
			continue;
		}

		const date = value instanceof Date ? value : new Date(String(value));
		if (isNaN(date.getTime())) {
			continue;
		}

		if (minDate === null || date < minDate) minDate = date;
		if (maxDate === null || date > maxDate) maxDate = date;
	}

	if (minDate === null || maxDate === null) {
		return null;
	}

	return [minDate, maxDate];
}

/**
 * Get the most common value in a field.
 *
 * Returns null if no items or all values are null.
 *
 * @param items - Array of items
 * @param fieldKey - The field to find the mode of
 * @returns - The most frequently occurring value
 *
 * @example
 * const mostCommon = getMostCommon(items, 'catalog-status');
 * console.log(mostCommon); // 'raw'
 */
export function getMostCommon(
	items: CatalogItem[],
	fieldKey: string
): any | null {
	if (items.length === 0) {
		return null;
	}

	const counts: Record<string, number> = {};
	let maxCount = 0;
	let mostCommonValue: any = null;

	for (const item of items) {
		const value = item.getField(fieldKey);
		const key = value === null || value === undefined ? 'null' : String(value);

		counts[key] = (counts[key] || 0) + 1;
		if (counts[key] > maxCount) {
			maxCount = counts[key];
			mostCommonValue = value;
		}
	}

	return mostCommonValue;
}

/**
 * Get min and max values for a numeric field.
 *
 * Returns null if no items or no valid numeric values.
 *
 * @param items - Array of items
 * @param fieldKey - The numeric field to analyze
 * @returns - Object with min and max, or null
 *
 * @example
 * const range = getRangeField(items, 'word-count');
 * console.log(range); // { min: 1000, max: 50000 }
 */
export function getRangeField(
	items: CatalogItem[],
	fieldKey: string
): { min: number; max: number } | null {
	let min: number | null = null;
	let max: number | null = null;

	for (const item of items) {
		const value = item.getField<number>(fieldKey);
		if (value !== null && value !== undefined && typeof value === 'number') {
			if (min === null || value < min) min = value;
			if (max === null || value > max) max = value;
		}
	}

	if (min === null || max === null) {
		return null;
	}

	return { min, max };
}

/**
 * Get comprehensive statistics for a catalog.
 *
 * Returns summary of total items, word counts, author/publication counts, and year range.
 *
 * @param items - Array of items to analyze
 * @param schema - The catalog schema
 * @returns - Statistics object
 *
 * @example
 * const stats = getStatistics(items, schema);
 * console.log(`${stats.total} works, ${stats.totalWordCount} words average`);
 */
export function getStatistics(
	items: CatalogItem[],
	schema: CatalogSchema
): {
	total: number;
	totalWordCount: number;
	averageWordCount: number;
	authorCount: number;
	publicationCount: number;
	yearRange: [number, number] | null;
	statusCounts: Record<string, number>;
} {
	const statusCounts = countByStatus(items, schema);
	const authorCounts = countByAuthor(items);
	const pubCounts = countByPublication(items);

	return {
		total: items.length,
		totalWordCount: totalWordCount(items),
		averageWordCount: averageWordCount(items),
		authorCount: Object.keys(authorCounts).length,
		publicationCount: Object.keys(pubCounts).length,
		yearRange: getYearRange(items),
		statusCounts: statusCounts
	};
}

/**
 * Get min and max year values.
 *
 * Returns null if no items or no valid year values.
 *
 * @param items - Array of items
 * @returns - [minYear, maxYear] or null
 *
 * @example
 * const [min, max] = getYearRange(items) || [0, 0];
 * console.log(`Years ${min}-${max}`);
 */
export function getYearRange(
	items: CatalogItem[]
): [number, number] | null {
	const range = getRangeField(items, 'year');
	if (!range) {
		return null;
	}
	return [range.min, range.max];
}

/**
 * Sum all values in a numeric field.
 *
 * Returns 0 if no items or all values are null.
 *
 * @param items - Array of items to sum
 * @param fieldKey - The numeric field to sum
 * @returns - Total sum of field values
 *
 * @example
 * const total = sumField(items, 'word-count');
 * console.log(total); // 150000
 */
export function sumField(
	items: CatalogItem[],
	fieldKey: string
): number {
	let sum = 0;

	for (const item of items) {
		const value = item.getField<number>(fieldKey);
		if (value !== null && value !== undefined && typeof value === 'number') {
			sum += value;
		}
	}

	return sum;
}

/**
 * Calculate total word count across all items.
 *
 * Sums the word-count field.
 *
 * @param items - Array of items
 * @returns - Total word count
 *
 * @example
 * const total = totalWordCount(items);
 * console.log(total); // 150000
 */
export function totalWordCount(
	items: CatalogItem[]
): number {
	return sumField(items, 'word-count');
}