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
import { DatacoreSettings } from '../types/settings';
import { parseFieldValue } from '../types/types';
import {
	filterByField,
	sortByField
} from '../queries/queryFunctions';

/**
 * Load all items from the configured catalog directory
 * Returns parsed CatalogItem objects from markdown files
 */
export async function loadCatalogItems(
	app: App,
	settings: DatacoreSettings
): Promise<CatalogItem[]> {
	const items: CatalogItem[] = [];

	try {
		// Get the catalog folder
		const folder = app.vault.getAbstractFileByPath(settings.catalogPath);
		if (!folder || !('children' in folder)) {
			console.warn(`Catalog folder not found: ${settings.catalogPath}`);
			return items;
		}

		// Process each file in the catalog folder
		const children = folder.children as unknown[];
		for (const file of children) {
			if (!(file instanceof TFile)) {continue;}
			if (!file.extension.match(/md|markdown/)) {continue;}

			const content = await app.vault.read(file);
			const item = parseMarkdownToItem(file, content, settings);

			if (item) {
				items.push(item);
			}
		}
	} catch (error) {
		console.error('Error loading catalog items:', error);
	}

	return items;
}

/**
 * Parse a markdown file into a CatalogItem
 * Extracts YAML frontmatter and converts to CatalogItem
 */
function parseMarkdownToItem(
	file: TFile,
	content: string,
	settings: DatacoreSettings
): CatalogItem | null {
	try {
		const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

		if (!frontmatterMatch?.[1]) {
			console.warn(`No frontmatter found in ${file.name}`);
			return null;
		}

		const frontmatterText = frontmatterMatch[1];
		const fields: Record<string, string | number | boolean | string[] | Date | null> = {};

		// Parse YAML-like frontmatter (simple key: value parsing)
		const lines_fm = frontmatterText.split('\n');
		for (const line of lines_fm) {
			const match = line.match(/^([^:]+):\s*(.*)$/);
			if (!match?.[1] || !match?.[2]) {continue;}

			const key = match[1]?.trim();
			const value = match[2]?.trim();

			// Parse value based on field type definition
			const fieldDef = settings.schema.fields.find((f) => f.key === key);
			if (fieldDef) {
				fields[key] = parseFieldValue(value, fieldDef.type);
			} else {
				fields[key] = value;
			}
		}

		// Ensure title field exists (use filename as fallback)
		const { titleField } = settings.schema.coreFields;
		fields[titleField] ??= file.basename;

		const id = (fields[settings.schema.coreFields.idField ?? 'title'] as string | number) ?? file.path;
		return new CatalogItem(String(id), fields, file.path);
	} catch (error) {
		console.error(`Error parsing ${file.name}:`, error);
		return null;
	}
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
			value.forEach((v) => values.add(String(v)));
		} else if (value !== null && value !== undefined) {
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
