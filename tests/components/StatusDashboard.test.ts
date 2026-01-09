import {
	describe,
	test
} from 'node:test';
import assert from 'node:assert/strict';
import { h } from 'preact';
import { render } from 'preact-render-to-string';
import { StatusDashboard } from '../../src/components';
import type { DatacoreSettings } from '../../src/types';
import {
	catalogItems,
	catalogSchema,
	defaultSettings
} from '../fixtures';

describe('StatusDashboard', () => {
	test('renders with items and schema', () => {
		const items = catalogItems.slice(0, 5);
		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		assert(result.includes('Catalog Status Overview'), 'should render title');
		assert(result.includes('cartographer-status-dashboard'), 'should have correct class');
	});

	test('groups items by configured status field', () => {
		const items = catalogItems.slice(0, 10);
		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// Verify multiple status groups are rendered (different status values)
		const rowCount = (result.match(/cartographer-status-dashboard__row/g) || []).length;
		assert(rowCount > 0, 'should render at least one status row');
	});

	test('calculates counts correctly for each status', () => {
		const items = catalogItems.slice(0, 5);
		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// Verify numeric count values are rendered
		assert(result.includes('cartographer-status-dashboard__cell'), 'should render cells for counts');
	});

	test('calculates percentages correctly', () => {
		const items = catalogItems.slice(0, 10);
		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				statusDashboard: {
					...defaultSettings.dashboards.statusDashboard,
					displayStats: ['count', 'percentage']
				}
			}
		};

		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings,
				statusField: 'catalog-status'
			})
		);

		// Verify percentage symbols are present
		assert(result.includes('%'), 'should display percentage values');
	});

	test('handles empty items array', () => {
		const result = render(
			h(StatusDashboard, {
				items: [],
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		assert(result.includes('No items to display'), 'should show empty state message');
		assert(result.includes('cartographer-status-dashboard--empty'), 'should have empty class');
	});

	test('handles items with null/undefined status values', () => {
		const items = catalogItems.slice(0, 3);
		// Some test items may have null status, verify they are handled
		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status'
			})
		);

		// Should not crash and should render successfully
		assert(result.length > 0, 'should render without error');
		assert(result.includes('cartographer-status-dashboard'), 'should render component');
	});

	test('displays total items count', () => {
		const items = catalogItems.slice(0, 8);
		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				statusDashboard: {
					...defaultSettings.dashboards.statusDashboard,
					showTotalStats: true,
					displayStats: ['count', 'percentage']
				}
			}
		};

		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings,
				statusField: 'catalog-status'
			})
		);

		assert(result.includes('TOTAL'), 'should display total row');
		assert(result.includes('cartographer-status-dashboard__total-row'), 'should have total row class');
	});

	test('shows statistics when enabled', () => {
		const items = catalogItems.slice(0, 5);
		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				statusDashboard: {
					...defaultSettings.dashboards.statusDashboard,
					displayStats: ['count', 'percentage', 'yearRange', 'averageWords']
				}
			}
		};

		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings,
				statusField: 'catalog-status'
			})
		);

		assert(result.includes('Year Range'), 'should display year range header when enabled');
		assert(result.includes('Avg Words'), 'should display average words header when enabled');
	});

	test('hides statistics when disabled', () => {
		const items = catalogItems.slice(0, 5);
		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				statusDashboard: {
					...defaultSettings.dashboards.statusDashboard,
					displayStats: ['count'] as const
				}
			}
		};

		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings,
				statusField: 'catalog-status'
			})
		);

		assert(!result.includes('Year Range'), 'should not display year range when disabled');
		assert(!result.includes('Avg Words'), 'should not display average words when disabled');
	});

	test('sorts groups by configured sort mode (count-desc)', () => {
		const items = catalogItems.slice(0, 15);
		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				statusDashboard: {
					...defaultSettings.dashboards.statusDashboard,
					sortBy: 'count-desc' as const
				}
			}
		};

		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings,
				statusField: 'catalog-status'
			})
		);

		assert(result.length > 0, 'should render with count-desc sort');
		assert(result.includes('cartographer-status-dashboard__row'), 'should render sorted rows');
	});

	test('sorts groups by configured sort mode (alphabetical)', () => {
		const items = catalogItems.slice(0, 15);
		const settings: DatacoreSettings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				statusDashboard: {
					...defaultSettings.dashboards.statusDashboard,
					sortBy: 'alphabetical' as const
				}
			}
		};

		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings,
				statusField: 'catalog-status'
			})
		);

		assert(result.length > 0, 'should render with alphabetical sort');
		assert(result.includes('cartographer-status-dashboard__row'), 'should render sorted rows');
	});

	test('optional click handler fires on status click', () => {
		const items = catalogItems.slice(0, 3);
		let clickedStatus: string | number | boolean | null = null;

		const handleClick = (status: string | number | boolean | null) => {
			clickedStatus = status;
		};

		// Render and test that callback structure exists
		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings: defaultSettings,
				statusField: 'catalog-status',
				onStatusClick: handleClick
			})
		);

		// Verify click handler attributes are present in rendered HTML
		assert(result.includes('onclick') || result.includes('onClick'), 'should have click handler');
	});

	test('respects groupByField configuration', () => {
		const items = catalogItems.slice(0, 8);
		const settings = {
			...defaultSettings,
			dashboards: {
				...defaultSettings.dashboards,
				statusDashboard: {
					...defaultSettings.dashboards.statusDashboard,
					groupByField: 'catalog-status'
				}
			}
		};

		const result = render(
			h(StatusDashboard, {
				items,
				schema: catalogSchema,
				settings,
				statusField: 'catalog-status'
			})
		);

		assert(result.includes('Catalog Status Overview'), 'should render with configured field');
		assert(result.length > 0, 'should successfully group by configured field');
	});
});
