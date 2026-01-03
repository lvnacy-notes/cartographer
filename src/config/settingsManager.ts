/**
 * Settings management for Datacore plugin
 * Handles loading, saving, validating, and managing settings
 */

import { Plugin } from 'obsidian';
import { DatacoreSettings, SchemaField } from '../types/settings';
import { PRESETS } from './presets';

/**
 * Manages loading, saving, and validating plugin settings
 */
export class SettingsManager {
	private plugin: Plugin;
	private settings: DatacoreSettings;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
		this.settings = PRESETS['pulp-fiction'] as DatacoreSettings;
	}

	async loadSettings(): Promise<DatacoreSettings> {
		const saved = (await this.plugin.loadData()) as DatacoreSettings | null;

		if (saved?.version) {
			this.settings = this.validateSettings(saved);
		} else {
			// Load default preset
			this.settings = JSON.parse(JSON.stringify(PRESETS['pulp-fiction'])) as DatacoreSettings;
		}

		return this.settings;
	}

	async saveSettings(): Promise<void> {
		await this.plugin.saveData(this.settings);
	}

	getSettings(): DatacoreSettings {
		return this.settings;
	}

	/**
	 * Load a preset by name
	 */
	async loadPreset(presetName: keyof typeof PRESETS): Promise<void> {
		this.settings = JSON.parse(JSON.stringify(PRESETS[presetName])) as DatacoreSettings;
		await this.saveSettings();
	}

	/**
	 * Add a custom field to schema
	 */
	addField(field: SchemaField): void {
		const existingIndex = this.settings.schema.fields.findIndex(
			(f) => f.key === field.key
		);

		if (existingIndex === -1) {
			this.settings.schema.fields.push(field);
		} else {
			this.settings.schema.fields[existingIndex] = field;
		}
	}

	/**
	 * Remove a field from schema
	 */
	removeField(fieldKey: string): void {
		this.settings.schema.fields = this.settings.schema.fields.filter(
			(f) => f.key !== fieldKey
		);
	}

	/**
	 * Update field visibility, filterability, etc.
	 */
	updateFieldProperties(
		fieldKey: string,
		updates: Partial<SchemaField>
	): void {
		const field = this.settings.schema.fields.find((f) => f.key === fieldKey);
		if (field) {
			Object.assign(field, updates);
		}
	}

	/**
	 * Update catalog path
	 */
	setCatalogPath(path: string): void {
		this.settings.catalogPath = path;
	}

	/**
	 * Update catalog name
	 */
	setCatalogName(name: string): void {
		this.settings.schema.catalogName = name;
	}

	/**
	 * Get list of available presets
	 */
	getAvailablePresets(): string[] {
		return Object.keys(PRESETS);
	}

	/**
	 * Validate settings structure
	 */
	private validateSettings(saved: DatacoreSettings): DatacoreSettings {
		// Ensure all required fields exist
		if (!saved.version) {saved.version = '1.0.0';}
		if (!saved.presetName) {saved.presetName = 'custom';}
		if (!saved.catalogPath) {saved.catalogPath = 'catalog';}

		// Ensure schema exists
		if (!saved.schema) {
			saved.schema = {
				catalogName: 'Custom Catalog',
				fields: [],
				coreFields: { titleField: 'title' },
			};
		}

		// Ensure dashboards exist
		if (!saved.dashboards) {
			saved.dashboards = {
				statusDashboard: {
					enabled: false,
					groupByField: '',
					showTotalStats: false,
					showWordCounts: false,
				},
				worksTable: {
					enabled: true,
					defaultColumns: ['title'],
					enablePagination: true,
				},
				filterBar: {
					enabled: false,
					layout: 'vertical' as const,
					filters: [],
				},
				publicationDashboard: {
					enabled: false,
					foreignKeyField: '',
					displayColumns: [],
				},
				authorCard: {
					enabled: false,
					authorField: '',
					displayColumns: [],
					showStatistics: false,
				},
				backstagePassPipeline: {
					enabled: false,
					stages: [],
				},
			};
		}

		// Ensure UI settings exist
		if (!saved.ui) {
			saved.ui = {
				itemsPerPage: 50,
				defaultSortColumn: 'title',
				defaultSortDesc: false,
				compactMode: false,
			};
		}

		return saved;
	}
}
