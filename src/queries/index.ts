/**
 * Query Functions Barrel Export
 *
 * Central export point for all query layer functions (filters, sorts, groupers, aggregators, utilities).
 * These pure, schema-agnostic functions form the foundation of the catalog query system.
 */

// Aggregate Functions
export {
	averageField,
	averageWordCount,
	countByAuthor,
	countByField,
	countByPublication,
	countByStatus,
	countByYear,
	getDateRange,
	getMostCommon,
	getRangeField,
	getStatistics,
	getYearRange,
	sumField,
	totalWordCount
} from './aggregateFunctions';

// Filter Functions
export {
	applyFilters,
	excludeWhere,
	filterByAuthor,
	filterByDateRange,
	filterByField,
	filterByFieldIncludes,
	filterByFieldRange,
	filterBPApproved,
	filterBPCandidates,
	filterByPublication,
	filterByPipelineStage,
	filterByStatus,
	filterWhere
} from './filterFunctions';

// Group Functions
export {
	flattenGroups,
	getGroupKeys,
	groupByAuthor,
	groupByCustom,
	groupByDateMonth,
	groupByField,
	groupByPublication,
	groupByStatus,
	groupByYear
} from './groupFunctions';

// Sort Functions
export {
	sortByDate,
	sortByField,
	sortByMultiple,
	sortByNumber,
	sortByString
} from './sortFunctions';

// Utility Functions
export {
	aggregateByField,
	createCompoundFilter,
	filterByArrayField,
	filterByMultiple,
	filterByRange,
	filterByText,
	getNumericStats,
	getUniqueValues,
	groupByArrayField,
	paginate,
	sortByField as sortByFieldUtils,
	sortByMultiple as sortByMultipleUtils
} from './queryFunctions';
