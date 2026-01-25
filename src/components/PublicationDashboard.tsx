/**
 * PublicationDashboard Component
 * Displays works for a specific publication with grouping and statistics.
 * Pure Preact component with no Obsidian dependencies
 * 
 * Configuration-driven via settings.dashboards.publicationDashboard:
 * - enabled: boolean, whether to show this component
 * - foreignKeyField: field that references publications (e.g., 'publications')
 * - displayColumns: array of field keys to display in table
 * 
 * Respects active library schema:
 * - Uses field labels from schema for column headers
 * - Validates fields exist before rendering
 * - Adapts display based on field configuration
 */

import { h, type VNode } from 'preact';
import { useMemo, useState, useEffect } from 'preact/hooks';
import {
	CatalogItem,
	PublicationDashboardProps,
	GroupStatistics,
	YearRange
} from '../types';

interface GroupWithStats {
	group: string;
	stats: GroupStatistics;
}

interface PublicationStats {
	total: number;
	totalWordCount: number;
	averageWordCount: number;
	yearRange: YearRange | null;
}

function filterByPublication(
	items: CatalogItem[],
	foreignKeyField: string,
	publicationName: string
): CatalogItem[] {
	return items.filter(item => {
		const value = item.getField(foreignKeyField);
		if (Array.isArray(value)) {
			return value.includes(publicationName);
		}
		return value === publicationName;
	});
}

function groupBy(items: CatalogItem[], groupField: string): Record<string, CatalogItem[]> {
	const groups: Record<string, CatalogItem[]> = {};
	for (const item of items) {
		const key = String(item.getField(groupField) ?? 'Unknown');
		if (!groups[key]) groups[key] = [];
		groups[key].push(item);
	}
	return groups;
}

function getStats(
	items: CatalogItem[],
	wordCountField: string,
	yearField: string
): PublicationStats {
	const total = items.length;
	const wordCounts = items.map(i => i.getField<number>(wordCountField) ?? 0);
	const years = items
		.map(i => i.getField<number>(yearField))
		.filter(y => typeof y === 'number') as number[];
	const totalWordCount = wordCounts.reduce((a, b) => a + b, 0);
	const averageWordCount = total ? Math.round(totalWordCount / total) : 0;
	const yearRange = years.length ? { min: Math.min(...years), max: Math.max(...years) } as YearRange : null;
	return { total, totalWordCount, averageWordCount, yearRange };
}

function getGroupStats(
	groupItems: CatalogItem[],
	wordCountField: string,
	yearField: string
): GroupStatistics {
	const count = groupItems.length;
	const wordCounts = groupItems.map(i => i.getField<number>(wordCountField) ?? 0);
	const totalWordCount = wordCounts.reduce((a, b) => a + b, 0);
	const averageWordCount = count ? Math.round(totalWordCount / count) : 0;
	const years = groupItems
		.map(i => i.getField<number>(yearField))
		.filter(y => typeof y === 'number') as number[];
	const yearRange = {
		min: years.length ? Math.min(...years) : null,
		max: years.length ? Math.max(...years) : null
	};
	return { count, totalWordCount, averageWordCount, yearRange };
}

export function PublicationDashboard(props: PublicationDashboardProps) {
	const { items, schema, publicationName, settings, onWorkClick } = props;
	const [isMobile, setIsMobile] = useState(
		typeof window !== 'undefined' && window.innerWidth < 600
	);

	// Track viewport changes for responsive layout
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 600);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Get dashboard config from settings with sensible defaults
	const config = settings.dashboards?.publicationDashboard ?? {
		enabled: true,
		foreignKeyField: 'publications',
		displayColumns: []
	};
	
	// Respect enabled flag from dashboard configuration
	if (config.enabled === false) {
		return null;
	}

	// Get foreignKeyField from config
	const foreignKeyField = config.foreignKeyField || 'publications';

	// Validate foreignKeyField exists in schema
	const foreignKeyFieldDef = schema.fields.find(f => f.key === foreignKeyField);
	if (!foreignKeyFieldDef) {
		return h(
			'div',
			{ class: 'dc-publication-dashboard dc-publication-dashboard--error' },
			h('p', null, `Error: Foreign key field "${foreignKeyField}" not found in schema`)
		);
	}

	// Determine columns to display from config
	const columns = config.displayColumns?.length
		? config.displayColumns
		: schema.fields.filter(f => f.visible).map(f => f.key);

	// Filter items by publication using foreignKeyField
	const filtered = useMemo(
		() => filterByPublication(items, foreignKeyField, publicationName),
		[items, foreignKeyField, publicationName]
	);

	// Determine grouping field (default to statusField from schema)
	const groupField = schema.coreFields?.statusField || 'catalog-status';

	// Group filtered items
	const groups = useMemo(() => groupBy(filtered, groupField), [filtered, groupField]);

	// Calculate field keys for stats
	const wordCountField = 
		schema.fields.find(f => f.label.toLowerCase().includes('word'))?.key || 
		'word-count';
	const yearField =
		schema.fields.find(f => f.label.toLowerCase().includes('year'))?.key || 
		'year-published';

	// Calculate overall stats
	const stats = useMemo(
		() => getStats(filtered, wordCountField, yearField),
		[filtered, wordCountField, yearField]
	);

	// Calculate group stats
	const groupStats = useMemo(() => {
		return Object.entries(groups).map(([groupName, groupItems]): GroupWithStats => ({
			group: groupName,
			stats: getGroupStats(groupItems, wordCountField, yearField)
		}));
	}, [groups, wordCountField, yearField]);

	// Handle work click
	const handleWorkClick = (workId: string) => {
		if (onWorkClick) {
			onWorkClick(workId);
		}
	};

	// Render empty state
	if (filtered.length === 0) {
		return h(
			'div',
			{ class: 'dc-publication-dashboard dc-publication-dashboard--empty' },
			h('h2', { class: 'dc-publication-dashboard__title' }, `Publication: ${publicationName}`),
			h('p', null, 'No works found for this publication')
		);
	}

	// Render stats bar
	const statsBar = h(
		'div',
		{ class: 'dc-publication-stats' },
		h('span', null, `Total works: ${stats.total}`),
		h('span', null, `Total words: ${stats.totalWordCount.toLocaleString()}`),
		h('span', null, `Average words: ${stats.averageWordCount.toLocaleString()}`),
		stats.yearRange && h('span', null, `Year range: ${stats.yearRange.min}–${stats.yearRange.max}`)
	);

	// Render table header
	const tableHeaderCells = columns.map(col => {
		const field = schema.fields.find(f => f.key === col);
		return h('th', { key: col, class: 'dc-table__header-cell' }, field?.label ?? col);
	});

	const tableHeader = h('thead', null, h('tr', null, ...tableHeaderCells));

	// Render table rows
	const tableRows = filtered.map(item => {
		const rowCells = columns.map(col => {
			const value = item.getField(col);
			const displayValue = Array.isArray(value) ? value.join(', ') : (value ?? '-');
			return h('td', { key: col, class: 'dc-table__cell' }, String(displayValue));
		});

		return h(
			'tr',
			{
				key: item.id,
				class: 'dc-table__row',
				onClick: () => handleWorkClick(item.id),
				style: 'cursor: pointer;'
			},
			...rowCells
		);
	});

	const table = h(
		'table',
		{ class: 'dc-table' },
		tableHeader,
		h('tbody', null, ...tableRows)
	);

	// Render mobile cards
	const renderMobileCards = (): VNode => {
		const cards = filtered.map(item => {
			const cardRows = columns.map(col => {
				const field = schema.fields.find(f => f.key === col);
				const value = item.getField(col);
				const displayValue = Array.isArray(value) ? value.join(', ') : (value ?? '-');

				return h(
					'div',
					{ key: col, class: 'dc-card__row' },
					h('span', { class: 'dc-card__label' }, `${field?.label ?? col}:`),
					h('span', { class: 'dc-card__value' }, String(displayValue))
				);
			});

			return h(
				'div',
				{
					key: item.id,
					class: 'dc-card',
					onClick: () => handleWorkClick(item.id),
					style: 'cursor: pointer;'
				},
				...cardRows
			);
		});

		return h('div', { class: 'dc-cards' }, ...cards);
	};

	// Render group summary
	const groupFieldDef = schema.fields.find(f => f.key === groupField);
	const groupSummaryItems = groupStats.map(gs => {
		return h(
			'div',
			{ key: gs.group, class: 'dc-group' },
			h('strong', null, gs.group),
			`: ${gs.stats.count} works`
		);
	});

	const groupSummary = h(
		'div',
		{ class: 'dc-publication-groups' },
		h('h3', null, `Grouped by ${groupFieldDef?.label ?? groupField}`),
		...groupSummaryItems
	);

	// Render content conditionally based on viewport
	const content = isMobile ? renderMobileCards() : table;

	return h(
		'div',
		{ class: 'dc-publication-dashboard' },
		h('h2', { class: 'dc-publication-dashboard__title' }, `Publication: ${publicationName}`),
		statsBar,
		content,
		groupSummary
	);
}