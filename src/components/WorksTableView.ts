/**
 * Works Table Component View
 * Displays all catalog items in a sortable, paginated table
 */

import { WorkspaceLeaf } from 'obsidian';
import { DatacoreComponentView, createTableElement } from './DatacoreComponentView';
import { DatacoreSettings } from '../types/settings';
import { loadCatalogItems, sortItems } from '../hooks/useDataLoading';
import { SortState } from '../types/dynamicWork';

export const WORKS_TABLE_VIEW_TYPE = 'datacore-works-table';

export class WorksTableView extends DatacoreComponentView {
	sortState: SortState;

	constructor(leaf: WorkspaceLeaf, settings: DatacoreSettings) {
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
		this.items = await loadCatalogItems(this.app, this.settings);
	}

	async renderComponent(): Promise<void> {
		return await Promise.resolve().then(() => {
			const container = this.containerEl.children[1] as HTMLElement;
			if (!container) {return;}

			container.empty();

			const { worksTable } = this.settings.dashboards;

			if (!worksTable.enabled) {
				container.createEl('p', { text: 'Works table is disabled' });
				return;
			}

			container.createEl('h2', { text: 'All works' });

			// Get columns to display
			const columns = worksTable.defaultColumns
				.map((key) => {
					const fieldDef = this.settings.schema.fields.find((f) => f.key === key);
					return fieldDef
						? { key, label: fieldDef.label }
						: null;
				})
				.filter((c) => c !== null) as Array<{ key: string; label: string }>;

			// Sort items
			const sorted = sortItems(this.items, this.sortState, this.settings);

			// Create and render table
			createTableElement(container, columns, sorted, this.settings);

			// Add controls
			const controls = container.createDiv({ cls: 'datacore-table-controls' });
			controls.createEl('p', { text: `Total: ${this.items.length} items` });
		});
	}
}
