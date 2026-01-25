/**
 * Works Table Component View
 * Displays all catalog items in a sortable, paginated table
 */

import { WorkspaceLeaf } from 'obsidian';
import { DatacoreComponentView, createTableElement } from './DatacoreComponentView';
import { CartographerSettings } from '../types/settings';
import { loadCatalogItems, sortItems } from '../hooks/useDataLoading';
import { SortState } from '../types/catalogItem';

export const WORKS_TABLE_VIEW_TYPE = 'datacore-works-table';

export class WorksTableView extends DatacoreComponentView {
	sortState: SortState;

	constructor(leaf: WorkspaceLeaf, settings: CartographerSettings) {
		super(leaf, settings);
		this.sortState = {
			field: settings.ui.defaultSortColumn,
			desc: settings.ui.defaultSortDesc,
		};
	}

	getViewType(): string {
		return WORKS_TABLE_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Works table';
	}

	async loadData(): Promise<void> {
		console.log('[Datacore] WorksTableView.loadData() starting');
		try {
			// Get active library
			const activeLibrary = this.settings.libraries.find(
				(lib) => lib.id === this.settings.activeLibraryId
			);
			if (!activeLibrary) {
				console.warn('[Datacore] No active library selected');
				this.items = [];
				return;
			}

			this.items = await loadCatalogItems(this.app, activeLibrary);
			console.log(`[Datacore] WorksTableView loaded ${this.items.length} items`);
		} catch (error) {
			console.error('[Datacore] WorksTableView.loadData() error:', error);
			throw error;
		}
	}

	async renderComponent(): Promise<void> {
		return await Promise.resolve().then(() => {
			const container = this.containerEl.children[1] as HTMLElement;
			if (!container) {
				return;
			}

			container.empty();

			const activeLibrary = this.getActiveLibrary();
			if (!activeLibrary) {
				container.createEl('p', { text: 'No active library selected' });
				return;
			}

			const { worksTable } = this.settings.dashboards;

			if (!worksTable.enabled) {
				container.createEl('p', { text: 'Works table is disabled' });
				return;
			}

			container.createEl('h2', { text: 'All works' });

			// Get columns to display
			const columns = worksTable.defaultColumns
				.map((key) => {
					const fieldDef = activeLibrary.schema.fields.find((f) => f.key === key);
					return fieldDef
						? { key, label: fieldDef.label }
						: null;
				})
				.filter((c) => c !== null) as Array<{ key: string; label: string }>;

			// Sort items
			const sorted = sortItems(this.items, this.sortState, this.settings);

			// Create and render table with schema fields from active library
			const schemaFieldsForTable = activeLibrary.schema.fields.map((f) => ({
				key: f.key,
				label: f.label,
				type: f.type,
			}));
			createTableElement(container, columns, sorted, schemaFieldsForTable);

			// Add controls
			const controls = container.createDiv({ cls: 'datacore-table-controls' });
			controls.createEl('p', { text: `Total: ${this.items.length} items` });
		});
	}
}
