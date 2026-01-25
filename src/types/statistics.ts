/**
 * Statistics Type Definitions
 * 
 * Unified statistics types for catalog analytics, dashboard displays, and aggregate
 * reporting. Provides consistent interfaces for statistics at different granularities:
 * group-level, catalog-wide, and cross-group aggregates.
 * 
 * **Design Principles:**
 * - **Consistency**: All statistics use the same field names and formats
 * - **Composability**: Types extend from a common base for shared fields
 * - **Type Safety**: Strict typing with proper null handling
 * - **Clarity**: Each type has a clear, distinct purpose
 * 
 * **Type Hierarchy:**
 * ```
 * YearRange (utility type)
 * ↓
 * BaseStatistics (shared fields)
 * ├→ GroupStatistics (single group/category)
 * ├→ CatalogStatistics (entire catalog with breakdowns)
 * └→ AggregateStatistics (cross-group totals with quality metrics)
 * ```
 * 
 * @module StatsTypes
 * 
 * @example
 * ```typescript
 * import { GroupStatistics, CatalogStatistics, YearRange } from '../types';
 * 
 * // Group-level stats (e.g., for one status value)
 * const draftStats: GroupStatistics = {
 *   count: 45,
 *   totalWordCount: 225000,
 *   averageWordCount: 5000,
 *   yearRange: { min: 2020, max: 2024 }
 * };
 * 
 * // Catalog-wide stats
 * const catalogStats: CatalogStatistics = {
 *   count: 150,
 *   totalWordCount: 750000,
 *   averageWordCount: 5000,
 *   yearRange: { min: 2018, max: 2024 },
 *   byStatus: { 'draft': 45, 'published': 105 },
 *   byAuthor: { 'Lovecraft, H. P.': 75, 'Smith, Clark Ashton': 75 }
 * };
 * ```
 */

/**
 * Year range representation with minimum and maximum values.
 * 
 * Represents a range of years across catalog items. Uses object format with
 * explicit `min` and `max` properties for clarity and null safety. Null values
 * indicate that no valid year data is available.
 * 
 * **Null Semantics:**
 * - Both `null`: No items have valid year data
 * - One `null`: Should not occur (if any years exist, both min and max should be set)
 * - Both set: Valid year range exists
 * 
 * **Usage:**
 * This type is used consistently across all statistics interfaces.
 * 
 * @typedef {Object} YearRange
 * 
 * @property {number | null} min - Minimum year value across the dataset, or null
 *   if no valid year data exists. Represents the earliest year found.
 * 
 * @property {number | null} max - Maximum year value across the dataset, or null
 *   if no valid year data exists. Represents the most recent year found.
 * 
 * @example
 * ```typescript
 * // Valid year range
 * const range1: YearRange = { min: 1920, max: 1936 };
 * 
 * // No year data available
 * const range2: YearRange = { min: null, max: null };
 * 
 * // Single year (min equals max)
 * const range3: YearRange = { min: 2024, max: 2024 };
 * ```
 * 
 * @example
 * ```typescript
 * // Computing year range from items
 * function computeYearRange(items: CatalogItem[], yearField: string): YearRange {
 *   const years = items
 *     .map(item => item.getField<number>(yearField))
 *     .filter((y): y is number => typeof y === 'number');
 *   
 *   if (years.length === 0) {
 *     return { min: null, max: null };
 *   }
 *   
 *   return {
 *     min: Math.min(...years),
 *     max: Math.max(...years)
 *   };
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Displaying year range
 * function formatYearRange(range: YearRange): string {
 *   if (range.min === null || range.max === null) {
 *     return 'No year data';
 *   }
 *   if (range.min === range.max) {
 *     return String(range.min);
 *   }
 *   return `${range.min}–${range.max}`;
 * }
 * ```
 */
export type YearRange = {
	min: number | null;
	max: number | null;
};

/**
 * Aggregate statistics across multiple groups with data quality metrics.
 * 
 * Used when combining statistics from multiple groups or when tracking data
 * completeness is important. Extends base statistics with additional fields
 * that track how many items have valid data for year and word count fields.
 * 
 * **Use Cases:**
 * - Dashboard footer showing totals across all groups
 * - Data quality reports (% of items with complete data)
 * - Aggregate views combining multiple status groups
 * - Summary statistics for filtered subsets
 * 
 * **Data Quality Metrics:**
 * The `validYearCount` and `validWordCount` fields help track data completeness:
 * - If `validYearCount < count`, some items are missing year data
 * - If `validWordCount < count`, some items are missing word count data
 * - Can calculate completeness: `(validYearCount / count) * 100`
 * 
 * @interface AggregateStatistics
 * @extends BaseStatistics
 * 
 * @property {number} validYearCount - Number of items that have valid (non-null)
 *   year data. Used to calculate data completeness percentage. Always <= count.
 * 
 * @property {number} validWordCount - Number of items that have valid (non-null)
 *   word count data. Used to calculate data completeness percentage. Always <= count.
 * 
 * @example
 * ```typescript
 * // Aggregate statistics across all status groups
 * const aggregateStats: AggregateStatistics = {
 *   count: 150,
 *   totalWordCount: 750000,
 *   averageWordCount: 5000,
 *   yearRange: { min: 2018, max: 2024 },
 *   validYearCount: 145,      // 5 items missing year data
 *   validWordCount: 150       // All items have word count
 * };
 * 
 * // Calculate data completeness
 * const yearCompleteness = (aggregateStats.validYearCount / aggregateStats.count) * 100;
 * console.log(`Year data: ${yearCompleteness}% complete`); // "Year data: 96.67% complete"
 * ```
 * 
 * @example
 * ```typescript
 * // Computing aggregate statistics from groups
 * function computeAggregateStats(
 *   groups: Array<{ stats: GroupStatistics; items: CatalogItem[] }>,
 *   yearField: string,
 *   wordCountField: string
 * ): AggregateStatistics {
 *   let count = 0;
 *   let totalWordCount = 0;
 *   let validYearCount = 0;
 *   let validWordCount = 0;
 *   let minYear: number | null = null;
 *   let maxYear: number | null = null;
 *   
 *   for (const { stats, items } of groups) {
 *     count += stats.count;
 *     totalWordCount += stats.totalWordCount;
 *     
 *     // Track valid data counts
 *     for (const item of items) {
 *       const year = item.getField<number>(yearField);
 *       const wordCount = item.getField<number>(wordCountField);
 *       
 *       if (typeof year === 'number') {
 *         validYearCount++;
 *         if (minYear === null || year < minYear) minYear = year;
 *         if (maxYear === null || year > maxYear) maxYear = year;
 *       }
 *       
 *       if (typeof wordCount === 'number') {
 *         validWordCount++;
 *       }
 *     }
 *   }
 *   
 *   return {
 *     count,
 *     totalWordCount,
 *     averageWordCount: count ? Math.round(totalWordCount / count) : 0,
 *     yearRange: { min: minYear, max: maxYear },
 *     validYearCount,
 *     validWordCount
 *   };
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Displaying aggregate statistics with completeness
 * function AggregateStatsDisplay({ stats }: { stats: AggregateStatistics }) {
 *   const yearCompleteness = Math.round((stats.validYearCount / stats.count) * 100);
 *   const wordCompleteness = Math.round((stats.validWordCount / stats.count) * 100);
 *   
 *   return (
 *     <div className="aggregate-stats">
 *       <h3>Total Statistics</h3>
 *       <p>Total Items: {stats.count}</p>
 *       <p>Total Words: {stats.totalWordCount.toLocaleString()}</p>
 *       <p>Average Words: {stats.averageWordCount.toLocaleString()}</p>
 *       
 *       <h4>Data Completeness</h4>
 *       <p>Year Data: {yearCompleteness}% ({stats.validYearCount}/{stats.count})</p>
 *       <p>Word Count Data: {wordCompleteness}% ({stats.validWordCount}/{stats.count})</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link BaseStatistics} for inherited field definitions
 * @see {@link GroupStatistics} for individual group statistics
 */
export interface AggregateStatistics extends BaseStatistics {
	validYearCount: number;
	validWordCount: number;
}

/**
 * Base statistics shared across all statistics types.
 * 
 * Provides the common statistical fields used by all granularities of statistics
 * (group, catalog, aggregate). This interface should not be used directly; instead,
 * use one of the specific statistics types that extend it.
 * 
 * **Core Metrics:**
 * - **Count**: Number of items in the dataset
 * - **Word Counts**: Total and average word counts
 * - **Year Range**: Temporal span of the dataset
 * 
 * **Design Rationale:**
 * By extracting shared fields into a base interface, we ensure:
 * - Consistent field names across all statistics types
 * - Single source of truth for field types
 * - Easy addition of new common fields (add to base, available everywhere)
 * 
 * **Calculation Notes:**
 * - `averageWordCount` is calculated as `totalWordCount / count`
 * - Items without word count data are treated as 0 in `totalWordCount`
 * - Items without word count data are still included in `count` denominator
 * - Year range only includes items with valid year values
 * 
 * @interface BaseStatistics
 * 
 * @property {number} count - Total number of items in the dataset. Always >= 0.
 *   For group stats, this is the number of items in that group. For catalog stats,
 *   this is the total number of items in the catalog.
 * 
 * @property {number} totalWordCount - Sum of word counts across all items. Items
 *   without word count data are treated as 0. Always >= 0.
 * 
 * @property {number} averageWordCount - Average word count per item, calculated
 *   as `totalWordCount / count`. Rounded to nearest integer. Returns 0 if count is 0.
 * 
 * @property {YearRange} yearRange - Minimum and maximum year values found in the
 *   dataset. Both fields are null if no items have valid year data.
 * 
 * @example
 * ```typescript
 * // Base statistics structure (extended by specific types)
 * const baseStats: BaseStatistics = {
 *   count: 100,
 *   totalWordCount: 500000,
 *   averageWordCount: 5000,
 *   yearRange: { min: 2020, max: 2024 }
 * };
 * ```
 * 
 * @see {@link GroupStatistics} for group-level statistics
 * @see {@link CatalogStatistics} for catalog-wide statistics
 * @see {@link AggregateStatistics} for cross-group aggregate statistics
 */
export interface BaseStatistics {
	count: number;
	totalWordCount: number;
	averageWordCount: number;
	yearRange: YearRange;
}

/**
 * Catalog-wide statistics with distribution breakdowns.
 * 
 * Provides comprehensive statistics for an entire catalog, including overall
 * metrics (inherited from BaseStatistics) plus breakdowns by various categorical
 * fields like status, author, and publication.
 * 
 * **Use Cases:**
 * - Catalog overview dashboards
 * - "At a glance" statistics for the entire library
 * - Analytics and reporting on catalog composition
 * - Progress tracking across multiple dimensions
 * 
 * **Distribution Fields:**
 * Optional `byX` fields provide item counts grouped by categorical values.
 * For example, `byStatus` might show `{ 'draft': 45, 'published': 105 }`.
 * 
 * **Replaces Legacy Type:**
 * This type replaces the old `CatalogStatistics` from dynamicWork.ts, but with
 * important changes:
 * - Year range is now object format (not tuple)
 * - Consistent field naming (`totalWordCount` not optional)
 * - Added `byPublication` for publication analytics
 * 
 * @interface CatalogStatistics
 * @extends BaseStatistics
 * 
 * @property {Record<string, number>} [byStatus] - Optional distribution of items
 *   by status field value. Keys are status values (e.g., 'draft', 'published'),
 *   values are counts. Only included if status field exists in schema.
 * 
 * @property {Record<string, number>} [byAuthor] - Optional distribution of items
 *   by author. Keys are author names, values are counts. For items with multiple
 *   authors, each author is counted separately. Only included if author field exists.
 * 
 * @property {Record<string, number>} [byPublication] - Optional distribution of
 *   items by publication. Keys are publication names, values are counts. For items
 *   with multiple publications (e.g., reprints), each publication is counted separately.
 *   Only included if publication field exists.
 * 
 * @example
 * ```typescript
 * // Complete catalog statistics
 * const stats: CatalogStatistics = {
 *   count: 150,
 *   totalWordCount: 750000,
 *   averageWordCount: 5000,
 *   yearRange: { min: 2018, max: 2024 },
 *   byStatus: {
 *     'raw': 30,
 *     'draft': 45,
 *     'in-review': 25,
 *     'published': 50
 *   },
 *   byAuthor: {
 *     'Lovecraft, H. P.': 75,
 *     'Smith, Clark Ashton': 50,
 *     'Howard, Robert E.': 25
 *   },
 *   byPublication: {
 *     'Weird Tales': 80,
 *     'The Arkham Sampler': 40,
 *     'Unknown': 30
 *   }
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Computing catalog statistics
 * function computeCatalogStats(
 *   items: CatalogItem[],
 *   schema: CatalogSchema
 * ): CatalogStatistics {
 *   const count = items.length;
 *   const wordCounts = items.map(i => i.getField<number>('word-count') ?? 0);
 *   const totalWordCount = wordCounts.reduce((a, b) => a + b, 0);
 *   const averageWordCount = count ? Math.round(totalWordCount / count) : 0;
 *   
 *   const years = items
 *     .map(i => i.getField<number>('year-published'))
 *     .filter((y): y is number => typeof y === 'number');
 *   
 *   const yearRange: YearRange = years.length
 *     ? { min: Math.min(...years), max: Math.max(...years) }
 *     : { min: null, max: null };
 *   
 *   const stats: CatalogStatistics = {
 *     count,
 *     totalWordCount,
 *     averageWordCount,
 *     yearRange
 *   };
 *   
 *   // Add optional distributions
 *   if (schema.coreFields.statusField) {
 *     stats.byStatus = countByField(items, schema.coreFields.statusField);
 *   }
 *   
 *   const authorField = schema.fields.find(f => f.key === 'authors');
 *   if (authorField) {
 *     stats.byAuthor = countByAuthor(items);
 *   }
 *   
 *   const pubField = schema.fields.find(f => f.key === 'publications');
 *   if (pubField) {
 *     stats.byPublication = countByPublication(items);
 *   }
 *   
 *   return stats;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Displaying catalog statistics in UI
 * function CatalogOverview({ stats }: { stats: CatalogStatistics }) {
 *   return (
 *     <div>
 *       <h2>Catalog Overview</h2>
 *       <p>Total Works: {stats.count}</p>
 *       <p>Total Words: {stats.totalWordCount.toLocaleString()}</p>
 *       <p>Average Words: {stats.averageWordCount.toLocaleString()}</p>
 *       {stats.yearRange.min && stats.yearRange.max && (
 *         <p>Year Range: {stats.yearRange.min}–{stats.yearRange.max}</p>
 *       )}
 *       
 *       {stats.byStatus && (
 *         <div>
 *           <h3>By Status</h3>
 *           {Object.entries(stats.byStatus).map(([status, count]) => (
 *             <p key={status}>{status}: {count}</p>
 *           ))}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link BaseStatistics} for inherited field definitions
 * @see {@link GroupStatistics} for single-group statistics
 */
export interface CatalogStatistics extends BaseStatistics {
	byStatus?: Record<string, number>;
	byAuthor?: Record<string, number>;
	byPublication?: Record<string, number>;
}

/**
 * Statistics for a single group or category of items.
 * 
 * Represents statistical metrics for items grouped by a specific field value
 * (e.g., all items with status="draft", all items by author "Lovecraft, H. P.",
 * all items in publication "Weird Tales").
 * 
 * **Use Cases:**
 * - Status dashboard showing stats per status value
 * - Author statistics (works per author)
 * - Publication analytics (works per publication)
 * - Any categorical grouping with aggregate metrics
 * 
 * **Typical Usage Pattern:**
 * 1. Group items by a field (e.g., status, author, publication)
 * 2. Calculate GroupStatistics for each group
 * 3. Display in dashboard or report
 * 
 * **Replaces Legacy Type:**
 * This type replaces `GroupStatistics` from filters.ts. The new name is
 * more generic since these statistics can be used for any grouping, not just status.
 * 
 * @interface GroupStatistics
 * @extends BaseStatistics
 * 
 * @example
 * ```typescript
 * // Statistics for items with status="draft"
 * const draftStats: GroupStatistics = {
 *   count: 45,
 *   totalWordCount: 225000,
 *   averageWordCount: 5000,
 *   yearRange: { min: 2020, max: 2024 }
 * };
 * 
 * // Statistics for author "Lovecraft, H. P."
 * const lovecraftStats: GroupStatistics = {
 *   count: 75,
 *   totalWordCount: 1500000,
 *   averageWordCount: 20000,
 *   yearRange: { min: 1917, max: 1935 }
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Computing group statistics
 * function computeGroupStats(
 *   items: CatalogItem[],
 *   wordCountField: string,
 *   yearField: string
 * ): GroupStatistics {
 *   const count = items.length;
 *   const wordCounts = items.map(i => i.getField<number>(wordCountField) ?? 0);
 *   const totalWordCount = wordCounts.reduce((a, b) => a + b, 0);
 *   const averageWordCount = count ? Math.round(totalWordCount / count) : 0;
 *   
 *   const years = items
 *     .map(i => i.getField<number>(yearField))
 *     .filter((y): y is number => typeof y === 'number');
 *   
 *   const yearRange: YearRange = years.length
 *     ? { min: Math.min(...years), max: Math.max(...years) }
 *     : { min: null, max: null };
 *   
 *   return { count, totalWordCount, averageWordCount, yearRange };
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Using in a status dashboard
 * interface StatusGroup {
 *   statusValue: string;
 *   displayLabel: string;
 *   stats: GroupStatistics;
 * }
 * 
 * const groups: StatusGroup[] = [
 *   {
 *     statusValue: 'draft',
 *     displayLabel: 'Draft',
 *     stats: { count: 45, totalWordCount: 225000, averageWordCount: 5000, yearRange: { min: 2020, max: 2024 } }
 *   },
 *   {
 *     statusValue: 'published',
 *     displayLabel: 'Published',
 *     stats: { count: 105, totalWordCount: 525000, averageWordCount: 5000, yearRange: { min: 2018, max: 2024 } }
 *   }
 * ];
 * ```
 * 
 * @see {@link BaseStatistics} for field definitions
 * @see {@link StatusGroup} in filters.ts for status grouping with statistics
 */
export interface GroupStatistics extends BaseStatistics {
	// Currently no additional fields beyond base
	// Future expansion possibilities:
	// - median word count
	// - mode (most common value)
	// - standard deviation
	// - percentiles
}