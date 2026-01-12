/**
 * Sample catalog item data for Storybook fixtures.
 * 
 * NOTE: These are plain objects, not CatalogItem instances.
 * Components expect CatalogItem[], so story authors should use buildCatalogItemFromData()
 * to convert these objects into proper CatalogItem instances.
 * 
 * Usage in stories:
 * ```typescript
 * import { buildCatalogItemFromData } from '../../src/types/dynamicWork';
 * import { sampleWorks, sampleSchema } from '../fixtures';
 * 
 * const items = Object.entries(sampleWorks).map(([id, data]) =>
 *   buildCatalogItemFromData(id, `pulp-fiction/works/${id}.md`, data, sampleSchema)
 * );
 * ```
 */

/**
 * Sample catalog item data for Storybook fixtures.
 * Represents typical fiction stories with mixed fields and status values.
 */
export const sampleWorks: Record<string, Record<string, unknown>> = {
	"the-call-of-cthulhu": {
		title: "The Call of Cthulhu",
		authors: ["Lovecraft, Howard Phillips"],
		"year-published": 1928,
		"word-count": 7500,
		"catalog-status": "published",
		publication: "Weird Tales",
		genres: ["horror", "cosmic-horror", "fiction"],
	},
	"the-shadow-over-innsmouth": {
		title: "The Shadow over Innsmouth",
		authors: ["Lovecraft, Howard Phillips"],
		"year-published": 1942,
		"word-count": 35000,
		"catalog-status": "published",
		publication: "Weird Tales",
		genres: ["horror", "cosmic-horror", "mystery"],
	},
	"the-dunwich-horror": {
		title: "The Dunwich Horror",
		authors: ["Lovecraft, Howard Phillips"],
		"year-published": 1929,
		"word-count": 15000,
		"catalog-status": "published",
		publication: "Weird Tales",
		genres: ["horror", "cosmic-horror"],
	},
	"the-house-on-the-borderland": {
		title: "The House on the Borderland",
		authors: ["Hodgson, William Hope"],
		"year-published": 1908,
		"word-count": 62000,
		"catalog-status": "published",
		publication: "Magazine Unknown",
		genres: ["horror", "fantasy", "science-fiction"],
	},
	"the-great-god-pan": {
		title: "The Great God Pan",
		authors: ["Machen, Arthur"],
		"year-published": 1894,
		"word-count": 31000,
		"catalog-status": "published",
		publication: "Bentley's Magazine",
		genres: ["horror", "occult", "mystery"],
	},
	"the-monk": {
		title: "The Monk",
		authors: ["Lewis, Matthew Gregory"],
		"year-published": 1796,
		"word-count": 95000,
		"catalog-status": "published",
		publication: "Original Publication",
		genres: ["gothic", "horror", "fiction"],
	},
	"vathek": {
		title: "Vathek",
		authors: ["Beckford, William"],
		"year-published": 1786,
		"word-count": 21000,
		"catalog-status": "published",
		publication: "Original Publication",
		genres: ["gothic", "horror", "fantasy"],
	},
	"an-occurence-at-owl-creek-bridge": {
		title: "An Occurrence at Owl Creek Bridge",
		authors: ["Bierce, Ambrose"],
		"year-published": 1890,
		"word-count": 3000,
		"catalog-status": "published",
		publication: "Tales of Soldiers and Civilians",
		genres: ["horror", "suspense", "fiction"],
	},
	"the-tell-tale-heart": {
		title: "The Tell-Tale Heart",
		authors: ["Poe, Edgar Allen"],
		"year-published": 1843,
		"word-count": 2500,
		"catalog-status": "draft",
		publication: "The Pioneer",
		genres: ["horror", "psychological", "fiction"],
	},
	"the-fall-of-the-house-of-usher": {
		title: "The Fall of the House of Usher",
		authors: ["Poe, Edgar Allen"],
		"year-published": 1839,
		"word-count": 7500,
		"catalog-status": "published",
		publication: "Burton's Gentleman's Magazine",
		genres: ["horror", "gothic", "fiction"],
	},
	"ligeia": {
		title: "Ligeia",
		authors: ["Poe, Edgar Allen"],
		"year-published": 1838,
		"word-count": 5000,
		"catalog-status": "review",
		publication: "American Museum of Literature",
		genres: ["horror", "supernatural", "fiction"],
	},
	"the-cask-of-amontillado": {
		title: "The Cask of Amontillado",
		authors: ["Poe, Edgar Allen"],
		"year-published": 1846,
		"word-count": 3500,
		"catalog-status": "published",
		publication: "Godey's Lady's Book",
		genres: ["horror", "revenge", "fiction"],
	},
	"the-murders-in-the-rue-morgue": {
		title: "The Murders in the Rue Morgue",
		authors: ["Poe, Edgar Allen"],
		"year-published": 1841,
		"word-count": 12000,
		"catalog-status": "published",
		publication: "Graham's Magazine",
		genres: ["mystery", "detective", "fiction"],
	},
	"the-raven": {
		title: "The Raven",
		authors: ["Poe, Edgar Allen"],
		"year-published": 1845,
		"word-count": 1000,
		"catalog-status": "published",
		publication: "American Review",
		genres: ["horror", "poetry", "supernatural"],
	},
	"carmilla": {
		title: "Carmilla",
		authors: ["Le Fanu, Sheridan"],
		"year-published": 1872,
		"word-count": 24000,
		"catalog-status": "published",
		publication: "The Dark Blue",
		genres: ["horror", "vampire", "gothic"],
	},
};

/**
 * Get a subset of sample works (first N items).
 * Useful for testing with a specific number of items.
 *
 * @param count - Number of items to return
 * @returns - Array of sample work data objects
 */
export function getSampleWorksArray(count: number = 15): Record<string, unknown>[] {
	const items = Object.values(sampleWorks);
	return items.slice(0, Math.min(count, items.length));
}

/**
 * Generate a large dataset for performance testing.
 * Creates duplicates with varied IDs to reach target count.
 *
 * @param count - Total number of items to generate (default: 150)
 * @returns - Array of sample work data objects
 */
export function generateLargeDataset(count: number = 150): Record<string, unknown>[] {
	const baseItems = Object.values(sampleWorks);
	const result: Record<string, unknown>[] = [];
	
	for (let i = 0; i < count; i++) {
		const baseItem = baseItems[i % baseItems.length];
		result.push({
			...baseItem,
			title: `${baseItem.title} (Copy ${Math.floor(i / baseItems.length) + 1})`,
		});
	}
	
	return result;
}
