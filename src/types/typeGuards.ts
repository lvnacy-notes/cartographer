/**
 * @module typeGuards
 * @description Type Guards and Runtime Type Checking Utilities
 * 
 * This module provides runtime type validation functions and type guards for
 * working with catalog data. These utilities enable safe type narrowing and
 * runtime type checking in TypeScript.
 * 
 * ## Core Responsibilities
 * 
 * 1. **Type Guards**: Runtime type checking with TypeScript type narrowing
 * 2. **Data Conversion**: Transform CatalogItem instances to plain objects
 * 3. **Validation**: Verify data matches expected types before processing
 * 
 * ## Type Guard Pattern
 * 
 * Type guards use TypeScript's `is` keyword to enable type narrowing:
 * 
 * ```typescript
 * function processValue(value: unknown) {
 *   if (isDateLike(value)) {
 *     // TypeScript knows value is string | number | Date here
 *     const date = new Date(value);
 *     return date.toISOString();
 *   }
 *   return null;
 * }
 * ```
 * 
 * ## Usage Patterns
 * 
 * ### Date-Like Value Validation
 * ```typescript
 * // Check if a value can be converted to a Date
 * const userInput = getUserInput();
 * 
 * if (isDateLike(userInput)) {
 *   const date = new Date(userInput); // Safe to convert
 *   item.setField('publication-date', date);
 * } else {
 *   showError('Invalid date value');
 * }
 * ```
 * 
 * ### CatalogItem to Plain Object
 * ```typescript
 * // Convert CatalogItem to plain object for processing
 * const itemData = itemToObject(catalogItem, settings);
 * 
 * // All schema fields are now accessible as object properties
 * console.log(itemData.title); // string | null
 * console.log(itemData['word-count']); // number | null
 * console.log(itemData.authors); // string[] | null
 * 
 * // Useful for serialization, comparison, or debugging
 * const json = JSON.stringify(itemData);
 * const isSame = _.isEqual(itemToObject(item1, settings), itemToObject(item2, settings));
 * ```
 * 
 * ### Schema-Based Object Conversion
 * ```typescript
 * // Convert item to object with all schema fields present
 * const obj = itemToObject(item, settings);
 * 
 * // Missing fields are represented as null
 * // - If field exists in schema but not set on item: null
 * // - All schema fields are included in returned object
 * // - Field keys match schema field keys exactly
 * ```
 * 
 * ## Type Safety
 * 
 * Type guards provide compile-time and runtime safety:
 * - **Compile-time**: TypeScript narrows types after guard check
 * - **Runtime**: Actual validation occurs at runtime
 * - **No false positives**: Guards only return true for valid values
 * 
 * ## Common Use Cases
 * 
 * ### Input Validation
 * ```typescript
 * function setPublicationDate(item: CatalogItem, value: unknown) {
 *   if (!isDateLike(value)) {
 *     throw new Error('Invalid date value');
 *   }
 *   item.setField('publication-date', new Date(value));
 * }
 * ```
 * 
 * ### Data Export
 * ```typescript
 * function exportItems(items: CatalogItem[], settings: CartographerSettings) {
 *   return items.map(item => itemToObject(item, settings));
 * }
 * ```
 * 
 * ### Debugging
 * ```typescript
 * function debugItem(item: CatalogItem, settings: CartographerSettings) {
 *   const obj = itemToObject(item, settings);
 *   console.table(obj); // Display all fields in table format
 * }
 * ```
 * 
 * @see {@link CatalogItem} - The primary data structure for type guards
 * @see {@link CartographerSettings} - Provides schema for object conversion
 * @see {@link isDateLike} - Check if value can be converted to Date
 * @see {@link itemToObject} - Convert CatalogItem to plain object
 */

import { CatalogItem } from './catalogItem';
import { CartographerSettings } from './settings';

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
	settings: CartographerSettings
): Record<string, string | number | boolean | string[] | Date | null> {
	const obj: Record<string, string | number | boolean | string[] | Date | null> = {};
	for (const field of settings.schema.fields) {
		obj[field.key] = item.getField(field.key);
	}
	return obj;
}