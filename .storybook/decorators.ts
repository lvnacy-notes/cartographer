import {
    h,
    type ComponentType
} from 'preact';
import {
    sampleLibrary,
    sampleSettings
} from './fixtures';
import type { DecoratorFunction } from '@storybook/preact';

/**
 * Storybook Global Decorators
 * 
 * Provides context and providers to wrap all component stories.
 * Ensures stories render within the expected data and configuration environment.
 * 
 * Decorators included:
 * - LibraryContextDecorator - provides active library configuration
 * - SampleDataDecorator - ensures consistent sample data across stories
 * - ThemeDecorator - applies consistent theme/styling context
 */

/**
 * LibraryContextDecorator
 * 
 * Simulates the Cartographer plugin environment by providing:
 * - Active library configuration (from sampleLibrary)
 * - Settings and dashboard configuration (from sampleSettings)
 * - Ensures components render as if library context is available
 * 
 * Used in: All stories by default (applied in preview.ts)
 * 
 * @example
 * // In story:
 * export const Default: Story = {
 *   args: { items: [...] }, // Library context provided automatically
 * };
 */
export const LibraryContextDecorator: DecoratorFunction<Record<string, unknown>> = (
	Story: ComponentType<unknown>,
) => {
	return h(
		'div',
		{
			class: 'cartographer-library-context',
			'data-library-id': sampleLibrary.id,
			'data-library-name': sampleLibrary.name,
		},
		h(Story, null),
	);
};

/**
 * SampleDataDecorator
 * 
 * Ensures consistent sample data fixtures are available to all stories.
 * Provides global access to fixture data through data attributes.
 * 
 * Makes fixtures queryable for integration testing:
 * - data-library-id: Active library ID
 * - data-schema-name: Catalog name from schema
 * - data-settings-active: Active library ID from settings
 * 
 * Used in: All stories by default (applied in preview.ts)
 */
export const SampleDataDecorator: DecoratorFunction<Record<string, unknown>> = (
	Story: ComponentType<unknown>,
) => {
	return h(
		'div',
		{
			class: 'cartographer-sample-data',
			'data-library-id': sampleLibrary.id,
			'data-schema-name': sampleSettings.schema.catalogName,
			'data-settings-active': sampleSettings.activeLibraryId,
		},
		h(Story, null),
	);
};

/**
 * ThemeDecorator
 * 
 * Applies consistent theme and styling context to stories.
 * Ensures components render with proper CSS variables and theme support.
 * 
 * Features:
 * - Light theme by default (dark theme available via viewport settings)
 * - CSS custom properties for theming
 * - Consistent spacing and typography
 * 
 * Used in: All stories by default (applied in preview.ts)
 */
export const ThemeDecorator: DecoratorFunction<Record<string, unknown>> = (
	Story: ComponentType<unknown>,
) => {
	return h(
		'div',
		{
			class: 'cartographer-theme-wrapper',
			style: {
				'--cartographer-primary': '#0969da',
				'--cartographer-success': '#1a7f37',
				'--cartographer-danger': '#d1242f',
				'--cartographer-warning': '#9e6a03',
				'--cartographer-muted': '#57606a',
				'--cartographer-spacing-xs': '0.25rem',
				'--cartographer-spacing-sm': '0.5rem',
				'--cartographer-spacing-md': '1rem',
				'--cartographer-spacing-lg': '1.5rem',
				'--cartographer-spacing-xl': '2rem',
				'padding': '2rem',
				'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
				'font-size': '14px',
				'line-height': '1.5',
				'color': '#24292f',
				'background-color': '#ffffff',
			} as Record<string, string>,
		},
		h(Story, null),
	);
};

/**
 * Export all decorators as array for easy application in preview.ts
 * 
 * @example
 * // In preview.ts:
 * export default {
 *   decorators: decorators,
 *   ...
 * };
 */
export const decorators = [
	LibraryContextDecorator,
	SampleDataDecorator,
	ThemeDecorator,
];
