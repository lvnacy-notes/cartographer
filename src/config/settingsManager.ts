/**
 * Settings management for Datacore plugin
 * Handles loading, saving, validating, and managing settings
 */

import { Plugin } from 'obsidian';
import {
	DatacoreSettings,
	Library,
	SchemaField
} from '../types/settings';

/**
 * Manages loading, saving, and validating plugin settings
 */
export class SettingsManager {
	private plugin: Plugin;
	private settings: DatacoreSettings;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
		this.settings = this.getDefaultSettings();
	}

	async loadSettings(): Promise<DatacoreSettings> {
		const saved = (await this.plugin.loadData()) as DatacoreSettings | null;

		if (saved?.version) {
			this.settings = this.validateSettings(saved);
		} else {
			// Initialize with empty library list
			this.settings = this.getDefaultSettings();
		}

		return this.settings;
	}

	async saveSettings(): Promise<void> {
		await this.plugin.saveData(this.settings);
	}

	getSettings(): DatacoreSettings {
		return this.settings;
	}

	private getDefaultSettings(): DatacoreSettings {
		return {
			version: '1.0.0',
			libraries: [],
			activeLibraryId: null,
			schema: {
				catalogName: 'Default Catalog',
				fields: [],
				coreFields: { titleField: 'title' },
			},
			dashboards: {
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
			},
			ui: {
				itemsPerPage: 50,
				defaultSortColumn: 'title',
				defaultSortDesc: false,
				compactMode: false,
			},
		};
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
	 * Create a new library
	 * @throws Error if vault path does not exist
	 */
	async createLibrary(library: Omit<Library, 'id' | 'createdAt'>): Promise<Library> {
		// Validate that the vault path exists
		try {
			await this.plugin.app.vault.adapter.exists(library.path);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Invalid library path: ${library.path} does not exist in vault. ${ errorMessage }`);
		}

		const newLibrary: Library = {
			id: `lib-${Date.now()}`,
			...library,
			createdAt: new Date().toISOString(),
		};
		this.settings.libraries.push(newLibrary);
		return newLibrary;
	}

	/**
	 * Update an existing library
	 */
	updateLibrary(id: string, updates: Partial<Library>): void {
		const library = this.settings.libraries.find((lib) => lib.id === id);
		if (library) {
			Object.assign(library, updates);
		}
	}

	/**
	 * Delete a library
	 */
	deleteLibrary(id: string): void {
		this.settings.libraries = this.settings.libraries.filter((lib) => lib.id !== id);
		if (this.settings.activeLibraryId === id) {
			this.settings.activeLibraryId = null;
		}
	}

	/**
	 * Get a library by ID
	 */
	getLibrary(id: string): Library | null {
		return this.settings.libraries.find((lib) => lib.id === id) ?? null;
	}

	/**
	 * Set the active library
	 */
	setActiveLibrary(id: string): void {
		if (this.settings.libraries.find((lib) => lib.id === id)) {
			this.settings.activeLibraryId = id;
		}
	}

	/**
	 * Get the active library
	 */
	getActiveLibrary(): Library | null {
		if (!this.settings.activeLibraryId) {
			return null;
		}
		return this.getLibrary(this.settings.activeLibraryId);
	}

	/**
	 * Validate settings structure
	 */
	private validateSettings(saved: DatacoreSettings): DatacoreSettings {
		// Ensure all required fields exist
		if (!saved.version) {
			saved.version = '1.0.0';
		}

		if (!saved.libraries) {
			saved.libraries = [];
		}

		if (saved.activeLibraryId === undefined) {
			saved.activeLibraryId = null;
		}

		// Ensure schema exists
		if (!saved.schema) {
			saved.schema = {
				catalogName: 'Default Catalog',
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
