/**
 * Settings and Configuration Type Definitions
 * 
 * Defines the complete settings structure for the Cartographer plugin, including
 * library schemas, dashboard configurations, and UI preferences. These types form
 * the contract between the plugin's settings system and all components.
 * 
 * Interfaces:
 * - AuthorCardConfig - configuration for the Author Card component
 * - BackstagePassPipelineConfig - configuration for the Backstage Pass publication pipeline
 * - CatalogSchema - schema definition for a catalog/library
 * - DashboardConfigs - configurations for all dashboards and components
 * - CartographerSettings - root settings object for Cartographer plugin
 * - FilterBarConfig - configuration for the Filter Bar component
 * - FilterDefinition - definition of a filter in the Filter Bar
 * - Library - configuration for a single library/catalog
 * - PipelineStage - definition of a stage in the Backstage Pass pipeline
 * - PublicationDashboardConfig - configuration for the Publication dashboard
 * - SchemaField - definition of an individual field in the catalog schema
 * - StatusDashboardConfig - configuration for the Status/Pipeline dashboard
 * - WorksTableConfig - configuration for the Works table view
 * 
 * **Architecture Overview:**
 * - {@link CartographerSettings} is the root settings object stored in plugin storage
 * - {@link Library} defines individual catalogs with their own schemas
 * - {@link CatalogSchema} defines the field structure for a library
 * - {@link DashboardConfigs} controls visibility and behavior of all dashboards
 * - Individual config interfaces control specific components
 * 
 * **Settings Flow:**
 * 1. Plugin loads {@link CartographerSettings} from Obsidian storage
 * 2. Active library is selected via `activeLibraryId`
 * 3. Active library's schema is copied to `settings.schema` for quick access
 * 4. Components read their configuration from `settings.dashboards.*`
 * 5. UI preferences are read from `settings.ui.*`
 * 
 * @module settings
 * 
 * @example
 * ```typescript
 * // Accessing settings in a component
 * import { CartographerSettings } from '../types';
 * 
 * function MyComponent(settings: CartographerSettings) {
 *   const schema = settings.schema;
 *   const dashboardConfig = settings.dashboards.statusDashboard;
 *   const itemsPerPage = settings.ui.itemsPerPage;
 * }
 * ```
 */

/**
 * Configuration for the Author Card component.
 * 
 * The Author Card displays information about individual authors, including
 * their works, statistics, and metadata. It can show author-specific fields
 * and aggregate data across all works by that author.
 * 
 * **Component Behavior:**
 * - Extracts author names from the configured `authorField`
 * - Groups works by author for statistical analysis
 * - Displays configurable columns from the schema
 * - Shows aggregate statistics (total works, word counts, etc.)
 * 
 * **Common Use Cases:**
 * - Author portfolio pages
 * - Contributor statistics
 * - Co-author relationship visualization
 * 
 * @interface AuthorCardConfig
 * @internal
 * 
 * @property {boolean} enabled - Whether the author card component is enabled.
 *   When false, the component will not render.
 * 
 * @property {string} authorField - Schema field key that contains author names,
 *   typically 'authors'. This field should be of type 'array' or 'wikilink-array'
 *   to support multiple authors per work.
 * 
 * @property {string[]} displayColumns - Array of schema field keys to display
 *   in the author card. These should be fields that make sense at an author level
 *   (e.g., 'word-count', 'publication-date', 'status').
 * 
 * @property {boolean} showStatistics - Whether to show aggregate statistics
 *   such as total works, total word count, average word count per work, and
 *   publication year range for the author.
 * 
 * @example
 * ```typescript
 * const authorCardConfig: AuthorCardConfig = {
 *   enabled: true,
 *   authorField: 'authors',
 *   displayColumns: ['title', 'word-count', 'year-published'],
 *   showStatistics: true
 * };
 * ```
 * 
 * @see {@link CatalogSchema} for field definitions
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
 * 
 * The Backstage Pass pipeline manages a multi-stage review and approval workflow
 * for works moving from draft to publication. Each stage can have custom filter
 * logic and display different fields relevant to that stage.
 * 
 * **Pipeline Stages:**
 * Works move through sequential stages (e.g., draft → review → copyedit → published).
 * Each stage defines:
 * - Filter logic to determine which works belong in that stage
 * - Display fields relevant to that stage's workflow
 * 
 * **Use Cases:**
 * - Editorial review processes
 * - Multi-step approval workflows
 * - Submission tracking systems
 * - Quality control pipelines
 * 
 * @interface BackstagePassPipelineConfig
 * @internal
 * 
 * @property {boolean} enabled - Whether the backstage pass pipeline is enabled.
 *   When false, the pipeline view will not be available.
 * 
 * @property {PipelineStage[]} stages - Array of pipeline stages in sequential order.
 *   Each stage defines the filter logic for including works and which fields to display.
 *   Works typically progress through stages from first to last.
 * 
 * @example
 * ```typescript
 * const pipelineConfig: BackstagePassPipelineConfig = {
 *   enabled: true,
 *   stages: [
 *     {
 *       name: 'Draft',
 *       filterLogic: 'item.status === "draft"',
 *       displayFields: ['title', 'word-count', 'last-modified']
 *     },
 *     {
 *       name: 'Review',
 *       filterLogic: 'item.status === "in-review"',
 *       displayFields: ['title', 'reviewer', 'review-deadline']
 *     },
 *     {
 *       name: 'Published',
 *       filterLogic: 'item.status === "published"',
 *       displayFields: ['title', 'publication', 'publish-date']
 *     }
 *   ]
 * };
 * ```
 * 
 * @see {@link PipelineStage} for stage definition structure
 */
export interface BackstagePassPipelineConfig {
	/** Whether the backstage pass pipeline is enabled */
	enabled: boolean;
	/** Stages in the publication pipeline (e.g., draft, review, approved) */
	stages: PipelineStage[];
}

/**
 * Root settings object for the Cartographer plugin.
 * 
 * This is the top-level settings structure stored in Obsidian's plugin storage.
 * It manages multiple libraries, tracks the active library, and stores all
 * dashboard configurations and UI preferences.
 * 
 * **Settings Lifecycle:**
 * 1. **Plugin Initialization**: Settings loaded from storage or defaults created
 * 2. **Library Management**: Users create, switch, and configure libraries
 * 3. **Active Library**: One library is active; its schema is copied to `schema`
 * 4. **Component Usage**: Components read from `dashboards.*` and `ui.*`
 * 5. **Settings Save**: Changes persisted to Obsidian storage
 * 
 * **Multi-Library Support:**
 * Users can maintain multiple independent libraries (catalogs), each with:
 * - Its own schema and field definitions
 * - Its own directory of markdown files
 * - Completely separate data and organization
 * 
 * **Active Library Pattern:**
 * The `schema` property is a copy of the active library's schema for quick access.
 * This avoids repeated lookups through the `libraries` array. When switching
 * active libraries, the `schema` property is updated.
 * 
 * @interface CartographerSettings
 * 
 * @property {Library[]} libraries - Array of all configured libraries. Each library
 *   represents a separate catalog with its own schema, directory, and items.
 *   Can be empty if user hasn't created any libraries yet.
 * 
 * @property {string | null} activeLibraryId - ID of the currently active library,
 *   or null if no library is selected. The active library determines which items
 *   are loaded and displayed. Must match a library ID in the `libraries` array.
 * 
 * @property {CatalogSchema} schema - Schema of the active library (a copy from the
 *   active Library object). This is the schema used by all components and views.
 *   Updated whenever the active library changes.
 * 
 * @property {DashboardConfigs} dashboards - Dashboard and component configurations
 *   controlling visibility and behavior of all UI components. Settings apply
 *   globally across all libraries.
 * 
 * @property {Object} ui - UI preferences and display options that apply globally.
 * 
 * @property {number} ui.itemsPerPage - Number of items to display per page in
 *   tables and lists. Affects pagination controls and performance. Typical values
 *   range from 10-100.
 * 
 * @property {string} ui.defaultSortColumn - Default field to sort by when loading
 *   tables (usually 'title' or 'date-modified'). Should be a valid field key from
 *   the schema.
 * 
 * @property {boolean} ui.defaultSortDesc - Whether to sort descending by default.
 *   `true` for descending (Z→A, newest→oldest), `false` for ascending (A→Z,
 *   oldest→newest).
 * 
 * @property {boolean} ui.compactMode - Whether to use compact mode in UI with
 *   reduced spacing, smaller fonts, and condensed layouts. Useful for fitting
 *   more information on screen.
 * 
 * @example
 * ```typescript
 * const settings: CartographerSettings = {
 *   libraries: [
 *     {
 *       id: "pulp-fiction",
 *       name: "Pulp Fiction",
 *       path: "pulp-fiction/works",
 *       schema: {
 *         catalogName: "Pulp Fiction",
 *         fields: [...],
 *         coreFields: { titleField: 'title', statusField: 'catalog-status' }
 *       },
 *       createdAt: "2026-01-01T00:00:00Z"
 *     },
 *     {
 *       id: "research-papers",
 *       name: "Research Papers",
 *       path: "research/papers",
 *       schema: {...},
 *       createdAt: "2026-01-15T00:00:00Z"
 *     }
 *   ],
 *   activeLibraryId: "pulp-fiction",
 *   schema: {
 *     // Copy of pulp-fiction library's schema
 *     catalogName: "Pulp Fiction",
 *     fields: [...],
 *     coreFields: { titleField: 'title', statusField: 'catalog-status' }
 *   },
 *   dashboards: {
 *     statusDashboard: { enabled: true, groupByField: 'catalog-status', ... },
 *     worksTable: { enabled: true, defaultColumns: [...], ... },
 *     // ... other dashboard configs
 *   },
 *   ui: {
 *     itemsPerPage: 20,
 *     defaultSortColumn: "title",
 *     defaultSortDesc: false,
 *     compactMode: false
 *   }
 * };
 * ```
 * 
 * @see {@link Library} for library structure
 * @see {@link CatalogSchema} for schema definition
 * @see {@link DashboardConfigs} for dashboard configuration
 */
export interface CartographerSettings {
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
 * Catalog schema definition—defines all available fields for a library.
 * 
 * The schema is the contract between markdown frontmatter and the plugin,
 * specifying what fields exist, their types, and how they should be handled.
 * Each library has its own schema, allowing different libraries to track
 * different types of information.
 * 
 * **Schema Design Principles:**
 * - Define only the fields you need for your catalog
 * - Use consistent field keys across your vault
 * - Set appropriate types for proper parsing and display
 * - Mark fields as visible/filterable/sortable based on usage
 * 
 * **Field Categories:**
 * - **metadata**: Basic identifying information (title, authors, dates)
 * - **status**: Workflow and publication state
 * - **workflow**: Review, approval, and process tracking
 * - **content**: Content characteristics (word count, genre, themes)
 * - **custom**: Library-specific fields
 * 
 * **Core Fields:**
 * The `coreFields` object identifies fields that have special meaning:
 * - `titleField`: Primary display name for items
 * - `idField`: Unique identifier (defaults to titleField if not specified)
 * - `statusField`: Tracks publication/workflow state (optional)
 * 
 * @interface CatalogSchema
 * 
 * @property {string} catalogName - Display name for this catalog shown in the UI
 *   (e.g., "Pulp Fiction Library", "Research Papers", "Personal Journal").
 * 
 * @property {SchemaField[]} fields - Array of field definitions that define all
 *   available fields for this catalog. Each field specifies its key, type, label,
 *   and display properties. Order affects default display order in tables.
 * 
 * @property {Object} coreFields - Core fields that have special meaning to the plugin.
 * 
 * @property {string} coreFields.titleField - Field key that serves as the display
 *   title for items (usually 'title'). This field is used for item labels, links,
 *   and primary identification throughout the UI.
 * 
 * @property {string} [coreFields.idField] - Field key that uniquely identifies items.
 *   If not specified, defaults to `titleField`. Use a separate ID field if titles
 *   are not guaranteed to be unique.
 * 
 * @property {string} [coreFields.statusField] - Field key that tracks publication
 *   or review status (e.g., 'catalog-status', 'workflow-stage'). Used by the
 *   StatusDashboard and workflow components. Optional.
 * 
 * @example
 * ```typescript
 * const schema: CatalogSchema = {
 *   catalogName: "Pulp Fiction",
 *   fields: [
 *     {
 *       key: 'title',
 *       label: 'Title',
 *       type: 'string',
 *       category: 'metadata',
 *       visible: true,
 *       filterable: true,
 *       sortable: true,
 *       sortOrder: 1
 *     },
 *     {
 *       key: 'authors',
 *       label: 'Authors',
 *       type: 'wikilink-array',
 *       category: 'metadata',
 *       visible: true,
 *       filterable: true,
 *       sortable: true,
 *       arrayItemType: 'wikilink',
 *       sortOrder: 2
 *     },
 *     {
 *       key: 'word-count',
 *       label: 'Word Count',
 *       type: 'number',
 *       category: 'content',
 *       visible: true,
 *       filterable: true,
 *       sortable: true,
 *       sortOrder: 3
 *     },
 *     {
 *       key: 'catalog-status',
 *       label: 'Status',
 *       type: 'string',
 *       category: 'status',
 *       visible: true,
 *       filterable: true,
 *       sortable: true,
 *       sortOrder: 4
 *     }
 *   ],
 *   coreFields: {
 *     titleField: 'title',
 *     idField: 'title',
 *     statusField: 'catalog-status'
 *   }
 * };
 * ```
 * 
 * @see {@link SchemaField} for individual field definition structure
 * @see {@link Library} for how schemas are associated with libraries
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
 * 
 * This interface aggregates all dashboard and component configurations into a
 * single object. Each property controls a specific dashboard or UI component,
 * allowing fine-grained control over what's displayed and how it behaves.
 * 
 * **Configuration Philosophy:**
 * - Each component can be independently enabled/disabled
 * - Components respect their configuration but provide sensible defaults
 * - Settings are validated against the active schema before use
 * 
 * **Available Dashboards:**
 * - **statusDashboard**: Aggregate status/workflow overview
 * - **worksTable**: Primary table view for catalog items
 * - **filterBar**: Filtering interface for catalog items
 * - **publicationDashboard**: Publication-specific work listings
 * - **authorCard**: Author information and statistics
 * - **backstagePassPipeline**: Multi-stage workflow management
 * 
 * @interface DashboardConfigs
 * 
 * @property {StatusDashboardConfig} statusDashboard - Configuration for the
 *   Status/Pipeline dashboard that shows item counts grouped by status field.
 * 
 * @property {WorksTableConfig} worksTable - Configuration for the Works table
 *   view that displays catalog items in a sortable, paginated table.
 * 
 * @property {FilterBarConfig} filterBar - Configuration for the filter bar
 *   component that provides filtering controls for catalog items.
 * 
 * @property {PublicationDashboardConfig} publicationDashboard - Configuration
 *   for the Publication dashboard that shows works for a specific publication.
 * 
 * @property {AuthorCardConfig} authorCard - Configuration for the Author card
 *   component that displays author information and statistics.
 * 
 * @property {BackstagePassPipelineConfig} backstagePassPipeline - Configuration
 *   for the Backstage Pass pipeline for multi-stage workflow management.
 * 
 * @example
 * ```typescript
 * const dashboards: DashboardConfigs = {
 *   statusDashboard: {
 *     enabled: true,
 *     groupByField: 'catalog-status',
 *     displayStats: ['count', 'percentage', 'averageWords'],
 *     showAggregateStatistics: true,
 *     showWordCounts: true
 *   },
 *   worksTable: {
 *     enabled: true,
 *     defaultColumns: ['title', 'authors', 'word-count', 'catalog-status'],
 *     enablePagination: true
 *   },
 *   filterBar: {
 *     enabled: true,
 *     layout: 'horizontal',
 *     filters: []
 *   },
 *   publicationDashboard: {
 *     enabled: true,
 *     foreignKeyField: 'publications',
 *     displayColumns: ['title', 'authors', 'year-published']
 *   },
 *   authorCard: {
 *     enabled: false,
 *     authorField: 'authors',
 *     displayColumns: [],
 *     showStatistics: false
 *   },
 *   backstagePassPipeline: {
 *     enabled: false,
 *     stages: []
 *   }
 * };
 * ```
 * 
 * @see Individual config interfaces for detailed property documentation
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
 * Filter bar configuration.
 * 
 * Controls which filters are available in the FilterBar component and how they
 * are displayed. Filters allow users to narrow down catalog items based on
 * field values.
 * 
 * **Filter Types:**
 * - **select**: Dropdown menu for single selection
 * - **checkbox**: Multiple checkboxes for OR logic selection
 * - **range**: Min/max inputs for numeric ranges
 * - **text**: Text input for substring matching
 * 
 * **Layout Modes:**
 * - **vertical**: Stacked layout, good for sidebars
 * - **horizontal**: Inline layout, good for top toolbars
 * - **dropdown**: Compact dropdown menu, good for mobile
 * 
 * @interface FilterBarConfig
 * @internal
 * 
 * @property {boolean} enabled - Whether the filter bar component is enabled.
 *   When false, no filtering UI will be displayed.
 * 
 * @property {FilterDefinition[]} filters - Array of filter definitions that
 *   determine which fields can be filtered and how. Each filter specifies
 *   the field, filter type, label, and options.
 * 
 * @property {('vertical'|'horizontal'|'dropdown')} layout - Layout mode for
 *   displaying filters. Affects the visual arrangement of filter controls.
 * 
 * @example
 * ```typescript
 * const filterBarConfig: FilterBarConfig = {
 *   enabled: true,
 *   layout: 'horizontal',
 *   filters: [
 *     {
 *       field: 'catalog-status',
 *       type: 'select',
 *       label: 'Status',
 *       enabled: true,
 *       options: ['raw', 'draft', 'published']
 *     },
 *     {
 *       field: 'authors',
 *       type: 'checkbox',
 *       label: 'Authors',
 *       enabled: true,
 *       options: [] // Populated dynamically from items
 *     },
 *     {
 *       field: 'word-count',
 *       type: 'range',
 *       label: 'Word Count',
 *       enabled: true
 *     },
 *     {
 *       field: 'title',
 *       type: 'text',
 *       label: 'Search Title',
 *       enabled: true
 *     }
 *   ]
 * };
 * ```
 * 
 * @see {@link FilterDefinition} for individual filter structure
 * @see {@link FilterBarProps} in componentProps.ts for component usage
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
 * 
 * Specifies how a particular field should be filterable, including the UI
 * control type, display label, and available options. Each filter corresponds
 * to a field in the catalog schema.
 * 
 * **Filter Logic by Type:**
 * - **select**: Exact match on selected value
 * - **checkbox**: OR logic across checked values (item matches any checked value)
 * - **range**: Numeric comparison (value >= min AND value <= max)
 * - **text**: Substring match (case-insensitive contains)
 * 
 * @interface FilterDefinition
 * 
 * @property {string} field - Schema field key to filter on (e.g., 'catalog-status',
 *   'authors', 'word-count'). Must be a valid field key from the catalog schema.
 * 
 * @property {('select'|'checkbox'|'range'|'text')} type - Type of filter UI control
 *   to display. Determines both the visual appearance and the filter logic applied.
 * 
 * @property {string} label - Display label for the filter in the UI. Shown as
 *   the filter's heading or label text.
 * 
 * @property {boolean} enabled - Whether this filter is currently active. Disabled
 *   filters are not shown in the UI and do not affect filtering logic.
 * 
 * @property {string[]} [options] - Available options for select/checkbox filters.
 *   Not used for range or text filters. Can be predefined or populated dynamically
 *   from catalog items (empty array = populate from items).
 * 
 * @example
 * ```typescript
 * // Select filter with predefined options
 * const statusFilter: FilterDefinition = {
 *   field: 'catalog-status',
 *   type: 'select',
 *   label: 'Status',
 *   enabled: true,
 *   options: ['raw', 'draft', 'in-review', 'published']
 * };
 * 
 * // Checkbox filter with dynamic options
 * const authorFilter: FilterDefinition = {
 *   field: 'authors',
 *   type: 'checkbox',
 *   label: 'Authors',
 *   enabled: true,
 *   options: [] // Will be populated from unique author values in items
 * };
 * 
 * // Range filter (no options needed)
 * const wordCountFilter: FilterDefinition = {
 *   field: 'word-count',
 *   type: 'range',
 *   label: 'Word Count',
 *   enabled: true
 * };
 * 
 * // Text filter (no options needed)
 * const titleFilter: FilterDefinition = {
 *   field: 'title',
 *   type: 'text',
 *   label: 'Search Title',
 *   enabled: true
 * };
 * ```
 * 
 * @see {@link FilterBarConfig} for filter bar configuration
 * @see {@link SchemaField} for field definitions
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
 * A library represents a complete catalog of items (works, books, articles, etc.)
 * stored in a specific directory and sharing a common schema. Users can create
 * and maintain multiple libraries for different purposes.
 * 
 * **Library Isolation:**
 * Each library is completely independent:
 * - Has its own schema with custom fields
 * - Stores items in its own directory
 * - Can be switched between via the library selector
 * - Does not share data with other libraries
 * 
 * **Common Library Patterns:**
 * - **Writing Projects**: Fiction library, Non-fiction library, Poetry library
 * - **Research**: Research papers, Book notes, Article clippings
 * - **Publishing**: Submissions tracker, Published works archive
 * - **Personal**: Reading list, Movie catalog, Recipe collection
 * 
 * @interface Library
 * 
 * @property {string} id - Unique identifier for this library (e.g., 'pulp-fiction',
 *   'research-papers'). Used in `activeLibraryId` to identify the active library.
 *   Should be URL-safe and not contain spaces.
 * 
 * @property {string} name - User-friendly display name shown in the library selector
 *   and UI (e.g., 'Pulp Fiction Library', 'My Research Papers'). Can contain spaces
 *   and special characters.
 * 
 * @property {string} path - Vault-relative path where catalog items are stored
 *   (e.g., 'pulp-fiction/works', 'research/papers', 'books/fiction'). All markdown
 *   files in this directory (and subdirectories) with matching frontmatter are
 *   included in the catalog.
 * 
 * @property {CatalogSchema} schema - Schema definition for this library specifying
 *   available fields, their types, and configuration. Each library's schema is
 *   independent and can be customized for its specific use case.
 * 
 * @property {string} createdAt - ISO 8601 timestamp when this library was created
 *   (e.g., '2026-01-01T00:00:00Z'). Used for sorting libraries and tracking creation.
 * 
 * @example
 * ```typescript
 * const library: Library = {
 *   id: "pulp-fiction",
 *   name: "Pulp Fiction Library",
 *   path: "pulp-fiction/works",
 *   schema: {
 *     catalogName: "Pulp Fiction",
 *     fields: [
 *       { key: 'title', label: 'Title', type: 'string', ... },
 *       { key: 'authors', label: 'Authors', type: 'wikilink-array', ... },
 *       { key: 'word-count', label: 'Word Count', type: 'number', ... },
 *       { key: 'catalog-status', label: 'Status', type: 'string', ... }
 *     ],
 *     coreFields: {
 *       titleField: 'title',
 *       idField: 'title',
 *       statusField: 'catalog-status'
 *     }
 *   },
 *   createdAt: "2026-01-01T00:00:00Z"
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Multiple libraries example
 * const libraries: Library[] = [
 *   {
 *     id: 'fiction',
 *     name: 'Fiction Works',
 *     path: 'writing/fiction',
 *     schema: { ... },
 *     createdAt: '2026-01-01T00:00:00Z'
 *   },
 *   {
 *     id: 'research',
 *     name: 'Research Papers',
 *     path: 'research/papers',
 *     schema: { ... },
 *     createdAt: '2026-01-15T00:00:00Z'
 *   }
 * ];
 * ```
 * 
 * @see {@link CatalogSchema} for schema structure
 * @see {@link CartographerSettings} for how libraries are managed
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

/**
 * Pipeline stage definition for Backstage Pass workflow.
 * 
 * Defines a single stage in a multi-stage publication pipeline. Each stage
 * has custom filter logic to determine which works belong in that stage and
 * which fields should be displayed for works in that stage.
 * 
 * **Stage Progression:**
 * Stages typically represent sequential steps in a workflow (e.g., Draft →
 * Review → Copyedit → Published). Works move through stages as their status
 * or other fields change.
 * 
 * **Filter Logic:**
 * The `filterLogic` property can be:
 * - JavaScript expression evaluated against items (e.g., `'item.status === "draft"'`)
 * - Predefined filter name (e.g., `'is-draft'`, `'needs-review'`)
 * 
 * @interface PipelineStage
 * 
 * @property {string} name - Display name for this stage (e.g., 'Draft', 'In Review',
 *   'Copyedit', 'Published'). Shown in the pipeline UI as the stage heading.
 * 
 * @property {string} filterLogic - JavaScript filter expression or predefined filter
 *   name that determines which items belong in this stage. Expression is evaluated
 *   with `item` as the CatalogItem being tested. Examples:
 *   - `'item.status === "draft"'`
 *   - `'item.status === "review" && item.reviewer !== null'`
 *   - `'is-published'` (predefined filter name)
 * 
 * @property {string[]} displayFields - Array of schema field keys to display for
 *   items in this stage. Different stages can show different fields relevant to
 *   their workflow step (e.g., 'reviewer' field in Review stage, 'publish-date'
 *   in Published stage).
 * 
 * @example
 * ```typescript
 * const stages: PipelineStage[] = [
 *   {
 *     name: 'Draft',
 *     filterLogic: 'item.getField("catalog-status") === "draft"',
 *     displayFields: ['title', 'word-count', 'last-modified', 'notes']
 *   },
 *   {
 *     name: 'Review',
 *     filterLogic: 'item.getField("catalog-status") === "in-review"',
 *     displayFields: ['title', 'reviewer', 'review-deadline', 'review-notes']
 *   },
 *   {
 *     name: 'Copyedit',
 *     filterLogic: 'item.getField("catalog-status") === "copyedit"',
 *     displayFields: ['title', 'copyeditor', 'copyedit-deadline']
 *   },
 *   {
 *     name: 'Published',
 *     filterLogic: 'item.getField("catalog-status") === "published"',
 *     displayFields: ['title', 'publication', 'publish-date', 'publication-url']
 *   }
 * ];
 * ```
 * 
 * @see {@link BackstagePassPipelineConfig} for pipeline configuration
 * @see {@link CatalogItem} for item structure used in filter expressions
 */
export interface PipelineStage {
	name: string;
	filterLogic: string; // JavaScript filter expression or predefined name
	displayFields: string[];
}

/**
 * Publication Dashboard configuration.
 * 
 * Controls the Publication Dashboard component, which displays all works
 * associated with a specific publication. Works are linked to publications
 * via a foreign key field (typically 'publications' containing an array of
 * publication names).
 * 
 * **Use Cases:**
 * - Viewing all stories published in a specific magazine
 * - Tracking submissions to a particular publisher
 * - Organizing works by anthology or collection
 * - Managing publication-specific metadata
 * 
 * **Foreign Key Pattern:**
 * The `foreignKeyField` should point to a field that contains publication
 * references, typically:
 * - Type: `array` or `wikilink-array`
 * - Contains: Publication names or wikilinks to publication notes
 * - Allows: Multiple publications per work (e.g., reprints)
 * 
 * @interface PublicationDashboardConfig
 * @internal
 * 
 * @property {boolean} enabled - Whether the publication dashboard is enabled.
 *   When false, publication-specific views will not be available.
 * 
 * @property {string} foreignKeyField - Field that references publications
 *   (e.g., 'publications', 'appeared-in', 'published-by'). This field should
 *   be an array type that can contain multiple publication names.
 * 
 * @property {string[]} displayColumns - Array of schema field keys to display
 *   in the publication dashboard table. Should include fields relevant to
 *   understanding works in publication context (e.g., 'title', 'authors',
 *   'year-published', 'page-count').
 * 
 * @example
 * ```typescript
 * const publicationConfig: PublicationDashboardConfig = {
 *   enabled: true,
 *   foreignKeyField: 'publications',
 *   displayColumns: [
 *     'title',
 *     'authors',
 *     'word-count',
 *     'year-published',
 *     'catalog-status'
 *   ]
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Example schema field for publications foreign key
 * const publicationsField: SchemaField = {
 *   key: 'publications',
 *   label: 'Publications',
 *   type: 'wikilink-array',
 *   arrayItemType: 'wikilink',
 *   category: 'metadata',
 *   visible: true,
 *   filterable: true,
 *   sortable: false,
 *   sortOrder: 10
 * };
 * 
 * // Example frontmatter
 * // ---
 * // title: "The Call of Cthulhu"
 * // publications: ["[[Weird Tales]]", "[[The Best Horror Stories]]"]
 * // ---
 * ```
 * 
 * @see {@link PublicationDashboardProps} in componentProps.ts for component usage
 */
export interface PublicationDashboardConfig {
	enabled: boolean;
	foreignKeyField: string; // Field that references publications (e.g., 'publications')
	displayColumns: string[];
}

/**
 * Individual field definition in a catalog schema.
 * 
 * Defines a single field that can appear in catalog item frontmatter. Each
 * field specifies its data type, display properties, and capabilities
 * (filterable, sortable, etc.).
 * 
 * **Field Types:**
 * - **string**: Text values (titles, names, short text)
 * - **number**: Numeric values (word counts, page numbers, ratings)
 * - **date**: Date/timestamp values (publish dates, deadlines)
 * - **boolean**: True/false values (flags, toggles)
 * - **array**: Lists of strings (tags, genres, keywords)
 * - **wikilink-array**: Lists of wikilinks (authors, publications, related works)
 * - **object**: Complex structured data (rare, for advanced use)
 * 
 * **Categories:**
 * Fields are grouped into categories for organization in settings UI:
 * - **metadata**: Core identifying information (title, authors, dates)
 * - **status**: Publication and workflow state
 * - **workflow**: Review and process tracking
 * - **content**: Content characteristics (word count, genre, themes)
 * - **custom**: User-defined or library-specific fields
 * 
 * **Sort Order:**
 * The `sortOrder` property determines default column order in tables. Lower
 * numbers appear first. Typically: title (1), authors (2), date (3), etc.
 * 
 * @interface SchemaField
 * 
 * @property {string} key - Internal field name that matches the frontmatter key
 *   (e.g., 'title', 'word-count', 'catalog-status'). Should be lowercase with
 *   hyphens, no spaces.
 * 
 * @property {string} label - Display label shown in UI (e.g., 'Title', 'Word Count',
 *   'Status'). Can contain spaces and capitalization.
 * 
 * @property {('string'|'number'|'date'|'boolean'|'array'|'wikilink-array'|'object')} type -
 *   Field type determining how values are parsed, stored, and displayed.
 * 
 * @property {('metadata'|'status'|'workflow'|'content'|'custom')} category - Category
 *   for grouping fields in the settings UI and documentation.
 * 
 * @property {boolean} visible - Whether this field is visible in default table views.
 *   Hidden fields can still be used for filtering and sorting but won't appear in
 *   columns unless explicitly added.
 * 
 * @property {boolean} filterable - Whether this field can be used in filters.
 *   Filterable fields appear in the filter bar and can be used to narrow down items.
 * 
 * @property {boolean} sortable - Whether this field can be used for sorting tables.
 *   Sortable fields show sort indicators in column headers.
 * 
 * @property {('string'|'wikilink')} [arrayItemType] - For array and wikilink-array
 *   types, specifies what type of items the array contains. Required for proper
 *   parsing and display of array contents.
 * 
 * @property {number} sortOrder - Default display order in tables (lower = earlier).
 *   Used to determine column order when no custom order is specified. Typically
 *   ranges from 1-100.
 * 
 * @property {string} [description] - Optional description shown in settings UI
 *   to help users understand what this field is for and how to use it.
 * 
 * @example
 * ```typescript
 * // String field example
 * const titleField: SchemaField = {
 *   key: 'title',
 *   label: 'Title',
 *   type: 'string',
 *   category: 'metadata',
 *   visible: true,
 *   filterable: true,
 *   sortable: true,
 *   sortOrder: 1,
 *   description: 'The title of the work'
 * };
 * 
 * // Number field example
 * const wordCountField: SchemaField = {
 *   key: 'word-count',
 *   label: 'Word Count',
 *   type: 'number',
 *   category: 'content',
 *   visible: true,
 *   filterable: true,
 *   sortable: true,
 *   sortOrder: 5,
 *   description: 'Total word count of the work'
 * };
 * 
 * // Wikilink array field example
 * const authorsField: SchemaField = {
 *   key: 'authors',
 *   label: 'Authors',
 *   type: 'wikilink-array',
 *   arrayItemType: 'wikilink',
 *   category: 'metadata',
 *   visible: true,
 *   filterable: true,
 *   sortable: true,
 *   sortOrder: 2,
 *   description: 'Authors of this work (wikilinks to author notes)'
 * };
 * 
 * // Date field example
 * const publishedField: SchemaField = {
 *   key: 'publish-date',
 *   label: 'Publish Date',
 *   type: 'date',
 *   category: 'metadata',
 *   visible: true,
 *   filterable: true,
 *   sortable: true,
 *   sortOrder: 6,
 *   description: 'Date this work was published'
 * };
 * 
 * // Boolean field example
 * const featuredField: SchemaField = {
 *   key: 'featured',
 *   label: 'Featured',
 *   type: 'boolean',
 *   category: 'status',
 *   visible: false,
 *   filterable: true,
 *   sortable: true,
 *   sortOrder: 20,
 *   description: 'Whether this work is featured'
 * };
 * ```
 * 
 * @see {@link CatalogSchema} for how fields are organized into schemas
 * @see {@link CatalogItem} for how field values are stored and accessed
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
 * Status Dashboard configuration.
 * 
 * Controls the Status Dashboard component, which provides an aggregate view
 * of catalog items grouped by a status field (or any categorical field).
 * Displays counts, percentages, and optional statistics for each status group.
 * 
 * **Dashboard Features:**
 * - Groups items by any categorical field
 * - Calculates multiple statistics per group
 * - Supports custom sorting options
 * - Shows aggregate totals row
 * - Responsive design (table/cards)
 * 
 * **Statistics:**
 * Configurable via `displayStats` array:
 * - **count**: Number of items in each group
 * - **percentage**: Percentage of total items
 * - **yearRange**: Min-max year range for items in group
 * - **averageWords**: Average word count for items in group
 * 
 * **Sorting Options:**
 * - **alphabetical**: Sort groups by status value (A-Z)
 * - **count-desc**: Sort by count, highest first
 * - **count-asc**: Sort by count, lowest first
 * 
 * @interface StatusDashboardConfig
 * @internal
 * 
 * @property {boolean} enabled - Whether the status dashboard is enabled.
 *   When false, the dashboard will not render.
 * 
 * @property {string} groupByField - Field key to group items by (usually
 *   'catalog-status', but can be any categorical field like 'workflow-stage',
 *   'genre', 'publication-status'). Should be a string, number, or boolean field.
 * 
 * @property {boolean} showAggregateStatistics - Whether to display a total summary row
 *   at the bottom of the dashboard showing aggregate statistics across all groups.
 * 
 * @property {boolean} showWordCounts - Whether to include word count statistics
 *   in the dashboard display (total and average word counts per group).
 * 
 * @property {('alphabetical'|'count-desc'|'count-asc')} [sortBy] - How to sort
 *   status groups. Defaults to 'alphabetical' if not specified.
 * 
 * @property {('count'|'percentage'|'yearRange'|'averageWords')[]} [displayStats] -
 *   Array of statistics to display for each group. If not specified, shows
 *   'count' and 'percentage' by default.
 * 
 * @property {string} [wordCountField] - Field key for word count calculations
 *   (e.g., 'word-count', 'length', 'words'). If not specified, attempts to find
 *   a field with 'word' in the label.
 * 
 * @property {string} [yearField] - Field key for year range calculations
 *   (e.g., 'year-published', 'publish-year', 'year'). If not specified, attempts
 *   to find a field with 'year' in the label.
 * 
 * @example
 * ```typescript
 * const statusConfig: StatusDashboardConfig = {
 *   enabled: true,
 *   groupByField: 'catalog-status',
 *   showAggregateStatistics: true,
 *   showWordCounts: true,
 *   sortBy: 'count-desc',
 *   displayStats: ['count', 'percentage', 'averageWords', 'yearRange'],
 *   wordCountField: 'word-count',
 *   yearField: 'year-published'
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Minimal configuration with defaults
 * const minimalConfig: StatusDashboardConfig = {
 *   enabled: true,
 *   groupByField: 'catalog-status',
 *   showAggregateStatistics: false,
 *   showWordCounts: false
 *   // sortBy, displayStats, wordCountField, yearField will use defaults
 * };
 * ```
 * 
 * @see {@link StatusDashboardProps} in componentProps.ts for component usage
 * @see {@link StatusGroup} in filters.ts for statistics structure
 */
export interface StatusDashboardConfig {
	enabled: boolean;
	groupByField: string; // Which field to group by (usually 'catalog-status')
	showAggregateStatistics: boolean;
	showWordCounts: boolean;
	sortBy?: 'alphabetical' | 'count-desc' | 'count-asc';
	displayStats?: ('count' | 'percentage' | 'yearRange' | 'averageWords')[];
	wordCountField?: string;
	yearField?: string;
}

/**
 * Works Table configuration.
 * 
 * Controls the Works Table component, which is the primary tabular view for
 * displaying catalog items. Configures which columns to show, column widths,
 * pagination, and row limits.
 * 
 * **Table Features:**
 * - Sortable columns (click headers to sort)
 * - Pagination with configurable items per page
 * - Customizable column selection and widths
 * - Responsive design with compact mode
 * - Row click for navigation
 * 
 * **Column Configuration:**
 * - `defaultColumns`: Which fields to show by default
 * - `columnWidths`: Optional custom widths per column (e.g., {'title': '300px'})
 * - Columns respect field visibility from schema
 * 
 * @interface WorksTableConfig
 * @internal
 * 
 * @property {boolean} enabled - Whether the works table is enabled.
 *   When false, the table view will not be available.
 * 
 * @property {string[]} defaultColumns - Array of schema field keys to display
 *   as columns (e.g., ['title', 'authors', 'word-count', 'catalog-status']).
 *   Order determines column order from left to right.
 * 
 * @property {Record<string, string>} [columnWidths] - Optional mapping of field
 *   keys to CSS width values (e.g., {'title': '300px', 'word-count': '100px'}).
 *   Columns without specified widths use auto sizing.
 * 
 * @property {number} [maxRows] - Optional maximum number of rows to display
 *   before requiring pagination. If not specified, uses `settings.ui.itemsPerPage`.
 * 
 * @property {boolean} enablePagination - Whether to enable pagination controls.
 *   When false, all items are shown in a single scrollable table (not recommended
 *   for large catalogs).
 * 
 * @example
 * ```typescript
 * const worksTableConfig: WorksTableConfig = {
 *   enabled: true,
 *   defaultColumns: [
 *     'title',
 *     'authors',
 *     'word-count',
 *     'catalog-status',
 *     'year-published'
 *   ],
 *   columnWidths: {
 *     'title': '300px',
 *     'authors': '200px',
 *     'word-count': '100px',
 *     'catalog-status': '120px',
 *     'year-published': '100px'
 *   },
 *   maxRows: 50,
 *   enablePagination: true
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Minimal configuration
 * const minimalConfig: WorksTableConfig = {
 *   enabled: true,
 *   defaultColumns: ['title', 'authors', 'catalog-status'],
 *   enablePagination: true
 *   // columnWidths and maxRows are optional
 * };
 * ```
 * 
 * @see {@link WorksTableProps} in componentProps.ts for component usage
 * @see {@link SchemaField} for field definitions
 */
export interface WorksTableConfig {
	enabled: boolean;
	defaultColumns: string[]; // Which fields to display
	columnWidths?: Record<string, string>;
	maxRows?: number;
	enablePagination: boolean;
}
