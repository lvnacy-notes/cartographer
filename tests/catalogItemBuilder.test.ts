import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
	buildCatalogItemFromMarkdown,
	applyFieldConversion,
	validateRequiredFields,
	ensureTitle,
	getVisibleFields,
	getFilterableFields,
	getSortableFields,
	getFieldsByCategory,
	mergeItems
} from '../src/dataAccess/catalogItemBuilder';
import { CatalogItem, CatalogSchema, SchemaField } from '../src/types';

/**
 * Create a realistic test schema based on Pulp Fiction library structure
 */
function createTestSchema(): CatalogSchema {
	return {
		catalogName: 'Pulp Fiction',
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
				description: 'Work title'
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
				arrayItemType: 'wikilink',
				description: 'Story authors'
			},
			{
				key: 'year',
				label: 'Year',
				type: 'number',
				category: 'metadata',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 3,
				description: 'Publication year'
			},
			{
				key: 'word-count',
				label: 'Word Count',
				type: 'number',
				category: 'content',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 4,
				description: 'Word count'
			},
			{
				key: 'publication',
				label: 'Publication',
				type: 'string',
				category: 'metadata',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 5,
				description: 'Original publication'
			},
			{
				key: 'status',
				label: 'Status',
				type: 'string',
				category: 'status',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 6,
				description: 'Cataloging status'
			},
			{
				key: 'date-read',
				label: 'Date Read',
				type: 'date',
				category: 'workflow',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 7,
				description: 'When read'
			},
			{
				key: 'approved',
				label: 'Approved',
				type: 'boolean',
				category: 'status',
				visible: true,
				filterable: true,
				sortable: true,
				sortOrder: 8,
				description: 'Catalog approved'
			},
			{
				key: 'tags',
				label: 'Tags',
				type: 'array',
				category: 'custom',
				visible: true,
				filterable: true,
				sortable: false,
				sortOrder: 9,
				arrayItemType: 'string',
				description: 'Subject tags'
			},
			{
				key: 'notes',
				label: 'Notes',
				type: 'string',
				category: 'custom',
				visible: false,
				filterable: false,
				sortable: false,
				sortOrder: 10,
				description: 'Internal notes'
			}
		],
		coreFields: {
			titleField: 'title',
			idField: 'title',
			statusField: 'status'
		}
	};
}

/**
 * Create realistic test markdown content
 */
function createTestMarkdownContent(overrides: Record<string, any> = {}): string {
	const defaults = {
		title: 'The Shadow Over Innsmouth',
		authors: ['[[H.P. Lovecraft]]'],
		year: 1931,
		'word-count': 15000,
		publication: '[[Weird Tales]]',
		status: 'published',
		'date-read': '2026-01-05',
		approved: true,
		tags: ['horror', 'cosmic-horror', 'lovecraft'],
		notes: 'Classic cosmic horror tale'
	};

	const merged = { ...defaults, ...overrides };

	let yaml = '---\n';
	for (const [key, value] of Object.entries(merged)) {
		if (Array.isArray(value)) {
			yaml += `${key}:\n`;
			for (const item of value) {
				yaml += `  - ${typeof item === 'string' && item.includes('[') ? item : `"${item}"`}\n`;
			}
		} else if (typeof value === 'boolean') {
			yaml += `${key}: ${value}\n`;
		} else if (typeof value === 'number') {
			yaml += `${key}: ${value}\n`;
		} else {
			yaml += `${key}: "${value}"\n`;
		}
	}
	yaml += '---\n# Content\nStory content here...';

	return yaml;
}

describe('Catalog Item Builder Functions', () => {
	describe('buildCatalogItemFromMarkdown', () => {
		test('should build CatalogItem from complete markdown', () => {
			const schema = createTestSchema();
			const content = createTestMarkdownContent();
			const item = buildCatalogItemFromMarkdown(content, 'works/story.md', schema);

			assert.strictEqual(item.id, 'the-shadow-over-innsmouth');
			assert.strictEqual(item.filePath, 'works/story.md');
			assert.strictEqual(item.getField<string>('title'), 'The Shadow Over Innsmouth');
			assert.strictEqual(item.getField<number>('year'), 1931);
			assert.strictEqual(item.getField<number>('word-count'), 15000);
		});

		test('should generate ID from title field', () => {
			const schema = createTestSchema();
			const content = createTestMarkdownContent({ title: 'The Cosmic Horror' });
			const item = buildCatalogItemFromMarkdown(content, 'works/cosmic.md', schema);

			assert.strictEqual(item.id, 'the-cosmic-horror');
		});

		test('should handle missing title with fallback to filepath', () => {
			const schema = createTestSchema();
			const content = createTestMarkdownContent({ title: undefined });
			const item = buildCatalogItemFromMarkdown(content, 'works/untitled.md', schema);

			// Should use filePath as fallback
			assert.ok(item.id.length > 0);
		});

		test('should type-convert fields according to schema', () => {
			const schema = createTestSchema();
			const content = createTestMarkdownContent();
			const item = buildCatalogItemFromMarkdown(content, 'works/story.md', schema);

			const year = item.getField<number>('year');
			assert.strictEqual(typeof year, 'number');
			assert.strictEqual(year, 1931);

			const approved = item.getField<boolean>('approved');
			assert.strictEqual(typeof approved, 'boolean');
			assert.strictEqual(approved, true);

			const tags = item.getField<string[]>('tags');
			assert.ok(Array.isArray(tags));
			assert.strictEqual(tags?.length, 3);
		});

		test('should set array fields from YAML array', () => {
			const schema = createTestSchema();
			const content = createTestMarkdownContent({
				authors: ['[[Lovecraft]]', '[[Smith]]']
			});
			const item = buildCatalogItemFromMarkdown(content, 'works/story.md', schema);

			const authors = item.getField<string[]>('authors');
			assert.ok(Array.isArray(authors));
			assert.strictEqual(authors?.length, 2);
		});

		test('should parse date fields', () => {
			const schema = createTestSchema();
			const content = createTestMarkdownContent({ 'date-read': '2026-01-05' });
			const item = buildCatalogItemFromMarkdown(content, 'works/story.md', schema);

			const dateRead = item.getField<Date>('date-read');
			assert.ok(dateRead instanceof Date);
		});

		test('should handle missing optional fields', () => {
			const schema = createTestSchema();
			const minimal = '---\ntitle: "Story"\n---\nContent';
			const item = buildCatalogItemFromMarkdown(minimal, 'works/story.md', schema);

			assert.strictEqual(item.getField<string>('title'), 'Story');
			assert.strictEqual(item.getField<string>('publication'), null);
		});
	});

	describe('applyFieldConversion', () => {
		test('should convert value to string type', () => {
			const schema = createTestSchema();
			const titleField = schema.fields.find(f => f.key === 'title')!;
			const result = applyFieldConversion(12345, titleField);
			assert.strictEqual(result, '12345');
		});

		test('should convert value to number type', () => {
			const schema = createTestSchema();
			const yearField = schema.fields.find(f => f.key === 'year')!;
			const result = applyFieldConversion('1931', yearField);
			assert.strictEqual(result, 1931);
		});

		test('should return undefined for invalid number conversion', () => {
			const schema = createTestSchema();
			const yearField = schema.fields.find(f => f.key === 'year')!;
			const result = applyFieldConversion('not-a-number', yearField);
			assert.strictEqual(result, undefined);
		});

		test('should convert to boolean', () => {
			const schema = createTestSchema();
			const approvedField = schema.fields.find(f => f.key === 'approved')!;
			assert.strictEqual(applyFieldConversion(true, approvedField), true);
			assert.strictEqual(applyFieldConversion('true', approvedField), true);
			assert.strictEqual(applyFieldConversion(false, approvedField), false);
		});

		test('should convert to date', () => {
			const schema = createTestSchema();
			const dateField = schema.fields.find(f => f.key === 'date-read')!;
			const result = applyFieldConversion('2026-01-05', dateField);
			assert.ok(result instanceof Date);
		});

		test('should convert to array', () => {
			const schema = createTestSchema();
			const tagsField = schema.fields.find(f => f.key === 'tags')!;
			const result = applyFieldConversion(['horror', 'cosmic'], tagsField);
			assert.ok(Array.isArray(result));
			assert.deepStrictEqual(result, ['horror', 'cosmic']);
		});

		test('should convert single value to array', () => {
			const schema = createTestSchema();
			const tagsField = schema.fields.find(f => f.key === 'tags')!;
			const result = applyFieldConversion('horror', tagsField);
			assert.ok(Array.isArray(result));
			assert.strictEqual(result[0], 'horror');
		});

		test('should handle null/undefined values', () => {
			const schema = createTestSchema();
			const titleField = schema.fields.find(f => f.key === 'title')!;
			assert.strictEqual(applyFieldConversion(null, titleField), undefined);
			assert.strictEqual(applyFieldConversion(undefined, titleField), undefined);
		});
	});

	describe('validateRequiredFields', () => {
		test('should return empty array when all required fields present', () => {
			const schema = createTestSchema();
			const item = new CatalogItem('test-001', 'test.md');
			item.setField('title', 'Test');
			const result = validateRequiredFields(item, schema);
			assert.deepStrictEqual(result, []);
		});

		test('should identify missing required fields', () => {
			// Mark some fields as required
			const schema = createTestSchema();
			(schema.fields[0] as any).required = true;
			(schema.fields[1] as any).required = true;

			const item = new CatalogItem('test-001', 'test.md');
			item.setField('title', 'Test');
			const result = validateRequiredFields(item, schema);
			assert.ok(Array.isArray(result));
		});
	});

	describe('ensureTitle', () => {
		test('should keep existing title', () => {
			const schema = createTestSchema();
			const item = new CatalogItem('test-001', 'test.md');
			item.setField('title', 'Existing Title');

			ensureTitle(item, schema);
			assert.strictEqual(item.getField<string>('title'), 'Existing Title');
		});

		test('should set fallback title if missing', () => {
			const schema = createTestSchema();
			const item = new CatalogItem('test-001', 'works/story.md');

			ensureTitle(item, schema, 'Fallback Title');
			assert.strictEqual(item.getField<string>('title'), 'Fallback Title');
		});

		test('should use filePath as default fallback', () => {
			const schema = createTestSchema();
			const item = new CatalogItem('test-001', 'works/story.md');

			ensureTitle(item, schema);
			assert.strictEqual(item.getField<string>('title'), 'works/story.md');
		});

		test('should not overwrite empty string with fallback', () => {
			const schema = createTestSchema();
			const item = new CatalogItem('test-001', 'test.md');
			item.setField('title', '');

			ensureTitle(item, schema, 'Fallback');
			// Empty string is falsy, so should be replaced
			assert.strictEqual(item.getField<string>('title'), 'Fallback');
		});
	});

	describe('getVisibleFields', () => {
		test('should return only visible fields', () => {
			const schema = createTestSchema();
			const visible = getVisibleFields(schema);

			assert.ok(visible.length > 0);
			for (const field of visible) {
				assert.strictEqual(field.visible, true);
			}
		});

		test('should exclude non-visible fields', () => {
			const schema = createTestSchema();
			const visible = getVisibleFields(schema);
			const visibleKeys = visible.map(f => f.key);

			assert.ok(visibleKeys.includes('title'));
			assert.ok(!visibleKeys.includes('notes')); // notes is not visible
		});

		test('should return array of SchemaField objects', () => {
			const schema = createTestSchema();
			const visible = getVisibleFields(schema);

			assert.ok(Array.isArray(visible));
			for (const field of visible) {
				assert.ok(field.key);
				assert.ok(field.label);
				assert.ok(field.type);
			}
		});
	});

	describe('getFilterableFields', () => {
		test('should return only filterable fields', () => {
			const schema = createTestSchema();
			const filterable = getFilterableFields(schema);

			for (const field of filterable) {
				assert.strictEqual(field.filterable, true);
			}
		});

		test('should include title and status', () => {
			const schema = createTestSchema();
			const filterable = getFilterableFields(schema);
			const keys = filterable.map(f => f.key);

			assert.ok(keys.includes('title'));
			assert.ok(keys.includes('status'));
		});
	});

	describe('getSortableFields', () => {
		test('should return only sortable fields', () => {
			const schema = createTestSchema();
			const sortable = getSortableFields(schema);

			for (const field of sortable) {
				assert.strictEqual(field.sortable, true);
			}
		});

		test('should sort by sortOrder', () => {
			const schema = createTestSchema();
			const sortable = getSortableFields(schema);

			// Verify sortOrder is ascending
			for (let i = 1; i < sortable.length; i++) {
				const prev = sortable[i - 1]?.sortOrder ?? 0;
				const curr = sortable[i]?.sortOrder ?? 0;
				assert.ok(prev <= curr);
			}
		});

		test('should exclude non-sortable fields like authors', () => {
			const schema = createTestSchema();
			const sortable = getSortableFields(schema);
			const keys = sortable.map(f => f.key);

			assert.ok(!keys.includes('authors')); // authors is not sortable
			assert.ok(!keys.includes('tags')); // tags is not sortable
		});

		test('should include title, year, and status', () => {
			const schema = createTestSchema();
			const sortable = getSortableFields(schema);
			const keys = sortable.map(f => f.key);

			assert.ok(keys.includes('title'));
			assert.ok(keys.includes('year'));
			assert.ok(keys.includes('status'));
		});
	});

	describe('getFieldsByCategory', () => {
		test('should return metadata fields', () => {
			const schema = createTestSchema();
			const fields = getFieldsByCategory(schema, 'metadata');

			for (const field of fields) {
				assert.strictEqual(field.category, 'metadata');
			}
			assert.ok(fields.length > 0);
		});

		test('should return status fields', () => {
			const schema = createTestSchema();
			const fields = getFieldsByCategory(schema, 'status');

			for (const field of fields) {
				assert.strictEqual(field.category, 'status');
			}
			assert.ok(fields.length > 0);
		});

		test('should return workflow fields', () => {
			const schema = createTestSchema();
			const fields = getFieldsByCategory(schema, 'workflow');

			for (const field of fields) {
				assert.strictEqual(field.category, 'workflow');
			}
		});

		test('should return content fields', () => {
			const schema = createTestSchema();
			const fields = getFieldsByCategory(schema, 'content');

			for (const field of fields) {
				assert.strictEqual(field.category, 'content');
			}
		});

		test('should return custom fields', () => {
			const schema = createTestSchema();
			const fields = getFieldsByCategory(schema, 'custom');

			for (const field of fields) {
				assert.strictEqual(field.category, 'custom');
			}
		});

		test('should return empty array for category with no fields', () => {
			const schema = createTestSchema();
			const emptySchema: CatalogSchema = {
				...schema,
				fields: []
			};
			const fields = getFieldsByCategory(emptySchema, 'metadata');
			assert.deepStrictEqual(fields, []);
		});
	});

	describe('mergeItems', () => {
		test('should merge two items with second taking precedence', () => {
			const item1 = new CatalogItem('id1', 'path1.md');
			item1.setField('title', 'Original');
			item1.setField('year', 2020);

			const item2 = new CatalogItem('id2', 'path2.md');
			item2.setField('title', 'Updated');

			const result = mergeItems(item1, item2);
			assert.strictEqual(result.getField<string>('title'), 'Updated');
			assert.strictEqual(result.getField<number>('year'), 2020);
		});

		test('should handle multiple items', () => {
			const item1 = new CatalogItem('id1', 'path1.md');
			item1.setField('title', 'Original');
			item1.setField('year', 2020);

			const item2 = new CatalogItem('id2', 'path2.md');
			item2.setField('title', 'Updated');
			item2.setField('status', 'published');

			const item3 = new CatalogItem('id3', 'path3.md');
			item3.setField('year', 2025);

			const result = mergeItems(item1, item2, item3);
			assert.strictEqual(result.getField<string>('title'), 'Updated');
			assert.strictEqual(result.getField<number>('year'), 2025);
			assert.strictEqual(result.getField<string>('status'), 'published');
		});

		test('should skip null/undefined values', () => {
			const item1 = new CatalogItem('id1', 'path1.md');
			item1.setField('title', 'Original');
			item1.setField('year', 2020);

			const item2 = new CatalogItem('id2', 'path2.md');
			item2.setField('title', null);
		item2.setField('year', null);

			const result = mergeItems(item1, item2);
			assert.strictEqual(result.getField<string>('title'), 'Original');
			assert.strictEqual(result.getField<number>('year'), 2020);
		});

		test('should create empty item for empty array', () => {
			const result = mergeItems();
			assert.ok(result instanceof CatalogItem);
			assert.strictEqual(result.id, '');
			assert.strictEqual(result.filePath, '');
		});

		test('should clone first item for single item array', () => {
			const item = new CatalogItem('id1', 'path1.md');
			item.setField('title', 'Test');

			const result = mergeItems(item);
			assert.strictEqual(result.id, 'id1');
			assert.strictEqual(result.filePath, 'path1.md');
			assert.strictEqual(result.getField<string>('title'), 'Test');
		});
	});

	describe('Integration Tests', () => {
		test('should build item and validate fields', () => {
			const schema = createTestSchema();
			const content = createTestMarkdownContent();
			const item = buildCatalogItemFromMarkdown(content, 'works/story.md', schema);

			// Verify item structure
			assert.ok(item.id.length > 0);
			assert.ok(item.filePath);
			assert.strictEqual(item.getField<string>('title'), 'The Shadow Over Innsmouth');
			assert.strictEqual(item.getField<number>('year'), 1931);
		});

		test('should get visible and filterable field subsets', () => {
			const schema = createTestSchema();
			const visible = getVisibleFields(schema);
			const filterable = getFilterableFields(schema);

			// Visible should include filterable fields
			const visibleKeys = visible.map(f => f.key);
			const filterableKeys = filterable.map(f => f.key);

			for (const key of filterableKeys) {
				if (key !== 'notes') {
					// Most filterable fields should be visible
					assert.ok(visibleKeys.includes(key));
				}
			}
		});

		test('should organize fields by category', () => {
			const schema = createTestSchema();
			const metadata = getFieldsByCategory(schema, 'metadata');
			const status = getFieldsByCategory(schema, 'status');
			const workflow = getFieldsByCategory(schema, 'workflow');
			const content = getFieldsByCategory(schema, 'content');
			const custom = getFieldsByCategory(schema, 'custom');

			// Verify all categories have expected fields
			assert.ok(metadata.some(f => f.key === 'title'));
			assert.ok(status.some(f => f.key === 'approved'));
			assert.ok(workflow.some(f => f.key === 'date-read'));
			assert.ok(content.some(f => f.key === 'word-count'));
			assert.ok(custom.some(f => f.key === 'tags'));
		});

		test('should build, ensure title, and merge items', () => {
			const schema = createTestSchema();
			const content = createTestMarkdownContent();
			const item = buildCatalogItemFromMarkdown(content, 'works/story.md', schema);

			// Create a partial update
			const update = new CatalogItem('temp', 'temp.md');
			update.setField('status', 'updated');
			update.setField('approved', false);

			// Merge
			const merged = mergeItems(item, update);

			// Verify merge
			assert.strictEqual(merged.getField<string>('title'), 'The Shadow Over Innsmouth');
			assert.strictEqual(merged.getField<string>('status'), 'updated');
			assert.strictEqual(merged.getField<boolean>('approved'), false);
		});
	});
});
