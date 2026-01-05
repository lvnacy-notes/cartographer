import { CatalogSchema } from '../types/settings';

/**
 * Default schema for library catalogs
 *
 * This schema is based on the standardized structure documented in the
 * Pulp Fiction library (works/README.md), which establishes best practices
 * for fiction work catalogs with:
 * - Type and classification fields (class, category, title)
 * - Contributors and publication metadata (authors, year, volume, issue, publications)
 * - Source documentation (citation, wikisource, backstage-draft)
 * - Content and cataloging status (synopsis, catalog-status, bp-candidate, bp-approved)
 * - Timeline tracking (date-read, date-cataloged, date-reviewed, date-approved)
 * - Content metrics and keywords (word-count, keywords, tags, content-warnings)
 *
 * Users can create libraries with this schema and customize it as needed.
 */
export const DEFAULT_LIBRARY_SCHEMA: CatalogSchema = {
	catalogName: 'Default Library',
	coreFields: {
		titleField: 'title',
		statusField: 'catalog-status',
	},
	fields: [
		// Type & Classification (1-3) — Programmatic Priority
		{
			key: 'class',
			label: 'Class',
			type: 'string',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 0,
			description: 'Primary categorization (e.g., "story", "article")',
		},
		{
			key: 'category',
			label: 'Category',
			type: 'string',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 1,
			description: 'Secondary classification (e.g., "short story", "novelette")',
		},
		{
			key: 'title',
			label: 'Title',
			type: 'string',
			category: 'metadata',
			visible: true,
			filterable: false,
			sortable: true,
			sortOrder: 2,
			description: 'Full title of the work',
		},

		// Identity & Contributors (4)
		{
			key: 'authors',
			label: 'Authors',
			type: 'wikilink-array',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: false,
			arrayItemType: 'wikilink',
			sortOrder: 3,
			description: 'Author(s) as wikilinks',
		},

		// Publication Metadata (5-8)
		{
			key: 'year',
			label: 'Year',
			type: 'number',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 4,
			description: 'Original publication year',
		},
		{
			key: 'volume',
			label: 'Volume',
			type: 'number',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 5,
			description: 'Publication volume number',
		},
		{
			key: 'issue',
			label: 'Issue',
			type: 'number',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 6,
			description: 'Publication issue number',
		},
		{
			key: 'publications',
			label: 'Publications',
			type: 'wikilink-array',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: false,
			arrayItemType: 'wikilink',
			sortOrder: 7,
			description: 'Source publication references',
		},

		// Source Documentation (9-11)
		{
			key: 'citation',
			label: 'Citation',
			type: 'string',
			category: 'metadata',
			visible: false,
			filterable: false,
			sortable: false,
			sortOrder: 8,
			description: 'Formal bibliographic citation',
		},
		{
			key: 'wikisource',
			label: 'Wikisource',
			type: 'string',
			category: 'metadata',
			visible: false,
			filterable: false,
			sortable: false,
			sortOrder: 9,
			description: 'Link to full text source (URL)',
		},
		{
			key: 'backstage-draft',
			label: 'Backstage Draft',
			type: 'string',
			category: 'metadata',
			visible: false,
			filterable: false,
			sortable: false,
			sortOrder: 10,
			description: 'Link to editorial draft document (URL)',
		},

		// Content & Synopsis (12)
		{
			key: 'synopsis',
			label: 'Synopsis',
			type: 'string',
			category: 'content',
			visible: false,
			filterable: false,
			sortable: false,
			sortOrder: 11,
			description: 'Brief plot summary for discovery and reference',
		},

		// Cataloging Status (13-15)
		{
			key: 'catalog-status',
			label: 'Catalog Status',
			type: 'string',
			category: 'status',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 12,
			description: 'Pipeline stage: raw | reviewed | approved | published',
		},
		{
			key: 'bp-candidate',
			label: 'Backstage Candidate',
			type: 'boolean',
			category: 'workflow',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 13,
			description: 'Recommended for editorial pipeline',
		},
		{
			key: 'bp-approved',
			label: 'Backstage Approved',
			type: 'boolean',
			category: 'workflow',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 14,
			description: 'Approved for publication',
		},

		// Timeline & Tracking (16-19)
		{
			key: 'date-read',
			label: 'Date Read',
			type: 'date',
			category: 'workflow',
			visible: false,
			filterable: true,
			sortable: true,
			sortOrder: 15,
			description: 'When cataloger read the work',
		},
		{
			key: 'date-cataloged',
			label: 'Date Cataloged',
			type: 'date',
			category: 'workflow',
			visible: false,
			filterable: true,
			sortable: true,
			sortOrder: 16,
			description: 'When added to catalog',
		},
		{
			key: 'date-reviewed',
			label: 'Date Reviewed',
			type: 'date',
			category: 'workflow',
			visible: false,
			filterable: true,
			sortable: true,
			sortOrder: 17,
			description: 'When review was completed',
		},
		{
			key: 'date-approved',
			label: 'Date Approved',
			type: 'date',
			category: 'workflow',
			visible: false,
			filterable: true,
			sortable: true,
			sortOrder: 18,
			description: 'When editorial approval was granted',
		},

		// Automation & Timestamps (20-21)
		{
			key: 'created',
			label: 'Created',
			type: 'date',
			category: 'metadata',
			visible: false,
			filterable: false,
			sortable: true,
			sortOrder: 19,
			description: 'File creation date',
		},
		{
			key: 'updated',
			label: 'Updated',
			type: 'date',
			category: 'metadata',
			visible: false,
			filterable: false,
			sortable: true,
			sortOrder: 20,
			description: 'Last file modification date',
		},

		// Content Metrics & Keywords (22-24)
		{
			key: 'word-count',
			label: 'Word Count',
			type: 'number',
			category: 'metadata',
			visible: true,
			filterable: true,
			sortable: true,
			sortOrder: 21,
			description: 'Approximate word count',
		},
		{
			key: 'keywords',
			label: 'Keywords',
			type: 'array',
			category: 'metadata',
			visible: false,
			filterable: true,
			sortable: false,
			arrayItemType: 'string',
			sortOrder: 22,
			description: 'Search terms and thematic keywords',
		},
		{
			key: 'tags',
			label: 'Tags',
			type: 'array',
			category: 'metadata',
			visible: false,
			filterable: true,
			sortable: false,
			arrayItemType: 'string',
			sortOrder: 23,
			description: 'Categorical tags and labels',
		},

		// Content Warnings & Metadata (25-26)
		{
			key: 'content-warnings',
			label: 'Content Warnings',
			type: 'array',
			category: 'metadata',
			visible: false,
			filterable: true,
			sortable: false,
			arrayItemType: 'string',
			sortOrder: 24,
			description: 'Content warnings (violence, drugs, etc.)',
		},
		{
			key: 'content-metadata',
			label: 'Content Metadata',
			type: 'object',
			category: 'metadata',
			visible: false,
			filterable: false,
			sortable: false,
			sortOrder: 25,
			description: 'Structured content analysis (paranormal-mechanism, setting, violence-level, creature-type, etc.)',
		},
	],
};

/**
 * Get the default schema
 * @returns The default library schema
 */
export function getDefaultSchema(): CatalogSchema {
	return DEFAULT_LIBRARY_SCHEMA;
}

/**
 * Get a deep copy of the default schema for new libraries
 * Ensures each library gets its own independent schema instance
 */
export function createSchemaFromDefault(): CatalogSchema {
	return JSON.parse(JSON.stringify(DEFAULT_LIBRARY_SCHEMA)) as CatalogSchema;
}
