import type { CatalogSchema, SchemaField } from '../../src/types';

/**
 * Sample schema definition for Storybook fixtures.
 * Represents a typical fiction library schema with common fields.
 */
export const sampleSchema: CatalogSchema = {
	catalogName: 'Pulp Fiction Library',
	fields: [
		{
			key: 'title',
			label: 'Title',
			type: 'string',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 1,
		},
		{
			key: 'authors',
			label: 'Authors',
			type: 'wikilink-array',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: false,
			sortOrder: 2,
		},
		{
			key: 'year-published',
			label: 'Year Published',
			type: 'number',
			category: 'publication',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 3,
		},
		{
			key: 'word-count',
			label: 'Word Count',
			type: 'number',
			category: 'metrics',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 4,
		},
		{
			key: 'catalog-status',
			label: 'Status',
			type: 'string',
			category: 'workflow',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 5,
		},
		{
			key: 'publication',
			label: 'Publication',
			type: 'string',
			category: 'publication',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 6,
		},
		{
			key: 'genres',
			label: 'Genres',
			type: 'array',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: false,
			sortOrder: 7,
		},
	] as SchemaField[],
	coreFields: {
		titleField: 'title',
		idField: 'title',
		statusField: 'catalog-status',
	},
};
