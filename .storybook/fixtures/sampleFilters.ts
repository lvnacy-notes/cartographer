import type { FilterDefinition } from "../../src/types";

/**
 * Sample filter configurations for Storybook fixtures.
 * Represents typical filters for a fiction library.
 */
export const sampleFilters: FilterDefinition[] = [
	{
		field: "catalog-status",
		label: "Status",
		type: "select",
		enabled: true,
		options: ["draft", "review", "published", "archived"],
	},
	{
		field: "year-published",
		label: "Year Published",
		type: "range",
		enabled: true,
	},
	{
		field: "genres",
		label: "Genres",
		type: "checkbox",
		enabled: true,
		options: ["horror", "gothic", "mystery", "cosmic-horror", "supernatural", "fantasy", "poetry"],
	},
	{
		field: "authors",
		label: "Search by Author",
		type: "text",
		enabled: true,
	},
	{
		field: "title",
		label: "Search by Title",
		type: "text",
		enabled: true,
	},
];

/**
 * Active filter values for testing FilterBar component.
 * Represents filters that have been applied by the user.
 */
export const sampleActiveFilters: Record<string, unknown> = {
	"catalog-status": "published",
	"genres": ["horror", "cosmic-horror"],
	"year-published": {
		min: 1800,
		max: 1950,
	},
	"title": "",
};
