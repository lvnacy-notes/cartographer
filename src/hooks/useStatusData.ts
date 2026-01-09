/**
 * useStatusData Hook
 * Manages status grouping, aggregation, and statistics calculation
 *
 * Encapsulates the logic for:
 * - Grouping items by status field
 * - Calculating statistics per group (count, word count, year range, averages)
 * - Calculating total statistics across all items
 * - Sorting groups according to configuration
 *
 * @example
 * const { statusGroups, totalStats, statusFieldDef } = useStatusData(
 *   items,
 *   schema,
 *   settings,
 *   'catalog-status'
 * );
 */

import { useMemo } from 'preact/hooks';
import {
	CatalogItem,
	CatalogSchema,
	DatacoreSettings
} from '../types';
import {
	StatusGroup
} from '../types/filterTypes';
import {
	calculateStatusStats,
	groupByField,
	sortStatusGroups
} from '../utils/filterHelpers';

/**
 * useStatusData Hook
 * Manages status data aggregation and statistics
 *
 * @param items - Catalog items to group
 * @param schema - Catalog schema for field definitions
 * @param settings - Settings object with dashboard config
 * @param statusField - Default field to group by (can be overridden in settings)
 * @returns Object containing statusGroups, totalStats, and statusFieldDef
 */
export function useStatusData(
	items: CatalogItem[],
	schema: CatalogSchema,
	settings: DatacoreSettings,
	statusField: string
) {
	// Get dashboard config from settings with sensible defaults
	const dashboardConfig = settings.dashboards?.statusDashboard ?? {};
	const sortBy = dashboardConfig.sortBy ?? 'count-desc';
	const wordCountField = dashboardConfig.wordCountField ?? 'word-count';
	const yearField = dashboardConfig.yearField ?? 'year';
	const statusFieldToUse = dashboardConfig.groupByField ?? statusField;

	// Find the status field definition for label
	const statusFieldDef = useMemo(
		() => schema.fields.find((f) => f.key === statusFieldToUse),
		[schema.fields, statusFieldToUse]
	);

	// Group items by status field and calculate statistics for each group
	const statusGroups = useMemo(() => {
		const groups = groupByField(items, statusFieldToUse);
		const result: StatusGroup[] = [];

		for (const [statusValue, groupItems] of groups) {
			const stats = calculateStatusStats(
				groupItems,
				wordCountField,
				yearField
			);

			const displayLabel = statusValue === null ? '(no status)' : String(statusValue);

			result.push({
				statusValue,
				displayLabel,
				stats
			});
		}

		// Sort groups according to config
		const sorted = sortStatusGroups(groups, sortBy);
		return sorted.map(([statusValue]) => {
			const group = result.find((g) => g.statusValue === statusValue);
			return group ?? { statusValue, displayLabel: '', stats: { count: 0, totalWordCount: 0, yearRange: { min: null, max: null }, averageWordCount: 0 } };
		});
	}, [items, statusFieldToUse, sortBy, wordCountField, yearField]);

	// Calculate total statistics
	const totalStats = useMemo(() => {
		if (items.length === 0) {
			return null;
		}

		let totalCount = 0;
		let totalWords = 0;
		let minYear: number | null = null;
		let maxYear: number | null = null;
		let validYearCount = 0;
		let validWordCount = 0;

		for (const item of items) {
			totalCount += 1;

			const wordCount = item.getField<number>(wordCountField);
			if (wordCount !== null && typeof wordCount === 'number' && wordCount > 0) {
				totalWords += wordCount;
				validWordCount += 1;
			}

			const year = item.getField<number>(yearField);
			if (year !== null && typeof year === 'number') {
				if (minYear === null || year < minYear) {
					minYear = year;
				}
				if (maxYear === null || year > maxYear) {
					maxYear = year;
				}
				validYearCount += 1;
			}
		}

		const averageWords = validWordCount > 0 ? Math.round(totalWords / validWordCount) : 0;

		return {
			totalCount,
			totalWords,
			yearRange: { min: minYear, max: maxYear },
			averageWords,
			validYearCount,
			validWordCount
		};
	}, [items, wordCountField, yearField]);

	return {
		statusGroups,
		totalStats,
		statusFieldDef
	};
}
