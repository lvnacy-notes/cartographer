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
 * Safely convert a value to a Date
 * Returns the Date if possible, otherwise returns null
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
 * Coerce a field value to a valid Date constructor argument
 * Filters out non-date-like values and returns string | number | Date | null
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
 * Helper to get typed field from CatalogItem based on schema
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
 * Helper to work with items as strongly-typed objects
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
 * Parse field value based on its type definition
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
 * Format field value for display
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
