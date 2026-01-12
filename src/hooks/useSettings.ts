/**
 * useSettings Hooks
 * Provides reactive access to settings, active library, and library list
 * 
 * Three helper functions to manage global settings listeners:
 * - initializeGlobalSettings(settings) - initialize the global settings store
 * - registerSettingsListener(listener) - register a listener for settings changes
 * - updateGlobalSettings(settings) - update global settings and notify listeners
 *
 * Three hooks for different use cases:
 * - useActiveLibrary() - get the current active library configuration
 * - useLibraryList() - get list of all configured libraries
 * - useLibrarySettings() - get the complete settings object
 *
 * All hooks respect library switching and trigger re-renders on settings changes.
 *
 * @example
 * const { activeLibrary } = useActiveLibrary();
 * const libraries = useLibraryList();
 * const { dashboards, ui } = useLibrarySettings();
 */

import { useMemo } from 'preact/hooks';
import {
	DatacoreSettings,
	Library
} from '../types';

/**
 * Global settings store (will be injected by plugin context)
 * This is a workaround for Preact's lack of built-in context API in hooks
 */
let globalSettings: DatacoreSettings | null = null;
let settingsListeners: (() => void)[] = [];

/**
 * Initialize global settings
 * (Internal use only - called by plugin during onload)
 */
export function initializeGlobalSettings(settings: DatacoreSettings): void {
	globalSettings = settings;
}

/**
 * Register a settings listener to be notified of changes
 * (Internal use only - called by plugin during initialization)
 */
export function registerSettingsListener(listener: () => void): () => void {
	settingsListeners.push(listener);
	return () => {
		settingsListeners = settingsListeners.filter((l) => l !== listener);
	};
}

/**
 * Update global settings and notify all listeners
 * (Internal use only - called by SettingsManager when settings change)
 */
export function updateGlobalSettings(settings: DatacoreSettings): void {
	globalSettings = settings;
	settingsListeners.forEach((listener) => listener());
}

/**
 * useActiveLibrary Hook
 * Returns the currently active library configuration
 *
 * Re-renders when:
 * - Active library changes
 * - Active library ID is set to null (no library selected)
 * - Active library properties are updated
 *
 * Respects library switching—when activeLibraryId changes,
 * the hook returns the new active library configuration.
 *
 * @returns Object containing:
 *   - activeLibrary: Library object for the active library, or null if none selected
 *   - activeLibraryId: ID of the active library (string) or null if none selected
 *   - isLoading: Whether settings are still loading
 *
 * @example
 * const { activeLibrary, activeLibraryId } = useActiveLibrary();
 * if (!activeLibrary) return <p>No library selected</p>;
 * return <p>Browsing: {activeLibrary.name} (path: {activeLibrary.path})</p>;
 */
export function useActiveLibrary() {
	const { settings, isLoading } = useLibrarySettings();

	const activeLibrary = useMemo<Library | null>(() => {
		if (!settings?.activeLibraryId) {
			return null;
		}

		const library = settings.libraries.find(
			(lib) => lib.id === settings.activeLibraryId
		);
		return library ?? null;
	}, [settings]);

	const activeLibraryId = useMemo(() => {
		if (!settings) {
			return null;
		}
		return settings.activeLibraryId;
	}, [settings]);

	return {
		activeLibrary,
		activeLibraryId,
		isLoading,
	};
}

/**
 * useLibraryList Hook
 * Returns the list of all configured libraries
 *
 * Re-renders when:
 * - A new library is created
 * - A library is deleted
 * - Library properties are updated (name, path, schema)
 *
 * The returned array is immutable; use SettingsManager methods
 * to create, update, or delete libraries.
 *
 * Respects library switching—this hook provides the full list
 * regardless of which library is currently active.
 *
 * @returns Object containing:
 *   - libraries: Array of all configured Library objects (immutable)
 *   - libraryCount: Number of configured libraries
 *   - isLoading: Whether settings are still loading
 *   - hasLibraries: Convenience boolean (true if libraryCount > 0)
 *
 * @example
 * const { libraries, hasLibraries } = useLibraryList();
 * if (!hasLibraries) return <p>No libraries configured</p>;
 * return (
 *   <ul>
 *     {libraries.map((lib) => (
 *       <li key={lib.id}>{lib.name}</li>
 *     ))}
 *   </ul>
 * );
 */
export function useLibraryList() {
	const { settings, isLoading } = useLibrarySettings();

	const libraries = useMemo<Library[]>(() => {
		if (!settings) {
			return [];
		}
		return [...settings.libraries];
	}, [settings]);

	const libraryCount = useMemo(() => libraries.length, [libraries]);

	const hasLibraries = useMemo(() => libraryCount > 0, [libraryCount]);

	return {
		libraries,
		libraryCount,
		isLoading,
		hasLibraries,
	};
}

/**
 * useLibrarySettings Hook
 * Returns the complete settings object for the active library
 *
 * Re-renders when:
 * - Active library changes
 * - Dashboard configurations change
 * - UI preferences change
 * - Schema is updated
 *
 * @returns Object containing:
 *   - settings: Complete DatacoreSettings object (schema, dashboards, ui, libraries, activeLibraryId)
 *   - isLoading: Whether settings are still loading (always false for hook access, true initially)
 *
 * @throws Error if settings are not initialized (should not happen in normal operation)
 *
 * @example
 * const { settings, isLoading } = useLibrarySettings();
 * if (isLoading) return <p>Loading...</p>;
 * return <p>Active library: {settings.activeLibraryId}</p>;
 */
export function useLibrarySettings() {
	const settings = useMemo<DatacoreSettings | null>(() => {
		if (!globalSettings) {
			return null;
		}
		return globalSettings;
	}, [globalSettings]);

	const isLoading = useMemo(() => {
		return settings === null;
	}, [settings]);

	if (!settings) {
		return {
			settings: {
				libraries: [],
				activeLibraryId: null,
				schema: {
					catalogName: 'Default',
					fields: [],
					coreFields: { titleField: 'title' },
				},
				dashboards: {
					statusDashboard: {
						enabled: false,
						groupByField: '',
						showTotalStats: false,
						showWordCounts: false,
					},
					worksTable: {
						enabled: true,
						defaultColumns: ['title'],
						enablePagination: true,
					},
					filterBar: {
						enabled: false,
						layout: 'vertical' as const,
						filters: [],
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
			},
			isLoading: true,
		};
	}

	return {
		settings,
		isLoading,
	};
}