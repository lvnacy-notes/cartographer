import type { Preview } from "@storybook/preact";
import { decorators } from "./decorators";

const preview: Preview = {
	decorators,
	parameters: {
		layout: "centered",
		viewport: {
			defaultViewport: "desktop",
			viewports: {
				mobile: {
					name: "Mobile",
					styles: {
						width: "375px",
						height: "667px",
					},
				},
				tablet: {
					name: "Tablet",
					styles: {
						width: "768px",
						height: "1024px",
					},
				},
				desktop: {
					name: "Desktop",
					styles: {
						width: "1440px",
						height: "900px",
					},
				},
			},
		},
		backgrounds: {
			default: "light",
			values: [
				{
					name: "light",
					value: "#ffffff",
				},
				{
					name: "dark",
					value: "#1e1e1e",
				},
			],
		},
		docs: {
			theme: undefined,
		},
	},
};

export default preview;
