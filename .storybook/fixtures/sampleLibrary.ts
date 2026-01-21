import type { Library, DatacoreSettings, DashboardConfigs } from '../../src/types';
import { sampleSchema } from './sampleSchema';

/**
 * Sample library configuration for Storybook fixtures.
 * Represents a single library with minimal required fields.
 */
export const sampleLibrary: Library = {
	id: 'pulp-fiction',
	name: 'Pulp Fiction',
	path: 'pulp-fiction/works',
	schema: sampleSchema,
	createdAt: '2026-01-01T00:00:00Z',
};

/**
 * Sample dashboard configurations for the active library.
 */
export const sampleDashboardConfigs: DashboardConfigs = {
	statusDashboard: {
		enabled: true,
		groupByField: 'catalog-status',
		showTotalStats: true,
		showWordCounts: true,
		sortBy: 'alphabetical',
		displayStats: ['count', 'percentage'],
	},
	worksTable: {
		enabled: true,
		defaultColumns: ['title', 'authors', 'year-published', 'word-count', 'catalog-status'],
		enablePagination: true,
		maxRows: 10,
	},
	filterBar: {
		enabled: true,
		filters: [],
		layout: 'vertical',
	},
	publicationDashboard: {
		enabled: false,
		foreignKeyField: 'publication',
		displayColumns: [],
	},
	authorCard: {
		enabled: false,
		authorField: 'authors',
		displayColumns: [],
		showStatistics: false,
	},
	backstagePassPipeline: {
		enabled: false,
		stages: [],
	},
};

/**
 * Sample complete settings object for Storybook fixtures.
 * Represents the full plugin configuration matching DatacoreSettings interface exactly.
 */
export const sampleSettings: DatacoreSettings = {
	libraries: [sampleLibrary],
	activeLibraryId: 'pulp-fiction',
	schema: sampleSchema,
	dashboards: sampleDashboardConfigs,
	ui: {
		itemsPerPage: 10,
		defaultSortColumn: 'title',
		defaultSortDesc: false,
		compactMode: false,
	},
};
