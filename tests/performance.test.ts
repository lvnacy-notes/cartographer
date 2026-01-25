// tests/performance.test.ts

/**
 * Cartographer Performance Benchmarks
 *
 * This suite benchmarks key operations for scalability and responsiveness.
 * Synthetic data is used to simulate large catalogs and stress-test components.
 *
 * Update thresholds and scenarios as the project evolves.
 */

import {
	describe,
	it
} from 'node:test';
import assert from 'node:assert';
import { performance } from 'node:perf_hooks';
import { render } from '@testing-library/preact';
import { h } from 'preact';
import { WorksTable } from '../src/components/WorksTable';
import { FilterBar } from '../src/components/FilterBar';
import { buildCatalogItemFromData } from '../src/types/catalogItem';
import { sampleSchema, sampleSettings } from '../.storybook/fixtures';

// Helper to generate N mock catalog items
function buildLargeCatalog(n: number) {
	return Array.from({ length: n }, (_, i) =>
		buildCatalogItemFromData(
		{
			title: `Work ${i + 1}`,
			author: `Author ${i % 10}`,
			year: 1900 + (i % 120),
			status: ['Read', 'Unread', 'In Progress'][i % 3],
			tags: [`tag${i % 5}`],
		},
		`id-${i + 1}`,
		`pulp-fiction/works/id-${i + 1}.md`,
		sampleSchema
		)
	);
}

describe('Performance Benchmarks', () => {
	it('WorksTable renders 100 items in under 100ms', () => {
		const items = buildLargeCatalog(100);
		const start = performance.now();
		render(h(WorksTable, { items, schema: sampleSchema, settings: sampleSettings }));
		const end = performance.now();
		assert(end - start < 100, `Render time was ${end - start}ms, expected under 100ms`);
	});

	it('WorksTable renders 500 items in under 250ms', () => {
		const items = buildLargeCatalog(500);
		const start = performance.now();
		render(h(WorksTable, { items, schema: sampleSchema, settings: sampleSettings }));
		const end = performance.now();
		assert(end - start < 250, `Render time was ${end - start}ms, expected under 250ms`);
	});

		it('FilterBar renders with 10 items in under 50ms', () => {
			const items = buildLargeCatalog(10);
			const start = performance.now();
			render(h(FilterBar, {
				items,
				schema: sampleSchema,
				settings: sampleSettings,
				onFilter: () => {},
				filterLayout: 'vertical',
			}));
			const end = performance.now();
			assert(end - start < 50, `Render time was ${end - start}ms, expected under 50ms`);
		});

	it('Switching libraries updates WorksTable in under 150ms', () => {
		// Simulate switching by re-rendering with a new items array
		const itemsA = buildLargeCatalog(100);
		const itemsB = buildLargeCatalog(100,);
		const { rerender } = render(h(WorksTable, { items: itemsA, schema: sampleSchema, settings: sampleSettings }));
		const start = performance.now();
		rerender(h(WorksTable, { items: itemsB, schema: sampleSchema, settings: sampleSettings }));
		const end = performance.now();
		assert(end - start < 150, `Update time was ${end - start}ms, expected under 150ms`);
	});

	// Add more benchmarks as needed (sorting, filtering, edge cases)
});
