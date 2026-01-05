/**
 * Command: Open specific library
 * Dynamically generated for each configured library
 */
import Cartographer from '../../main';
import { Library } from '../../types/settings';
import { STATUS_DASHBOARD_VIEW_TYPE } from '../../components/StatusDashboardView';
import { CommandDefinition } from '../../types/commands';

export function openLibraryCommand(plugin: Cartographer, library: Library): CommandDefinition {
	return {
		id: `datacore-library-${library.id}`,
		name: `Open ${library.name}`,
		callback: () => {
			plugin.settingsManager.setActiveLibrary(library.id);
			void plugin.activateView(STATUS_DASHBOARD_VIEW_TYPE);
		}
	};
}