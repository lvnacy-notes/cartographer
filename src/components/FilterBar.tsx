/**
 * FilterBar Component
 * Interactive filtering interface with multiple filter types (select, checkbox, range, text)
 * Pure Preact component with configuration-driven filter definitions
 *
 * Configuration-driven via settings.dashboards.filterBar:
 * - enabled: boolean, whether to show this component
 * - filters: FilterDefinition[], list of filters to display
 * - layout: 'vertical' | 'horizontal' | 'dropdown', layout mode
 *
 * Respects active library schema:
 * - Only allows filters on fields marked filterable:true in schema
 * - Uses field label from schema if filter label is missing
 * - Adapts to different library schemas dynamically
 */

import { h, type VNode } from 'preact';
import {
	useCallback,
	useMemo,
} from 'preact/hooks';
import { useFilters } from '../hooks/useFilters';
import {
	FilterBarProps,
	FilterDefinition,
	YearRange
} from '../types';

/**
 * FilterBar Component
 * Renders interactive filters and applies them to items in real-time
 * Supports select, checkbox, range, and text filter types
 * Respects active library schema and field filterability configuration
 *
 * @param props - Component props
 * @returns Rendered filter bar component or null if disabled
 *
 * @example
 * h(FilterBar, {
 *   items: catalogItems,
 *   schema: schema,
 *   settings: settings,
 *   onFilter: handleFilterChange,
 *   filterLayout: 'vertical'
 * })
 */
export function FilterBar(props: FilterBarProps) {
	const { items, schema, settings, onFilter, filterLayout } = props;

	// Get filter config from settings
	const filterConfig = settings.dashboards?.filterBar ?? {};
	
	// Respect enabled flag from filter configuration
	if (filterConfig.enabled === false) {
		return null;
	}

	// Filter definitions from config - only include those with filterable fields in schema
	const configFilters: FilterDefinition[] = filterConfig.filters ?? [];
	
	// Filter to only include filters for filterable fields in schema
	const filters = useMemo<FilterDefinition[]>(() => {
		return configFilters.map((filter) => {
			const fieldDef = schema.fields.find((f) => f.key === filter.field);
			// Skip filters for non-filterable fields
			if (!fieldDef?.filterable) {
				return null;
			}
			// Use schema field label if filter label is missing
			const label = filter.label || fieldDef.label;
			return { ...filter, label };
		}).filter((f): f is FilterDefinition => f !== null);
	}, [configFilters, schema.fields]);

	const layout = filterLayout ?? filterConfig.layout ?? 'vertical';

	// Use filter hook for state management
	const {
		filterState,
		handleFilterChange,
		handleClearFilters,
		fieldOptions,
		fieldRanges
	} = useFilters(
		items,
		settings,
		onFilter
	);

	// Render select filter
	const renderSelectFilter = useCallback(
		(filter: FilterDefinition): VNode => {
			const uniqueValues = fieldOptions[filter.field] ?? [];
			const currentValue = filterState[filter.field] ?? '';

			const options = [h('option', { key: 'all', value: '' }, 'All')];

			uniqueValues.forEach((value: unknown, idx: number) => {
				options.push(
					h('option', { key: idx, value: String(value) }, String(value))
				);
			});

			return h(
				'div',
				{ key: filter.field, class: 'filter-item filter-select' },
				h('label', null, filter.label),
				h(
					'select',
					{
						value: typeof currentValue === 'string' ? currentValue : '',
						onChange: (e: Event) => {
							const target = e.target as HTMLSelectElement;
							handleFilterChange(
								filter.field,
								target.value ? target.value : null
							);
						},
					},
					options
				)
			);
		},
		[fieldOptions, filterState, handleFilterChange]
	);

	// Render checkbox filter
	const renderCheckboxFilter = useCallback(
		(filter: FilterDefinition): VNode => {
			const uniqueValues = fieldOptions[filter.field] ?? [];
			const currentValues = (filterState[filter.field] as unknown[]) ?? [];

			const checkboxes = uniqueValues.map((value: unknown, idx: number) => {
				const isChecked = currentValues.includes(value);

				return h(
					'div',
					{ key: idx, class: 'checkbox-item' },
					h('input', {
						type: 'checkbox',
						checked: isChecked,
						onChange: (e: Event) => {
							const target = e.target as HTMLInputElement;
							const newValues = target.checked
								? [...currentValues, value]
								: currentValues.filter((v) => v !== value);
							handleFilterChange(filter.field, newValues);
						},
					}),
					h('label', null, String(value))
				);
			});

			return h(
				'div',
				{ key: filter.field, class: 'filter-item filter-checkbox' },
				h('label', null, filter.label),
				checkboxes
			);
		},
		[fieldOptions, filterState, handleFilterChange]
	);

	// Render range filter
	const renderRangeFilter = useCallback(
		(filter: FilterDefinition): VNode | null => {
			const range = fieldRanges[filter.field];

			if (!range) {
				return null;
			}

			const [min, max] = range;
			const currentRange = filterState[filter.field] as YearRange;
			const currentMin = currentRange?.min ?? min;
			const currentMax = currentRange?.max ?? max;

			return h(
				'div',
				{ key: filter.field, class: 'filter-item filter-range' },
				h('label', null, filter.label),
				h(
					'div',
					{ class: 'range-inputs' },
					h('input', {
						type: 'number',
						placeholder: String(min),
						min,
						max,
						value: currentMin,
						onChange: (e: Event) => {
							const target = e.target as HTMLInputElement;
							const newMin = parseInt(target.value, 10);
							handleFilterChange(filter.field, [newMin, currentMax]);
						},
					}),
					h('span', null, '—'),
					h('input', {
						type: 'number',
						placeholder: String(max),
						min,
						max,
						value: currentMax,
						onChange: (e: Event) => {
							const target = e.target as HTMLInputElement;
							const newMax = parseInt(target.value, 10);
							handleFilterChange(filter.field, [currentMin, newMax]);
						},
					})
				)
			);
		},
		[fieldRanges, filterState, handleFilterChange]
	);

	// Render text filter
	const renderTextFilter = useCallback(
		(filter: FilterDefinition): VNode => {
			const currentValue = (filterState[filter.field] as string) ?? '';

			return h(
				'div',
				{ key: filter.field, class: 'filter-item filter-text' },
				h('label', null, filter.label),
				h('input', {
					type: 'text',
					placeholder: 'Search...',
					value: currentValue,
					onChange: (e: Event) => {
						const target = e.target as HTMLInputElement;
						handleFilterChange(filter.field, target.value || null);
					},
				})
			);
		},
		[filterState, handleFilterChange]
	);

	// Render appropriate filter UI based on type
	const renderFilter = useCallback(
		(filter: FilterDefinition): VNode | null => {
			switch (filter.type) {
				case 'select':
					return renderSelectFilter(filter);
				case 'checkbox':
					return renderCheckboxFilter(filter);
				case 'range':
					return renderRangeFilter(filter);
				case 'text':
					return renderTextFilter(filter);
				default:
					return null;
			}
		},
		[renderSelectFilter, renderCheckboxFilter, renderRangeFilter, renderTextFilter]
	);

	// Get enabled filters
	const enabledFilters = useMemo(() => filters.filter((f) => f.enabled), [filters]);

	// Render filter items
	const filterItems = enabledFilters.map((filter: FilterDefinition) => renderFilter(filter));

	// Render clear button
	const clearButton = h(
		'button',
		{
			class: 'filter-clear',
			onClick: handleClearFilters,
		},
		'Clear filters'
	);

	return h(
		'div',
		{ class: `filter-bar filter-bar-${layout}` },
		h('div', { class: 'filter-items' }, filterItems),
		h('div', { class: 'filter-actions' }, clearButton)
	);
}
