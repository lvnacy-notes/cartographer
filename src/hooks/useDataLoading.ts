/**
 * React hooks for loading and managing catalog data
 * Hooks for fetching from Obsidian vault and subscribing to changes
 */

import { App, TFile } from 'obsidian';
import {
	CatalogItem,
	FilterState,
	SortState
} from '../types/dynamicWork';
import {
	DatacoreSettings,
	Library
} from '../types/settings';
import { parseFieldValue } from '../types/types';
import {
	filterByField,
	sortByField
} from '../queries/queryFunctions';

/**
 * Load all items from a specific library's catalog directory
 * Returns parsed CatalogItem objects from markdown files
 * @param app - Obsidian App instance
 * @param library - Library configuration defining the catalog path and schema
 */
export async function loadCatalogItems(
	app: App,
	library: Library
): Promise<CatalogItem[]> {
	const items: CatalogItem[] = [];

	try {
		console.log(`[Datacore] Starting catalog load: ${library.path}`);
		console.log(`[Datacore] Library: ${library.name}`);
		console.log(`[Datacore] Looking in vault root for: ${library.path}`);
		
		// Get the catalog folder
		const folder = app.vault.getAbstractFileByPath(library.path);
		
		if (!folder) {
			console.error(`[Datacore] Catalog folder not found at: ${library.path}`);
			console.log(`[Datacore] Vault root files:`, app.vault.getRoot().children.map(f => f.path));
			return items;
		}
		
		if (!('children' in folder)) {
			console.error(`[Datacore] Path exists but is not a folder: ${library.path}`);
			return items;
		}

		// Process each file in the catalog folder
		const children = folder.children as unknown[];
		console.log(`[Datacore] Found ${children.length} items in folder`);
		
		let fileCount = 0;
		let parseCount = 0;
		
		for (const file of children) {
			if (!(file instanceof TFile)) {continue;}
			if (!file.extension.match(/md|markdown/)) {continue;}

			fileCount++;
			console.log(`[Datacore] Processing: ${file.name}`);
			
			const content = await app.vault.read(file);
			const item = parseMarkdownToItem(file, content, library);

			if (item) {
				items.push(item);
				parseCount++;
			} else {
				console.warn(`[Datacore] Failed to parse: ${file.name}`);
			}
		}
		
		console.log(`[Datacore] Load complete: ${fileCount} files processed, ${parseCount} items loaded`);
	} catch (error) {
		console.error('[Datacore] Error loading catalog items:', error);
	}

	return items;
}

/**
 * Parse a markdown file into a CatalogItem
 * Extracts YAML frontmatter and converts to CatalogItem
 * @param file - TFile instance from vault
 * @param content - File content as string
 * @param library - Library configuration defining the schema for parsing
 */
function parseMarkdownToItem(
	file: TFile,
	content: string,
	library: Library
): CatalogItem | null {
	try {
		const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

		if (!frontmatterMatch?.[1]) {
			console.warn(`No frontmatter found in ${file.name}`);
			return null;
		}

		const frontmatterText = frontmatterMatch[1];
		const fields = parseYamlFrontmatter(frontmatterText, library);

		// Ensure title field exists (use filename as fallback)
		const { titleField } = library.schema.coreFields;
		fields[titleField] ??= file.basename;

		const id = (fields[library.schema.coreFields.idField ?? 'title'] as string | number) ?? file.path;
		const item = new CatalogItem(String(id), file.path);
		for (const [key, value] of Object.entries(fields)) {
			item.setField(key, value);
		}
		return item;
	} catch (error) {
		console.error(`Error parsing ${file.name}:`, error);
		return null;
	}
}

/**
 * Parse YAML frontmatter with support for arrays, nested objects, and proper type conversion
 * Handles:
 * - Simple key: value pairs
 * - Multi-line arrays with - item syntax
 * - Empty/null values
 * - Quoted strings with special characters (e.g., wikilinks)
 * @param frontmatterText - Raw YAML frontmatter content
 * @param library - Library configuration defining the schema for type-aware parsing
 */
function parseYamlFrontmatter(
	frontmatterText: string,
	library: Library
): Record<string, string | number | boolean | string[] | Date | null> {
	const fields: Record<string, string | number | boolean | string[] | Date | null> = {};
	const lines = frontmatterText.split('\n');
	let currentKey: string | null = null;
	let currentArray: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? '';

		// Skip empty lines
		if (!line.trim()) {
			continue;
		}

		// Check if line is an array item (starts with - )
		if (line?.match(/^\s*-\s+/)) {
			const arrayItem = (line ?? '').replace(/^\s*-\s+/, '').trim();
			if (currentKey) {
				// Remove quotes if present (e.g., '[[Link]]' -> [[Link]])
				const cleanItem = arrayItem.replace(/^['"]|['"]$/g, '');
				currentArray.push(cleanItem);
			}
			continue;
		}

		// If we have a current array, save it and reset
		if (currentArray.length > 0 && currentKey) {
			const fieldDef = library.schema.fields.find((f) => f.key === currentKey);
			fields[currentKey] = parseFieldValue(currentArray, fieldDef?.type ?? 'array');
			currentArray = [];
			currentKey = null;
		}

		// Check for key: value pattern
		const match = (line ?? '').match(/^([^:]+):\s*(.*)$/);
		if (!match?.[1]) {
			continue;
		}

		const key = match[1]?.trim();
		const value = (match[2]?.trim()) ?? '';

		// Check if this line starts an array or has an inline value
		if (value === '') {
			// Check if next line is an array item
			const nextLine = i + 1 < lines.length ? (lines[i + 1] ?? '') : '';
			if (nextLine?.match(/^\s*-\s+/)) {
				// This is an array field, collect items
				currentKey = key;
				currentArray = [];
				continue;
			} else {
				// Empty value
				const fieldDef = library.schema.fields.find((f) => f.key === key);
				fields[key] = parseFieldValue(null, fieldDef?.type ?? 'string');
			}
		} else {
			// Inline value (may be in array or single)
			const fieldDef = library.schema.fields.find((f) => f.key === key);

			// Remove quotes if present
			const cleanValue = value.replace(/^['"]|['"]$/g, '');

			if (fieldDef?.type === 'array' || fieldDef?.type === 'wikilink-array') {
				// Single-line array or single item
				const cleanItem = cleanValue.replace(/^['"]|['"]$/g, '');
				fields[key] = parseFieldValue([cleanItem], fieldDef.type);
			} else {
				fields[key] = parseFieldValue(cleanValue, fieldDef?.type ?? 'string');
			}
		}
	}

	// Handle any remaining array
	if (currentArray.length > 0 && currentKey) {
		const fieldDef = library.schema.fields.find((f) => f.key === currentKey);
		fields[currentKey] = parseFieldValue(currentArray, fieldDef?.type ?? 'array');
	}

	return fields;
}

/**
 * Subscribe to changes in the vault and reload items
 */
export function subscribeToVaultChanges(
	app: App,
	onUpdate: () => void
): () => void {
	const updateHandler = () => onUpdate();

	app.vault.on('create', updateHandler);
	app.vault.on('delete', updateHandler);
	app.vault.on('modify', updateHandler);
	app.vault.on('rename', updateHandler);

	// Return unsubscribe function
	return () => {
		app.vault.off('create', updateHandler);
		app.vault.off('delete', updateHandler);
		app.vault.off('modify', updateHandler);
		app.vault.off('rename', updateHandler);
	};
}

/**
 * Batch filter items by multiple conditions
 */
export function filterItems(
	items: CatalogItem[],
	filters: FilterState,
	settings: DatacoreSettings
): CatalogItem[] {
	let result = [...items];

	for (const [fieldKey, value] of Object.entries(filters)) {
		if (!value) {
			continue;
		}

		const fieldDef = settings.schema.fields.find((f) => f.key === fieldKey);
		if (!fieldDef?.filterable) {
			continue;
		}

		if (Array.isArray(value)) {
			// Multi-select filter - value is string[]
			const filterValues = value as string[];
			result = result.filter((item) => {
				const itemValue = item.getField(fieldKey);
				if (Array.isArray(itemValue)) {
					// Both are arrays, check if any item value is in the filter values
					return filterValues.some((v) => itemValue.includes(String(v)));
				}
				// Single value, check if it's in the filter values
				return filterValues.includes(String(itemValue));
			});
		} else if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
			// Range filter
			const rangeValue = value as { min: number; max: number };
			result = result.filter((item) => {
				const itemValue = item.getField<number>(fieldKey);
				return itemValue !== null && itemValue >= rangeValue.min && itemValue <= rangeValue.max;
			});
		} else {
			// Single value filter
			result = filterByField(result, fieldKey, value as string | number | boolean);
		}
	}

	return result;
}

/**
 * Sort items by configuration
 */
export function sortItems(
	items: CatalogItem[],
	sort: SortState,
	settings: DatacoreSettings
): CatalogItem[] {
	const fieldDef = settings.schema.fields.find((f) => f.key === sort.field);
	if (!fieldDef?.sortable) {
		return items;
	}

	return sortByField(items, sort.field, sort.desc, fieldDef.type);
}

/**
 * Get unique values for a field (for filter dropdowns)
 */
export function getFieldValues(
	items: CatalogItem[],
	fieldKey: string
): string[] {
	const values = new Set<string>();

	for (const item of items) {
		const value = item.getField(fieldKey);
		if (Array.isArray(value)) {
			value.forEach((v) => {
				if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
					values.add(String(v));
				}
			});
		} else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			values.add(String(value));
		}
	}

	return Array.from(values).sort();
}

/**
 * Get min/max for numeric field (for range filters)
 */
export function getFieldRange(
	items: CatalogItem[],
	fieldKey: string
): { min: number; max: number } | null {
	const values = items
		.map((item) => item.getField<number>(fieldKey))
		.filter((v) => v !== null && typeof v === 'number');

	if (values.length === 0) {
		return null;
	}

	return {
		min: Math.min(...values),
		max: Math.max(...values),
	};
}
