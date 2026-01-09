/**
 * Dynamic Work Interface & Catalog Item Class
 *
 * Provides a flexible, schema-agnostic abstraction for catalog items
 * that adapts to any configured library schema. All field access is
 * via getters/setters, not direct property access.
 * 
 * Types:
 * - FieldValue - valid field value types
 * - StoredFieldValue - includes object types for complex fields
 * 
 * Interfaces:
 * - CatalogStatistics - statistics summary for a catalog
 * - FilterState - filter state for component use
 * - SortState - sort state
 * 
 * Classes:
 * - CatalogItem - represents a single work/document in the catalog
 * 
 * Functions:
 * - buildCatalogItemFromData - constructs a CatalogItem from raw data and schema
 * - convertFieldValue - converts raw field values to schema-defined types
 * - getTypedField - type-safe field getter based on schema
 * - itemToObject - converts a CatalogItem to a plain object using schema
 */

import type {
	CatalogSchema,
	SchemaField
} from './settings';

/**
 * Valid field value type - represents all possible types that can be stored in catalog fields.
 * Used throughout query functions for type consistency.
 */
export type FieldValue = string | number | boolean | string[] | Date | null;

/**
 * Stored field value - includes object types for complex fields.
 * Used internally for field storage and retrieval.
 */
export type StoredFieldValue = FieldValue | Record<string, unknown>;

/**
 * Statistics summary for a catalog
 */
export interface CatalogStatistics {
	total: number;
	byStatus?: Record<string, number>;
	byAuthor?: Record<string, number>;
	yearRange?: [number, number];
	totalWordCount?: number;
	averageWordCount?: number;
}

/**
 * Filter state for component use
 */
export interface FilterState {
	status?: string[];
	author?: string[];
	year?: [number, number];
	text?: string;
	[key: string]: string | string[] | [number, number] | undefined;
}

/**
 * Sort state
 */
export interface SortState {
	field: string;
	desc: boolean;
}

/**
 * CatalogItem represents a single work/document in a library catalog.
 *
 * Uses dynamic field storage to support any schema configuration.
 * Field values are type-checked at runtime based on schema definition.
 *
 * @example
 * const item = new CatalogItem('work-001', 'pulp-fiction/works/my-story.md');
 * item.setField('title', 'The Cosmic Horror');
 * item.setField('authors', ['Lovecraft, H. P.']);
 * const title = item.getField<string>('title');
 */
export class CatalogItem {
	id: string;
	filePath: string;
	private fields: Record<string, StoredFieldValue> = {};

	/**
	 * Create a new CatalogItem.
	 *
	 * @param id - Unique identifier for this catalog item
	 * @param filePath - Vault-relative path to the markdown file
	 */
	constructor(id: string, filePath: string) {
		this.id = id;
		this.filePath = filePath;
	}

	/**
	 * Get a field value with optional type coercion.
	 *
	 * Returns null if field is not set or has a null/undefined value.
	 *
	 * @template T - Expected type of the field value
	 * @param fieldKey - The field key to retrieve
	 * @returns - The field value, or null if not set
	 *
	 * @example
	 * const title = item.getField<string>('title');
	 * const wordCount = item.getField<number>('word-count');
	 * const authors = item.getField<string[]>('authors');
	 */
	getField<T>(fieldKey: string): T | null {
		const value = this.fields[fieldKey];
		if (value === null || value === undefined) {
			return null;
		}
		return value as T;
	}

	/**
	 * Set a field value.
	 *
	 * Can be used to update any field. The actual type validation
	 * should be performed by the caller or the data loading layer.
	 *
	 * @param fieldKey - The field key to set
	 * @param value - The value to store
	 *
	 * @example
	 * item.setField('title', 'The Cosmic Horror');
	 * item.setField('word-count', 5000);
	 * item.setField('authors', ['Lovecraft, H. P.']);
	 */
	setField(fieldKey: string, value: StoredFieldValue): void {
		this.fields[fieldKey] = value;
	}

	/**
	 * Check if a field has been set (not null/undefined).
	 *
	 * @param fieldKey - The field key to check
	 * @returns - True if field exists and is not null/undefined
	 */
	hasField(fieldKey: string): boolean {
		const value = this.fields[fieldKey];
		return value !== null && value !== undefined;
	}

	/**
	 * Get all fields as a plain object.
	 *
	 * Useful for exporting or passing to other functions.
	 * Returns a shallow copy of the internal fields object.
	 *
	 * @returns - Object with all field keys and values
	 */
	getAllFields(): Record<string, StoredFieldValue> {
		return { ...this.fields };
	}

	/**
	 * Clear all field values.
	 *
	 * Useful for resetting an item before reloading data.
	 */
	clearFields(): void {
		this.fields = {};
	}

	/**
	 * Serialize item to JSON (including id and filePath).
	 *
	 * @returns - Plain object with id, filePath, and all fields
	 */
	toJSON(): Record<string, StoredFieldValue | null | string> {
		return {
			id: this.id,
			filePath: this.filePath,
			...this.fields,
		};
	}

	/**
	 * Create a shallow copy of this item.
	 *
	 * Useful for filtering operations that need to return new instances.
	 *
	 * @returns - A new CatalogItem with same id, filePath, and fields
	 */
	clone(): CatalogItem {
		const cloned = new CatalogItem(this.id, this.filePath);
		cloned.fields = { ...this.fields };
		return cloned;
	}
}

/**
 * Build a CatalogItem from raw frontmatter data and schema.
 *
 * Applies type conversions and field validation based on schema definition.
 * This is the primary way to construct CatalogItems from parsed markdown files.
 *
 * @param rawData - Parsed frontmatter data (key-value object)
 * @param id - Unique identifier for this item
 * @param filePath - Vault-relative path to the markdown file
 * @param schema - The catalog schema for type information
 * @returns - A new CatalogItem with all fields set according to schema
 *
 * @example
 * const parsedYAML = { title: 'Story', authors: ['Author 1'], 'word-count': 5000 };
 * const item = buildCatalogItemFromData(parsedYAML, 'id-001', 'works/story.md', schema);
 */
export function buildCatalogItemFromData(
	rawData: Record<string, unknown>,
	id: string,
	filePath: string,
	schema: CatalogSchema
): CatalogItem {
	const item = new CatalogItem(id, filePath);

	// Set each field from raw data, applying schema-based type conversion
	for (const fieldDef of schema.fields) {
		const rawValue = rawData[fieldDef.key];
		const typedValue = convertFieldValue(rawValue, fieldDef);
		if (typedValue !== undefined) {
			item.setField(fieldDef.key, typedValue);
		}
	}

	return item;
}

/**
 * Convert a raw field value to its schema-defined type.
 *
 * Handles type coercion for all supported field types:
 * - string, number, boolean, date, array, wikilink-array, object
 *
 * @param rawValue - The raw value from parsed YAML
 * @param fieldDef - The schema field definition
 * @returns - Converted value, or undefined if conversion fails
 */
export function convertFieldValue(
	rawValue: unknown,
	fieldDef: SchemaField
): StoredFieldValue | undefined {
	// Null/undefined pass through
	if (rawValue === null || rawValue === undefined) {
		return undefined;
	}

	switch (fieldDef.type) {
		case 'string': {
			if (typeof rawValue === 'string') {
				return rawValue;
			}
			if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
				return String(rawValue);
			}
			return undefined;
		}

		case 'number': {
			if (typeof rawValue === 'number') {
				return rawValue;
			}
			const num = Number(rawValue);
			return isNaN(num) ? undefined : num;
		}

		case 'boolean': {
			if (typeof rawValue === 'boolean') {
				return rawValue;
			}
			if (typeof rawValue === 'string') {
				return rawValue.toLowerCase() === 'true';
			}
			return Boolean(rawValue);
		}

		case 'date': {
			if (rawValue instanceof Date) {
				return rawValue;
			}
			if (typeof rawValue === 'string' || typeof rawValue === 'number') {
				try {
					return new Date(rawValue);
				} catch {
					return undefined;
				}
			}
			return undefined;
		}

		case 'array': {
			if (Array.isArray(rawValue)) {
				// Convert array items if needed
				if (fieldDef.arrayItemType === 'string') {
					const mapped: string[] = rawValue.map((v: unknown) => {
						if (typeof v === 'string') {
							return v;
						}
						if (typeof v === 'number' || typeof v === 'boolean') {
							return String(v);
						}
						return String(v);
					});
					return mapped;
				}
				// Return array as-is when no specific item type conversion needed
				return rawValue as unknown[] as string[];
			}
			// Single value becomes single-item array
			if (typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
				return [String(rawValue)];
			}
			return undefined;
		}

		case 'wikilink-array': {
			if (Array.isArray(rawValue)) {
				const mapped: string[] = rawValue.map((v: unknown) => {
					if (typeof v === 'string') {
						return v;
					}
					if (typeof v === 'number' || typeof v === 'boolean') {
						return String(v);
					}
					return String(v);
				});
				return mapped;
			}
			// Single wikilink becomes single-item array
			if (typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
				return [String(rawValue)];
			}
			return undefined;
		}

		case 'object': {
			if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
				return rawValue as Record<string, unknown>;
			}
			return undefined;
		}

		default: {
			const _exhaustive: never = fieldDef.type;
			return _exhaustive;
		}
	}
}

/**
 * Get a typed field value from a CatalogItem based on schema definition.
 *
 * This is a type-safe helper that respects the field's defined type in the schema.
 *
 * @template T - Expected return type
 * @param item - The CatalogItem to read from
 * @param fieldKey - The field key to retrieve
 * @param schema - The catalog schema (for field type information)
 * @returns - The typed field value, or null if not set
 *
 * @example
 * const title = getTypedField<string>(item, 'title', schema);
 * const wordCount = getTypedField<number>(item, 'word-count', schema);
 */
export function getTypedField<T>(
	item: CatalogItem,
	fieldKey: string,
	schema: CatalogSchema
): T | null {
	const fieldDef = schema.fields.find(f => f.key === fieldKey);
	if (!fieldDef) {
		return null;
	}

	return item.getField<T>(fieldKey);
}

/**
 * Convert a CatalogItem to a plain object using schema field definitions.
 *
 * This ensures the returned object includes all schema-defined fields,
 * with null values for missing fields.
 *
 * @param item - The CatalogItem to convert
 * @param schema - The catalog schema
 * @returns - Plain object with all schema fields (including nulls for missing fields)
 *
 * @example
 * const obj = itemToObject(item, schema);
 * // Returns: { title: '...', authors: [...], year: null, ... }
 */
export function itemToObject(
	item: CatalogItem,
	schema: CatalogSchema
): Record<string, StoredFieldValue | null | string> {
	const obj: Record<string, StoredFieldValue | null | string> = {
		id: item.id,
		filePath: item.filePath,
	};

	// Add all schema fields (with null for missing fields)
	for (const fieldDef of schema.fields) {
		const value = item.getField<StoredFieldValue>(fieldDef.key);
		obj[fieldDef.key] = value ?? null;
	}

	return obj;
}