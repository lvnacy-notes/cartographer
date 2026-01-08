import type { CatalogItem } from '../../src/types';

/**
 * Test catalog items based on real Pulp Fiction works.
 * 31 items with all field types populated.
 * Used for integration testing with realistic data.
 */
export function createTestCatalogItems(): CatalogItem[] {
	const items: CatalogItem[] = [];

	// 1. Call of Cthulhu
	const item1 = new (require('../../src/types').CatalogItem)('lovecraft-call-of-cthulhu', 'works/Call of Cthulhu.md');
	item1.setField('title', 'The Call of Cthulhu');
	item1.setField('category', 'novelette');
	item1.setField('authors', [['Lovecraft, Howard Phillips']]);
	item1.setField('year', 1928);
	item1.setField('volume', 11);
	item1.setField('word-count', 12000);
	item1.setField('date-cataloged', '2026-01-01');
	item1.setField('date-reviewed', null);
	item1.setField('bp-candidate', true);
	item1.setField('bp-approved', false);
	item1.setField('catalog-status', 'raw');
	item1.setField('keywords', ['cosmic-horror', 'lovecraftian', 'cult']);
	item1.setField('tags', ['library', 'pulp-fiction', 'story']);
	item1.setField('publications', [['Weird Tales Vol 11 No 2 February 1928']]);
	item1.setField('content-metadata', { setting: 'Providence', creature: 'Cthulhu' });
	items.push(item1);

	// 2. Fear
	const item2 = new (require('../../src/types').CatalogItem)('solomon-fear', 'works/Fear.md');
	item2.setField('title', 'Fear');
	item2.setField('category', 'short story');
	item2.setField('authors', [['Solomon, David R']]);
	item2.setField('year', 1923);
	item2.setField('volume', 1);
	item2.setField('word-count', 4500);
	item2.setField('date-cataloged', '2026-01-01');
	item2.setField('date-reviewed', '2026-01-02');
	item2.setField('bp-candidate', true);
	item2.setField('bp-approved', false);
	item2.setField('catalog-status', 'raw');
	item2.setField('keywords', ['psychological', 'human-interest']);
	item2.setField('tags', ['library', 'pulp-fiction', 'story']);
	item2.setField('publications', [['Weird Tales Vol 1 No 1 March 1923']]);
	item2.setField('content-metadata', { protagonist: 'lawyer', setting: 'swamp' });
	items.push(item2);

	// 3. The Haunter of the Dark
	const item3 = new (require('../../src/types').CatalogItem)('lovecraft-haunter-dark', 'works/The Haunter of the Dark.md');
	item3.setField('title', 'The Haunter of the Dark');
	item3.setField('category', 'short story');
	item3.setField('authors', [['Lovecraft, Howard Phillips']]);
	item3.setField('year', 1935);
	item3.setField('volume', 26);
	item3.setField('word-count', 8500);
	item3.setField('date-cataloged', '2026-01-01');
	item3.setField('date-reviewed', '2026-01-03');
	item3.setField('bp-candidate', true);
	item3.setField('bp-approved', true);
	item3.setField('catalog-status', 'approved');
	item3.setField('keywords', ['cosmic-horror', 'cursed-artifact']);
	item3.setField('tags', ['library', 'pulp-fiction', 'story']);
	item3.setField('publications', [['Weird Tales Vol 26 No 12 December 1935']]);
	item3.setField('content-metadata', { setting: 'Providence', artifact: 'mirror' });
	items.push(item3);

	// 4. Shadow over Innsmouth
	const item4 = new (require('../../src/types').CatalogItem)('lovecraft-shadow-innsmouth', 'works/Shadow over Innsmouth.md');
	item4.setField('title', 'The Shadow over Innsmouth');
	item4.setField('category', 'novelette');
	item4.setField('authors', [['Lovecraft, Howard Phillips']]);
	item4.setField('year', 1942);
	item4.setField('volume', 1);
	item4.setField('word-count', 15000);
	item4.setField('date-cataloged', '2026-01-01');
	item4.setField('date-reviewed', null);
	item4.setField('bp-candidate', false);
	item4.setField('bp-approved', false);
	item4.setField('catalog-status', 'raw');
	item4.setField('keywords', ['cosmic-horror', 'fish-people']);
	item4.setField('tags', ['library', 'pulp-fiction', 'story']);
	item4.setField('publications', [['Weird Tales']]);
	item4.setField('content-metadata', { setting: 'Innsmouth', creatures: 'Deep-Ones' });
	items.push(item4);

	// 5. The Great God Pan
	const item5 = new (require('../../src/types').CatalogItem)('machen-great-god-pan', 'works/The Great God Pan.md');
	item5.setField('title', 'The Great God Pan');
	item5.setField('category', 'novelette');
	item5.setField('authors', [['Machen, Arthur']]);
	item5.setField('year', 1894);
	item5.setField('volume', 0);
	item5.setField('word-count', 18000);
	item5.setField('date-cataloged', '2026-01-01');
	item5.setField('date-reviewed', '2026-01-02');
	item5.setField('bp-candidate', true);
	item5.setField('bp-approved', true);
	item5.setField('catalog-status', 'approved');
	item5.setField('keywords', ['psychological-horror', 'occult']);
	item5.setField('tags', ['library', 'pulp-fiction', 'story']);
	item5.setField('publications', [['Standalone']]);
	item5.setField('content-metadata', { setting: 'England', theme: 'forbidden-knowledge' });
	items.push(item5);

	// 6. The Shambler from the Stars
	const item6 = new (require('../../src/types').CatalogItem)('bloch-shambler-stars', 'works/The Shambler from the Stars.md');
	item6.setField('title', 'The Shambler from the Stars');
	item6.setField('category', 'short story');
	item6.setField('authors', [['Bloch, Robert']]);
	item6.setField('year', 1935);
	item6.setField('volume', 25);
	item6.setField('word-count', 6000);
	item6.setField('date-cataloged', '2026-01-01');
	item6.setField('date-reviewed', '2026-01-04');
	item6.setField('bp-candidate', true);
	item6.setField('bp-approved', false);
	item6.setField('catalog-status', 'reviewed');
	item6.setField('keywords', ['cosmic-horror', 'interdimensional']);
	item6.setField('tags', ['library', 'pulp-fiction', 'story']);
	item6.setField('publications', [['Weird Tales Vol 25 No 9']]);
	item6.setField('content-metadata', { creature: 'Shoggoth-like' });
	items.push(item6);

	// 7. The Testament of Carnamagos
	const item7 = new (require('../../src/types').CatalogItem)('smith-testament-carnamagos', 'works/The Testament of Carnamagos.md');
	item7.setField('title', 'The Testament of Carnamagos');
	item7.setField('category', 'short story');
	item7.setField('authors', [['Smith, Clark Ashton']]);
	item7.setField('year', 1925);
	item7.setField('volume', 5);
	item7.setField('word-count', 5500);
	item7.setField('date-cataloged', '2026-01-02');
	item7.setField('date-reviewed', null);
	item7.setField('bp-candidate', false);
	item7.setField('bp-approved', false);
	item7.setField('catalog-status', 'raw');
	item7.setField('keywords', ['occult', 'decadent']);
	item7.setField('tags', ['library', 'pulp-fiction', 'story']);
	item7.setField('publications', [['Weird Tales Vol 5 No 1']]);
	item7.setField('content-metadata', { setting: 'Hyperborea', magic: 'sorcery' });
	items.push(item7);

	// 8. The Thing in the Darkness
	const item8 = new (require('../../src/types').CatalogItem)('quinn-thing-darkness', 'works/The Thing in the Darkness.md');
	item8.setField('title', 'The Thing in the Darkness');
	item8.setField('category', 'short story');
	item8.setField('authors', [['Quinn, Seabury']]);
	item8.setField('year', 1924);
	item8.setField('volume', 3);
	item8.setField('word-count', 7200);
	item8.setField('date-cataloged', '2026-01-02');
	item8.setField('date-reviewed', '2026-01-05');
	item8.setField('bp-candidate', true);
	item8.setField('bp-approved', false);
	item8.setField('catalog-status', 'reviewed');
	item8.setField('keywords', ['cosmic-horror', 'mystery']);
	item8.setField('tags', ['library', 'pulp-fiction', 'story']);
	item8.setField('publications', [['Weird Tales Vol 3 No 5']]);
	item8.setField('content-metadata', { creature: 'unknown' });
	items.push(item8);

	// 9. The Fall of the House of Usher
	const item9 = new (require('../../src/types').CatalogItem)('poe-fall-house-usher', 'works/The Fall of the House of Usher.md');
	item9.setField('title', 'The Fall of the House of Usher');
	item9.setField('category', 'novelette');
	item9.setField('authors', [['Poe, Edgar Allen']]);
	item9.setField('year', 1839);
	item9.setField('volume', 0);
	item9.setField('word-count', 8000);
	item9.setField('date-cataloged', '2026-01-02');
	item9.setField('date-reviewed', '2026-01-06');
	item9.setField('bp-candidate', true);
	item9.setField('bp-approved', true);
	item9.setField('catalog-status', 'approved');
	item9.setField('keywords', ['gothic', 'family-curse']);
	item9.setField('tags', ['library', 'pulp-fiction', 'story']);
	item9.setField('publications', [['Burton\'s Gentleman\'s Magazine']]);
	item9.setField('content-metadata', { setting: 'mansion', theme: 'decay' });
	items.push(item9);

	// 10. The Port of Ever-Night
	const item10 = new (require('../../src/types').CatalogItem)('kline-port-ever-night', 'works/The Port of Ever-Night.md');
	item10.setField('title', 'The Port of Ever-Night');
	item10.setField('category', 'short story');
	item10.setField('authors', [['Kline, Otis Adelbert']]);
	item10.setField('year', 1925);
	item10.setField('volume', 6);
	item10.setField('word-count', 6800);
	item10.setField('date-cataloged', '2026-01-03');
	item10.setField('date-reviewed', null);
	item10.setField('bp-candidate', false);
	item10.setField('bp-approved', false);
	item10.setField('catalog-status', 'raw');
	item10.setField('keywords', ['dark-fantasy', 'otherworldly']);
	item10.setField('tags', ['library', 'pulp-fiction', 'story']);
	item10.setField('publications', [['Weird Tales Vol 6 No 7']]);
	item10.setField('content-metadata', { setting: 'otherworldly-port' });
	items.push(item10);

	// 11-31: Additional items to reach 31 total
	const additionalItems = [
		{ id: 'odonnell-phantom', title: 'The Phantom of the Gilded Chamber', author: 'O\'Donnell, Elliot', year: 1926, vol: 7, wc: 5900, status: 'reviewed' },
		{ id: 'talman-shadow-moor', title: 'Shadow on the Moor', author: 'Talman, Wilfred Blanch', year: 1932, vol: 19, wc: 4800, status: 'raw' },
		{ id: 'lovecraft-mountains', title: 'At the Mountains of Madness', author: 'Lovecraft, Howard Phillips', year: 1936, vol: 27, wc: 22000, status: 'reviewed' },
		{ id: 'burks-black-god', title: 'The Black God', author: 'Burks, Arthur J', year: 1927, vol: 9, wc: 6300, status: 'raw' },
		{ id: 'lovecraft-color', title: 'The Color out of Space', author: 'Lovecraft, Howard Phillips', year: 1927, vol: 9, wc: 12500, status: 'approved' },
		{ id: 'smith-master-underworld', title: 'Master of the Underworld', author: 'Smith, Clark Ashton', year: 1931, vol: 18, wc: 7100, status: 'raw' },
		{ id: 'quinn-vampire', title: 'The Vampire Lord', author: 'Quinn, Seabury', year: 1929, vol: 14, wc: 8900, status: 'reviewed' },
		{ id: 'hawkins-doll', title: 'The Doll', author: 'Hawkins, Willard E', year: 1925, vol: 5, wc: 4200, status: 'raw' },
		{ id: 'lovecraft-dunwich', title: 'The Dunwich Horror', author: 'Lovecraft, Howard Phillips', year: 1929, vol: 13, wc: 16000, status: 'approved' },
		{ id: 'bloch-haunted-lib', title: 'The Haunted Library', author: 'Bloch, Robert', year: 1934, vol: 23, wc: 5600, status: 'raw' },
		{ id: 'machen-imposters', title: 'The Three Imposters', author: 'Machen, Arthur', year: 1895, vol: 0, wc: 18500, status: 'approved' },
		{ id: 'lovecraft-silver-key', title: 'The Silver Key', author: 'Lovecraft, Howard Phillips', year: 1926, vol: 7, wc: 9200, status: 'raw' },
		{ id: 'kline-isle-morgana', title: 'Isle of the Fairy Morgana', author: 'Kline, Otis Adelbert', year: 1928, vol: 11, wc: 7800, status: 'reviewed' },
		{ id: 'talman-trail', title: 'Trail of the Cloven Hoof', author: 'Talman, Wilfred Blanch', year: 1933, vol: 21, wc: 6500, status: 'raw' },
		{ id: 'bloch-weird-shadows', title: 'Weird Shadows', author: 'Bloch, Robert', year: 1930, vol: 15, wc: 5800, status: 'reviewed' },
		{ id: 'lovecraft-charles-ward', title: 'The Case of Charles Dexter Ward', author: 'Lovecraft, Howard Phillips', year: 1927, vol: 9, wc: 20000, status: 'raw' },
		{ id: 'quinn-thousand-shapes', title: 'Thing of a Thousand Shapes', author: 'Quinn, Seabury', year: 1927, vol: 9, wc: 8100, status: 'reviewed' },
		{ id: 'lovecraft-rats-walls', title: 'The Rats in the Walls', author: 'Lovecraft, Howard Phillips', year: 1924, vol: 3, wc: 7500, status: 'approved' },
		{ id: 'faus-weaving-shadows', title: 'Weaving Shadows', author: 'Faus, Joseph', year: 1928, vol: 11, wc: 6400, status: 'raw' },
		{ id: 'darlington-midnight', title: 'The Midnight Service', author: 'D\'Orsay, Laurence R', year: 1926, vol: 8, wc: 5200, status: 'reviewed' },
		{ id: 'leahy-phantom-valley', title: 'Phantom Valley', author: 'Leahy, John Martin', year: 1923, vol: 1, wc: 7600, status: 'approved' }
	];

	let itemIndex = 11;
	for (const data of additionalItems) {
		const item = new (require('../../src/types').CatalogItem)(data.id, `works/${data.title}.md`);
		item.setField('title', data.title);
		item.setField('category', data.wc > 12000 ? 'novelette' : 'short story');
		item.setField('authors', [[data.author]]);
		item.setField('year', data.year);
		item.setField('volume', data.vol);
		item.setField('word-count', data.wc);
		item.setField('date-cataloged', `2026-01-${String(Math.floor(itemIndex / 3) + 1).padStart(2, '0')}`);
		item.setField('date-reviewed', data.status === 'raw' ? null : `2026-01-${String(itemIndex + 3).padStart(2, '0')}`);
		item.setField('bp-candidate', Math.random() > 0.4);
		item.setField('bp-approved', data.status === 'approved');
		item.setField('catalog-status', data.status);
		item.setField('keywords', ['pulp-fiction', data.status]);
		item.setField('tags', ['library', 'pulp-fiction', 'story']);
		item.setField('publications', [['Weird Tales']]);
		item.setField('content-metadata', { year_created: data.year });
		items.push(item);
		itemIndex++;
	}

	return items;
}

export const catalogItems = createTestCatalogItems();
