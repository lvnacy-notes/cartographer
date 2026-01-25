/**
 * @module fieldUtils
 * @description Field Parsing, Formatting, and Conversion Utilities
 * 
 * This module provides utility functions for working with catalog field values,
 * including type coercion, parsing, formatting, and retrieval. These utilities
 * bridge the gap between raw data values and typed, display-ready content.
 * 
 * ## Core Responsibilities
 * 
 * 1. **Type Coercion**: Convert values to appropriate types for processing
 * 2. **Parsing**: Transform raw values into typed field values based on schema
 * 3. **Formatting**: Convert typed values to human-readable display strings
 * 4. **Field Access**: Type-safe retrieval of fields from CatalogItem instances
 * 
 * ## Usage Patterns
 * 
 * ### Parsing User Input
 * ```typescript
 * // Convert form input to typed value
 * const year = parseFieldValue(inputValue, 'number'); // string -> number
 * const published = parseFieldValue(checkboxValue, 'boolean'); // string -> boolean
 * const tags = parseFieldValue(tagInput, 'array'); // string -> string[]
 * ```
 * 
 * ### Formatting for Display
 * ```typescript
 * // Convert typed values to display strings
 * const dateStr = formatFieldValue(work.publicationDate, 'date'); // Date -> "1/6/2026"
 * const statusStr = formatFieldValue(work.published, 'boolean'); // true -> "✓"
 * const authorsStr = formatFieldValue(work.authors, 'array'); // ["A", "B"] -> "A, B"
 * ```
 * 
 * ### Type-Safe Field Access
 * ```typescript
 * // Get typed field values from CatalogItem
 * const title = getTypedField<string>(item, 'title', settings);
 * const wordCount = getTypedField<number>(item, 'word-count', settings);
 * const authors = getTypedField<string[]>(item, 'authors', settings);
 * ```
 * 
 * ### Date Handling
 * ```typescript
 * // Coerce values to date-compatible types
 * const dateValue = coerceToValidDateValue(fieldValue); // Filters out invalid types
 * const date = toDate(dateValue); // Converts to Date object or null
 * ```
 * 
 * ## Field Type Support
 * 
 * The utilities support all Cartographer field types:
 * - `string` - Text values
 * - `number` - Numeric values (integers, floats)
 * - `boolean` - True/false values
 * - `date` - Date/timestamp values
 * - `array` - String arrays
 * - `wikilink-array` - Arrays of wikilinks (treated as string arrays)
 * 
 * ## Null Handling
 * 
 * All functions gracefully handle null/undefined values:
 * - **Parsing**: `null`/`undefined` → `null`
 * - **Formatting**: `null`/`undefined` → `"-"` (display placeholder)
 * - **Coercion**: Invalid types → `null`
 * - **Conversion**: Invalid dates → `null`
 * 
 * @see {@link CatalogItem} - The primary data structure these utilities operate on
 * @see {@link CartographerSettings} - Contains schema definitions used for field type lookup
 * @see {@link parseFieldValue} - Convert raw values to typed field values
 * @see {@link formatFieldValue} - Convert typed values to display strings
 * @see {@link getTypedField} - Type-safe field retrieval from CatalogItem
 */

import { CatalogItem } from "./catalogItem";
import { CartographerSettings } from "./settings";

/**
 * Coerce a field value to a valid Date constructor argument.
 * Filters out non-date-like values and returns string | number | Date | null.
 *
 * @param value - A potential date value
 * @returns - String, number, Date, or null (suitable for Date constructor)
 *
 * @example
 * const coerced1 = coerceToValidDateValue('2026-01-06'); // Returns: '2026-01-06'
 * const coerced2 = coerceToValidDateValue(new Date()); // Returns: Date object
 * const coerced3 = coerceToValidDateValue(true); // Returns: null (boolean not valid for Date)
 */
export function coerceToValidDateValue(
    value: string | number | boolean | string[] | Date | null | undefined
): string | number | Date | null {
    if (value === null || value === undefined) {return null;}
    if (value instanceof Date) {return value;}
    if (typeof value === 'string' || typeof value === 'number') {return value;}
    // For boolean or array types, return null (not valid for Date)
    return null;
}

/**
 * Format field value for display in UI.
 * Converts values to human-readable string representation based on type.
 *
 * @param value - The value to format
 * @param fieldType - The field type (determines formatting)
 * @returns - Formatted string suitable for display, or '-' if null/undefined
 *
 * @example
 * const dateStr = formatFieldValue(new Date('2026-01-06'), 'date'); // Returns: '1/6/2026'
 * const boolStr = formatFieldValue(true, 'boolean'); // Returns: '✓'
 * const arrStr = formatFieldValue(['a', 'b'], 'array'); // Returns: 'a, b'
 * const nullStr = formatFieldValue(null, 'string'); // Returns: '-'
 */
export function formatFieldValue(
	value: string | number | boolean | string[] | Date | null | undefined,
	fieldType: string
): string {
	if (value === null || value === undefined) {
		return '-';
	}

	switch (fieldType) {
		case 'date': {
			const dateValue = toDate(value);
			if (dateValue) {
				return dateValue.toLocaleDateString();
			}
			return '-';
		}
		case 'boolean':
			return value ? '✓' : '✗';
		case 'number':
			return String(value);
		case 'array':
		case 'wikilink-array':
			if (Array.isArray(value)) {
				return value.join(', ');
			}
			return String(value);
		case 'string':
		default:
			return String(value);
	}
}

/**
 * Helper to get typed field from CatalogItem based on schema.
 * Looks up the field definition in the schema and returns the typed value.
 *
 * @template T - Expected return type of the field
 * @param item - The CatalogItem to read from
 * @param fieldKey - The field key to retrieve
 * @param settings - Plugin settings (contains the schema)
 * @returns - The typed field value, or null if field not found or not set
 *
 * @example
 * const title = getTypedField<string>(item, 'title', settings);
 * const wordCount = getTypedField<number>(item, 'word-count', settings);
 * const authors = getTypedField<string[]>(item, 'authors', settings);
 */
export function getTypedField<T>(
    item: CatalogItem,
    fieldKey: string,
    settings: CartographerSettings
): T | null {
    const fieldDef = settings.schema.fields.find((f) => f.key === fieldKey);
    if (!fieldDef) {
        return null;
    }
    return item.getField<T>(fieldKey);
}

/**
 * Parse field value based on its type definition.
 * Coerces values to the correct type (number, boolean, date, array, etc.).
 *
 * @param value - The raw value to parse
 * @param fieldType - The target field type (determines coercion logic)
 * @returns - Parsed value of the correct type, or null if value is null/undefined
 *
 * @example
 * const num = parseFieldValue('5000', 'number'); // Returns: 5000
 * const bool = parseFieldValue('true', 'boolean'); // Returns: true
 * const date = parseFieldValue('2026-01-06', 'date'); // Returns: Date object
 * const arr = parseFieldValue('item1', 'array'); // Returns: ['item1']
 */
export function parseFieldValue(
	value: string | number | boolean | string[] | Date | null | undefined,
	fieldType: string
): string | number | boolean | string[] | Date | null {
	if (value === null || value === undefined) {
		return null;
	}

	switch (fieldType) {
		case 'number':
			return typeof value === 'number' ? value : parseFloat(String(value));
		case 'boolean':
			if (typeof value === 'boolean') {return value;}
			return String(value).toLowerCase() === 'true';
		case 'date': {
			const dateValue = toDate(value);
			return dateValue ?? null;
		}
		case 'array':
		case 'wikilink-array':
			return Array.isArray(value) ? value : [String(value)];
		case 'string':
		default:
			return String(value);
	}
}

/**
 * Safely convert a value to a Date.
 * Returns the Date if possible, otherwise returns null.
 *
 * @param value - Any value that might be a date
 * @returns - Date object if conversion succeeds, null otherwise
 *
 * @example
 * const date1 = toDate('2026-01-06'); // Returns: Date object
 * const date2 = toDate(1704844800000); // Returns: Date object (timestamp)
 * const date3 = toDate('invalid'); // Returns: null
 */
export function toDate(value: unknown): Date | null {
	if (value instanceof Date) {
		return isNaN(value.getTime()) ? null : value;
	}
	if (typeof value === 'string' || typeof value === 'number') {
		const date = new Date(value);
		return isNaN(date.getTime()) ? null : date;
	}
	return null;
}