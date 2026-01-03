/**
 * Dynamic work interface and related types
 * Adapts to configured schema without fixed properties
 */

/**
 * Dynamic catalog item that adapts to configured schema
 * Instead of fixed properties, uses a map of field values
 */
export class CatalogItem {
	id: string;
	fields: Map<string, string | number | boolean | string[] | Date | null>;
	sourceFile: string;

	constructor(id: string, fields: Record<string, string | number | boolean | string[] | Date | null>, sourceFile: string) {
		this.id = id;
		this.fields = new Map(Object.entries(fields || {}));
		this.sourceFile = sourceFile;
	}

	// Get field value with type coercion
	getField<T = string | number | boolean | string[] | Date | null>(fieldKey: string): T | null {
		return (this.fields.get(fieldKey) ?? null) as T | null;
	}

	// Set field value
	setField(fieldKey: string, value: string | number | boolean | string[] | Date | null): void {
		this.fields.set(fieldKey, value);
	}

	// Check if field exists
	hasField(fieldKey: string): boolean {
		return this.fields.has(fieldKey);
	}

	// Get all fields as object
	toObject(): Record<string, string | number | boolean | string[] | Date | null> {
		return Object.fromEntries(this.fields);
	}
}

/**
 * Catalog data state returned from hooks
 */
export interface CatalogDataState {
	items: CatalogItem[];
	isLoading: boolean;
	error?: Error;
	revision: number; // Incremented on file changes
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
