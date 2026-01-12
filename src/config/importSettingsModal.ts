/**
 * Modal for confirming settings import action (merge vs replace)
 */

import {
	App,
	Modal
} from 'obsidian';
import { DatacoreSettings } from '../types/settings';
import { SettingsManager } from './settingsManager';

export class ImportSettingsModal extends Modal {
	settingsManager: SettingsManager;
	importedSettings: DatacoreSettings;
	onConfirm: (settings: DatacoreSettings) => Promise<void>;

	constructor(
		app: App,
		settingsManager: SettingsManager,
		importedSettings: DatacoreSettings,
		onConfirm: (settings: DatacoreSettings) => Promise<void>
	) {
		super(app);
		this.settingsManager = settingsManager;
		this.importedSettings = importedSettings;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Import settings' });
		contentEl.createEl('p', {
			text: 'Choose how to import these settings:'
		});

		const currentSettings = this.settingsManager.getSettings();
		const importedLibraryCount = this.importedSettings.libraries.length;
		const currentLibraryCount = currentSettings.libraries.length;

		contentEl.createEl('div', {
			text: `Imported libraries: ${importedLibraryCount} | Current libraries: ${currentLibraryCount}`,
			cls: 'setting-item-description'
		});

		const buttonContainer = contentEl.createDiv({ cls: 'import-modal-buttons' });

		const replaceBtn = buttonContainer.createEl('button', {
			text: 'Replace all',
			cls: 'mod-cta'
		});
		replaceBtn.addEventListener('click', () => {
			void (async () => {
				await this.onConfirm(this.importedSettings);
				this.close();
			})();
		});

		const mergeBtn = buttonContainer.createEl('button', {
			text: 'Merge with existing'
		});
		mergeBtn.addEventListener('click', () => {
			void (async () => {
				const merged: DatacoreSettings = {
					...currentSettings,
					libraries: [...currentSettings.libraries]
				};

				const importedIds = new Set(this.importedSettings.libraries.map((l) => l.id));
				const existingIds = new Set(currentSettings.libraries.map((l) => l.id));

				this.importedSettings.libraries.forEach((lib) => {
					if (existingIds.has(lib.id)) {
						const index = merged.libraries.findIndex((l) => l.id === lib.id);
						merged.libraries[index] = lib;
					} else {
						merged.libraries.push(lib);
					}
				});

				if (this.importedSettings.activeLibraryId && importedIds.has(this.importedSettings.activeLibraryId)) {
					merged.activeLibraryId = this.importedSettings.activeLibraryId;
				}

				await this.onConfirm(merged);
				this.close();
			})();
		});

		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelBtn.addEventListener('click', () => this.close());
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
