/**
 * Command registration and management
 */
import Cartographer from '../main';
import { CommandDefinition } from '../types/commands';
import { openStatusDashboardCommand } from './core/openStatusDashboard';
import { openWorksTableCommand } from './core/openWorksTable';
import { toggleLibrarySidebarCommand } from './core/toggleLibrarySidebar';
import { openLibraryCommand } from './library/openLibrary';

/**
 * Get all core (static) commands that are always available
 */
export function getCoreCommands(plugin: Cartographer): CommandDefinition[] {
	return [
		openStatusDashboardCommand(plugin),
		openWorksTableCommand(plugin),
		toggleLibrarySidebarCommand(plugin),
	];
}

/**
 * Get dynamic library commands (one per configured library)
 */
export function getLibraryCommands(plugin: Cartographer): CommandDefinition[] {
	const settings = plugin.settingsManager.getSettings();
	return settings.libraries.map(library => openLibraryCommand(plugin, library));
}

/**
 * Register all commands with the plugin
 */
export function registerAllCommands(plugin: Cartographer): void {
	const coreCommands = getCoreCommands(plugin);
	const libraryCommands = getLibraryCommands(plugin);
	const allCommands = [...coreCommands, ...libraryCommands];

	for (const command of allCommands) {
		plugin.addCommand({
			id: command.id,
			name: command.name,
			callback: command.callback
		});
	}
}

/**
 * Re-register library commands when libraries change
 * Called from settings manager when library list is updated
 */
export function updateLibraryCommands(plugin: Cartographer): void {
	const settings = plugin.settingsManager.getSettings();
	const libraryCommands = settings.libraries.map(library => openLibraryCommand(plugin, library));

	for (const command of libraryCommands) {
		try {
			// Try to add command; Obsidian will prevent duplicates
			plugin.addCommand({
				id: command.id,
				name: command.name,
				callback: command.callback
			});
		} catch (error) {
			// Command may already exist, which is fine
			console.debug(`Command ${command.id} already registered`, error);
		}
	}
}
