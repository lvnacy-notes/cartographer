/**
 * StatusDashboard Component
 * Aggregate view showing item counts grouped by status field
 * Pure Preact component with no Obsidian dependencies
 *
 * Configuration-driven via settings.dashboards.statusDashboard:
 * - enabled: boolean, whether to show this component
 * - groupByField: which field to group by (usually 'catalog-status')
 * - sortBy: 'alphabetical' | 'count-desc' | 'count-asc'
 * - displayStats: array of stat keys to display ('count', 'percentage', 'yearRange', 'averageWords')
 * - showAggregateStatistics: boolean, show footer total row
 * - wordCountField: field key for word count calculations (default: 'word-count')
 * - yearField: field key for year calculations (default: 'year')
 *
 * Respects active library schema:
 * - Uses field label from schema instead of hardcoded text
 * - Validates statusField exists in schema before rendering
 * - Adapts display based on field visibility and type configuration
 */

import { h, type VNode } from 'preact';
import {
	useEffect,
	useState
} from 'preact/hooks';
import {
	StatusDashboardProps
} from '../types';
import { useStatusData } from '../hooks/useStatusData';
import { formatNumber } from '../utils/fieldFormatters';

/**
 * StatusDashboard Component
 * Groups items by status field and displays counts with configurable statistics
 * Supports responsive layout (desktop table, mobile cards)
 * Respects active library schema and dashboard configuration
 *
 * @param props - Component props
 * @returns Rendered dashboard component or null if disabled/invalid
 *
 * @example
 * h(StatusDashboard, {
 *   items: catalogItems,
 *   schema: schema,
 *   settings: settings,
 *   statusField: 'catalog-status',
 *   onStatusClick: (status) => console.log('Clicked:', status)
 * })
 */
export function StatusDashboard(props: StatusDashboardProps) {
	const { items, schema, settings, statusField, onStatusClick } = props;
	const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 600);

	// Track viewport changes for responsive layout
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 600);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Get dashboard config from settings with sensible defaults
	const dashboardConfig = settings.dashboards?.statusDashboard ?? {};
	
	// Respect enabled flag from dashboard configuration
	if (dashboardConfig.enabled === false) {
		return null;
	}

	// Validate statusField exists in schema
	const statusFieldDef = schema.fields.find((f) => f.key === statusField);
	if (!statusFieldDef) {
		return h(
			'div',
			{ class: 'cartographer-status-dashboard cartographer-status-dashboard--error' },
			h('p', null, `Error: Status field "${statusField}" not found in schema`)
		);
	}

	const displayStats = dashboardConfig.displayStats ?? ['count', 'percentage'];
	const showAggregateStatistics = dashboardConfig.showAggregateStatistics ?? true;

	// Use hook for status data
	const { statusGroups, AggregateStatistics } = useStatusData(
		items,
		schema,
		settings,
		statusField
	);

	// Handle status click
	const handleStatusClick = (statusValue: string | number | boolean | null) => {
		if (onStatusClick && typeof statusValue === 'string') {
			onStatusClick(statusValue);
		}
	};

	// Render empty state
	if (items.length === 0) {
		return h(
			'div',
			{ class: 'cartographer-status-dashboard cartographer-status-dashboard--empty' },
			h('p', null, 'No items to display')
		);
	}

	// Render table header
	const headerCells = [
		h('th', { class: 'cartographer-status-dashboard__header-cell' }, statusFieldDef.label)
	];

	if (displayStats.includes('count')) {
		headerCells.push(h('th', { class: 'cartographer-status-dashboard__header-cell cartographer-status-dashboard__header-cell--numeric' }, 'Count'));
	}

	if (displayStats.includes('percentage')) {
		headerCells.push(h('th', { class: 'cartographer-status-dashboard__header-cell cartographer-status-dashboard__header-cell--numeric' }, '%'));
	}

	if (displayStats.includes('yearRange')) {
		headerCells.push(h('th', { class: 'cartographer-status-dashboard__header-cell' }, 'Year Range'));
	}

	if (displayStats.includes('averageWords')) {
		headerCells.push(h('th', { class: 'cartographer-status-dashboard__header-cell cartographer-status-dashboard__header-cell--numeric' }, 'Avg Words'));
	}

	const tableHeader = h('thead', null, h('tr', null, ...headerCells));

	// Render status rows
	const statusRows = statusGroups.map((group) => {
		const percentage = AggregateStatistics ? Math.round((group.stats.count / AggregateStatistics.totalCount) * 100) : 0;
		const yearRangeStr = group.stats.yearRange.min !== null && group.stats.yearRange.max !== null
			? `${group.stats.yearRange.min}–${group.stats.yearRange.max}`
			: '-';

		const cells: Array<ReturnType<typeof h>> = [
			h(
				'td',
				{
					class: 'cartographer-status-dashboard__cell',
					onClick: () => handleStatusClick(group.statusValue),
					style: 'cursor: pointer;'
				},
				group.displayLabel
			)
		];

		if (displayStats.includes('count')) {
			cells.push(
				h('td', { class: 'cartographer-status-dashboard__cell cartographer-status-dashboard__cell--numeric' }, String(group.stats.count))
			);
		}

		if (displayStats.includes('percentage')) {
			cells.push(
				h('td', { class: 'cartographer-status-dashboard__cell cartographer-status-dashboard__cell--numeric' }, `${percentage}%`)
			);
		}

		if (displayStats.includes('yearRange')) {
			cells.push(
				h('td', { class: 'cartographer-status-dashboard__cell' }, yearRangeStr)
			);
		}

		if (displayStats.includes('averageWords')) {
			const avgStr = group.stats.averageWordCount > 0 ? formatNumber(Math.round(group.stats.averageWordCount)) : '-';
			cells.push(
				h('td', { class: 'cartographer-status-dashboard__cell cartographer-status-dashboard__cell--numeric' }, avgStr)
			);
		}

		return h('tr', { key: `status-${String(group.statusValue)}`, class: 'cartographer-status-dashboard__row' }, ...cells);
	});

	// Render table footer with totals (if enabled)
	let tableFooter = null;
	if (showAggregateStatistics && AggregateStatistics) {
		const footerCells = [
			h('th', { class: 'cartographer-status-dashboard__footer-cell' }, 'TOTAL')
		];

		if (displayStats.includes('count')) {
			footerCells.push(
				h('td', { class: 'cartographer-status-dashboard__footer-cell cartographer-status-dashboard__footer-cell--numeric' }, String(AggregateStatistics.totalCount))
			);
		}

		if (displayStats.includes('percentage')) {
			footerCells.push(
				h('td', { class: 'cartographer-status-dashboard__footer-cell cartographer-status-dashboard__footer-cell--numeric' }, '100%')
			);
		}

		if (displayStats.includes('yearRange')) {
			const yearStr = AggregateStatistics.yearRange.min !== null && AggregateStatistics.yearRange.max !== null
				? `${AggregateStatistics.yearRange.min}–${AggregateStatistics.yearRange.max}`
				: '-';
			footerCells.push(
				h('td', { class: 'cartographer-status-dashboard__footer-cell' }, yearStr)
			);
		}

		if (displayStats.includes('averageWords')) {
			const avgStr = AggregateStatistics.averageWords > 0 ? formatNumber(AggregateStatistics.averageWords) : '-';
			footerCells.push(
				h('td', { class: 'cartographer-status-dashboard__footer-cell cartographer-status-dashboard__footer-cell--numeric' }, avgStr)
			);
		}

		tableFooter = h('tfoot', null, h('tr', { class: 'cartographer-status-dashboard__total-row' }, ...footerCells));
	}

	// Render main table
	const table = h(
		'table',
		{ class: 'cartographer-status-dashboard__table' },
		tableHeader,
		h('tbody', null, ...statusRows),
		tableFooter
	);

	// Mobile card layout rendering
	const renderMobileCards = (): VNode => {
		const cards: VNode[] = statusGroups.map((group) => {
			const percentage = AggregateStatistics ? Math.round((group.stats.count / AggregateStatistics.totalCount) * 100) : 0;
			const yearRangeStr = group.stats.yearRange.min !== null && group.stats.yearRange.max !== null
				? `${group.stats.yearRange.min}–${group.stats.yearRange.max}`
				: '-';

			const cardContent: VNode[] = [
				h('div', { class: 'cartographer-status-dashboard__card-header' }, group.displayLabel)
			];

			if (displayStats.includes('count')) {
				cardContent.push(
					h('div', { class: 'cartographer-status-dashboard__card-row' },
						h('span', { class: 'cartographer-status-dashboard__card-label' }, 'Count:'),
						h('span', { class: 'cartographer-status-dashboard__card-value' }, String(group.stats.count))
					)
				);
			}

			if (displayStats.includes('percentage')) {
				cardContent.push(
					h('div', { class: 'cartographer-status-dashboard__card-row' },
						h('span', { class: 'cartographer-status-dashboard__card-label' }, 'Percentage:'),
						h('span', { class: 'cartographer-status-dashboard__card-value' }, `${percentage}%`)
					)
				);
			}

			if (displayStats.includes('yearRange')) {
				cardContent.push(
					h('div', { class: 'cartographer-status-dashboard__card-row' },
						h('span', { class: 'cartographer-status-dashboard__card-label' }, 'Year range:'),
						h('span', { class: 'cartographer-status-dashboard__card-value' }, yearRangeStr)
					)
				);
			}

			if (displayStats.includes('averageWords')) {
				const avgStr = group.stats.averageWordCount > 0 ? formatNumber(Math.round(group.stats.averageWordCount)) : '-';
				cardContent.push(
					h('div', { class: 'cartographer-status-dashboard__card-row' },
						h('span', { class: 'cartographer-status-dashboard__card-label' }, 'Avg words:'),
						h('span', { class: 'cartographer-status-dashboard__card-value' }, avgStr)
					)
				);
			}

			return h(
				'div',
				{
					key: `status-card-${String(group.statusValue)}`,
					class: 'cartographer-status-dashboard__card',
					onClick: () => handleStatusClick(group.statusValue),
					style: 'cursor: pointer;'
				},
				...cardContent
			);
		});

		// Add total card if enabled
		if (showAggregateStatistics && AggregateStatistics) {
			const totalCardContent: VNode[] = [
				h('div', { class: 'cartographer-status-dashboard__card-header cartographer-status-dashboard__card-header--total' }, '📈 Total')
			];

			if (displayStats.includes('count')) {
				totalCardContent.push(
					h('div', { class: 'cartographer-status-dashboard__card-row' },
						h('span', { class: 'cartographer-status-dashboard__card-label' }, 'Items:'),
						h('span', { class: 'cartographer-status-dashboard__card-value' }, String(AggregateStatistics.totalCount))
					)
				);
			}

			if (displayStats.includes('yearRange')) {
				const yearStr = AggregateStatistics.yearRange.min !== null && AggregateStatistics.yearRange.max !== null
					? `${AggregateStatistics.yearRange.min}–${AggregateStatistics.yearRange.max}`
					: '-';
				totalCardContent.push(
					h('div', { class: 'cartographer-status-dashboard__card-row' },
						h('span', { class: 'cartographer-status-dashboard__card-label' }, 'Year range:'),
						h('span', { class: 'cartographer-status-dashboard__card-value' }, yearStr)
					)
				);
			}

			if (displayStats.includes('averageWords')) {
				const avgStr = AggregateStatistics.averageWords > 0 ? formatNumber(AggregateStatistics.averageWords) : '-';
				totalCardContent.push(
					h('div', { class: 'cartographer-status-dashboard__card-row' },
						h('span', { class: 'cartographer-status-dashboard__card-label' }, 'Avg words:'),
						h('span', { class: 'cartographer-status-dashboard__card-value' }, avgStr)
					)
				);
			}

			cards.push(
				h(
					'div',
					{ key: 'status-card-total', class: 'cartographer-status-dashboard__card cartographer-status-dashboard__card--total' },
					totalCardContent
				)
			);
		}

		return h(
			'div',
			{ class: 'cartographer-status-dashboard__cards' },
			...cards
		);
	};

	// Render conditionally based on viewport size
	const content = isMobile ? renderMobileCards() : table;

	return h(
		'div',
		{ class: 'cartographer-status-dashboard' },
		h('h3', { class: 'cartographer-status-dashboard__title' }, `${statusFieldDef.label} Overview`),
		content
	);
}
