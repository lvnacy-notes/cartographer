/**
 * Configuration for the Author Card component.
 * Controls display, layout, and data presentation for author information.
 */
export interface AuthorCardConfig {
	/** Whether the author card component is enabled */
	enabled: boolean;
	/** Schema field key that contains author names (usually 'authors') */
	authorField: string;
	/** Schema field keys to display in author card (subset of schema fields) */
	displayColumns: string[];
	/** Whether to show aggregate statistics (count, works per author, etc.) */
	showStatistics: boolean;
}

/**
 * Configuration for the Backstage Pass publication pipeline.
 * Manages the multi-stage review and approval workflow for works.
 */
export interface BackstagePassPipelineConfig {
	/** Whether the backstage pass pipeline is enabled */
	enabled: boolean;
	/** Stages in the publication pipeline (e.g., draft, review, approved) */
	stages: PipelineStage[];
}

/**
 * Catalog schema definition—defines all available fields for a library.
 * 
 * The schema is the contract between markdown frontmatter and the plugin,
 * specifying what fields exist, their types, and how they should be handled.
 * Different libraries can have different schemas.
 *
 * @example
 * const schema: CatalogSchema = {
 *   catalogName: "Pulp Fiction",
 *   fields: [
 *     { key: 'title', label: 'Title', type: 'string', sortOrder: 1 },
 *     { key: 'authors', label: 'Authors', type: 'wikilink-array', sortOrder: 2 },
 *     { key: 'word-count', label: 'Word Count', type: 'number', sortOrder: 3 },
 *   ],
 *   coreFields: {
 *     titleField: 'title',
 *     idField: 'title',
 *     statusField: 'catalog-status'
 *   }
 * };
 */
export interface CatalogSchema {
	/** Display name for this catalog (e.g., "Pulp Fiction", "My Library") */
	catalogName: string;
	/** Array of field definitions for this catalog (defines all available fields) */
	fields: SchemaField[];
	/** Core fields required for plugin operation */
	coreFields: {
		/** Field key that serves as the display title for items (usually 'title') */
		titleField: string;
		/** Field key that uniquely identifies items (optional; defaults to titleField) */
		idField?: string;
		/** Field key that tracks publication/review status (optional) */
		statusField?: string;
	};
}

/**
 * Dashboard and component configurations.
 * Controls which dashboards and views are enabled, and their display options.
 */
export interface DashboardConfigs {
	/** Configuration for the Status/Pipeline dashboard */
	statusDashboard: StatusDashboardConfig;
	/** Configuration for the Works table view */
	worksTable: WorksTableConfig;
	/** Configuration for the filter bar component */
	filterBar: FilterBarConfig;
	/** Configuration for the Publication dashboard */
	publicationDashboard: PublicationDashboardConfig;
	/** Configuration for the Author card component */
	authorCard: AuthorCardConfig;
	/** Configuration for the Backstage Pass pipeline */
	backstagePassPipeline: BackstagePassPipelineConfig;
}

/**
 * Configuration types for Cartographer plugin.
 * Defines the complete settings structure, schemas, and library management.
 *
 * This is the root settings object stored in Obsidian plugin storage.
 * It includes all library configurations, active library selection, and UI preferences.
 *
 * @example
 * const settings: DatacoreSettings = {
 *   version: "1.0.0",
 *   libraries: [
 *     { id: "pulp-fiction", name: "Pulp Fiction", path: "pulp-fiction/works", schema: {...}, createdAt: "2026-01-01T00:00:00Z" }
 *   ],
 *   activeLibraryId: "pulp-fiction",
 *   schema: {...}, // Schema of the active library
 *   dashboards: {...},
 *   ui: { itemsPerPage: 20, defaultSortColumn: "title", defaultSortDesc: false, compactMode: false }
 * };
 */
export interface DatacoreSettings {
	/** Settings format version (for migrations) */
	version: string;
	/** Array of configured libraries */
	libraries: Library[];
	/** ID of currently active library, or null if none selected */
	activeLibraryId: string | null;
	/** Schema of the active library (copy of schema from active Library object) */
	schema: CatalogSchema;
	/** Dashboard and component visibility & configuration */
	dashboards: DashboardConfigs;
	/** UI preferences and display options */
	ui: {
		/** Number of items to display per page in tables/lists */
		itemsPerPage: number;
		/** Default field to sort by (usually 'title') */
		defaultSortColumn: string;
		/** Whether to sort descending by default */
		defaultSortDesc: boolean;
		/** Whether to use compact mode in UI (condensed display) */
		compactMode: boolean;
	};
}

/**
 * Filter bar configuration.
 * Controls which filters are available and how they are displayed in the UI.
 */
export interface FilterBarConfig {
	/** Whether the filter bar is enabled */
	enabled: boolean;
	/** Array of filter definitions available to the user */
	filters: FilterDefinition[];
	/** Layout mode for displaying filters ('vertical', 'horizontal', or 'dropdown') */
	layout: 'vertical' | 'horizontal' | 'dropdown';
}

/**
 * Definition of a single filter in the filter bar.
 * Specifies the field, filter type, UI label, and available options.
 */
export interface FilterDefinition {
	/** Schema field key to filter on */
	field: string;
	/** Type of filter UI to display ('select', 'checkbox', 'range', 'text') */
	type: 'select' | 'checkbox' | 'range' | 'text';
	/** Display label for the filter in the UI */
	label: string;
	/** Whether this filter is currently enabled */
	enabled: boolean;
	/** Options available for select/checkbox filters (ignored for range/text) */
	options?: string[];
}

/**
 * Library configuration—defines a single catalog or collection.
 *
 * A library is a catalog of items (works, books, articles, etc.) all stored
 * in a single directory and sharing a common schema. Users can have multiple
 * libraries (e.g., "Pulp Fiction", "Personal Library", "Research Notes").
 *
 * @example
 * const library: Library = {
 *   id: "pulp-fiction",
 *   name: "Pulp Fiction",
 *   path: "pulp-fiction/works",
 *   schema: {...},
 *   createdAt: "2026-01-01T00:00:00Z"
 * };
 */
export interface Library {
	/** Unique identifier for this library (used in activeLibraryId) */
	id: string;
	/** User-friendly display name (shown in library selector) */
	name: string;
	/** Vault path where catalog items are stored (e.g., 'pulp-fiction/works', 'my-library/books') */
	path: string;
	/** Schema definition for this library (fields, types, configuration) */
	schema: CatalogSchema;
	/** ISO 8601 timestamp when this library was created */
	createdAt: string;
}

export interface PipelineStage {
	name: string;
	filterLogic: string; // JavaScript filter expression or predefined name
	displayFields: string[];
}

export interface PublicationDashboardConfig {
	enabled: boolean;
	foreignKeyField: string; // Field that references publications (e.g., 'publications')
	displayColumns: string[];
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
