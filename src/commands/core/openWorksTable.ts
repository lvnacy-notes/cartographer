/**
 * Command: Open works table
 */
import Cartographer from '../../main';
import { WORKS_TABLE_VIEW_TYPE } from '../../components/WorksTableView';
import { CommandDefinition } from '../../types/commands';

export function openWorksTableCommand(plugin: Cartographer): CommandDefinition {
	return {
		id: 'datacore-open-works-table',
		name: 'Open works table',
		callback: () => {
			void plugin.activateView(WORKS_TABLE_VIEW_TYPE);
		}
	};
}
