import type { DatacoreSettings } from '../../src/types';
import { catalogSchema } from './catalogSchema';

/**
 * Default DatacoreSettings for testing.
 * Configured with all three Session 3 components enabled.
 */
export const defaultSettings: DatacoreSettings = {
	libraries: [
		{
			id: 'test-library',
			name: 'Test Library',
			path: 'test-works',
			schema: catalogSchema,
			createdAt: new Date().toISOString()
		}
	],
	activeLibraryId: 'test-library',
	schema: catalogSchema,
	dashboards: {
		statusDashboard: {
			enabled: true,
			groupByField: 'catalog-status',
			showTotalStats: true,
			showWordCounts: true
		},
		worksTable: {
			enabled: true,
			defaultColumns: ['title', 'authors', 'year', 'word-count', 'catalog-status'],
			columnWidths: {},
			maxRows: 50,
			enablePagination: true
		},
		filterBar: {
			enabled: true,
			filters: [
				{
					field: 'catalog-status',
					type: 'select',
					label: 'Status',
					enabled: true
				},
				{
					field: 'year',
					type: 'range',
					label: 'Year',
					enabled: true
				},
				{
					field: 'title',
					type: 'text',
					label: 'Title',
					enabled: true
				}
			],
			layout: 'vertical'
		},
		publicationDashboard: {
			enabled: false,
			foreignKeyField: 'publications',
			displayColumns: []
		},
		authorCard: {
			enabled: false,
			authorField: 'authors',
			displayColumns: [],
			showStatistics: false
		},
		backstagePassPipeline: {
			enabled: false,
			stages: []
		}
	},
	ui: {
		itemsPerPage: 10,
		defaultSortColumn: 'title',
		defaultSortDesc: false,
		compactMode: false
	}
};
