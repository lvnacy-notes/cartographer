// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://cartographer.lvnacy.xyz',
	base: '/',
	outDir: '../deploy',
	integrations: [
		starlight({
			logo: {
				src: './src/assets/cartographer-logo.png',
				alt: 'Cartographer Logo',
			},
			title: 'The Cartographer\'s Atlas',
			description: `How to Navigate Cartographer
				Comprehensive documentation for the Cartographer Obsidian plugin.`,
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/lvnacy-notes/cartographer',
				},
				{
					icon: 'blueSky',
					label: 'BlueSky',
					href: 'https://bsky.app/profile/code.lvnacy.xyz',
				}
			],
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Getting Started', link: '/getting-started' },
					]
				},
				{
					label: 'Guides',
					autogenerate: { directory: 'guides' },
				},
				{
					label: 'Developers',
					items: [
						{ label: 'Overview', link: '/developers/' },
						'developers/supreme-directive',
						'developers/implementation',
						'developers/jsdoc-spec',
						'developers/ci-cd-workflow',
					]
				},
				{
					label: 'Components',
					link: '/storybook',
				},
				{
					label: 'Reference',
					items: [
						{ label: 'API Overview', link: '/reference/' },
						{ 
							label: 'API Documentation',
							autogenerate: { directory: 'reference/api' }
						},
					]
				}
			]
		}),
	],
});