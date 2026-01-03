/**
 * Configuration types for Datacore plugin
 * Defines all settings structure, schemas, and presets
 */

export interface DatacoreSettings {
	// Core configuration
	version: string;
	presetName: string; // 'pulp-fiction', 'general-library', 'manuscripts', 'custom'

	// Catalog location
	catalogPath: string; // e.g., 'works', 'manuscripts', 'stories'

	// Schema & field configuration
	schema: CatalogSchema;

	// Component visibility & configuration
	dashboards: DashboardConfigs;

	// UI preferences
	ui: {
		itemsPerPage: number;
		defaultSortColumn: string;
		defaultSortDesc: boolean;
		compactMode: boolean;
	};
}

/**
 * Catalog schema definition - defines all available fields
 */
export interface CatalogSchema {
	// Display name for this catalog
	catalogName: string;

	// Field definitions
	fields: SchemaField[];

	// Core fields (required for plugin to function)
	coreFields: {
		titleField: string; // Which field is the title (usually 'title')
		idField?: string; // Optional: unique identifier field
		statusField?: string; // Optional: status/stage field
	};
}

/**
 * Individual field definition
 */
export interface SchemaField {
	// Internal field name (matches frontmatter key)
	key: string;

	// Display label in UI
	label: string;

	// Field type (determines how it's parsed and displayed)
	type:
		| 'string'
		| 'number'
		| 'date'
		| 'boolean'
		| 'array'
		| 'wikilink-array'
		| 'object';

	// Category for grouping in UI
	category: 'metadata' | 'status' | 'workflow' | 'content' | 'custom';

	// Whether field is visible in default table views
	visible: boolean;

	// Whether field can be filtered by
	filterable: boolean;

	// Whether field can be sorted by
	sortable: boolean;

	// For array types: what is the item type?
	arrayItemType?: 'string' | 'wikilink';

	// Default sort order (lower = earlier in list)
	sortOrder: number;

	// Description for settings UI
	description?: string;
}

/**
 * Dashboard & component configurations
 */
export interface DashboardConfigs {
	statusDashboard: StatusDashboardConfig;
	worksTable: WorksTableConfig;
	filterBar: FilterBarConfig;
	publicationDashboard: PublicationDashboardConfig;
	authorCard: AuthorCardConfig;
	backstagePassPipeline: BackstagePassPipelineConfig;
}

export interface StatusDashboardConfig {
	enabled: boolean;
	groupByField: string; // Which field to group by (usually 'catalog-status')
	showTotalStats: boolean;
	showWordCounts: boolean;
}

export interface WorksTableConfig {
	enabled: boolean;
	defaultColumns: string[]; // Which fields to display
	columnWidths?: Record<string, string>;
	maxRows?: number;
	enablePagination: boolean;
}

export interface FilterBarConfig {
	enabled: boolean;
	filters: FilterDefinition[];
	layout: 'vertical' | 'horizontal' | 'dropdown';
}

export interface FilterDefinition {
	field: string;
	type: 'select' | 'checkbox' | 'range' | 'text';
	label: string;
	enabled: boolean;
	options?: string[]; // For select/checkbox filters
}

export interface PublicationDashboardConfig {
	enabled: boolean;
	foreignKeyField: string; // Field that references publications (e.g., 'publications')
	displayColumns: string[];
}

export interface AuthorCardConfig {
	enabled: boolean;
	authorField: string; // Field that contains author names
	displayColumns: string[];
	showStatistics: boolean;
}

export interface BackstagePassPipelineConfig {
	enabled: boolean;
	stages: PipelineStage[];
}

export interface PipelineStage {
	name: string;
	filterLogic: string; // JavaScript filter expression or predefined name
	displayFields: string[];
}
