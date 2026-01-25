/**
 * @module componentProps
 * @description Component Props Interfaces for Dashboard Components
 * 
 * This module defines TypeScript interfaces for all dashboard component props in the
 * Cartographer plugin. These interfaces establish clear contracts between parent
 * components and reusable dashboard components, ensuring type safety and consistency.
 * 
 * ## Architecture Pattern: BaseComponentProps
 * 
 * All dashboard components extend `BaseComponentProps`, which provides the three
 * core props required by every component:
 * - `items` - The catalog items to display/analyze
 * - `schema` - The library schema defining field types and configuration
 * - `settings` - The complete plugin settings object
 * 
 * This pattern ensures:
 * - **Consistency**: All components receive the same core data
 * - **Type Safety**: TypeScript enforces the presence of required props
 * - **DRY Principle**: No repetition of common props across interfaces
 * - **Extensibility**: Components add specific props via interface extension
 * 
 * ```typescript
 * // Base pattern
 * export interface BaseComponentProps {
 *   items: CatalogItem[];
 *   schema: CatalogSchema;
 *   settings: CartographerSettings;
 * }
 * 
 * // Component-specific extensions
 * export interface StatusDashboardProps extends BaseComponentProps {
 *   statusField: string;           // Component-specific prop
 *   onStatusClick?: (status: string) => void;  // Component-specific callback
 * }
 * ```
 * 
 * ## Component Props Interfaces
 * 
 * ### Core Components
 * - **BaseComponentProps** - Base interface with common props (items, schema, settings)
 * - **FilterBarProps** - Filter interface with layout and callback
 * - **StatusDashboardProps** - Status grouping dashboard with statistics
 * - **PublicationDashboardProps** - Publication-specific works view
 * - **WorksTableProps** - Sortable, paginated table component
 * 
 * ### Supporting Types
 * - **FilterState** - Current filter values mapping
 * 
 * ## Usage Pattern
 * 
 * ### Defining Component Props
 * ```typescript
 * import { BaseComponentProps } from '../types';
 * 
 * // Extend base for component-specific props
 * export interface MyDashboardProps extends BaseComponentProps {
 *   customField: string;
 *   onCustomAction?: () => void;
 * }
 * ```
 * 
 * ### Using in Components
 * ```typescript
 * import { StatusDashboardProps } from '../types';
 * 
 * export function StatusDashboard(props: StatusDashboardProps) {
 *   // Destructure base props and component-specific props
 *   const { items, schema, settings, statusField, onStatusClick } = props;
 *   
 *   // Component implementation...
 * }
 * ```
 * 
 * ### Parent Component Integration
 * ```typescript
 * import { StatusDashboardProps } from '../types';
 * import { h } from 'preact';
 * 
 * // In parent render function
 * const statusProps: StatusDashboardProps = {
 *   items: catalogItems,        // From BaseComponentProps
 *   schema: librarySchema,       // From BaseComponentProps
 *   settings: pluginSettings,    // From BaseComponentProps
 *   statusField: 'catalog-status',  // Component-specific
 *   onStatusClick: handleStatusClick  // Component-specific callback
 * };
 * 
 * return h(StatusDashboard, statusProps);
 * ```
 * 
 * ## Component Interaction Patterns
 * 
 * ### Callback Props
 * Most components accept optional callback props for user interactions:
 * - `onStatusClick` - User clicks a status group
 * - `onWorkClick` - User clicks a work item
 * - `onFilter` - User changes filter values
 * - `onSort` - User changes table sort
 * - `onPageChange` - User navigates to different page
 * 
 * These callbacks enable parent components to:
 * - Update application state
 * - Navigate to different views
 * - Filter/sort data
 * - Track analytics
 * 
 * ### Configuration Props
 * Components read their configuration from `settings.dashboards.[componentName]`:
 * ```typescript
 * function StatusDashboard({ settings }: StatusDashboardProps) {
 *   const config = settings.dashboards.statusDashboard;
 *   const showStats = config.displayStats;
 *   const sortBy = config.sortBy;
 *   // ...
 * }
 * ```
 * 
 * ## Design Principles
 * 
 * 1. **Single Source of Truth**: All components receive the same `items`, `schema`, and `settings`
 * 2. **Controlled Components**: Parent manages state, components render and report changes
 * 3. **Separation of Concerns**: Components handle display, parents handle state and logic
 * 4. **Type Safety**: All props are strongly typed with comprehensive documentation
 * 5. **Consistent Patterns**: All components follow the same structural patterns
 * 
 * @see {@link BaseComponentProps} - Base interface for all dashboard components
 * @see {@link CatalogItem} - Data structure for catalog items
 * @see {@link CatalogSchema} - Schema structure with field definitions
 * @see {@link CartographerSettings} - Complete plugin settings interface
 */


import { CatalogItem } from './catalogItem';
import {
	CatalogSchema,
	CartographerSettings
} from './settings';

/**
 * Props for the BaseComponent wrapper component.
 * 
 * This wrapper component sits between the main view and the WorksTable component,
 * dynamically generating table configuration based on the active library's schema.
 * It handles the translation from schema definitions to table display settings.
 * 
 * **Usage Pattern:**
 * The ConfigurableWorksTable receives raw items and schema, then:
 * 1. Reads schema field definitions to determine which columns to show
 * 2. Applies visibility and sortability rules from schema
 * 3. Passes processed configuration to the underlying WorksTable component
 * 
 * @interface BaseComponentProps
 * 
 * @property {CatalogItem[]} items - All items from the active library to display in the table.
 *   These items are typically pre-filtered by the parent component if needed.
 * 
 * @property {CatalogSchema} schema - Library schema containing field definitions, types,
 *   and display configuration. Used to determine which fields are visible, sortable,
 *   and how they should be rendered.
 * 
 * @property {CartographerSettings} settings - Complete plugin settings object containing
 *   dashboard configurations, UI preferences, and table-specific settings like
 *   pagination, default sort order, and column widths.
 * 
 * @example
 * ```typescript
 * // In a parent component or view
 * const props: BaseComponentProps = {
 *   items: catalogItems,
 *   schema: activeLibrarySchema,
 *   settings: pluginSettings
 * };
 * 
 * h(ConfigurableWorksTable, props)
 * ```
 * 
 * @see {@link WorksTableProps} for the underlying table component props
 * @see {@link CatalogSchema} for schema structure
 */
export interface BaseComponentProps {
	/** All items from active library */
	items: CatalogItem[];
	/** Library schema with field definitions */
	schema: CatalogSchema;
	/** Full settings object (provides component configuration) */
	settings: CartographerSettings;
}

/**
 * Props for the FilterBar component.
 * 
 * The FilterBar provides a configurable interface for filtering catalog items
 * based on various field criteria. It supports multiple filter types (select,
 * checkbox, range, text) and can be displayed in different layouts.
 * 
 * **Filter Processing:**
 * 1. Component reads filter definitions from `settings.dashboards.filterBar`
 * 2. Analyzes `items` to populate filter options (e.g., unique status values)
 * 3. User interacts with filters, component applies filter logic
 * 4. Calls `onFilter` callback with the filtered subset of items
 * 
 * **Layout Modes:**
 * - `vertical`: Stacked filters, good for sidebars
 * - `horizontal`: Inline filters, good for top bars
 * - `dropdown`: Compact dropdown menu, good for mobile
 * 
 * @interface FilterBarProps
 * 
 * This interface extends `BaseComponentProps`, inheriting the core props:
 * - `items`: Catalog items to filter
 * - `schema`: Library schema for field definitions
 * - `settings`: Plugin settings for configuration
 * 
 * @property {function} onFilter - Callback fired when filter values change. Receives
 *   the filtered subset of items. Parent component typically uses this to update
 *   the displayed list or table.
 * 
 * @property {('vertical'|'horizontal'|'dropdown')} [filterLayout] - Optional layout mode
 *   override. If not provided, uses layout from settings configuration.
 * 
 * @example
 * ```typescript
 * const [filteredItems, setFilteredItems] = useState(allItems);
 * 
 * const filterBarProps: FilterBarProps = {
 *   items: allItems,
 *   schema: librarySchema,
 *   settings: pluginSettings,
 *   onFilter: (filtered) => setFilteredItems(filtered),
 *   filterLayout: 'horizontal'
 * };
 * 
 * h(FilterBar, filterBarProps)
 * ```
 * 
 * @see {@link FilterDefinition} in settings.ts for filter configuration structure
 */
export interface FilterBarProps extends BaseComponentProps {
	/** Callback fired when filters change with filtered items */
	onFilter: (filtered: CatalogItem[]) => void;
	/** Optional layout mode: 'vertical', 'horizontal', or 'dropdown' */
	filterLayout?: 'vertical' | 'horizontal' | 'dropdown';
}

/**
 * Filter state object tracking current filter values.
 * 
 * This interface represents the current state of all active filters in the FilterBar.
 * Each key corresponds to a schema field key, and the value represents the current
 * filter selection for that field.
 * 
 * **Value Types by Filter Type:**
 * - **select filter**: `string` - single selected value
 * - **checkbox filter**: `string[]` - array of selected values (OR logic)
 * - **range filter**: `{ min: number, max: number }` - numeric range
 * - **text filter**: `string` - search text for substring matching
 * 
 * @interface FilterState
 * 
 * @property {unknown} [fieldKey] - Filter value for a specific field. The type varies
 *   based on the filter type defined in the filter configuration.
 * 
 * @example
 * ```typescript
 * const filterState: FilterState = {
 *   'catalog-status': 'published',           // select: single value
 *   'authors': ['Smith', 'Jones', 'Brown'],  // checkbox: multiple values
 *   'word-count': { min: 1000, max: 5000 },  // range: numeric bounds
 *   'title': 'cosmic'                        // text: substring search
 * };
 * ```
 * 
 * @see {@link FilterBarProps} for how this state is used
 */
export interface FilterState {
	[fieldKey: string]: unknown;
}

/**
 * Props for the PublicationDashboard component.
 * 
 * The PublicationDashboard displays all works associated with a specific publication,
 * providing statistics, grouping, and detailed work listings. It filters items by
 * a foreign key field (e.g., 'publications') and shows publication-specific metrics.
 * 
 * **Component Features:**
 * - Filters items to show only those linked to the specified publication
 * - Displays aggregate statistics (total works, word counts, year ranges)
 * - Groups works by status or other configured field
 * - Provides responsive table (desktop) and card (mobile) layouts
 * - Supports clickable work items for navigation
 * 
 * **Configuration:**
 * Uses `settings.dashboards.publicationDashboard` for:
 * - `foreignKeyField`: Field that references publications (e.g., 'publications')
 * - `displayColumns`: Which fields to show in the table
 * - `enabled`: Whether the dashboard is active
 * 
 * @interface PublicationDashboardProps
 * 
 * This interface extends `BaseComponentProps`, inheriting the core props:
 * - `items`: Catalog items to filter
 * - `schema`: Library schema for field definitions
 * - `settings`: Plugin settings for configuration
 * 
 * @property {string} publicationName - Name of the publication to display works for.
 *   This value is matched against the foreign key field (e.g., items where
 *   `item.getField('publications')` includes this name).
 * 
 * @property {function} [onWorkClick] - Optional callback fired when a work item is
 *   clicked. Receives the work's ID. Parent component typically uses this to navigate
 *   to the work's detail view or open the markdown file.
 * 
 * @example
 * ```typescript
 * const props: PublicationDashboardProps = {
 *   items: allCatalogItems,
 *   schema: librarySchema,
 *   publicationName: 'Weird Tales',
 *   settings: pluginSettings,
 *   onWorkClick: (workId) => {
 *     // Navigate to work detail or open file
 *     console.log('Opening work:', workId);
 *   }
 * };
 * 
 * h(PublicationDashboard, props)
 * ```
 * 
 * @see {@link PublicationDashboardConfig} in settings.ts for configuration structure
 */
export interface PublicationDashboardProps extends BaseComponentProps {
	/** Name of the publication to display works for */
	publicationName: string;
	/** Optional: click handler for individual works */
	onWorkClick?: (workId: string) => void;
}

/**
 * Props for the StatusDashboard component.
 * 
 * The StatusDashboard provides an aggregate view of catalog items grouped by
 * a status field (or any other categorical field). It displays counts, percentages,
 * and optional statistics like word counts and year ranges for each status group.
 * 
 * **Component Features:**
 * - Groups items by any categorical field (typically 'catalog-status')
 * - Calculates and displays configurable statistics per group
 * - Supports multiple display modes (count, percentage, year range, average words)
 * - Provides responsive layouts (table for desktop, cards for mobile)
 * - Optional total row showing aggregate statistics
 * - Clickable status rows for filtering by status
 * 
 * **Configuration:**
 * Uses `settings.dashboards.statusDashboard` for:
 * - `displayStats`: Which statistics to show ('count', 'percentage', 'yearRange', 'averageWords')
 * - `showAggregateStatistics`: Whether to display a total row
 * - `sortBy`: How to order status groups ('alphabetical', 'count-desc', 'count-asc')
 * - `wordCountField`: Field key for word count calculations
 * - `yearField`: Field key for year range calculations
 * 
 * @interface StatusDashboardProps
 * 
 * This interface extends `BaseComponentProps`, inheriting the core props:
 * - `items`: Catalog items to filter
 * - `schema`: Library schema for field definitions
 * - `settings`: Plugin settings for configuration
 * 
 * @property {string} statusField - Field key to group items by (e.g., 'catalog-status',
 *   'workflow-stage', 'review-status'). This field should be categorical (string, boolean,
 *   or number) rather than continuous.
 * 
 * @property {function} [onStatusClick] - Optional callback fired when a status row is
 *   clicked. Receives the status value as a string. Parent component typically uses this
 *   to filter the works table to show only items with the clicked status.
 * 
 * @example
 * ```typescript
 * const props: StatusDashboardProps = {
 *   items: allCatalogItems,
 *   schema: librarySchema,
 *   settings: pluginSettings,
 *   statusField: 'catalog-status',
 *   onStatusClick: (status) => {
 *     // Filter works table to show only this status
 *     console.log('Filter by status:', status);
 *   }
 * };
 * 
 * h(StatusDashboard, props)
 * ```
 * 
 * @example
 * ```typescript
 * // Configuration example in settings
 * const settings: CartographerSettings = {
 *   // ...
 *   dashboards: {
 *     statusDashboard: {
 *       enabled: true,
 *       groupByField: 'catalog-status',
 *       displayStats: ['count', 'percentage', 'averageWords'],
 *       showAggregateStatistics: true,
 *       sortBy: 'count-desc'
 *     }
 *   }
 * };
 * ```
 * 
 * @see {@link StatusDashboardConfig} in settings.ts for configuration structure
 * @see {@link StatusGroup} in filters.ts for the statistics data structure
 */
export interface StatusDashboardProps extends BaseComponentProps {
	/** Which field to group by (usually catalog-status) */
	statusField: string;
	/** Optional: click handler for filtering by status */
	onStatusClick?: (status: string) => void;
}

/**
 * Props for the WorksTable component.
 * 
 * The WorksTable is the primary tabular view for displaying catalog items. It provides
 * a sortable, paginated table with configurable columns based on the library schema.
 * The component handles all table interactions (sorting, pagination) and reports state
 * changes back to the parent via callbacks.
 * 
 * **Component Features:**
 * - Displays items in a sortable table with schema-defined columns
 * - Supports ascending/descending sort on any sortable column
 * - Provides pagination with configurable items per page
 * - Formats field values according to their types (dates, arrays, booleans, etc.)
 * - Responsive design with optional compact mode
 * - Clickable rows for navigation to item details
 * 
 * **Sorting:**
 * Sorting is controlled by `sortColumn` and `sortDesc` props. When a user clicks
 * a column header, the component calls `onSort` with the new sort state. The parent
 * component is responsible for actually sorting the items and passing the sorted
 * array back to the table.
 * 
 * **Pagination:**
 * Pagination is controlled by the `currentPage` prop and `settings.ui.itemsPerPage`.
 * When the user changes pages, the component calls `onPageChange`. The parent is
 * responsible for calculating which items to display based on the current page.
 * 
 * @interface WorksTableProps
 * 
 * This interface extends `BaseComponentProps`, inheriting the core props:
 * - `items`: Catalog items to filter
 * - `schema`: Library schema for field definitions
 * - `settings`: Plugin settings for configuration
 * 
 * @property {string} [sortColumn] - Field key of the currently sorted column (e.g.,
 *   'title', 'word-count'). If not provided, uses `settings.ui.defaultSortColumn`.
 * 
 * @property {boolean} [sortDesc] - Sort direction: `true` for descending, `false` for
 *   ascending. If not provided, uses `settings.ui.defaultSortDesc`.
 * 
 * @property {function} [onSort] - Optional callback fired when user clicks a column
 *   header to change sort. Receives the new sort column key and direction. Parent
 *   should update its sort state and re-sort items.
 * 
 * @property {number} [currentPage] - Current page number (0-indexed). Used to display
 *   the correct page indicator in the pagination controls. Defaults to 0.
 * 
 * @property {function} [onPageChange] - Optional callback fired when user navigates
 *   to a different page. Receives the new page number (0-indexed). Parent should
 *   update its page state and recalculate which items to display.
 * 
 * @example
 * ```typescript
 * const [sortColumn, setSortColumn] = useState('title');
 * const [sortDesc, setSortDesc] = useState(false);
 * const [currentPage, setCurrentPage] = useState(0);
 * 
 * // Calculate which items to show
 * const itemsPerPage = settings.ui.itemsPerPage;
 * const startIdx = currentPage * itemsPerPage;
 * const endIdx = startIdx + itemsPerPage;
 * 
 * // Sort and paginate items
 * const sortedItems = sortItems(allItems, sortColumn, sortDesc);
 * const pageItems = sortedItems.slice(startIdx, endIdx);
 * 
 * const props: WorksTableProps = {
 *   items: pageItems,
 *   schema: librarySchema,
 *   settings: pluginSettings,
 *   sortColumn,
 *   sortDesc,
 *   onSort: (column, desc) => {
 *     setSortColumn(column);
 *     setSortDesc(desc);
 *     setCurrentPage(0); // Reset to first page on sort change
 *   },
 *   currentPage,
 *   onPageChange: setCurrentPage
 * };
 * 
 * h(WorksTable, props)
 * ```
 * 
 * @example
 * ```typescript
 * // Configuration example in settings
 * const settings: CartographerSettings = {
 *   // ...
 *   dashboards: {
 *     worksTable: {
 *       enabled: true,
 *       defaultColumns: ['title', 'authors', 'word-count', 'catalog-status'],
 *       enablePagination: true,
 *       maxRows: 50
 *     }
 *   },
 *   ui: {
 *     itemsPerPage: 20,
 *     defaultSortColumn: 'title',
 *     defaultSortDesc: false,
 *     compactMode: false
 *   }
 * };
 * ```
 * 
 * @see {@link WorksTableConfig} in settings.ts for configuration structure
 * @see {@link CatalogItem} for the item data structure
 */
export interface WorksTableProps extends BaseComponentProps {
	/** Current sort column key (optional) */
	sortColumn?: string;
	/** Sort direction - true for descending, false for ascending (optional) */
	sortDesc?: boolean;
	/** Callback fired when sort column/direction changes */
	onSort?: (column: string, desc: boolean) => void;
	/** Current page number (0-indexed, optional) */
	currentPage?: number;
	/** Callback fired when page changes */
	onPageChange?: (page: number) => void;
}