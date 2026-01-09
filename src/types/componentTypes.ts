/**
 * Component Type Definitions
 * Props interfaces and types used by dashboard components
 * 
 * Interfaces:
 * - FilterBarProps - props for FilterBar component
 * - FilterState - current filter state mapping
 * - StatusCount - data for a single status count
 * - StatusDashboardProps - props for StatusDashboard component
 * - WorksTableProps - props for WorksTable component
 */


import { CatalogItem } from './dynamicWork';
import {
	CatalogSchema,
	DatacoreSettings
} from './settings';

/**
 * Props for the FilterBar component
 */
export interface FilterBarProps {
	/** All available items (used to populate filter options) */
	items: CatalogItem[];
	/** Library schema with field definitions */
	schema: CatalogSchema;
	/** Full settings object (provides filter configuration) */
	settings: DatacoreSettings;
	/** Callback fired when filters change with filtered items */
	onFilter: (filtered: CatalogItem[]) => void;
	/** Optional layout mode: 'vertical', 'horizontal', or 'dropdown' */
	filterLayout?: 'vertical' | 'horizontal' | 'dropdown';
}

/**
 * Filter state object tracking current filter values
 * Maps field keys to their current filter values (varies by filter type)
 */
export interface FilterState {
	[fieldKey: string]: unknown;
}

/**
 * Status count data for a single status value
 */
export interface StatusCount {
	/** Status value (string representation) */
	status: string;
	/** Count of items with this status */
	count: number;
	/** Percentage of total items */
	percentage: number;
}

/**
 * Props for the StatusDashboard component
 */
export interface StatusDashboardProps {
	/** All items from active library */
	items: CatalogItem[];
	/** Library schema with field definitions */
	schema: CatalogSchema;
	/** Full settings object (provides component configuration) */
	settings: DatacoreSettings;
	/** Which field to group by (usually catalog-status) */
	statusField: string;
	/** Optional: click handler for filtering by status */
	onStatusClick?: (status: string) => void;
}

/**
 * Props for the WorksTable component
 */
export interface WorksTableProps {
	/** All items to display in the table */
	items: CatalogItem[];
	/** Library schema with field definitions */
	schema: CatalogSchema;
	/** Full settings object (provides component configuration) */
	settings: DatacoreSettings;
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