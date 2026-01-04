/**
 * Library configuration - defines a single catalog/collection
 */
export interface Library {
	// Unique identifier for this library
	id: string;
	// User-friendly display name
	name: string;
	// Vault path where catalog items are stored
	path: string; // e.g., 'pulp-fiction/works', 'manuscripts', 'my-library/books'
	// Schema definition for this library
	schema: CatalogSchema;
	// ISO timestamp of when library was created
	createdAt: string;
}

/**
 * Configuration types for Cartographer plugin
 * Defines all settings structure, schemas, and library management
 */

export interface DatacoreSettings {
	// Core configuration
	version: string;
	// Multi-library support
	libraries: Library[];
	activeLibraryId: string | null; // ID of currently active library, or null if none selected
	// Schema & field configuration for the ACTIVE library
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
