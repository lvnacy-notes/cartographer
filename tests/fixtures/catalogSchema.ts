import type { CatalogSchema } from '../../src/types';

/**
 * Test schema with all 7 SchemaField types.
 * Used across all component tests to verify type handling.
 *
 * Field Types Included:
 * - string: title, category, publication
 * - number: year, volume, word-count
 * - date: date-cataloged, date-reviewed
 * - boolean: bp-candidate, bp-approved
 * - array: keywords, tags
 * - wikilink-array: authors, publications
 * - object: content-metadata
 */
export const catalogSchema: CatalogSchema = {
	catalogName: 'Pulp Fiction Works',
	fields: [
		{
			key: 'title',
			label: 'Title',
			type: 'string',
			category: 'metadata',
			visible: true,
			sortable: true,
			filterable: true,
			sortOrder: 1,
			description: 'Story title'
		},
		{
			key: 'category',
			label: 'Category',
			type: 'string',
			category: 'metadata',
			visible: true,
			sortable: true,
			filterable: true,
			sortOrder: 2,
			description: 'Story category (short story, novelette, etc.)'
		},
		{
			key: 'authors',
			label: 'Authors',
			type: 'wikilink-array',
			category: 'metadata',
			visible: true,
			sortable: false,
			filterable: true,
			sortOrder: 3,
			arrayItemType: 'wikilink',
			description: 'Story authors'
		},
		{
			key: 'year',
			label: 'Year',
			type: 'number',
			category: 'metadata',
			visible: true,
			sortable: true,
			filterable: true,
			sortOrder: 4,
			description: 'Publication year'
		},
		{
			key: 'volume',
			label: 'Volume',
			type: 'number',
			category: 'metadata',
			visible: true,
			sortable: true,
			filterable: false,
			sortOrder: 5,
			description: 'Magazine volume number'
		},
		{
			key: 'word-count',
			label: 'Word Count',
			type: 'number',
			category: 'content',
			visible: true,
			sortable: true,
			filterable: false,
			sortOrder: 6,
			description: 'Word count of story'
		},
		{
			key: 'date-cataloged',
			label: 'Date Cataloged',
			type: 'date',
			category: 'workflow',
			visible: true,
			sortable: true,
			filterable: true,
			sortOrder: 7,
			description: 'When item was added to catalog'
		},
		{
			key: 'date-reviewed',
			label: 'Date Reviewed',
			type: 'date',
			category: 'workflow',
			visible: true,
			sortable: true,
			filterable: false,
			sortOrder: 8,
			description: 'When item was reviewed'
		},
		{
			key: 'bp-candidate',
			label: 'BP Candidate',
			type: 'boolean',
			category: 'status',
			visible: true,
			sortable: true,
			filterable: true,
			sortOrder: 9,
			description: 'Candidate for Backstage Pass'
		},
		{
			key: 'bp-approved',
			label: 'BP Approved',
			type: 'boolean',
			category: 'status',
			visible: true,
			sortable: true,
			filterable: true,
			sortOrder: 10,
			description: 'Approved for Backstage Pass'
		},
		{
			key: 'catalog-status',
			label: 'Catalog Status',
			type: 'string',
			category: 'status',
			visible: true,
			sortable: true,
			filterable: true,
			sortOrder: 11,
			description: 'Cataloging workflow status'
		},
		{
			key: 'keywords',
			label: 'Keywords',
			type: 'array',
			category: 'content',
			visible: true,
			sortable: false,
			filterable: false,
			sortOrder: 12,
			arrayItemType: 'string',
			description: 'Subject keywords'
		},
		{
			key: 'tags',
			label: 'Tags',
			type: 'array',
			category: 'content',
			visible: true,
			sortable: false,
			filterable: false,
			sortOrder: 13,
			arrayItemType: 'string',
			description: 'Obsidian tags'
		},
		{
			key: 'publications',
			label: 'Publications',
			type: 'wikilink-array',
			category: 'metadata',
			visible: true,
			sortable: false,
			filterable: false,
			sortOrder: 14,
			arrayItemType: 'wikilink',
			description: 'Publication references'
		},
		{
			key: 'content-metadata',
			label: 'Content Metadata',
			type: 'object',
			category: 'custom',
			visible: false,
			sortable: false,
			filterable: false,
			sortOrder: 15,
			description: 'Custom content metadata'
		}
	],
	coreFields: {
		titleField: 'title',
		idField: 'title',
		statusField: 'catalog-status'
	}
};
