import type { StorybookConfig } from "@storybook/preact-vite";

const config: StorybookConfig = {
	framework: "@storybook/preact",
	stories: ["../src/**/*.stories.ts"],
	addons: ["@storybook/addon-essentials"],
};

export default config;
