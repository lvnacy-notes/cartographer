import { Plugin } from 'obsidian';
import { DatacoreSettings } from './types/settings';
import { SettingsManager } from './config/settingsManager';
import { DatacoreSettingsTab } from './config/settingsTab';
import {
	StatusDashboardView,
	STATUS_DASHBOARD_VIEW_TYPE
} from './components/StatusDashboardView';
import {
	WorksTableView,
	WORKS_TABLE_VIEW_TYPE
} from './components/WorksTableView';
import {
	LibrarySidebarPanel,
	LIBRARY_SIDEBAR_VIEW_TYPE
} from './components/LibrarySidebarPanel';
import { registerAllCommands } from './commands';


export default class Cartographer extends Plugin {
	settings: DatacoreSettings;
	settingsManager: SettingsManager;

	async onload() {
		this.settingsManager = new SettingsManager(this);
		this.settings = await this.settingsManager.loadSettings();

		// Register view types
		this.registerView(
			STATUS_DASHBOARD_VIEW_TYPE,
			(leaf) => new StatusDashboardView(leaf, this.settings)
		);

		this.registerView(
			WORKS_TABLE_VIEW_TYPE,
			(leaf) => new WorksTableView(leaf, this.settings)
		);

		// Register sidebar panel
		this.registerView(
			LIBRARY_SIDEBAR_VIEW_TYPE,
			(leaf) => new LibrarySidebarPanel(leaf, this, this.settingsManager, this.settings)
		);

		// Add settings tab
		this.addSettingTab(new DatacoreSettingsTab(this.app, this, this.settingsManager));

		// Register all commands (core + dynamic library commands)
		registerAllCommands(this);

		// Add ribbon icon
		this.addRibbonIcon('database', 'Datacore catalog', () => {
			void this.activateView(STATUS_DASHBOARD_VIEW_TYPE);
		});
	}

	onunload() {
		// Plugin cleanup happens automatically
	}

	async activateView(viewType: string): Promise<void> {
		const { workspace } = this.app;

		const leaves = workspace.getLeavesOfType(viewType);
		const leaf = leaves.length > 0
			? leaves[0]
			: workspace.getLeaf('tab');

		if (!leaf) {return;}

		await leaf.setViewState({
			type: viewType,
			active: true,
		});

		workspace.revealLeaf(leaf).catch(error => {
			console.error('Error revealing leaf:', error);
		});
	}
}
