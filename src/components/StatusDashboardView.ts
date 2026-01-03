/**
 * Status Dashboard Component View
 * Shows a summary of items grouped by status with counts
 */

import { DatacoreComponentView, createStatusSummary } from './DatacoreComponentView';
import { loadCatalogItems } from '../hooks/useDataLoading';

export const STATUS_DASHBOARD_VIEW_TYPE = 'datacore-status-dashboard';

export class StatusDashboardView extends DatacoreComponentView {
	getViewType(): string {
		return STATUS_DASHBOARD_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Status dashboard';
	}

	async loadData(): Promise<void> {
		this.items = await loadCatalogItems(this.app, this.settings);
	}

	async renderComponent(): Promise<void> {
		const container = this.containerEl.children[1] as HTMLElement;
		if (!container) {
			return;
		}

		container.empty();

		const { statusDashboard } = this.settings.dashboards;

		if (!statusDashboard.enabled) {
			container.createEl('p', { text: 'Status dashboard is disabled' });
			return;
		}

		container.createEl('h2', { text: 'Status summary' });

		await Promise.resolve(createStatusSummary(
			container,
			this.items,
			statusDashboard.groupByField,
			statusDashboard.showWordCounts,
			this.settings
		)).catch((error: unknown) => {
			const message = error instanceof Error ? error.message : String(error);
			container.createEl('p', { text: `Error rendering status dashboard: ${message}` });
		});
	};
}
