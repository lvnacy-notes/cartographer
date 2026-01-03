/**
 * Settings UI Tab for Obsidian settings panel
 */

import { App, PluginSettingTab, Setting, Plugin } from 'obsidian';
import { PRESETS } from './presets';
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

		// Preset selection
		new Setting(containerEl)
			.setName('Configuration preset')
			.setDesc('Select a preset configuration or create a custom one')
			.addDropdown((dropdown) => {
				this.settingsManager.getAvailablePresets().forEach((preset) => {
					dropdown.addOption(preset, preset);
				});
				dropdown
					.setValue(settings.presetName)
					.onChange(async (value: keyof typeof PRESETS) => {
						await this.settingsManager.loadPreset(value);
						this.display(); // Refresh the UI
					});
			});

		// Catalog path
		new Setting(containerEl)
			.setName('Catalog path')
			.setDesc('Relative path to catalog directory (e.g., "works", "library")')
			.addText((text) => {
				text
					.setValue(settings.catalogPath)
					.onChange(async (value: string) => {
						this.settingsManager.setCatalogPath(value);
						await this.settingsManager.saveSettings();
					});
			});

		// Catalog name
		new Setting(containerEl)
			.setName('Catalog name')
			.setDesc('Display name for this catalog')
			.addText((text) => {
				text
					.setValue(settings.schema.catalogName)
					.onChange(async (value: string) => {
						this.settingsManager.setCatalogName(value);
						await this.settingsManager.saveSettings();
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
