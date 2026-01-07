/**
 * Catalog Item Builder
 *
 * Constructs CatalogItem instances from parsed markdown file data,
 * applying schema-based type conversion and field validation.
 */

import {
    buildCatalogItemFromData,
	CatalogItem,
    CatalogSchema,
	convertFieldValue,
    SchemaField
} from '../types';
import { parseMarkdownFile } from './fileParser';

/**
 * Build a CatalogItem from markdown file content.
 *
 * Combines file parsing with schema-based field construction.
 * This is the primary entry point for creating CatalogItems from vault files.
 *
 * @param fileContent - Raw markdown file content
 * @param filePath - Vault-relative path to the file
 * @param schema - Catalog schema defining all available fields
 * @returns - A CatalogItem with all fields populated from markdown frontmatter
 *
 * @example
 * const content = fs.readFileSync('works/story.md', 'utf8');
 * const item = buildCatalogItemFromMarkdown(content, 'works/story.md', schema);
 */
export function buildCatalogItemFromMarkdown(
	fileContent: string,
	filePath: string,
	schema: CatalogSchema
): CatalogItem {
	// Parse markdown file to extract YAML frontmatter
	const rawData = parseMarkdownFile(fileContent);

	// Generate a unique ID from the file path or title field
	const titleField = schema.coreFields.titleField;
	const idField = schema.coreFields.idField ?? titleField;
	const id = String(rawData[idField] ?? filePath).toLowerCase().replace(/\s+/g, '-');

	// Use the shared builder function to create the item
	return buildCatalogItemFromData(rawData, id, filePath, schema);
}

/**
 * Apply type conversion to a raw field value based on schema field definition.
 *
 * Handles all supported field types and converts values appropriately.
 * Used during CatalogItem construction from parsed YAML data.
 *
 * @param rawValue - The raw value from YAML parsing (could be any type)
 * @param fieldDef - The schema field definition (provides target type)
 * @returns - Converted value matching the field's defined type, or undefined if conversion failed
 *
 * @example
 * const fieldDef = schema.fields.find(f => f.key === 'word-count');
 * const converted = applyFieldConversion(5000, fieldDef!);
 * // Returns: 5000 (as number)
 *
 * @example
 * const fieldDef = schema.fields.find(f => f.key === 'date-read');
 * const converted = applyFieldConversion('2026-01-05', fieldDef!);
 * // Returns: Date object
 */
export function applyFieldConversion(
	rawValue: any,
	fieldDef: SchemaField
): any | undefined {
	return convertFieldValue(rawValue, fieldDef);
}

/**
 * Validate that a CatalogItem has all required fields.
 *
 * Checks that all required schema fields (marked with `required: true`)
 * are present and not null in the CatalogItem.
 *
 * @param item - The CatalogItem to validate
 * @param schema - The catalog schema
 * @returns - Array of missing required field keys (empty if all present)
 *
 * @example
 * const missing = validateRequiredFields(item, schema);
 * if (missing.length > 0) {
 *   console.warn(`Missing required fields: ${missing.join(', ')}`);
 * }
 */
export function validateRequiredFields(
	item: CatalogItem,
	schema: CatalogSchema
): string[] {
	const missing: string[] = [];

	for (const fieldDef of schema.fields) {
		// Check if field is required (note: current SchemaField doesn't have required, but leaving for future)
		if ((fieldDef as any).required === true) {
			if (!item.hasField(fieldDef.key)) {
				missing.push(fieldDef.key);
			}
		}
	}

	return missing;
}

/**
 * Ensure a CatalogItem has a valid title.
 *
 * Uses the schema's titleField definition to locate the title.
 * Falls back to filePath if title is missing.
 *
 * @param item - The CatalogItem to check/fix
 * @param schema - The catalog schema
 * @param fallbackValue - Value to use if title is missing (defaults to filePath)
 *
 * @example
 * ensureTitle(item, schema, item.filePath);
 */
export function ensureTitle(
	item: CatalogItem,
	schema: CatalogSchema,
	fallbackValue?: string
): void {
	const titleField = schema.coreFields.titleField;
	const title = item.getField<string>(titleField);

	if (!title) {
		item.setField(titleField, fallbackValue ?? item.filePath);
	}
}

/**
 * Get all schema fields that are visible in default UI views.
 *
 * Useful for determining which fields to display in tables, cards, etc.
 *
 * @param schema - The catalog schema
 * @returns - Array of visible SchemaField definitions
 *
 * @example
 * const visibleFields = getVisibleFields(schema);
 * const columns = visibleFields.map(f => f.label);
 */
export function getVisibleFields(schema: CatalogSchema): SchemaField[] {
	return schema.fields.filter(f => f.visible);
}

/**
 * Get all schema fields that support filtering.
 *
 * Used to populate filter UI components.
 *
 * @param schema - The catalog schema
 * @returns - Array of filterable SchemaField definitions
 *
 * @example
 * const filterableFields = getFilterableFields(schema);
 */
export function getFilterableFields(schema: CatalogSchema): SchemaField[] {
	return schema.fields.filter(f => f.filterable);
}

/**
 * Get all schema fields that support sorting.
 *
 * Used to populate sort UI menus.
 *
 * @param schema - The catalog schema
 * @returns - Array of sortable SchemaField definitions, ordered by sortOrder
 *
 * @example
 * const sortableFields = getSortableFields(schema);
 * const options = sortableFields.map(f => ({ label: f.label, value: f.key }));
 */
export function getSortableFields(schema: CatalogSchema): SchemaField[] {
	return schema.fields
		.filter(f => f.sortable)
		.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/**
 * Get all schema fields in a specific category.
 *
 * Useful for organizing fields in settings or UI.
 *
 * @param schema - The catalog schema
 * @param category - The field category to filter by
 * @returns - Array of SchemaField definitions in the category
 *
 * @example
 * const statusFields = getFieldsByCategory(schema, 'status');
 */
export function getFieldsByCategory(
	schema: CatalogSchema,
	category: 'metadata' | 'status' | 'workflow' | 'content' | 'custom'
): SchemaField[] {
	return schema.fields.filter(f => f.category === category);
}

/**
 * Merge multiple CatalogItems by taking non-null field values from each.
 *
 * Useful for updating an item with partial data.
 * Earlier items in the array take precedence.
 *
 * @param items - Array of CatalogItems to merge
 * @returns - A new CatalogItem with merged fields
 *
 * @example
 * const updated = mergeItems([originalItem, partialUpdate]);
 * // Fields from partialUpdate override originalItem where different
 */
export function mergeItems(...items: CatalogItem[]): CatalogItem {
	if (items.length === 0) {
		return new CatalogItem('', '');
	}

	const baseItem = items[0]!.clone();

	for (let i = 1; i < items.length; i++) {
		const nextItem = items[i]!;
		const nextFields = nextItem.getAllFields();

		for (const [key, value] of Object.entries(nextFields)) {
			if (value !== null && value !== undefined) {
				baseItem.setField(key, value);
			}
		}
	}

	return baseItem;
}
