/**
 * Column rendering utilities for table cell display
 * Handles rendering catalog item field values in table cells with proper type conversions
 */

import { CatalogItem } from '../types/dynamicWork';
import {
	CatalogSchema,
	SchemaField
} from '../types/settings';
import {
	formatArray,
	formatBoolean,
	formatDate,
	formatNumber,
	formatObject,
	formatWikilinkArray,
} from './fieldFormatters';

/**
 * Render a catalog item field value for table cell display
 * Handles all 7 SchemaField types with appropriate formatting
 * @param item - The CatalogItem containing the field value
 * @param fieldKey - The key/name of the field to render
 * @param schema - The catalog schema (provides field type information)
 * @returns Rendered cell content as string (or '-' if field not found/empty)
 * @example
 * renderCell(item, 'authors', schema) // 'Lovecraft, H.P., Poe, Edgar'
 * renderCell(item, 'year', schema) // '1928'
 * renderCell(item, 'bp-candidate', schema) // 'Yes'
 */
export function renderCell(
	item: CatalogItem,
	fieldKey: string,
	schema: CatalogSchema
): string {
	const field = schema.fields.find(f => f.key === fieldKey);
	const value = item.getField(fieldKey);

	if (!field) {
		return '-';
	}

	switch (field.type) {
		case 'date': {
			return formatDate(value);
		}

		case 'number': {
			return formatNumber(value);
		}

		case 'boolean': {
			return formatBoolean(value);
		}

		case 'array': {
			return formatArray(value);
		}

		case 'wikilink-array': {
			return formatWikilinkArray(value);
		}

		case 'object': {
			return formatObject(value);
		}

		case 'string':
		default: {
			if (value === null || value === undefined) {
				return '-';
			}
			if (typeof value === 'string') {
				return value;
			}
			return (value as string).toString();
		}
	}
}

/**
 * Render a cell value with optional character truncation
 * Useful for long text fields in narrow table columns
 * @param item - The CatalogItem containing the field value
 * @param fieldKey - The key/name of the field to render
 * @param schema - The catalog schema
 * @param maxLength - Optional maximum characters before truncation with ellipsis
 * @returns Rendered and optionally truncated cell content
 * @example
 * renderCellTruncated(item, 'synopsis', schema, 50) // 'This is a long synopsis...'
 */
export function renderCellTruncated(
	item: CatalogItem,
	fieldKey: string,
	schema: CatalogSchema,
	maxLength?: number
): string {
	const rendered = renderCell(item, fieldKey, schema);

	if (!maxLength || rendered === '-' || rendered.length <= maxLength) {
		return rendered;
	}

	return `${ rendered.substring(0, maxLength) }...`;
}

/**
 * Render cell content with HTML escaping for safe display
 * Escapes special HTML characters to prevent XSS attacks
 * @param item - The CatalogItem containing the field value
 * @param fieldKey - The key/name of the field to render
 * @param schema - The catalog schema
 * @returns HTML-safe cell content with escaped special characters
 * @example
 * renderCellSafe(item, 'title', schema) // 'Call of Cthulhu' (with < > & escaped if present)
 */
export function renderCellSafe(
	item: CatalogItem,
	fieldKey: string,
	schema: CatalogSchema
): string {
	const content = renderCell(item, fieldKey, schema);

	return content
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Check if a field value is "empty" (null, undefined, empty array, or empty string)
 * @param value - The value to check
 * @returns True if value is considered empty, false otherwise
 * @example
 * isEmpty(null) // true
 * isEmpty([]) // true
 * isEmpty('') // true
 * isEmpty('value') // false
 */
export function isEmpty(value: unknown): boolean {
	if (value === null || value === undefined) {
		return true;
	}
	if (typeof value === 'string' && value.trim() === '') {
		return true;
	}
	if (Array.isArray(value) && value.length === 0) {
		return true;
	}
	return false;
}

/**
 * Compare two cell values for sorting across all SchemaField types
 * Handles type-specific comparison logic for each field type
 * @param valueA - First value to compare
 * @param valueB - Second value to compare
 * @param fieldType - The schema field type (determines comparison logic)
 * @returns -1 if A < B, 0 if A === B, 1 if A > B (empty values sort to end)
 * @example
 * compareCellValues('a', 'b', 'string') // -1
 * compareCellValues(1928, 1923, 'number') // 1
 */
export function compareCellValues(
	valueA: unknown,
	valueB: unknown,
	fieldType: SchemaField['type']
): number {
	const aEmpty = isEmpty(valueA);
	const bEmpty = isEmpty(valueB);

	if (aEmpty && bEmpty) {
		return 0;
	}
	if (aEmpty) {
		return 1;
	}
	if (bEmpty) {
		return -1;
	}

	switch (fieldType) {
		case 'number': {
			const numA = typeof valueA === 'number' ? valueA : parseFloat(String(valueA));
			const numB = typeof valueB === 'number' ? valueB : parseFloat(String(valueB));
			if (isNaN(numA) || isNaN(numB)) {
				return 0;
			}
			return numA < numB ? -1 : numA > numB ? 1 : 0;
		}

		case 'date': {
			const dateA = valueA instanceof Date ? valueA : new Date(String(valueA));
			const dateB = valueB instanceof Date ? valueB : new Date(String(valueB));
			const timeA = dateA.getTime();
			const timeB = dateB.getTime();
			if (isNaN(timeA) || isNaN(timeB)) {
				return 0;
			}
			return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
		}

		case 'boolean': {
			const boolA = valueA === true || valueA === 'true' || valueA === 1;
			const boolB = valueB === true || valueB === 'true' || valueB === 1;
			return boolA === boolB ? 0 : boolA ? 1 : -1;
		}

		case 'array':
		case 'wikilink-array': {
			const lenA = Array.isArray(valueA) ? valueA.length : 0;
			const lenB = Array.isArray(valueB) ? valueB.length : 0;
			return lenA < lenB ? -1 : lenA > lenB ? 1 : 0;
		}

		case 'string':
		case 'object':
		default: {
			const strA = String(valueA).toLowerCase();
			const strB = String(valueB).toLowerCase();
			return strA < strB ? -1 : strA > strB ? 1 : 0;
		}
	}
}
