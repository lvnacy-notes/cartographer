/**
 * Sidebar panel for library management and switching
 * Allows users to view all libraries, select active library, and manage library list
 */

import {
	ItemView,
	WorkspaceLeaf,
	Plugin
} from 'obsidian';
import { CartographerSettings, Library } from '../types/settings';
import { SettingsManager } from '../config/settingsManager';
import { loadCatalogItems } from '../hooks/useDataLoading';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { LibraryModal } from '../config/libraryModal';

export const LIBRARY_SIDEBAR_VIEW_TYPE = 'datacore-library-sidebar';

/**
 * Sidebar panel for managing libraries and switching between them
 */
export class LibrarySidebarPanel extends ItemView {
	private plugin: Plugin;
	private settingsManager: SettingsManager;
	private settings: CartographerSettings;

	constructor(
		leaf: WorkspaceLeaf,
		plugin: Plugin,
		settingsManager: SettingsManager,
		settings: CartographerSettings
	) {
		super(leaf);
		this.plugin = plugin;
		this.settingsManager = settingsManager;
		this.settings = settings;
	}

	getViewType(): string {
		return LIBRARY_SIDEBAR_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Library';
	}

	async onOpen(): Promise<void> {
		await this.render();
		this.registerEvent(
			this.plugin.app.vault.on('modify', () => {
				void this.updateLibraryCounts();
			})
		);
	}

	onClose(): Promise<void> {
		return Promise.resolve();
	}

	private async render(): Promise<void> {
		const container = this.containerEl.children[1];
		if (!container) {
			return;
		}

		const element = container as HTMLElement;
		element.empty();

		const libraryPanel = element.createDiv('datacore-library-panel');

		// Title
		libraryPanel.createEl('h3', {
			text: 'Libraries',
			cls: 'datacore-library-title'
		});

		// Add Library button
		const buttonContainer = libraryPanel.createDiv('datacore-library-buttons');
		const addBtn = buttonContainer.createEl('button', {
			/* eslint-disable-next-line obsidianmd/ui/sentence-case */
			text: '+ Add Library',
			cls: 'datacore-add-library-btn'
		});

		addBtn.addEventListener('click', () => {
			// Open library creation modal
			const modal = new LibraryModal(
				this.plugin.app,
				this.settingsManager,
				null,
				async () => {
					await this.settingsManager.saveSettings();
					await this.render();
				}
			);
			modal.open();
		});

		// Libraries list
		const listContainer = libraryPanel.createDiv('datacore-library-list');

		if (this.settings.libraries.length === 0) {
			listContainer.createEl('div', {
				text: 'No libraries configured',
				cls: 'datacore-library-empty'
			});
		} else {
			for (const library of this.settings.libraries) {
				await this.createLibraryItem(listContainer, library);
			}
		}
	}

	private async createLibraryItem(
		container: HTMLElement,
		library: Library
	): Promise<void> {
		const itemEl = container.createDiv('datacore-library-item');
		const isActive = this.settings.activeLibraryId === library.id;

		if (isActive) {
			itemEl.addClass('datacore-library-item-active');
		}

		// Main clickable area
		const mainEl = itemEl.createDiv('datacore-library-item-main');

		// Library name
		mainEl.createEl('h3', {
			text: 'Libraries',
			cls: 'datacore-library-title'
		});

		// Item count
		let itemCount = 0;
		try {
			const items = await loadCatalogItems(this.plugin.app, library);
			itemCount = items.length;
		} catch (error: unknown) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			console.warn(`Could not load count for library ${library.name}:`, errorMsg);
		}

		mainEl.createEl('div', {
			text: `${itemCount} item${itemCount !== 1 ? 's' : ''}`,
			cls: 'datacore-library-item-count'
		});

		// Select on click
		mainEl.addEventListener('click', () => {
			if (!isActive) {
				void (async () => {
					this.settingsManager.setActiveLibrary(library.id);
					await this.settingsManager.saveSettings();
					await this.render();
				})();
			}
		});

		// Action buttons
		const actionsEl = itemEl.createDiv('datacore-library-item-actions');

		const deleteBtn = actionsEl.createEl('button', {
			text: '−',
			cls: 'datacore-library-delete-btn',
			title: 'Delete library'
		});

		deleteBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			void (async () => {
				const confirmed = await this.confirmDelete(library.name);
				if (confirmed) {
					this.settingsManager.deleteLibrary(library.id);
					await this.settingsManager.saveSettings();
					await this.render();
				}
			})();
		});
	}

	private async updateLibraryCounts(): Promise<void> {
		const items = this.containerEl.querySelectorAll('.datacore-library-item-count');
		for (let i = 0; i < items.length; i++) {
			const library = this.settings.libraries[i];
			if (!library) {
				continue;
			}

			const item = items[i];
			if (!item) {
				continue;
			}

			try {
				const catalogItems = await loadCatalogItems(this.plugin.app, library);
				const count = catalogItems.length;
				item.textContent = `${count} item${count !== 1 ? 's' : ''}`;
			} catch (error: unknown) {
				const errorMsg = error instanceof Error ? error.message : String(error);
				console.warn(`Could not load count for library ${library.name}:`, errorMsg);
				/* eslint-disable-next-line obsidianmd/ui/sentence-case */
				item.textContent = '? items';
			}
		}
	}

	private async confirmDelete(libraryName: string): Promise<boolean> {
		return await new Promise((resolve) => {
			const modal = new DeleteConfirmModal(this.plugin.app, libraryName, (confirmed) => {
				resolve(confirmed);
			});
			modal.open();
		});
	}
}
