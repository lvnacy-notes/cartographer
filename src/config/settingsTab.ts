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

export class DatacoreSettingsTab extends PluginSettingTab {
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
		new Setting(containerEl).setName('Datacore plugin').setHeading();

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
	}
}
