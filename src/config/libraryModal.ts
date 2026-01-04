/**
 * Modal dialog for adding/editing libraries
 */

import {
	App,
	Modal,
	Notice,
	Setting
} from 'obsidian';
import { SettingsManager } from './settingsManager';
import { Library, CatalogSchema } from '../types/settings';

// Default schemas for new libraries
const DEFAULT_SCHEMA_TEMPLATES = {
	blank: {
		catalogName: 'Blank',
		fields: [],
		coreFields: { titleField: 'title' }
	} as CatalogSchema
};

export class LibraryModal extends Modal {
	settingsManager: SettingsManager;
	library: Partial<Library> | null;
	onSubmit: (library: Omit<Library, 'id' | 'createdAt'>) => Promise<void>;

	constructor(
		app: App,
		settingsManager: SettingsManager,
		library: Library | null,
		onSubmit: (library: Omit<Library, 'id' | 'createdAt'>) => Promise<void>
	) {
		super(app);
		this.settingsManager = settingsManager;
		this.library = library ? { ...library } : { schema: DEFAULT_SCHEMA_TEMPLATES.blank };
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		const title = this.library?.id ? 'Edit library' : 'Add library';
		contentEl.createEl('h2', { text: title });

		// Name input
		new Setting(contentEl)
			.setName('Library name')
			.setDesc('Display name for this library')
			.addText((text) => {
				text
					.setValue(this.library?.name ?? '')
					/* eslint-disable obsidianmd/ui/sentence-case */
					.setPlaceholder('e.g., "My Collection"')
					.onChange((value) => {
						if (this.library) {
							this.library.name = value;
						}
					});
			});

		// Path input
		new Setting(contentEl)
			.setName('Vault path')
			.setDesc('Path to catalog folder in vault (e.g., "books", "research", "items")')
			.addText((text) => {
				text
					.setValue(this.library?.path ?? '')
					/* eslint-disable obsidianmd/ui/sentence-case */
					.setPlaceholder('books')
					.onChange((value) => {
						if (this.library) {
							this.library.path = value;
						}
					});
			});

		// Schema template selector
		new Setting(contentEl)
			.setName('Schema template')
			.setDesc('Starting template for library schema')
			.addDropdown((dropdown) => {
				dropdown.addOption('blank', 'Blank');
				dropdown.setValue('blank').onChange((value) => {
					if (this.library) {
						this.library.schema =
							DEFAULT_SCHEMA_TEMPLATES[value as keyof typeof DEFAULT_SCHEMA_TEMPLATES];
					}
				});
			});

		// Save/Cancel buttons
		const buttonContainer = contentEl.createDiv({
			cls: 'modal-button-container'
		});

		const saveButton = buttonContainer.createEl('button', {
			text: 'Save',
			cls: 'mod-cta'
		});
		saveButton.addEventListener('click', () => {
			if (!this.library?.name || !this.library?.path || !this.library?.schema) {
				void new Notice('Please fill in all fields');
				return;
			}
			void (async () => {
				try {
					if (!this.library) {
						throw new Error('Library not initialized');
					}
					const { name, path, schema } = this.library;
					if (!name || !path || !schema) {
						throw new Error('Library fields not properly initialized');
					}
					await this.onSubmit({ name, path, schema });
					this.close();
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Unknown error';
					void new Notice(`Error: ${message}`);
				}
			})();
		});

		const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelButton.addEventListener('click', () => this.close());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
