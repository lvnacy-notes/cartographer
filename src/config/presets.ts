/**
 * Bundled configuration presets for different catalog types
 */

import { DatacoreSettings } from '../types/settings';

/**
 * PRESET 1: Pulp Fiction Catalog (Default)
 *
 * Assumes:
 * - Directory: /works/
 * - Status field: catalog-status
 * - Author field: authors (array)
 * - Publication field: publications (wikilink-array)
 * - Editorial workflow: bp-candidate, bp-approved
 */
export const PULP_FICTION_PRESET: DatacoreSettings = {
	version: '1.0.0',
	presetName: 'pulp-fiction',
	catalogPath: 'pulp-fiction/works',

	schema: {
		catalogName: 'Pulp Fiction Library',
		coreFields: {
			titleField: 'title',
			statusField: 'catalog-status',
		},
		fields: [
			{
				key: 'title',
				label: 'Title',
				type: 'string',
				category: 'metadata',
				visible: true,
				filterable: false,
				sortable: true,
				sortOrder: 0,
				description: 'Work title',
			},
			{
				key: 'authors',
				label: 'Authors',
				type: 'array',
				category: 'metadata',
				visible: true,
				filterable: true,
				sortable: false,
				arrayItemType: 'string',
				sortOrder: 1,
				description: 'Author names',
			},
			{
				key: 'year',
				label: 'Year',
				type: 'number',
				category: 'metadata',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 2,
				description: 'Publication year',
			},
			{
				key: 'catalog-status',
				label: 'Status',
				type: 'string',
				category: 'status',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 3,
				description: 'Cataloging status: raw, reviewed, approved, published',
			},
			{
				key: 'word-count',
				label: 'Word Count',
				type: 'number',
				category: 'metadata',
				visible: true,
				filterable: false,
				sortable: true,
				sortOrder: 4,
				description: 'Story word count',
			},
			{
				key: 'publications',
				label: 'Publications',
				type: 'wikilink-array',
				category: 'metadata',
				visible: false,
				filterable: true,
				sortable: false,
				arrayItemType: 'wikilink',
				sortOrder: 5,
				description: 'Appearances in publications',
			},
			{
				key: 'bp-candidate',
				label: 'BP Candidate',
				type: 'boolean',
				category: 'workflow',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 6,
				description: 'Candidate for Backstage Pass anthology',
			},
			{
				key: 'bp-approved',
				label: 'BP Approved',
				type: 'boolean',
				category: 'workflow',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 7,
				description: 'Approved for Backstage Pass anthology',
			},
			{
				key: 'date-cataloged',
				label: 'Date Cataloged',
				type: 'date',
				category: 'metadata',
				visible: false,
				filterable: false,
				sortable: true,
				sortOrder: 8,
				description: 'When this work was cataloged',
			},
			{
				key: 'date-reviewed',
				label: 'Date Reviewed',
				type: 'date',
				category: 'workflow',
				visible: false,
				filterable: false,
				sortable: true,
				sortOrder: 9,
				description: 'When this work was reviewed',
			},
			{
				key: 'date-approved',
				label: 'Date Approved',
				type: 'date',
				category: 'workflow',
				visible: false,
				filterable: false,
				sortable: true,
				sortOrder: 10,
				description: 'When this work was approved',
			},
			{
				key: 'keywords',
				label: 'Keywords',
				type: 'array',
				category: 'content',
				visible: false,
				filterable: true,
				sortable: false,
				arrayItemType: 'string',
				sortOrder: 11,
				description: 'Content keywords/tags',
			},
			{
				key: 'content-warnings',
				label: 'Content Warnings',
				type: 'array',
				category: 'content',
				visible: false,
				filterable: true,
				sortable: false,
				arrayItemType: 'string',
				sortOrder: 12,
				description: 'Content warnings for readers',
			},
		],
	},

	dashboards: {
		statusDashboard: {
			enabled: true,
			groupByField: 'catalog-status',
			showTotalStats: true,
			showWordCounts: true,
		},
		worksTable: {
			enabled: true,
			defaultColumns: ['title', 'authors', 'year', 'catalog-status', 'word-count'],
			enablePagination: true,
		},
		filterBar: {
			enabled: true,
			layout: 'vertical',
			filters: [
				{
					field: 'catalog-status',
					type: 'select',
					label: 'Status',
					enabled: true,
					options: ['raw', 'reviewed', 'approved', 'published'],
				},
				{
					field: 'bp-candidate',
					type: 'checkbox',
					label: 'BP Candidate',
					enabled: true,
				},
				{
					field: 'bp-approved',
					type: 'checkbox',
					label: 'BP Approved',
					enabled: true,
				},
				{
					field: 'year',
					type: 'range',
					label: 'Year Range',
					enabled: true,
				},
			],
		},
		publicationDashboard: {
			enabled: true,
			foreignKeyField: 'publications',
			displayColumns: ['authors', 'year', 'catalog-status', 'word-count'],
		},
		authorCard: {
			enabled: true,
			authorField: 'authors',
			displayColumns: ['title', 'year', 'publications'],
			showStatistics: true,
		},
		backstagePassPipeline: {
			enabled: true,
			stages: [
				{
					name: 'Candidates',
					filterLogic: 'bp-candidate === true',
					displayFields: ['title', 'authors', 'year', 'word-count'],
				},
				{
					name: 'Approved',
					filterLogic: 'bp-approved === true',
					displayFields: ['title', 'authors', 'date-approved'],
				},
				{
					name: 'In Pipeline',
					filterLogic: 'bp-approved === true && catalog-status === "approved"',
					displayFields: ['title', 'authors', 'date-approved'],
				},
			],
		},
	},

	ui: {
		itemsPerPage: 50,
		defaultSortColumn: 'title',
		defaultSortDesc: false,
		compactMode: false,
	}
};

/**
 * PRESET 2: General Library Catalog
 *
 * Assumes:
 * - Directory: /library/ or /books/
 * - Status field: status (simpler: unread, reading, completed)
 * - Author field: author (single, not array)
 * - No editorial workflow
 */
export const GENERAL_LIBRARY_PRESET: DatacoreSettings = {
	version: '1.0.0',
	presetName: 'general-library',
	catalogPath: 'library',

	schema: {
		catalogName: 'General Library',
		coreFields: {
			titleField: 'title',
			statusField: 'status',
		},
		fields: [
			{
				key: 'title',
				label: 'Title',
				type: 'string',
				category: 'metadata',
				visible: true,
				filterable: false,
				sortable: true,
				sortOrder: 0,
			},
			{
				key: 'author',
				label: 'Author',
				type: 'string',
				category: 'metadata',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 1,
			},
			{
				key: 'genre',
				label: 'Genre',
				type: 'string',
				category: 'metadata',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 2,
			},
			{
				key: 'status',
				label: 'Reading Status',
				type: 'string',
				category: 'status',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 3,
			},
			{
				key: 'year',
				label: 'Published Year',
				type: 'number',
				category: 'metadata',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 4,
			},
			{
				key: 'rating',
				label: 'Rating',
				type: 'number',
				category: 'content',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 5,
			},
		],
	},

	dashboards: {
		statusDashboard: {
			enabled: true,
			groupByField: 'status',
			showTotalStats: true,
			showWordCounts: false,
		},
		worksTable: {
			enabled: true,
			defaultColumns: ['title', 'author', 'genre', 'status', 'year', 'rating'],
			enablePagination: true,
		},
		filterBar: {
			enabled: true,
			layout: 'horizontal',
			filters: [
				{
					field: 'status',
					type: 'select',
					label: 'Status',
					enabled: true,
					options: ['unread', 'reading', 'completed'],
				},
				{
					field: 'genre',
					type: 'select',
					label: 'Genre',
					enabled: true,
				},
			],
		},
		publicationDashboard: {
			enabled: false,
			foreignKeyField: '',
			displayColumns: [],
		},
		authorCard: {
			enabled: true,
			authorField: 'author',
			displayColumns: ['title', 'genre', 'year', 'rating'],
			showStatistics: true,
		},
		backstagePassPipeline: {
			enabled: false,
			stages: [],
		},
	},

	ui: {
		itemsPerPage: 50,
		defaultSortColumn: 'title',
		defaultSortDesc: false,
		compactMode: false,
	},
};

/**
 * PRESET 3: Manuscript Tracker
 *
 * Assumes:
 * - Directory: /manuscripts/
 * - Status field: status (draft, revising, querying, published)
 * - Author field: author (single)
 * - Workflow fields: draft-date, query-date, agent, publisher
 */
export const MANUSCRIPTS_PRESET: DatacoreSettings = {
	version: '1.0.0',
	presetName: 'manuscripts',
	catalogPath: 'manuscripts',

	schema: {
		catalogName: 'Manuscript Tracker',
		coreFields: {
			titleField: 'title',
			statusField: 'status',
		},
		fields: [
			{
				key: 'title',
				label: 'Title',
				type: 'string',
				category: 'metadata',
				visible: true,
				filterable: false,
				sortable: true,
				sortOrder: 0,
			},
			{
				key: 'author',
				label: 'Author',
				type: 'string',
				category: 'metadata',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 1,
			},
			{
				key: 'genre',
				label: 'Genre',
				type: 'string',
				category: 'metadata',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 2,
			},
			{
				key: 'status',
				label: 'Status',
				type: 'string',
				category: 'status',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 3,
			},
			{
				key: 'word-count',
				label: 'Word Count',
				type: 'number',
				category: 'metadata',
				visible: true,
				filterable: false,
				sortable: true,
				sortOrder: 4,
			},
			{
				key: 'draft-date',
				label: 'Draft Started',
				type: 'date',
				category: 'workflow',
				visible: true,
				filterable: false,
				sortable: true,
				sortOrder: 5,
			},
			{
				key: 'query-date',
				label: 'Query Date',
				type: 'date',
				category: 'workflow',
				visible: true,
				filterable: false,
				sortable: true,
				sortOrder: 6,
			},
			{
				key: 'agent',
				label: 'Agent',
				type: 'string',
				category: 'workflow',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 7,
			},
			{
				key: 'publisher',
				label: 'Publisher',
				type: 'string',
				category: 'workflow',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 8,
			},
		],
	},

	dashboards: {
		statusDashboard: {
			enabled: true,
			groupByField: 'status',
			showTotalStats: true,
			showWordCounts: true,
		},
		worksTable: {
			enabled: true,
			defaultColumns: ['title', 'genre', 'status', 'word-count', 'agent'],
			enablePagination: true,
		},
		filterBar: {
			enabled: true,
			layout: 'vertical',
			filters: [
				{
					field: 'status',
					type: 'select',
					label: 'Status',
					enabled: true,
					options: ['draft', 'revising', 'querying', 'published'],
				},
				{
					field: 'genre',
					type: 'select',
					label: 'Genre',
					enabled: true,
				},
			],
		},
		publicationDashboard: {
			enabled: false,
			foreignKeyField: '',
			displayColumns: [],
		},
		authorCard: {
			enabled: false,
			authorField: '',
			displayColumns: [],
			showStatistics: false,
		},
		backstagePassPipeline: {
			enabled: true,
			stages: [
				{
					name: 'Drafting',
					filterLogic: 'status === "draft"',
					displayFields: ['title', 'word-count', 'draft-date'],
				},
				{
					name: 'Revising',
					filterLogic: 'status === "revising"',
					displayFields: ['title', 'word-count'],
				},
				{
					name: 'On Submission',
					filterLogic: 'status === "querying"',
					displayFields: ['title', 'query-date', 'agent'],
				},
				{
					name: 'Published',
					filterLogic: 'status === "published"',
					displayFields: ['title', 'publisher'],
				},
			],
		},
	},

	ui: {
		itemsPerPage: 50,
		defaultSortColumn: 'title',
		defaultSortDesc: false,
		compactMode: false,
	},
};

/**
 * PRESET 4: Custom/Template
 * Use this as a starting point for custom catalogs
 */
export const DEFAULT_CUSTOM_PRESET: DatacoreSettings = {
	version: '1.0.0',
	presetName: 'custom',
	catalogPath: 'catalog',
	schema: {
		catalogName: 'Custom Catalog',
		coreFields: {
			titleField: 'title'
		},
		fields: [
			{
				key: 'title',
				label: 'Title',
				type: 'string',
				category: 'metadata',
				visible: true,
				filterable: false,
				sortable: true,
				sortOrder: 0,
			}
		]
	},
	dashboards: {
		statusDashboard: {
			enabled: false,
			groupByField: '',
			showTotalStats: false,
			showWordCounts: false,
		},
		worksTable: {
			enabled: true,
			defaultColumns: ['title'],
			enablePagination: true,
		},
		filterBar: {
			enabled: false,
			layout: 'vertical',
			filters: [],
		},
		publicationDashboard: {
			enabled: false,
			foreignKeyField: '',
			displayColumns: [],
		},
		authorCard: {
			enabled: false,
			authorField: '',
			displayColumns: [],
			showStatistics: false,
		},
		backstagePassPipeline: {
			enabled: false,
			stages: [],
		},
	},
	ui: {
		itemsPerPage: 50,
		defaultSortColumn: 'title',
		defaultSortDesc: false,
		compactMode: false,
	}
};

export const PRESETS: Record<string, DatacoreSettings> = {
	'pulp-fiction': PULP_FICTION_PRESET,
	'general-library': GENERAL_LIBRARY_PRESET,
	'manuscripts': MANUSCRIPTS_PRESET,
	'custom': DEFAULT_CUSTOM_PRESET,
};
