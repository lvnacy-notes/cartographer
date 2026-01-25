/**
 * Base React component types and utilities for Datacore plugin
 * Components are rendered using Obsidian's view system
 */

import {
	ItemView,
	WorkspaceLeaf
} from 'obsidian';
import {
	CartographerSettings,
	CatalogItem,
	Library
} from '../types';

/**
 * Base class for Datacore component views in Obsidian
 * Extends Obsidian's ItemView to render components
 */
export abstract class DatacoreComponentView extends ItemView {
	settings: CartographerSettings;
	items: CatalogItem[] = [];
	isLoading = false;

	constructor(leaf: WorkspaceLeaf, settings: CartographerSettings) {
		super(leaf);
		this.settings = settings;
	}

	/**
	 * Get the currently active library configuration
	 */
	getActiveLibrary(): Library | null {
		const activeId = this.settings.activeLibraryId;
		if (!activeId) {
			return null;
		}
		return this.settings.libraries.find((lib) => lib.id === activeId) ?? null;
	}

	/**
	 * Get the view type (required by ItemView)
	 */
	abstract getViewType(): string;

	/**
	 * Get the display text for the view (required by ItemView)
	 */
	abstract getDisplayText(): string;

	/**
	 * Load data from vault
	 */
	abstract loadData(): Promise<void>;

	/**
	 * Render the component
	 */
	abstract renderComponent(): Promise<void>;

	async onOpen(): Promise<void> {
		this.isLoading = true;
		try {
			await this.loadData();
			await this.renderComponent();
		} finally {
			this.isLoading = false;
		}
	}

	onClose(): Promise<void> {
		return Promise.resolve();
	}
}

/**
 * Utility to create a simple table DOM element
 */
export function createTableElement(
	container: HTMLElement,
	columns: Array<{ key: string; label: string }>,
	items: CatalogItem[],
	schemaFields: Array<{ key: string; label: string; type: string }>
): HTMLTableElement {
	const table = container.createEl('table', { cls: 'datacore-table' });
	const thead = table.createEl('thead');
	const tbody = table.createEl('tbody');

	// Create header row
	const headerRow = thead.createEl('tr');
	for (const { label } of columns) {
		headerRow.createEl('th', { text: label });
	}

	// Create data rows
	for (const item of items) {
		const row = tbody.createEl('tr');
		for (const { key } of columns) {
			const cell = row.createEl('td');
			const value = item.getField(key);

			const fieldDef = schemaFields.find((f) => f.key === key);
			if (fieldDef?.type === 'date' && value) {
				if (value instanceof Date) {
					cell.setText(value.toLocaleDateString());
				} else if (typeof value === 'string' || typeof value === 'number') {
					const date = new Date(value);
					if (!isNaN(date.getTime())) {
						cell.setText(date.toLocaleDateString());
					} else {
						cell.setText(String(value));
					}
				} else {
					cell.setText('-');
				}
			} else if (fieldDef?.type === 'array' && Array.isArray(value)) {
				cell.setText(value.join(', '));
			} else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
				cell.setText(String(value));
			} else {
				cell.setText('-');
			}
		}
	}

	return table;
}

/**
 * Utility to create filter UI
 */
export function createFilterElement(
	container: HTMLElement,
	fields: Array<{ key: string; label: string; type: string }>,
	onFilterChange: (filters: Record<string, string | boolean | undefined>) => void
): HTMLDivElement {
	const filterContainer = container.createDiv({ cls: 'datacore-filter-bar' });

	const filters: Record<string, string | boolean | undefined> = {};

	for (const { key, label, type } of fields) {
		const filterGroup = filterContainer.createDiv({ cls: 'filter-group' });
		filterGroup.createEl('label', { text: label });

		if (type === 'select') {
			const select = filterGroup.createEl('select');
			select.addEventListener('change', (e) => {
				const target = e.target as HTMLSelectElement;
				filters[key] = target.value || undefined;
				onFilterChange(filters);
			});
		} else if (type === 'checkbox') {
			const checkbox = filterGroup.createEl('input', {
				type: 'checkbox',
				cls: 'filter-checkbox',
			});
			checkbox.addEventListener('change', (e) => {
				const target = e.target as HTMLInputElement;
				filters[key] = target.checked;
				onFilterChange(filters);
			});
		} else if (type === 'text') {
			const input = filterGroup.createEl('input', {
				type: 'text',
				cls: 'filter-text',
			});
			input.addEventListener('change', (e) => {
				const target = e.target as HTMLInputElement;
				filters[key] = target.value || undefined;
				onFilterChange(filters);
			});
		}
	}

	return filterContainer;
}

/**
 * Utility to create status summary
 */
export function createStatusSummary(
	container: HTMLElement,
	items: CatalogItem[],
	groupByField: string,
	showWordCounts: boolean = false
): void {
	const summaryDiv = container.createDiv({ cls: 'datacore-status-summary' });
	const groups = new Map<unknown, CatalogItem[]>();

	// Group items
	for (const item of items) {
		const key = item.getField(groupByField);
		if (!groups.has(key)) {
			groups.set(key, []);
		}
		const group = groups.get(key);
		if (group) {
			group.push(item);
		}
	}

	// Render summary
	const table = summaryDiv.createEl('table');
	const thead = table.createEl('thead');
	const headerRow = thead.createEl('tr');
	headerRow.createEl('th', { text: groupByField });
	headerRow.createEl('th', { text: 'Count' });

	if (showWordCounts) {
		headerRow.createEl('th', { text: 'Total words' });
	}

	const tbody = table.createEl('tbody');
	for (const [key, group] of groups) {
		const row = tbody.createEl('tr');
		row.createEl('td', { text: String(key) });
		row.createEl('td', { text: String(group.length) });

		if (showWordCounts) {
			const totalWords = group.reduce((sum, item) => {
				const count = item.getField<number>('word-count') ?? 0;
				return sum + count;
			}, 0);
			row.createEl('td', { text: String(totalWords) });
		}
	}
}
