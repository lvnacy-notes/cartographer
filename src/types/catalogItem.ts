/**
 * Catalog Item Data Model
 * 
 * Provides a flexible, schema-agnostic abstraction for catalog items that adapts
 * to any configured library schema. The `CatalogItem` class uses dynamic field
 * storage, allowing it to work with any field configuration without requiring
 * compile-time knowledge of the schema.
 * 
 * Types:
 * - FieldValue - valid field value types
 * - StoredFieldValue - includes object types for complex fields
 * 
 * Interfaces:
 * - QueryFilter - filter state for backend filtering operations
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
 * 
 * **Core Design Principles:**
 * - **Schema-agnostic**: Works with any field configuration
 * - **Runtime type safety**: Fields are validated against schema at runtime
 * - **No direct property access**: All field access via getters/setters
 * - **Immutable patterns**: Clone for filtering, pure functions for transformation
 * 
 * **Architecture:**
 * 1. **CatalogItem Class**: Dynamic storage container for catalog entries
 * 2. **Builder Functions**: Convert raw data to typed CatalogItems
 * 3. **Type Converters**: Handle schema-based type coercion
 * 4. **Utility Functions**: Type-safe getters and serialization
 * 
 * **Data Flow:**
 * ```
 * Markdown File → Parse YAML → Raw Data → buildCatalogItemFromData() →
 * → convertFieldValue() → CatalogItem with typed fields
 * ```
 * 
 * @module catalogItem
 * 
 * @example
 * ```typescript
 * import { CatalogItem, buildCatalogItemFromData } from '../types';
 * 
 * // Manual construction
 * const item = new CatalogItem('work-001', 'works/story.md');
 * item.setField('title', 'The Cosmic Horror');
 * item.setField('word-count', 5000);
 * 
 * // From raw data (preferred)
 * const rawData = { title: 'Story', 'word-count': 5000 };
 * const item = buildCatalogItemFromData(rawData, 'work-001', 'works/story.md', schema);
 * ```
 */

import type {
	CatalogSchema,
	SchemaField
} from './settings';
import type { YearRange } from './statistics';

/**
 * Valid field value types that can be stored in catalog fields.
 * 
 * This type union represents all possible runtime values for catalog fields.
 * Used throughout the query and filtering system for type consistency.
 * 
 * **Supported Types:**
 * - `string`: Text values (titles, names, descriptions)
 * - `number`: Numeric values (word counts, page numbers, ratings)
 * - `boolean`: True/false flags
 * - `string[]`: Arrays of strings (tags, genres, keywords)
 * - `Date`: Date/timestamp values
 * - `null`: Explicitly unset or missing values
 * 
 * **Note on Arrays:**
 * Only string arrays are included in FieldValue. Arrays of other types
 * (numbers, booleans, dates) are not currently supported and would need
 * to be stored as string arrays and converted on read.
 * 
 * @typedef {(string | number | boolean | string[] | Date | null)} FieldValue
 * 
 * @example
 * ```typescript
 * // Valid FieldValue examples
 * const title: FieldValue = 'The Call of Cthulhu';
 * const wordCount: FieldValue = 15000;
 * const published: FieldValue = true;
 * const tags: FieldValue = ['horror', 'lovecraft', 'cosmic'];
 * const publishDate: FieldValue = new Date('1928-02-01');
 * const unpublished: FieldValue = null;
 * ```
 * 
 * @see {@link StoredFieldValue} for internal storage type that includes objects
 */
export type FieldValue = string | number | boolean | string[] | Date | null;

/**
 * Stored field value type - extends FieldValue to include object types.
 * 
 * Used internally for field storage and retrieval. This type allows storing
 * complex structured data in addition to the standard field types. The object
 * type is primarily used for:
 * - Future extensibility (custom field types)
 * - Intermediate parsing states
 * - Complex metadata structures
 * 
 * **Internal Use Only:**
 * This type is used within the CatalogItem class's internal storage. External
 * code should typically work with FieldValue instead.
 * 
 * @typedef {(FieldValue | Record<string, unknown>)} StoredFieldValue
 * @internal
 * 
 * @example
 * ```typescript
 * // StoredFieldValue can include objects
 * const metadata: StoredFieldValue = {
 *   revision: 3,
 *   lastEditor: 'user@example.com',
 *   changes: ['title', 'content']
 * };
 * ```
 * 
 * @see {@link FieldValue} for the public-facing field value type
 */
export type StoredFieldValue = FieldValue | Record<string, unknown>;

/**
 * Query filter criteria for filtering catalog items.
 * 
 * Represents structured filter conditions used in backend query operations. Unlike the
 * UI-focused `FilterState` in componentProps.ts (which uses generic `unknown` values),
 * `QueryFilter` uses specific types optimized for backend filtering operations.
 * 
 * **Filter Types:**
 * - **Array filters** (`status`, `author`): OR logic - match any value in array
 * - **Range filters** (`year`): AND logic - value must be within [min, max] range
 * - **Text filters** (`text`): Substring matching (case-insensitive)
 * - **Custom filters**: Any field via index signature
 * 
 * **Predefined Filter Fields:**
 * Common fields are predefined for convenience, but the index signature allows
 * filtering on any field defined in the schema.
 * 
 * **Range Format:**
 * Ranges use YearRange objects with `min` and `max` properties rather than tuples
 * for more compact representation and easier destructuring in filter logic.
 * 
 * @interface QueryFilter
 * 
 * @property {string[]} [status] - Optional array of status values to match (OR logic).
 *   Items with any of these status values will be included. Example: `['draft', 'published']`
 *   includes items that are either draft or published.
 * 
 * @property {string[]} [author] - Optional array of author names to match (OR logic).
 *   Items authored by any of these authors will be included. For items with multiple
 *   authors, matches if any author is in the list.
 * 
 * @property {YearRange} [year] - Optional year range as object with min/max (AND logic).
 *   Items with year >= min AND year <= max will be included. Example: `{ min: 1920, max: 1930 }`
 *   includes items published between 1920 and 1930 (inclusive).
 * 
 * @property {string} [text] - Optional text filter for substring matching. Applied
 *   to text fields with case-insensitive contains logic. Example: `'cthulhu'` matches
 *   titles containing "Cthulhu", "cthulhu", or "CTHULHU".
 * 
 * @property {(string | string[] | YearRange | undefined)} [key: string] -
 *   Index signature allowing filters on any schema field. Value type depends on
 *   filter type:
 *   - Single value filters: `string`
 *   - Multi-select filters: `string[]`
 *   - Range filters: `YearRange` object
 *   - Unset filters: `undefined`
 * 
 * @example
 * ```typescript
 * // Basic status filter
 * const filter1: QueryFilter = {
 *   status: ['draft', 'in-review']
 * };
 * 
 * // Multiple filter types combined
 * const filter2: QueryFilter = {
 *   status: ['published'],
 *   author: ['Lovecraft, H. P.', 'Smith, Clark Ashton'],
 *   year: { min: 1920, max: 1935 },
 *   text: 'cosmic horror'
 * };
 * 
 * // Custom field filters
 * const filter3: QueryFilter = {
 *   'word-count': { min: 5000, max: 10000 },  // Range on word count
 *   'genre': ['horror', 'fantasy'], // Multi-select on genre
 *   'publication': 'Weird Tales'    // Single value on publication
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Using QueryFilter in a filtering function
 * function applyFilter(items: CatalogItem[], filter: QueryFilter): CatalogItem[] {
 *   return items.filter(item => {
 *     // Check status filter
 *     if (filter.status) {
 *       const itemStatus = item.getField<string>('catalog-status');
 *       if (!itemStatus || !filter.status.includes(itemStatus)) {
 *         return false;
 *       }
 *     }
 *     
 *     // Check year range filter
 *     if (filter.year) {
 *       const itemYear = item.getField<number>('year-published');
 *       if (!itemYear || itemYear < filter.year.min || itemYear > filter.year.max) {
 *         return false;
 *       }
 *     }
 *     
 *     return true;
 *   });
 * }
 * ```
 * 
 * @see {@link FilterState} in componentProps.ts for UI-focused filter state with generic values
 * @see {@link YearRange} in statistics.ts for year range type definition
 */
export interface QueryFilter {
	status?: string[];
	author?: string[];
	year?: YearRange;
	text?: string;
	[key: string]: unknown;
}

/**
 * Sort state configuration for sorting catalog items.
 * 
 * Defines which field to sort by and the sort direction. Used throughout the
 * application for table sorting, query result ordering, and list displays.
 * 
 * **Sort Direction:**
 * - `desc: true`: Descending order (Z→A, 9→0, newest→oldest)
 * - `desc: false`: Ascending order (A→Z, 0→9, oldest→newest)
 * 
 * **Common Sort Fields:**
 * - `title`: Alphabetical by title
 * - `word-count`: Numeric by word count
 * - `year-published`: Chronological by publication year
 * - `catalog-status`: Alphabetical by status
 * - `last-modified`: Chronological by modification date
 * 
 * @interface SortState
 * 
 * @property {string} field - Schema field key to sort by (e.g., 'title', 'word-count',
 *   'year-published'). Must be a valid field key from the active library's schema.
 *   The field should have `sortable: true` in its schema definition.
 * 
 * @property {boolean} desc - Sort direction flag. `true` for descending order
 *   (largest/latest/last first), `false` for ascending order (smallest/earliest/first first).
 * 
 * @example
 * ```typescript
 * // Sort by title, ascending (A→Z)
 * const sortByTitle: SortState = {
 *   field: 'title',
 *   desc: false
 * };
 * 
 * // Sort by word count, descending (largest first)
 * const sortByWordCount: SortState = {
 *   field: 'word-count',
 *   desc: true
 * };
 * 
 * // Sort by publication year, descending (newest first)
 * const sortByYear: SortState = {
 *   field: 'year-published',
 *   desc: true
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Using SortState in a sorting function
 * function applySorting(items: CatalogItem[], sort: SortState, schema: CatalogSchema): CatalogItem[] {
 *   const fieldDef = schema.fields.find(f => f.key === sort.field);
 *   if (!fieldDef || !fieldDef.sortable) {
 *     return items; // Field not sortable, return unsorted
 *   }
 *   
 *   return [...items].sort((a, b) => {
 *     const aVal = a.getField(sort.field);
 *     const bVal = b.getField(sort.field);
 *     
 *     // Null handling
 *     if (aVal === null && bVal === null) return 0;
 *     if (aVal === null) return 1;
 *     if (bVal === null) return -1;
 *     
 *     // Comparison based on type
 *     let comparison = 0;
 *     if (typeof aVal === 'string' && typeof bVal === 'string') {
 *       comparison = aVal.localeCompare(bVal);
 *     } else if (typeof aVal === 'number' && typeof bVal === 'number') {
 *       comparison = aVal - bVal;
 *     }
 *     
 *     return sort.desc ? -comparison : comparison;
 *   });
 * }
 * ```
 * 
 * @see {@link WorksTableProps} in componentProps.ts for table sorting integration
 */
export interface SortState {
	field: string;
	desc: boolean;
}

/**
 * CatalogItem represents a single work/document in a library catalog.
 * 
 * This class provides a flexible, schema-agnostic container for catalog entries.
 * Instead of having fixed properties, it uses dynamic field storage that adapts
 * to whatever schema is configured for the library.
 * 
 * **Design Philosophy:**
 * - **Dynamic over Static**: No compile-time field definitions
 * - **Schema-driven**: Field types determined by schema at runtime
 * - **Encapsulated**: All field access through getter/setter methods
 * - **Immutable-friendly**: Clone method for functional transformations
 * 
 * **Core Properties:**
 * - `id`: Unique identifier (usually from idField in schema)
 * - `filePath`: Vault-relative path to the source markdown file
 * - `fields`: Internal storage for all dynamic fields (private)
 * 
 * **Field Storage:**
 * Fields are stored in a private `Record<string, StoredFieldValue>` and accessed
 * via `getField()` and `setField()` methods. This allows runtime type checking
 * and schema validation.
 * 
 * **Usage Patterns:**
 * 1. **Construction**: Use `buildCatalogItemFromData()` for type-safe creation
 * 2. **Field Access**: Use `getField<T>()` with type parameter for type safety
 * 3. **Filtering**: Use `clone()` to create copies without mutating originals
 * 4. **Serialization**: Use `toJSON()` or `itemToObject()` for export
 * 
 * @class CatalogItem
 * 
 * @example
 * ```typescript
 * // Manual construction (not recommended)
 * const item = new CatalogItem('work-001', 'pulp-fiction/works/my-story.md');
 * item.setField('title', 'The Cosmic Horror');
 * item.setField('authors', ['Lovecraft, H. P.']);
 * item.setField('word-count', 15000);
 * 
 * // Type-safe field access
 * const title = item.getField<string>('title');        // 'The Cosmic Horror'
 * const wordCount = item.getField<number>('word-count'); // 15000
 * const authors = item.getField<string[]>('authors');   // ['Lovecraft, H. P.']
 * 
 * // Field existence check
 * if (item.hasField('publish-date')) {
 *   const date = item.getField<Date>('publish-date');
 *   console.log('Published:', date);
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Preferred construction via builder
 * const rawData = {
 *   title: 'At the Mountains of Madness',
 *   authors: ['Lovecraft, H. P.'],
 *   'word-count': 40000,
 *   'year-published': 1936
 * };
 * 
 * const item = buildCatalogItemFromData(
 *   rawData,
 *   'work-002',
 *   'pulp-fiction/works/mountains.md',
 *   schema
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // Cloning for immutable operations
 * const filtered = items
 *   .filter(item => item.getField<string>('catalog-status') === 'published')
 *   .map(item => item.clone()); // Create copies, don't mutate originals
 * ```
 * 
 * @see {@link buildCatalogItemFromData} for the recommended construction method
 * @see {@link getTypedField} for schema-validated field access
 * @see {@link itemToObject} for serialization
 */
export class CatalogItem {
	id: string;
	filePath: string;
	private fields: Record<string, StoredFieldValue> = {};

	/**
	 * Create a new CatalogItem.
	 * 
	 * **Note**: Direct construction is rarely needed. Prefer using
	 * `buildCatalogItemFromData()` which handles type conversion based on schema.
	 * 
	 * @param {string} id - Unique identifier for this catalog item. Typically derived
	 *   from the `idField` specified in the schema's `coreFields`, or from the file path
	 *   if no idField is specified.
	 * 
	 * @param {string} filePath - Vault-relative path to the markdown file (e.g.,
	 *   'pulp-fiction/works/story.md'). Used for navigation, file operations, and
	 *   as a fallback identifier.
	 * 
	 * @example
	 * ```typescript
	 * const item = new CatalogItem('work-001', 'works/my-story.md');
	 * ```
	 */
	constructor(id: string, filePath: string) {
		this.id = id;
		this.filePath = filePath;
	}

	/**
	 * Get a field value with optional type coercion.
	 * 
	 * Returns null if the field is not set or has a null/undefined value. The type
	 * parameter `T` provides TypeScript type safety but does not perform runtime
	 * validation. For schema-validated access, use `getTypedField()` instead.
	 * 
	 * **Null Handling:**
	 * - Field not set → `null`
	 * - Field explicitly set to `null` → `null`
	 * - Field set to `undefined` → `null`
	 * - Field has a value → that value cast to `T`
	 * 
	 * **Type Safety:**
	 * The generic parameter `T` is for TypeScript type checking only. The method
	 * performs a simple type cast and does not validate that the stored value
	 * actually matches type `T`.
	 * 
	 * @template T - Expected type of the field value (e.g., `string`, `number`,
	 *   `string[]`, `Date`).
	 * 
	 * @param {string} fieldKey - The field key to retrieve (must match a field key
	 *   from the schema).
	 * 
	 * @returns {T | null} The field value cast to type T, or null if not set.
	 * 
	 * @example
	 * ```typescript
	 * const item = new CatalogItem('work-001', 'works/story.md');
	 * item.setField('title', 'The Shadow Over Innsmouth');
	 * item.setField('word-count', 28000);
	 * item.setField('authors', ['Lovecraft, H. P.']);
	 * 
	 * // Type-safe access
	 * const title = item.getField<string>('title');           // 'The Shadow Over Innsmouth'
	 * const wordCount = item.getField<number>('word-count');  // 28000
	 * const authors = item.getField<string[]>('authors');     // ['Lovecraft, H. P.']
	 * 
	 * // Field that doesn't exist
	 * const rating = item.getField<number>('rating');         // null
	 * ```
	 * 
	 * @see {@link getTypedField} for schema-validated field access
	 * @see {@link hasField} to check if a field is set before accessing
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
	 * Updates or creates a field with the specified value. No type validation is
	 * performed - the caller is responsible for ensuring the value matches the
	 * field's schema type. For type-safe construction, use `buildCatalogItemFromData()`
	 * which applies schema-based type conversion.
	 * 
	 * **Overwriting:**
	 * If the field already exists, it will be overwritten with the new value.
	 * 
	 * **Type Validation:**
	 * This method does not validate that `value` matches the field's type in the
	 * schema. Type validation should be performed by:
	 * - The data loading layer (via `convertFieldValue()`)
	 * - The builder function (`buildCatalogItemFromData()`)
	 * - The caller before calling `setField()`
	 * 
	 * @param {string} fieldKey - The field key to set (should match a field key
	 *   from the schema, but this is not enforced).
	 * 
	 * @param {StoredFieldValue} value - The value to store. Can be any valid
	 *   `StoredFieldValue` type (string, number, boolean, string[], Date, null,
	 *   or object).
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * ```typescript
	 * const item = new CatalogItem('work-001', 'works/story.md');
	 * 
	 * // Set various field types
	 * item.setField('title', 'The Call of Cthulhu');
	 * item.setField('word-count', 15000);
	 * item.setField('published', true);
	 * item.setField('authors', ['Lovecraft, H. P.']);
	 * item.setField('publish-date', new Date('1928-02-01'));
	 * item.setField('rating', null);
	 * 
	 * // Overwrite existing field
	 * item.setField('word-count', 15500); // Updates from 15000 to 15500
	 * ```
	 * 
	 * @see {@link buildCatalogItemFromData} for type-safe construction
	 * @see {@link convertFieldValue} for schema-based type conversion
	 */
	setField(fieldKey: string, value: StoredFieldValue): void {
		this.fields[fieldKey] = value;
	}

	/**
	 * Check if a field has been set (not null/undefined).
	 * 
	 * Returns `true` if the field exists and has a non-null, non-undefined value.
	 * Useful for checking field presence before accessing, especially for optional
	 * fields that may not be set on all items.
	 * 
	 * **Distinction from getField():**
	 * - `hasField('field')` → `true` if field is set to any value (including `false`, `0`, `''`)
	 * - `getField('field')` → `null` if field is unset or null
	 * 
	 * **Use Cases:**
	 * - Conditional logic based on field presence
	 * - Validation before accessing optional fields
	 * - Filtering items that have specific fields
	 * 
	 * @param {string} fieldKey - The field key to check.
	 * 
	 * @returns {boolean} `true` if the field exists and is not null/undefined,
	 *   `false` otherwise.
	 * 
	 * @example
	 * ```typescript
	 * const item = new CatalogItem('work-001', 'works/story.md');
	 * item.setField('title', 'The Dunwich Horror');
	 * item.setField('published', false);
	 * item.setField('rating', null);
	 * 
	 * item.hasField('title');      // true (has value)
	 * item.hasField('published');  // true (false is a valid value)
	 * item.hasField('rating');     // false (explicitly null)
	 * item.hasField('word-count'); // false (never set)
	 * ```
	 * 
	 * @example
	 * ```typescript
	 * // Conditional access pattern
	 * if (item.hasField('publish-date')) {
	 *   const date = item.getField<Date>('publish-date');
	 *   console.log('Published on:', date);
	 * } else {
	 *   console.log('Publish date not set');
	 * }
	 * 
	 * // Filtering items with specific fields
	 * const publishedItems = items.filter(item => 
	 *   item.hasField('publish-date') && item.hasField('publication')
	 * );
	 * ```
	 */
	hasField(fieldKey: string): boolean {
		const value = this.fields[fieldKey];
		return value !== null && value !== undefined;
	}

	/**
	 * Get all fields as a plain object.
	 * 
	 * Returns a shallow copy of the internal fields storage. Useful for exporting,
	 * debugging, or passing to functions that need access to all fields at once.
	 * 
	 * **Shallow Copy:**
	 * The returned object is a new object, but the field values themselves are not
	 * deep-cloned. Modifying nested objects or arrays in the returned object may
	 * affect the original item's data.
	 * 
	 * **Excludes Metadata:**
	 * This method returns only the dynamic fields, not the `id` and `filePath`
	 * properties. For a complete serialization including metadata, use `toJSON()`.
	 * 
	 * @returns {Record<string, StoredFieldValue>} Plain object mapping field keys
	 *   to their values.
	 * 
	 * @example
	 * ```typescript
	 * const item = new CatalogItem('work-001', 'works/story.md');
	 * item.setField('title', 'The Colour Out of Space');
	 * item.setField('word-count', 12000);
	 * item.setField('authors', ['Lovecraft, H. P.']);
	 * 
	 * const fields = item.getAllFields();
	 * console.log(fields);
	 * // {
	 * //   'title': 'The Colour Out of Space',
	 * //   'word-count': 12000,
	 * //   'authors': ['Lovecraft, H. P.']
	 * // }
	 * ```
	 * 
	 * @example
	 * ```typescript
	 * // Debugging helper
	 * function debugItem(item: CatalogItem) {
	 *   console.log('Item:', item.id);
	 *   console.log('Path:', item.filePath);
	 *   console.log('Fields:', item.getAllFields());
	 * }
	 * ```
	 * 
	 * @see {@link toJSON} for complete serialization with id and filePath
	 * @see {@link itemToObject} for schema-aware serialization
	 */
	getAllFields(): Record<string, StoredFieldValue> {
		return { ...this.fields };
	}

	/**
	 * Clear all field values.
	 * 
	 * Removes all stored field data from the item, resetting it to an empty state.
	 * The `id` and `filePath` properties are preserved. Useful for reusing an item
	 * instance or resetting before reloading data.
	 * 
	 * **Destructive Operation:**
	 * This operation cannot be undone. All field data is permanently lost unless
	 * you've saved a reference or clone beforehand.
	 * 
	 * **Use Cases:**
	 * - Resetting an item before reloading from disk
	 * - Clearing cached data
	 * - Reusing item instances in object pools
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * ```typescript
	 * const item = new CatalogItem('work-001', 'works/story.md');
	 * item.setField('title', 'The Whisperer in Darkness');
	 * item.setField('word-count', 26000);
	 * 
	 * console.log(item.getField('title')); // 'The Whisperer in Darkness'
	 * 
	 * item.clearFields();
	 * 
	 * console.log(item.getField('title')); // null
	 * console.log(item.id);                // 'work-001' (preserved)
	 * console.log(item.filePath);          // 'works/story.md' (preserved)
	 * ```
	 * 
	 * @example
	 * ```typescript
	 * // Reload pattern
	 * async function reloadItem(item: CatalogItem, app: App, schema: CatalogSchema) {
	 *   const file = app.vault.getAbstractFileByPath(item.filePath);
	 *   if (file instanceof TFile) {
	 *     const content = await app.vault.read(file);
	 *     const frontmatter = parseFrontmatter(content);
	 *     
	 *     item.clearFields(); // Reset before reloading
	 *     
	 *     for (const [key, value] of Object.entries(frontmatter)) {
	 *       const converted = convertFieldValue(value, schema.fields.find(f => f.key === key));
	 *       if (converted !== undefined) {
	 *         item.setField(key, converted);
	 *       }
	 *     }
	 *   }
	 * }
	 * ```
	 */
	clearFields(): void {
		this.fields = {};
	}

	/**
	 * Serialize item to JSON (including id and filePath).
	 * 
	 * Converts the item to a plain object suitable for JSON serialization. Includes
	 * the `id`, `filePath`, and all field data. Unlike `getAllFields()`, this method
	 * provides a complete representation of the item.
	 * 
	 * **Output Structure:**
	 * ```typescript
	 * {
	 *   id: string,
	 *   filePath: string,
	 *   [fieldKey: string]: field value
	 * }
	 * ```
	 * 
	 * **Use Cases:**
	 * - Exporting catalog data to JSON
	 * - API responses
	 * - Saving state to local storage
	 * - Debugging and logging
	 * 
	 * **Date Serialization:**
	 * `Date` objects in fields will be serialized by `JSON.stringify()` to ISO 8601
	 * strings. When deserializing, you'll need to convert them back to Date objects.
	 * 
	 * @returns {Record<string, StoredFieldValue | null | string>} Plain object with
	 *   id, filePath, and all fields.
	 * 
	 * @example
	 * ```typescript
	 * const item = new CatalogItem('work-001', 'works/story.md');
	 * item.setField('title', 'The Shadow Out of Time');
	 * item.setField('word-count', 38000);
	 * item.setField('publish-date', new Date('1936-06-01'));
	 * 
	 * const json = item.toJSON();
	 * console.log(json);
	 * // {
	 * //   id: 'work-001',
	 * //   filePath: 'works/story.md',
	 * //   title: 'The Shadow Out of Time',
	 * //   'word-count': 38000,
	 * //   'publish-date': Date object
	 * // }
	 * 
	 * // Serialize to JSON string
	 * const jsonString = JSON.stringify(item.toJSON());
	 * ```
	 * 
	 * @example
	 * ```typescript
	 * // Export multiple items
	 * function exportCatalog(items: CatalogItem[]): string {
	 *   const data = items.map(item => item.toJSON());
	 *   return JSON.stringify(data, null, 2);
	 * }
	 * 
	 * const exported = exportCatalog(catalogItems);
	 * // Save to file or send via API
	 * ```
	 * 
	 * @see {@link getAllFields} for fields only (without id and filePath)
	 * @see {@link itemToObject} for schema-aware serialization with null handling
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
	 * Returns a new `CatalogItem` instance with the same `id`, `filePath`, and field
	 * data. The fields object is shallow-copied, meaning primitive values are copied
	 * but nested objects and arrays are referenced.
	 * 
	 * **Shallow Copy Semantics:**
	 * - `id` and `filePath` are copied (strings, so this is safe)
	 * - Fields object is shallow-copied via spread operator
	 * - Primitive field values (string, number, boolean, null) are independent
	 * - Arrays and objects in fields are referenced (mutations affect both copies)
	 * 
	 * **Use Cases:**
	 * - Functional filtering operations (non-mutating)
	 * - Creating modified versions without affecting originals
	 * - Snapshot/rollback patterns
	 * - Parallel processing where each worker needs independent copies
	 * 
	 * **When to Use:**
	 * Use `clone()` when you need to:
	 * - Filter or transform items without mutating the original array
	 * - Create "draft" versions that can be modified independently
	 * - Preserve original state while experimenting with changes
	 * 
	 * @returns {CatalogItem} A new CatalogItem with same id, filePath, and fields.
	 * 
	 * @example
	 * ```typescript
	 * const original = new CatalogItem('work-001', 'works/story.md');
	 * original.setField('title', 'The Dreams in the Witch House');
	 * original.setField('word-count', 10000);
	 * 
	 * const copy = original.clone();
	 * 
	 * // Modify the copy
	 * copy.setField('word-count', 12000);
	 * 
	 * console.log(original.getField('word-count')); // 10000 (unchanged)
	 * console.log(copy.getField('word-count'));     // 12000 (modified)
	 * ```
	 * 
	 * @example
	 * ```typescript
	 * // Immutable filtering pattern
	 * function filterPublished(items: CatalogItem[]): CatalogItem[] {
	 *   return items
	 *     .filter(item => item.getField<string>('catalog-status') === 'published')
	 *     .map(item => item.clone()); // Return copies, don't mutate originals
	 * }
	 * ```
	 * 
	 * @example
	 * ```typescript
	 * // Shallow copy caveat with nested arrays
	 * const item1 = new CatalogItem('work-001', 'works/story.md');
	 * item1.setField('authors', ['Lovecraft, H. P.', 'Derleth, August']);
	 * 
	 * const item2 = item1.clone();
	 * 
	 * // Modifying the array affects both (shallow copy)
	 * const authors = item2.getField<string[]>('authors');
	 * authors?.push('Bloch, Robert');
	 * 
	 * console.log(item1.getField('authors')); // ['Lovecraft, H. P.', 'Derleth, August', 'Bloch, Robert']
	 * console.log(item2.getField('authors')); // ['Lovecraft, H. P.', 'Derleth, August', 'Bloch, Robert']
	 * 
	 * // To avoid this, replace the array rather than mutating
	 * item2.setField('authors', [...(item2.getField<string[]>('authors') ?? []), 'Bloch, Robert']);
	 * ```
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
 * This is the **primary and recommended way** to construct CatalogItems. It handles:
 * - Type conversion based on schema field definitions
 * - Validation of field values against schema types
 * - Proper handling of null/undefined values
 * - Array type conversions (including wikilink arrays)
 * 
 * **Type Conversion:**
 * Each field value is processed through `convertFieldValue()` which applies
 * schema-aware type coercion. For example:
 * - String '5000' → Number 5000 (if field type is 'number')
 * - String 'true' → Boolean true (if field type is 'boolean')
 * - Single value → Single-item array (if field type is 'array')
 * 
 * **Null Handling:**
 * Fields with null or undefined values in raw data are not set on the item
 * (calling `getField()` on them returns null).
 * 
 * **Schema Validation:**
 * Only fields defined in the schema are processed. Extra fields in raw data
 * are ignored. Missing fields simply won't be set on the item.
 * 
 * @param {Record<string, unknown>} rawData - Parsed frontmatter data as key-value
 *   pairs. Keys should match field keys in the schema. Values will be converted
 *   to appropriate types based on schema definitions.
 * 
 * @param {string} id - Unique identifier for this item. Typically derived from
 *   the `idField` in schema's `coreFields`, or from the file path if no idField.
 * 
 * @param {string} filePath - Vault-relative path to the markdown file source
 *   (e.g., 'pulp-fiction/works/story.md').
 * 
 * @param {CatalogSchema} schema - The catalog schema defining field types and
 *   validation rules. Used to convert raw values to proper types.
 * 
 * @returns {CatalogItem} A new CatalogItem with all schema-defined fields
 *   properly typed and validated.
 * 
 * @example
 * ```typescript
 * // Raw YAML frontmatter parsed to object
 * const rawData = {
 *   title: 'The Call of Cthulhu',
 *   authors: ['Lovecraft, H. P.'],
 *   'word-count': '15000',  // String from YAML
 *   'year-published': 1928,
 *   'catalog-status': 'published',
 *   tags: ['horror', 'cosmic', 'lovecraft']
 * };
 * 
 * // Schema defines field types
 * const schema: CatalogSchema = {
 *   catalogName: 'Pulp Fiction',
 *   fields: [
 *     { key: 'title', type: 'string', ... },
 *     { key: 'authors', type: 'wikilink-array', ... },
 *     { key: 'word-count', type: 'number', ... },  // Will convert '15000' to 15000
 *     { key: 'year-published', type: 'number', ... },
 *     { key: 'catalog-status', type: 'string', ... },
 *     { key: 'tags', type: 'array', arrayItemType: 'string', ... }
 *   ],
 *   coreFields: { titleField: 'title', idField: 'title' }
 * };
 * 
 * const item = buildCatalogItemFromData(
 *   rawData,
 *   'the-call-of-cthulhu',
 *   'pulp-fiction/works/cthulhu.md',
 *   schema
 * );
 * 
 * console.log(item.getField<string>('title'));    // 'The Call of Cthulhu'
 * console.log(item.getField<number>('word-count')); // 15000 (converted from string)
 * console.log(item.getField<string[]>('authors')); // ['Lovecraft, H. P.']
 * ```
 * 
 * @example
 * ```typescript
 * // Usage in data loading pipeline
 * async function loadItemFromFile(
 *   file: TFile,
 *   app: App,
 *   schema: CatalogSchema
 * ): Promise<CatalogItem | null> {
 *   const content = await app.vault.read(file);
 *   const frontmatter = parseFrontmatter(content);
 *   
 *   if (!frontmatter) return null;
 *   
 *   const id = frontmatter[schema.coreFields.idField ?? 'title'] ?? file.basename;
 *   
 *   return buildCatalogItemFromData(
 *     frontmatter,
 *     String(id),
 *     file.path,
 *     schema
 *   );
 * }
 * ```
 * 
 * @see {@link convertFieldValue} for type conversion details
 * @see {@link CatalogItem} for the item class structure
 * @see {@link CatalogSchema} for schema structure
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
 * Performs runtime type coercion based on the field's type definition in the schema.
 * Handles all supported field types and provides sensible fallback behavior for
 * values that can't be converted.
 * 
 * **Supported Type Conversions:**
 * 
 * **string:**
 * - string → string (pass through)
 * - number/boolean → String(value)
 * - other → undefined
 * 
 * **number:**
 * - number → number (pass through)
 * - string → Number(value) if valid, undefined if NaN
 * - other → undefined
 * 
 * **boolean:**
 * - boolean → boolean (pass through)
 * - string 'true'/'false' → true/false (case-insensitive)
 * - other → Boolean(value)
 * 
 * **date:**
 * - Date → Date (pass through)
 * - string/number → new Date(value) if valid, undefined otherwise
 * 
 * **array:**
 * - array → array (with item type conversion if arrayItemType specified)
 * - single value → [value] (wrapped in array)
 * 
 * **wikilink-array:**
 * - array → string[] (all items converted to strings)
 * - single value → [String(value)]
 * 
 * **object:**
 * - object → object (pass through, no arrays)
 * - other → undefined
 * 
 * **Null/Undefined Handling:**
 * Null and undefined inputs always return undefined (field won't be set).
 * 
 * @param {unknown} rawValue - The raw value from parsed YAML/frontmatter. Can be
 *   any type as YAML parsing may produce various JavaScript types.
 * 
 * @param {SchemaField} fieldDef - The schema field definition that specifies the
 *   target type and any additional type parameters (like arrayItemType).
 * 
 * @returns {StoredFieldValue | undefined} The converted value ready for storage,
 *   or undefined if conversion failed or value was null/undefined.
 * 
 * @example
 * ```typescript
 * const schema: CatalogSchema = { ... };
 * const titleField = schema.fields.find(f => f.key === 'title')!;
 * const wordCountField = schema.fields.find(f => f.key === 'word-count')!;
 * 
 * // String conversion
 * convertFieldValue('The Colour Out of Space', titleField); // 'The Colour Out of Space'
 * convertFieldValue(123, titleField);                       // '123'
 * 
 * // Number conversion
 * convertFieldValue('12000', wordCountField);  // 12000
 * convertFieldValue(12000, wordCountField);    // 12000
 * convertFieldValue('abc', wordCountField);    // undefined (NaN)
 * 
 * // Boolean conversion
 * convertFieldValue('true', booleanField);   // true
 * convertFieldValue('false', booleanField);  // false
 * convertFieldValue(1, booleanField);        // true
 * 
 * // Array conversion
 * convertFieldValue(['a', 'b'], arrayField);    // ['a', 'b']
 * convertFieldValue('single', arrayField);      // ['single']
 * 
 * // Null/undefined
 * convertFieldValue(null, titleField);      // undefined
 * convertFieldValue(undefined, titleField); // undefined
 * ```
 * 
 * @example
 * ```typescript
 * // Used in buildCatalogItemFromData
 * for (const fieldDef of schema.fields) {
 *   const rawValue = frontmatter[fieldDef.key];
 *   const convertedValue = convertFieldValue(rawValue, fieldDef);
 *   
 *   if (convertedValue !== undefined) {
 *     item.setField(fieldDef.key, convertedValue);
 *   }
 * }
 * ```
 * 
 * @see {@link SchemaField} for field definition structure
 * @see {@link buildCatalogItemFromData} for usage in item construction
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
 * This is a schema-validated alternative to `CatalogItem.getField()`. It verifies
 * that the requested field exists in the schema before attempting to retrieve it,
 * providing an additional layer of type safety.
 * 
 * **Advantages over `item.getField()`:**
 * - Schema validation: ensures field exists in schema
 * - Self-documenting: schema parameter makes field source clear
 * - Consistent with other schema-aware utilities
 * 
 * **When to Use:**
 * - When you want schema validation
 * - When working with dynamic field keys (from user input or config)
 * - When consistency with schema-aware patterns is important
 * 
 * **When NOT to Use:**
 * - When you know the field exists (use `item.getField()` for simplicity)
 * - In performance-critical loops (extra schema lookup overhead)
 * 
 * @template T - Expected return type of the field value.
 * 
 * @param {CatalogItem} item - The CatalogItem to read from.
 * 
 * @param {string} fieldKey - The field key to retrieve. Should be a valid field
 *   key from the schema.
 * 
 * @param {CatalogSchema} schema - The catalog schema used to validate the field
 *   exists before accessing.
 * 
 * @returns {T | null} The typed field value, or null if the field doesn't exist
 *   in the schema or isn't set on the item.
 * 
 * @example
 * ```typescript
 * const item = new CatalogItem('work-001', 'works/story.md');
 * item.setField('title', 'The Rats in the Walls');
 * item.setField('word-count', 8000);
 * 
 * // Schema-validated access
 * const title = getTypedField<string>(item, 'title', schema);       // 'The Rats in the Walls'
 * const wordCount = getTypedField<number>(item, 'word-count', schema); // 8000
 * 
 * // Field not in schema
 * const invalid = getTypedField<string>(item, 'nonexistent-field', schema); // null
 * 
 * // Compare with direct access (no schema validation)
 * const title2 = item.getField<string>('title');  // Same result, less validation
 * ```
 * 
 * @example
 * ```typescript
 * // Dynamic field access from user input
 * function getUserFieldValue(
 *   item: CatalogItem,
 *   userFieldKey: string,
 *   schema: CatalogSchema
 * ): string {
 *   // Schema validation prevents accessing non-existent fields
 *   const value = getTypedField<unknown>(item, userFieldKey, schema);
 *   
 *   if (value === null) {
 *     return `Field "${userFieldKey}" not found or not set`;
 *   }
 *   
 *   return String(value);
 * }
 * ```
 * 
 * @see {@link CatalogItem.getField} for direct field access without schema validation
 * @see {@link itemToObject} for schema-aware serialization
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
 * Creates a complete plain object representation of the item that includes:
 * - `id` and `filePath` metadata
 * - All schema-defined fields with their current values
 * - `null` for schema fields that aren't set on the item
 * 
 * **Difference from `toJSON()`:**
 * - `toJSON()`: Includes only set fields
 * - `itemToObject()`: Includes ALL schema fields (with null for unset ones)
 * 
 * **Use Cases:**
 * - Exporting to formats that expect consistent structure (CSV, database)
 * - API responses where all fields should be present
 * - Data validation (ensuring no required fields are missing)
 * - Schema-aware serialization
 * 
 * **Field Ordering:**
 * Fields appear in the order they're defined in the schema (via `schema.fields` array).
 * 
 * @param {CatalogItem} item - The CatalogItem to convert.
 * 
 * @param {CatalogSchema} schema - The catalog schema defining which fields should
 *   be included in the output.
 * 
 * @returns {Record<string, StoredFieldValue | null | string>} Plain object with
 *   id, filePath, and all schema fields. Unset fields have `null` values.
 * 
 * @example
 * ```typescript
 * const schema: CatalogSchema = {
 *   catalogName: 'Pulp Fiction',
 *   fields: [
 *     { key: 'title', type: 'string', ... },
 *     { key: 'word-count', type: 'number', ... },
 *     { key: 'catalog-status', type: 'string', ... },
 *     { key: 'publish-date', type: 'date', ... }
 *   ],
 *   coreFields: { titleField: 'title' }
 * };
 * 
 * const item = new CatalogItem('work-001', 'works/story.md');
 * item.setField('title', 'The Haunter of the Dark');
 * item.setField('word-count', 5800);
 * // Note: catalog-status and publish-date NOT set
 * 
 * const obj = itemToObject(item, schema);
 * console.log(obj);
 * // {
 * //   id: 'work-001',
 * //   filePath: 'works/story.md',
 * //   title: 'The Haunter of the Dark',
 * //   'word-count': 5800,
 * //   'catalog-status': null,     // Not set, so null
 * //   'publish-date': null         // Not set, so null
 * // }
 * 
 * // Compare with toJSON() which omits unset fields
 * const json = item.toJSON();
 * // {
 * //   id: 'work-001',
 * //   filePath: 'works/story.md',
 * //   title: 'The Haunter of the Dark',
 * //   'word-count': 5800
 * //   // catalog-status and publish-date not included
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // Export to CSV with consistent columns
 * function exportToCSV(items: CatalogItem[], schema: CatalogSchema): string {
 *   const rows = items.map(item => itemToObject(item, schema));
 *   
 *   // All rows have the same fields (with nulls for missing values)
 *   const headers = ['id', 'filePath', ...schema.fields.map(f => f.key)];
 *   const csvLines = [
 *     headers.join(','),
 *     ...rows.map(row => 
 *       headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
 *     )
 *   ];
 *   
 *   return csvLines.join('\n');
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Validate required fields
 * function validateItem(item: CatalogItem, schema: CatalogSchema): string[] {
 *   const obj = itemToObject(item, schema);
 *   const errors: string[] = [];
 *   
 *   // Check for required fields (example: title and status)
 *   const requiredFields = ['title', 'catalog-status'];
 *   
 *   for (const fieldKey of requiredFields) {
 *     if (obj[fieldKey] === null) {
 *       errors.push(`Required field "${fieldKey}" is missing`);
 *     }
 *   }
 *   
 *   return errors;
 * }
 * ```
 * 
 * @see {@link CatalogItem.toJSON} for serialization without null padding
 * @see {@link CatalogItem.getAllFields} for fields only (no id/filePath)
 * @see {@link buildCatalogItemFromData} for the reverse operation (object → item)
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