import { render, fireEvent, screen } from '@testing-library/preact';
import { createTestCatalogItems } from '../fixtures/catalogItems';
import { catalogSchema } from '../fixtures/catalogSchema';
import { defaultSettings } from '../fixtures/defaultSettings';

describe('PublicationDashboard', () => {
	it('renders without errors with valid props', () => {
		const items = createTestCatalogItems();
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={defaultSettings}
			/>
		);
		expect(screen.getByText(/Publication:/)).toBeTruthy();
		expect(screen.getByText(/Total works:/)).toBeTruthy();
	});

	it('filters items by publication name (array field)', () => {
		const items = createTestCatalogItems();
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={defaultSettings}
			/>
		);
		// Only Call of Cthulhu should match
		expect(screen.getByText('The Call of Cthulhu')).toBeTruthy();
		expect(screen.queryByText('Fear')).toBeNull();
	});

	it('handles empty publication (no matches)', () => {
		const items = createTestCatalogItems();
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Nonexistent Publication"
				settings={defaultSettings}
			/>
		);
		expect(screen.getByText(/Total works: 0/)).toBeTruthy();
	});

	it('groups items by status as configured', () => {
		const items = createTestCatalogItems();
		const settings = {
		...defaultSettings,
		dashboards: {
			...defaultSettings.dashboards,
			publicationDashboard: {
			...defaultSettings.dashboards.publicationDashboard,
			groupByField: 'catalog-status',
			},
		},
		};
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={settings}
			/>
		);
		expect(screen.getByText(/Grouped by catalog-status/)).toBeTruthy();
		expect(screen.getByText(/raw/)).toBeTruthy();
	});

	it('groups items by year as configured', () => {
		const items = createTestCatalogItems();
		const settings = {
		...defaultSettings,
		dashboards: {
			...defaultSettings.dashboards,
			publicationDashboard: {
			...defaultSettings.dashboards.publicationDashboard,
			groupByField: 'year',
			},
		},
		};
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={settings}
			/>
		);
		expect(screen.getByText(/Grouped by year/)).toBeTruthy();
		expect(screen.getByText(/1928/)).toBeTruthy();
	});

	it('calculates statistics accurately', () => {
		const items = createTestCatalogItems();
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={defaultSettings}
			/>
		);
		expect(screen.getByText(/Total works: 1/)).toBeTruthy();
		expect(screen.getByText(/Total words: 12000/)).toBeTruthy();
		expect(screen.getByText(/Average words: 12000/)).toBeTruthy();
		expect(screen.getByText(/Year range: 1928 - 1928/)).toBeTruthy();
	});

	it('renders correct columns from config', () => {
		const items = createTestCatalogItems();
		const settings = {
		...defaultSettings,
		dashboards: {
			...defaultSettings.dashboards,
			publicationDashboard: {
			...defaultSettings.dashboards.publicationDashboard,
			displayColumns: ['title', 'authors', 'year'],
			},
		},
		};
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={settings}
			/>
		);
		expect(screen.getByText('Title')).toBeTruthy();
		expect(screen.getByText('Authors')).toBeTruthy();
		expect(screen.getByText('Year')).toBeTruthy();
	});

	it('handles missing/invalid config gracefully', () => {
		const items = createTestCatalogItems();
		const settings = { ...defaultSettings, dashboards: {} };
		expect(() => {
		render(
			<PublicationDashboard
			items={items}
			schema={catalogSchema}
			publicationField="publications"
			publicationName="Weird Tales Vol 11 No 2 February 1928"
			settings={settings}
			/>
		);
		}).not.toThrow();
	});

	it('renders table layout on desktop', () => {
		const items = createTestCatalogItems();
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={defaultSettings}
			/>
		);
		expect(screen.getByRole('table')).toBeTruthy();
		expect(screen.getByText('The Call of Cthulhu')).toBeTruthy();
	});

	it('renders card layout on mobile (simulated)', () => {
		// Simulate mobile by setting window.innerWidth
		const items = createTestCatalogItems();
		const originalWidth = window.innerWidth;
		window.innerWidth = 500;
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={defaultSettings}
			/>
		);
		// For now, table is always rendered, but this test is a placeholder for future mobile logic
		expect(screen.getByRole('table')).toBeTruthy();
		window.innerWidth = originalWidth;
	});

	it('supports onWorkClick handler', () => {
		const items = createTestCatalogItems();
		const handleClick = jest.fn();
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={defaultSettings}
				onWorkClick={handleClick}
			/>
		);
		fireEvent.click(screen.getByText('The Call of Cthulhu'));
		expect(handleClick).toHaveBeenCalledWith('lovecraft-call-of-cthulhu');
	});

	it('handles items with missing fields', () => {
		const items = createTestCatalogItems();
		// Remove a field from the item
		items[0].setField('year', undefined);
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={defaultSettings}
			/>
		);
		expect(screen.getByText('-')).toBeTruthy();
	});

	it('handles large data sets efficiently', () => {
		const items = [];
		for (let i = 0; i < 120; i++) {
		const item = createTestCatalogItems()[0];
		item.id = `item-${i}`;
		items.push(item);
		}
		render(
			<PublicationDashboard
				items={items}
				schema={catalogSchema}
				publicationField="publications"
				publicationName="Weird Tales Vol 11 No 2 February 1928"
				settings={defaultSettings}
			/>
		);
		expect(screen.getAllByText('The Call of Cthulhu').length).toBe(120);
		expect(screen.getByText(/Total works: 120/)).toBeTruthy();
	});
});
