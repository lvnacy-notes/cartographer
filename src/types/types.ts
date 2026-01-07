/**
 * Additional utility types and type guards
 */

import { CatalogItem } from './dynamicWork';
import { DatacoreSettings } from './settings';

/**
 * Type guard: Check if value can be converted to a Date
 */
export function isDateLike(value: unknown): value is string | number | Date {
	if (value instanceof Date) {return true;}
	if (typeof value === 'string' || typeof value === 'number') {
		const date = new Date(value);
		return !isNaN(date.getTime());
	}
	return false;
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
	settings: DatacoreSettings
): T | null {
	const fieldDef = settings.schema.fields.find((f) => f.key === fieldKey);
	if (!fieldDef) {
		return null;
	}
	return item.getField<T>(fieldKey);
}

/**
 * Helper to work with items as strongly-typed objects.
 * Converts a CatalogItem to a plain object with all schema fields included.
 *
 * @param item - The CatalogItem to convert
 * @param settings - Plugin settings (contains the schema)
 * @returns - Plain object with all schema fields (missing fields are null)
 *
 * @example
 * const obj = itemToObject(item, settings);
 * // Returns: { title: 'The Story', authors: ['Author'], year: 1928, ... }
 */
export function itemToObject(
	item: CatalogItem,
	settings: DatacoreSettings
): Record<string, string | number | boolean | string[] | Date | null> {
	const obj: Record<string, string | number | boolean | string[] | Date | null> = {};
	for (const field of settings.schema.fields) {
		obj[field.key] = item.getField(field.key);
	}
	return obj;
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
