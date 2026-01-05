/**
 * Command: Toggle library sidebar
 */
import Cartographer from '../../main';
import { LIBRARY_SIDEBAR_VIEW_TYPE } from '../../components/LibrarySidebarPanel';
import { toggleSidebarPanel } from '../../utils/viewUtils';
import { CommandDefinition } from '../../types/commands';

export function toggleLibrarySidebarCommand(plugin: Cartographer): CommandDefinition {
	return {
		id: 'datacore-toggle-library-sidebar',
		name: 'Toggle library sidebar',
		callback: () => {
			void toggleSidebarPanel(plugin.app, LIBRARY_SIDEBAR_VIEW_TYPE);
		}
	};
}
