/**
 * Settings UI Tab for Obsidian settings panel
 */

import {
	App,
	Plugin,
	PluginSettingTab,
	Setting
} from 'obsidian';
import { SettingsManager } from './settingsManager';
import { LibraryModal } from './libraryModal';
import { ImportSettingsModal } from './importSettingsModal';
import { CartographerSettings } from '../types/settings';

export class CartographerSettingsTab extends PluginSettingTab {
	plugin: Plugin;
	settingsManager: SettingsManager;

	constructor(app: App, plugin: Plugin, settingsManager: SettingsManager) {
		super(app, plugin);
		this.plugin = plugin;
		this.settingsManager = settingsManager;
	}

	display(): void {
		const { containerEl } = this;
		const settings = this.settingsManager.getSettings();

		containerEl.empty();
		/* eslint-disable-next-line obsidianmd/ui/sentence-case */
		new Setting(containerEl).setName('Library Selection').setHeading();

		// Active library selector
		new Setting(containerEl)
			.setName('Active library')
			.setDesc('Select which library to display')
			.addDropdown((dropdown) => {
				dropdown.addOption('', 'None selected');
				settings.libraries.forEach((library) => {
					dropdown.addOption(library.id, library.name);
				});
				dropdown
					.setValue(settings.activeLibraryId ?? '')
					.onChange(async (value: string) => {
						if (value) {
							this.settingsManager.setActiveLibrary(value);
						} else {
							settings.activeLibraryId = null;
						}
						await this.settingsManager.saveSettings();
						this.display();
					});
			});

		// Library management section
		/* eslint-disable-next-line obsidianmd/ui/sentence-case */
		new Setting(containerEl).setName('Library Management').setHeading();

		// Add library button
		new Setting(containerEl).addButton((button) => {
			button
				.setButtonText('Add library')
				.setCta()
				.onClick(() => {
					new LibraryModal(this.app, this.settingsManager, null, async (lib) => {
						void this.settingsManager.createLibrary(lib);
						await this.settingsManager.saveSettings();
						this.display();
					}).open();
				});
		});

		// Library list with edit/delete buttons
		if (settings.libraries.length === 0) {
			containerEl.createEl('p', {
				text: 'No libraries configured. Add one to get started.'
			});
		} else {
			settings.libraries.forEach((library) => {
				const libContainer = containerEl.createDiv({
					cls: 'library-item'
				});

				const libInfo = libContainer.createDiv({ cls: 'library-info' });
				libInfo.createEl('strong', { text: library.name });
				libInfo.createEl('div', {
					text: `Path: ${library.path}`,
					cls: 'setting-item-description'
				});
				libInfo.createEl('div', {
					text: `Fields: ${library.schema.fields.length}`,
					cls: 'setting-item-description'
				});

				const libActions = libContainer.createDiv({ cls: 'library-actions' });

				// Edit button
				const editBtn = libActions.createEl('button', { text: 'Edit' });
				editBtn.addEventListener('click', () => {
					new LibraryModal(this.app, this.settingsManager, library, async (lib) => {
						this.settingsManager.updateLibrary(library.id, lib);
						await this.settingsManager.saveSettings();
						this.display();
					}).open();
				});

				// Delete button
				const deleteBtn = libActions.createEl('button', {
					text: 'Delete',
					cls: 'mod-warning'
				});
				deleteBtn.addEventListener('click', () => {
					const { name: _name, id } = library;
					const deleteConfirmBtn = libActions.createEl('button', {
						text: 'Confirm delete',
						cls: 'mod-warning'
					});
					deleteBtn.hide();
					deleteConfirmBtn.addEventListener('click', () => {
						this.settingsManager.deleteLibrary(id);
						void this.settingsManager.saveSettings();
						this.display();
					});
					const cancelConfirmBtn = libActions.createEl('button', { text: 'Cancel' });
					cancelConfirmBtn.addEventListener('click', () => {
						deleteConfirmBtn.remove();
						cancelConfirmBtn.remove();
						deleteBtn.show();
					});
				});
			});
		}

		// Documentation section
		new Setting(containerEl)
			.setName('Component documentation')
			/* eslint-disable-next-line obsidianmd/ui/sentence-case */
			.setDesc('Interactive Storybook with 20+ component examples, fixture data, and mobile testing')
			.addButton((button) => {
				button
					/* eslint-disable-next-line obsidianmd/ui/sentence-case */
					.setButtonText('View Storybook Guide')
					.onClick(() => {
						// Open Storybook guide in default browser or show in vault
						const win = window.open('../STORYBOOK-GUIDE.md', '_blank');
						if (!win) {
							console.error('Failed to open Storybook guide');
						}
					});
			});

		// UI Preferences section
		/* eslint-disable-next-line obsidianmd/ui/sentence-case */
		new Setting(containerEl).setName('UI Preferences').setHeading();

		// Items per page
		new Setting(containerEl)
			.setName('Items per page')
			.setDesc('Number of items to display per page in tables')
			.addText((text) => {
				text
					.setValue(String(settings.ui.itemsPerPage))
					.onChange(async (value: string) => {
						settings.ui.itemsPerPage = parseInt(value, 10) || 50;
						await this.settingsManager.saveSettings();
					});
			});

		// Compact mode
		new Setting(containerEl)
			.setName('Compact mode')
			.setDesc('Display tables in compact mode')
			.addToggle((toggle) => {
				toggle
					.setValue(settings.ui.compactMode)
					.onChange(async (value: boolean) => {
						settings.ui.compactMode = value;
						await this.settingsManager.saveSettings();
					});
			});

		// Component visibility
		new Setting(containerEl).setName('Components').setHeading();

		new Setting(containerEl)
			.setName('Status dashboard')
			.setDesc('Show status summary dashboard')
			.addToggle((toggle) => {
				toggle
					.setValue(settings.dashboards.statusDashboard.enabled)
					.onChange(async (value: boolean) => {
						settings.dashboards.statusDashboard.enabled = value;
						await this.settingsManager.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Works table')
			.setDesc('Show works table')
			.addToggle((toggle) => {
				toggle
					.setValue(settings.dashboards.worksTable.enabled)
					.onChange(async (value: boolean) => {
						settings.dashboards.worksTable.enabled = value;
						await this.settingsManager.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Filter bar')
			.setDesc('Show filter controls')
			.addToggle((toggle) => {
				toggle
					.setValue(settings.dashboards.filterBar.enabled)
					.onChange(async (value: boolean) => {
						settings.dashboards.filterBar.enabled = value;
						await this.settingsManager.saveSettings();
					});
			});

		// Import/Export section
		new Setting(containerEl).setName('Backup & import').setHeading();

		new Setting(containerEl)
			.setName('Export settings')
			.setDesc('Download all libraries and preferences as JSON')
			.addButton((button) => {
				button.setButtonText('Export').onClick(() => {
					const json = JSON.stringify(settings, null, 2);
					const blob = new Blob([json], { type: 'application/json' });
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					const dateStr = new Date().toISOString().split('T')[0];
					link.download = `cartographer-settings-${dateStr}.json`;
					link.click();
					URL.revokeObjectURL(url);
				});
			});

		new Setting(containerEl)
			.setName('Import settings')
			.setDesc('Upload a previously exported settings file')
			.addButton((button) => {
				button.setButtonText('Import').onClick(() => {
					const input = document.createElement('input');
					input.type = 'file';
					input.accept = '.json';
					input.onchange = () => {
						const file = input.files?.[0];
						if (!file) {
							return;
						}
						const reader = new FileReader();
						reader.onload = () => {
							try {
								const text = reader.result;
								if (typeof text !== 'string') {
									throw new Error('File read failed');
								}
								const imported = JSON.parse(text) as CartographerSettings;
								new ImportSettingsModal(
									this.app,
									this.settingsManager,
									imported,
									async (newSettings) => {
										this.settingsManager.setSettings(newSettings);
										await this.settingsManager.saveSettings();
										this.display();
									}
								).open();
							} catch (error) {
								const message = error instanceof Error ? error.message : 'Unknown error';
								console.error('Failed to import settings:', message);
							}
						};
						reader.readAsText(file);
					};
					input.click();
				});
			});
	}
}
