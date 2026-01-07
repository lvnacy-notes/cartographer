/**
 * Data Access Barrel Export
 *
 * Central export point for all file parsing and data construction utilities.
 */

export {
	extractFrontmatter,
	parseYAML,
	parseMarkdownFile,
} from './fileParser';

export {
	buildCatalogItemFromMarkdown,
	applyFieldConversion,
	validateRequiredFields,
	ensureTitle,
	getVisibleFields,
	getFilterableFields,
	getSortableFields,
	getFieldsByCategory,
	mergeItems,
} from './catalogItemBuilder';
