/**
 * Command: Open status dashboard
 */
import Cartographer from '../../main';
import { STATUS_DASHBOARD_VIEW_TYPE } from '../../components/StatusDashboardView';
import { CommandDefinition } from '../../types/commands';

export function openStatusDashboardCommand(plugin: Cartographer): CommandDefinition {
	return {
		id: 'datacore-open-status-dashboard',
		name: 'Open status dashboard',
		callback: () => {
			void plugin.activateView(STATUS_DASHBOARD_VIEW_TYPE);
		}
	};
}
