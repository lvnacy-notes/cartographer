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
import { Library, CatalogSchema, SchemaField } from '../types/settings';

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

		// Field editor section
		contentEl.createEl('h3', { text: 'Schema fields' });

		if (this.library?.schema?.fields && this.library.schema.fields.length > 0) {
			this.library.schema.fields.forEach((field, index) => {
				const fieldContainer = contentEl.createDiv({ cls: 'field-editor-item' });
				const fieldInfo = fieldContainer.createDiv({ cls: 'field-editor-info' });
				fieldInfo.createEl('div', {
					text: `${field.key} (${field.type})`,
					cls: 'field-editor-name'
				});
				fieldInfo.createEl('div', {
					text: `Filterable: ${field.filterable ? 'Yes' : 'No'} | Sortable: ${field.sortable ? 'Yes' : 'No'}`,
					cls: 'field-editor-flags'
				});

				const fieldActions = fieldContainer.createDiv({ cls: 'field-editor-actions' });
				const editBtn = fieldActions.createEl('button', { text: 'Edit' });
				editBtn.addEventListener('click', () => {
					this.openFieldEditor(contentEl, index);
				});

				const removeBtn = fieldActions.createEl('button', {
					text: 'Remove',
					cls: 'mod-warning'
				});
				removeBtn.addEventListener('click', () => {
					if (this.library?.schema?.fields) {
						this.library.schema.fields.splice(index, 1);
						this.onOpen();
					}
				});
			});
		} else {
			contentEl.createEl('p', {
				text: 'No fields configured. Click "Add field" to get started.',
				cls: 'setting-item-description'
			});
		}

		new Setting(contentEl).addButton((button) => {
			button.setButtonText('Add field').onClick(() => {
				if (!this.library?.schema?.fields) {
					return;
				}
				const newField: SchemaField = {
					key: `field_${this.library.schema.fields.length + 1}`,
					label: `Field ${this.library.schema.fields.length + 1}`,
					type: 'string',
					category: 'custom',
					visible: true,
					filterable: true,
					sortable: true,
					sortOrder: this.library.schema.fields.length + 1
				};
				this.library.schema.fields.push(newField);
				this.onOpen();
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

	private openFieldEditor(parentEl: HTMLElement, fieldIndex: number) {
		if (!this.library?.schema?.fields?.[fieldIndex]) {
			return;
		}

		const field = this.library.schema.fields[fieldIndex];
		const editorContainer = parentEl.createDiv({ cls: 'field-editor-modal' });

		const closeBtn = editorContainer.createEl('button', {
			text: '✕',
			cls: 'field-editor-close'
		});

		const form = editorContainer.createDiv();

		new Setting(form)
			.setName('Field key')
			.addText((text) => {
				text.setValue(field.key).onChange((value) => {
					field.key = value;
				});
			});

		new Setting(form)
			.setName('Display label')
			.addText((text) => {
				text.setValue(field.label).onChange((value) => {
					field.label = value;
				});
			});

		new Setting(form)
			.setName('Field type')
			.addDropdown((dropdown) => {
				dropdown.addOption('string', 'String');
				dropdown.addOption('number', 'Number');
				dropdown.addOption('boolean', 'Boolean');
				dropdown.addOption('date', 'Date');
				dropdown.addOption('array', 'Array');
				dropdown.addOption('wikilink-array', 'Wikilink array');
				dropdown.addOption('object', 'Object');
				dropdown
					.setValue(field.type)
					.onChange((value) => {
						field.type = value as SchemaField['type'];
					});
			});

		new Setting(form)
			.setName('Category')
			.addDropdown((dropdown) => {
				dropdown.addOption('metadata', 'Metadata');
				dropdown.addOption('status', 'Status');
				dropdown.addOption('workflow', 'Workflow');
				dropdown.addOption('content', 'Content');
				dropdown.addOption('custom', 'Custom');
				dropdown
					.setValue(field.category)
					.onChange((value) => {
						field.category = value as SchemaField['category'];
					});
			});

		new Setting(form)
			.setName('Visible')
			.addToggle((toggle) => {
				toggle.setValue(field.visible).onChange((value) => {
					field.visible = value;
				});
			});

		new Setting(form)
			.setName('Filterable')
			.addToggle((toggle) => {
				toggle.setValue(field.filterable).onChange((value) => {
					field.filterable = value;
				});
			});

		new Setting(form)
			.setName('Sortable')
			.addToggle((toggle) => {
				toggle.setValue(field.sortable).onChange((value) => {
					field.sortable = value;
				});
			});

		const buttonContainer = form.createDiv({ cls: 'modal-button-container' });
		const saveBtn = buttonContainer.createEl('button', {
			text: 'Save',
			cls: 'mod-cta'
		});
		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });

		saveBtn.addEventListener('click', () => {
			editorContainer.remove();
		});

		closeBtn.addEventListener('click', () => {
			editorContainer.remove();
		});

		cancelBtn.addEventListener('click', () => {
			editorContainer.remove();
		});
	}
}
