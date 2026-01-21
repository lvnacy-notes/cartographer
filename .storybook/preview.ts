import type { Preview } from '@storybook/preact';
import { decorators } from './decorators';

const preview: Preview = {
	decorators,
	parameters: {
		layout: 'centered',

		viewport: {
			defaultViewport: 'desktop',
			viewports: {
				mobile: {
					name: 'Mobile',
					styles: {
						width: '375px',
						height: '667px',
					},
				},
				tablet: {
					name: 'Tablet',
					styles: {
						width: '768px',
						height: '1024px',
					},
				},
				desktop: {
					name: 'Desktop',
					styles: {
						width: '1440px',
						height: '900px',
					},
				},
			},
		},

		backgrounds: {
			default: 'light',
			values: [
				{
					name: 'light',
					value: '#ffffff',
				},
				{
					name: 'dark',
					value: '#1e1e1e',
				},
			],
		},

		docs: {
			theme: undefined,
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: 'todo',
		},
	},
};

export default preview;
