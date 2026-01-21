import type { StorybookConfig } from '@storybook/preact-vite';

const config: StorybookConfig = {
	framework: '@storybook/preact-vite',
	stories: ['../src/**/*.stories.ts'],
	addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
};

export default config;