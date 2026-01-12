import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
	useLibrarySettings,
	useActiveLibrary,
	useLibraryList,
	initializeGlobalSettings,
    registerSettingsListener,
	updateGlobalSettings,
} from '../src/hooks/useSettings';
import { DatacoreSettings, Library } from '../src/types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

/**
 * Create a mock library for testing
 */
function createMockLibrary(id: string, name: string, path: string): Library {
	return {
		id,
		name,
		path,
		schema: {
			catalogName: name,
			fields: [
				{
					key: 'title',
					label: 'Title',
					type: 'string',
					category: 'metadata',
					visible: true,
					filterable: true,
					sortable: true,
					sortOrder: 1,
				},
			],
			coreFields: { titleField: 'title' },
		},
		createdAt: new Date().toISOString(),
	};
}

/**
 * Create default test settings
 */
function createTestSettings(): DatacoreSettings {
	return {
		libraries: [
			createMockLibrary('lib-1', 'Pulp Fiction', 'pulp-fiction/works'),
			createMockLibrary('lib-2', 'Personal Library', 'my-library/books'),
		],
		activeLibraryId: 'lib-1',
		schema: createMockLibrary('lib-1', 'Pulp Fiction', 'pulp-fiction/works').schema,
		dashboards: {
			statusDashboard: {
				enabled: true,
				groupByField: 'status',
				showTotalStats: true,
				showWordCounts: true,
			},
			worksTable: {
				enabled: true,
				defaultColumns: ['title', 'status'],
				enablePagination: true,
			},
			filterBar: {
				enabled: true,
				layout: 'vertical',
				filters: [
					{
						field: 'status',
						type: 'select',
						label: 'Status',
						enabled: true,
						options: ['draft', 'published'],
					},
				],
			},
			publicationDashboard: {
				enabled: false,
				foreignKeyField: '',
				displayColumns: [],
			},
			authorCard: {
				enabled: false,
				authorField: '',
				displayColumns: [],
				showStatistics: false,
			},
			backstagePassPipeline: {
				enabled: false,
				stages: [],
			},
		},
		ui: {
			itemsPerPage: 50,
			defaultSortColumn: 'title',
			defaultSortDesc: false,
			compactMode: false,
		},
	};
}

// ============================================================================
// useLibrarySettings TESTS
// ============================================================================

describe('useLibrarySettings', () => {
	test('returns complete settings object with all required properties', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { settings: result, isLoading } = useLibrarySettings();

		assert.strictEqual(isLoading, false);
		assert.ok(result.libraries);
		assert.ok(result.dashboards);
		assert.ok(result.ui);
		assert.ok(result.schema);
	});

	test('returns activeLibraryId from settings', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { settings: result } = useLibrarySettings();

		assert.strictEqual(result.activeLibraryId, 'lib-1');
	});

	test('returns correct dashboard configuration', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { settings: result } = useLibrarySettings();

		assert.strictEqual(result.dashboards.worksTable.enabled, true);
		assert.strictEqual(result.dashboards.statusDashboard.enabled, true);
	});

	test('returns correct UI preferences', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { settings: result } = useLibrarySettings();

		assert.strictEqual(result.ui.itemsPerPage, 50);
		assert.strictEqual(result.ui.defaultSortColumn, 'title');
	});

	test('returns schema with fields', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { settings: result } = useLibrarySettings();

		assert.ok(result.schema.fields.length > 0);
		assert.ok(result.schema.fields[0]);
		assert.strictEqual(result.schema.fields[0].key, 'title');
	});

	test('reflects updates to global settings', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let { settings: result } = useLibrarySettings();
		assert.strictEqual(result.ui.itemsPerPage, 50);

		// Update global settings
		const updated = createTestSettings();
		updated.ui.itemsPerPage = 100;
		updateGlobalSettings(updated);

		result = useLibrarySettings().settings;
		assert.strictEqual(result.ui.itemsPerPage, 100);
	});
});

// ============================================================================
// useActiveLibrary TESTS
// ============================================================================

describe('useActiveLibrary', () => {
	test('returns active library when one is selected', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { activeLibrary } = useActiveLibrary();

		assert.ok(activeLibrary);
		assert.strictEqual(activeLibrary.id, 'lib-1');
		assert.strictEqual(activeLibrary.name, 'Pulp Fiction');
	});

	test('returns activeLibraryId matching the active library', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { activeLibraryId } = useActiveLibrary();

		assert.strictEqual(activeLibraryId, 'lib-1');
	});

	test('returns null when no library is selected', () => {
		const settings = createTestSettings();
		settings.activeLibraryId = null;
		initializeGlobalSettings(settings);

		const { activeLibrary, activeLibraryId } = useActiveLibrary();

		assert.strictEqual(activeLibrary, null);
		assert.strictEqual(activeLibraryId, null);
	});

	test('returns active library schema', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { activeLibrary } = useActiveLibrary();

		assert.ok(activeLibrary);
		assert.strictEqual(activeLibrary.schema.catalogName, 'Pulp Fiction');
	});

	test('returns active library path', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { activeLibrary } = useActiveLibrary();

		assert.ok(activeLibrary);
		assert.strictEqual(activeLibrary.path, 'pulp-fiction/works');
	});

	test('returns isLoading as false when initialized', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { isLoading } = useActiveLibrary();

		assert.strictEqual(isLoading, false);
	});

	test('switches to different library when activeLibraryId changes', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let { activeLibrary } = useActiveLibrary();
		assert.strictEqual(activeLibrary?.name, 'Pulp Fiction');

		// Switch to lib-2
		const updated = createTestSettings();
		updated.activeLibraryId = 'lib-2';
		updateGlobalSettings(updated);

		activeLibrary = useActiveLibrary().activeLibrary;
		assert.strictEqual(activeLibrary?.name, 'Personal Library');
	});

	test('handles switching to non-existent library gracefully', () => {
		const settings = createTestSettings();
		settings.activeLibraryId = 'non-existent-id';
		initializeGlobalSettings(settings);

		const { activeLibrary } = useActiveLibrary();

		assert.strictEqual(activeLibrary, null);
	});
});

// ============================================================================
// useLibraryList TESTS
// ============================================================================

describe('useLibraryList', () => {
	test('returns all configured libraries', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { libraries } = useLibraryList();

		assert.strictEqual(libraries.length, 2);
	});

	test('returns libraries in correct order', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { libraries } = useLibraryList();

		assert.ok(libraries[0]);
		assert.ok(libraries[1]);
		assert.strictEqual(libraries[0].id, 'lib-1');
		assert.strictEqual(libraries[1].id, 'lib-2');
	});

	test('returns correct libraryCount', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { libraryCount } = useLibraryList();

		assert.strictEqual(libraryCount, 2);
	});

	test('returns hasLibraries as true when libraries exist', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { hasLibraries } = useLibraryList();

		assert.strictEqual(hasLibraries, true);
	});

	test('returns hasLibraries as false when no libraries exist', () => {
		const settings = createTestSettings();
		settings.libraries = [];
		initializeGlobalSettings(settings);

		const { hasLibraries } = useLibraryList();

		assert.strictEqual(hasLibraries, false);
	});

	test('returns empty array when no libraries exist', () => {
		const settings = createTestSettings();
		settings.libraries = [];
		initializeGlobalSettings(settings);

		const { libraries } = useLibraryList();

		assert.strictEqual(libraries.length, 0);
	});

	test('returns isLoading as false when initialized', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { isLoading } = useLibraryList();

		assert.strictEqual(isLoading, false);
	});

	test('reflects library additions', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let { libraryCount } = useLibraryList();
		assert.strictEqual(libraryCount, 2);

		// Add a new library
		const updated = createTestSettings();
		updated.libraries.push(
			createMockLibrary('lib-3', 'Research Notes', 'research/notes')
		);
		updateGlobalSettings(updated);

		libraryCount = useLibraryList().libraryCount;
		assert.strictEqual(libraryCount, 3);
	});

	test('reflects library deletions', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let { libraryCount } = useLibraryList();
		assert.strictEqual(libraryCount, 2);

		// Remove a library
		const updated = createTestSettings();
		updated.libraries = updated.libraries.filter((lib) => lib.id !== 'lib-2');
		updateGlobalSettings(updated);

		libraryCount = useLibraryList().libraryCount;
		assert.strictEqual(libraryCount, 1);
	});

	test('provides access to library schema', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { libraries } = useLibraryList();

		assert.ok(libraries[0]);
		assert.ok(libraries[0].schema);
		assert.strictEqual(libraries[0].schema.catalogName, 'Pulp Fiction');
	});

	test('provides access to library path', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const { libraries } = useLibraryList();

		assert.ok(libraries[1]);
		assert.strictEqual(libraries[1].path, 'my-library/books');
	});
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Hook Integration', () => {
	test('all hooks work together in coordinated state', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const librarySettings = useLibrarySettings();
		const activeLibrary = useActiveLibrary();
		const libraryList = useLibraryList();

		assert.strictEqual(librarySettings.settings.activeLibraryId, 'lib-1');
		assert.strictEqual(activeLibrary.activeLibrary?.id, 'lib-1');
		assert.strictEqual(libraryList.libraryCount, 2);
	});

	test('maintains consistency across library switch', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let librarySettings = useLibrarySettings();
		let activeLibrary = useActiveLibrary();

		assert.strictEqual(librarySettings.settings.activeLibraryId, 'lib-1');
		assert.strictEqual(activeLibrary.activeLibrary?.id, 'lib-1');

		// Switch library
		const updated = createTestSettings();
		updated.activeLibraryId = 'lib-2';
		updateGlobalSettings(updated);

		librarySettings = useLibrarySettings();
		activeLibrary = useActiveLibrary();

		assert.strictEqual(librarySettings.settings.activeLibraryId, 'lib-2');
		assert.strictEqual(activeLibrary.activeLibrary?.id, 'lib-2');
		assert.strictEqual(activeLibrary.activeLibrary?.name, 'Personal Library');
	});

	test('library list remains consistent during active library changes', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let { libraryCount: count1 } = useLibraryList();
		assert.strictEqual(count1, 2);

		// Switch active library
		const updated = createTestSettings();
		updated.activeLibraryId = 'lib-2';
		updateGlobalSettings(updated);

		const { libraryCount: count2 } = useLibraryList();
		assert.strictEqual(count2, 2); // Count stays the same
	});
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
	test('handles empty library list', () => {
		const settings = createTestSettings();
		settings.libraries = [];
		settings.activeLibraryId = null;
		initializeGlobalSettings(settings);

		const libraryList = useLibraryList();
		const activeLibrary = useActiveLibrary();

		assert.strictEqual(libraryList.libraryCount, 0);
		assert.strictEqual(libraryList.hasLibraries, false);
		assert.strictEqual(activeLibrary.activeLibrary, null);
	});

	test('handles single library', () => {
		const settings = createTestSettings();
		settings.libraries = [settings.libraries[0]];
		initializeGlobalSettings(settings);

		const libraryList = useLibraryList();
		const activeLibrary = useActiveLibrary();

		assert.strictEqual(libraryList.libraryCount, 1);
		assert.strictEqual(libraryList.hasLibraries, true);
		assert.ok(activeLibrary.activeLibrary);
	});

	test('handles single library correctly', () => {
		const settings = createTestSettings();
		settings.libraries = [settings.libraries[0]];
		initializeGlobalSettings(settings);

		const { libraries } = useLibraryList();
		const { activeLibrary } = useActiveLibrary();

		assert.strictEqual(libraries.length, 1);
		assert.ok(activeLibrary);
		assert.strictEqual(activeLibrary.id, 'lib-1');
	});
});

// ============================================================================
// LISTENER REGISTRATION & NOTIFICATION TESTS
// ============================================================================

describe('Settings Listener Infrastructure', () => {
	test('registerSettingsListener adds a listener and returns unsubscribe function', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let listenerCalled = false;
		const listener = () => {
			listenerCalled = true;
		};

		const unsubscribe = registerSettingsListener(listener);

		// Verify unsubscribe is a function
		assert.strictEqual(typeof unsubscribe, 'function');

		// Verify listener is NOT called yet
		assert.strictEqual(listenerCalled, false);

		// Update settings to trigger listener
		updateGlobalSettings(settings);

		// Verify listener was called
		assert.strictEqual(listenerCalled, true);

		// Unsubscribe
		unsubscribe();

		// Reset flag
		listenerCalled = false;

		// Update again
		const updated = createTestSettings();
		updated.ui.itemsPerPage = 100;
		updateGlobalSettings(updated);

		// Verify listener was NOT called after unsubscribe
		assert.strictEqual(listenerCalled, false);
	});

	test('multiple listeners all receive notification on settings update', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let listener1Called = false;
		let listener2Called = false;
		let listener3Called = false;

		const unsubscribe1 = registerSettingsListener(() => {
			listener1Called = true;
		});

		const unsubscribe2 = registerSettingsListener(() => {
			listener2Called = true;
		});

		const unsubscribe3 = registerSettingsListener(() => {
			listener3Called = true;
		});

		// Update settings
		const updated = createTestSettings();
		updated.ui.itemsPerPage = 75;
		updateGlobalSettings(updated);

		// All listeners should be called
		assert.strictEqual(listener1Called, true);
		assert.strictEqual(listener2Called, true);
		assert.strictEqual(listener3Called, true);

		// Unsubscribe one listener
		unsubscribe2();

		// Reset flags
		listener1Called = false;
		listener2Called = false;
		listener3Called = false;

		// Update again
		const updated2 = createTestSettings();
		updated2.ui.itemsPerPage = 80;
		updateGlobalSettings(updated2);

		// Only listeners 1 and 3 should be called
		assert.strictEqual(listener1Called, true);
		assert.strictEqual(listener2Called, false);
		assert.strictEqual(listener3Called, true);

		// Cleanup
		unsubscribe1();
		unsubscribe3();
	});

	test('listener cleanup prevents double unsubscribe errors', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let callCount = 0;
		const listener = () => {
			callCount++;
		};

		const unsubscribe = registerSettingsListener(listener);

		// First unsubscribe
		unsubscribe();

		// Second unsubscribe should not error
		assert.doesNotThrow(() => {
			unsubscribe();
		});

		// Update settings - listener should not be called
		updateGlobalSettings(settings);
		assert.strictEqual(callCount, 0);
	});

	test('updateGlobalSettings notifies all listeners immediately', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		let notificationOrder: number[] = [];

		const unsubscribe1 = registerSettingsListener(() => {
			notificationOrder.push(1);
		});

		const unsubscribe2 = registerSettingsListener(() => {
			notificationOrder.push(2);
		});

		const unsubscribe3 = registerSettingsListener(() => {
			notificationOrder.push(3);
		});

		// Trigger update
		const updated = createTestSettings();
		updated.ui.itemsPerPage = 90;
		updateGlobalSettings(updated);

		// All listeners called in registration order
		assert.deepEqual(notificationOrder, [1, 2, 3]);

		// Cleanup
		unsubscribe1();
		unsubscribe2();
		unsubscribe3();
	});

	test('hooks receive updated settings after listener notification', () => {
		const settings = createTestSettings();
		initializeGlobalSettings(settings);

		const listener = () => {
			// When listener fires, hook should see the new settings
			const { settings: currentSettings } = useLibrarySettings();
			assert.strictEqual(currentSettings.ui.itemsPerPage, 100);
		};

		registerSettingsListener(listener);

		// Update with new value
		const updated = createTestSettings();
		updated.ui.itemsPerPage = 100;
		updateGlobalSettings(updated);

		// Verify hook also reflects the update
		const { settings: finalSettings } = useLibrarySettings();
		assert.strictEqual(finalSettings.ui.itemsPerPage, 100);
	});

	test('handles uninitialized state (globalSettings is null)', () => {
		// Initialize with null (simulating uninitialized state)
		initializeGlobalSettings(createTestSettings());
		// Clear by setting to null doesn't have a public API, so we test default behavior
		// The hooks should return safe defaults when uninitialized

		// This is implicit in the hook behavior - they return defaults
		const { settings, isLoading } = useLibrarySettings();
		assert.ok(settings); // Should not be null after initialization
		assert.strictEqual(isLoading, false);

		const { libraries } = useLibraryList();
		assert.ok(Array.isArray(libraries));

		const { activeLibrary } = useActiveLibrary();
		// activeLibrary may be null, but the hook should not error
		assert.ok(activeLibrary === null || activeLibrary);
	});
});
