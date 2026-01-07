import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
	extractFrontmatter,
	parseYAML,
	parseMarkdownFile
} from '../src/dataAccess/fileParser';

describe('File Parser Functions', () => {
	describe('extractFrontmatter', () => {
		test('should extract valid YAML frontmatter', () => {
			const content = '---\ntitle: My Note\nauthor: John\n---\n# Content';
			const result = extractFrontmatter(content);
			assert.strictEqual(result, 'title: My Note\nauthor: John');
		});

		test('should return null when no frontmatter present', () => {
			const content = '# No frontmatter\nJust content';
			const result = extractFrontmatter(content);
			assert.strictEqual(result, null);
		});

		test('should return null when only opening delimiter', () => {
			const content = '---\ntitle: Test\n# Missing closing delimiter';
			const result = extractFrontmatter(content);
			assert.strictEqual(result, null);
		});

		test('should handle empty frontmatter', () => {
			const content = '---\n---\n# Content';
			const result = extractFrontmatter(content);
			assert.strictEqual(result, '');
		});

		test('should extract multiline frontmatter with arrays', () => {
			const content = '---\ntitle: Story\ntags:\n  - fiction\n  - horror\n---\n# Content';
			const result = extractFrontmatter(content);
			assert.ok(result?.includes('title: Story'));
			assert.ok(result?.includes('tags:'));
		});

		test('should handle special characters in frontmatter', () => {
			const content = '---\ntitle: "A Tale of Wonder & Mystery"\nauthor: O\'Brien\n---\nContent';
			const result = extractFrontmatter(content);
			assert.ok(result?.includes('title:'));
			assert.ok(result?.includes('author: O\'Brien'));
		});

		test('should not extract nested delimiters in content', () => {
			const content = '---\ntitle: Test\n---\n---\nNested code block\n---';
			const result = extractFrontmatter(content);
			assert.strictEqual(result, 'title: Test');
		});
	});

	describe('parseYAML', () => {
		test('should parse simple key-value pairs', () => {
			const yaml = 'title: My Title\nauthor: John Doe';
			const result = parseYAML(yaml);
			assert.strictEqual(result.title, 'My Title');
			assert.strictEqual(result.author, 'John Doe');
		});

		test('should parse quoted strings', () => {
			const yaml = 'title: "Quoted Title"\nsubtitle: \'Single Quoted\'';
			const result = parseYAML(yaml);
			assert.strictEqual(result.title, 'Quoted Title');
			assert.strictEqual(result.subtitle, 'Single Quoted');
		});

		test('should parse numeric values', () => {
			const yaml = 'count: 42\nrating: 4.5\nnegative: -10';
			const result = parseYAML(yaml);
			assert.strictEqual(result.count, 42);
			assert.strictEqual(result.rating, 4.5);
			assert.strictEqual(result.negative, -10);
		});

		test('should parse boolean values', () => {
			const yaml = 'published: true\napproved: false\nactive: yes\ninactive: no';
			const result = parseYAML(yaml);
			assert.strictEqual(result.published, true);
			assert.strictEqual(result.approved, false);
			assert.strictEqual(result.active, true);
			assert.strictEqual(result.inactive, false);
		});

		test('should parse ISO date strings', () => {
			const yaml = 'date: 2026-01-05\ntime: 2026-01-05T14:30:00Z';
			const result = parseYAML(yaml);
			assert.strictEqual(result.date, '2026-01-05');
			assert.strictEqual(result.time, '2026-01-05T14:30:00Z');
		});

		test('should parse simple arrays with dash notation', () => {
			const yaml = 'tags:\n  - fiction\n  - horror\n  - classic';
			const result = parseYAML(yaml);
			assert.ok(Array.isArray(result.tags));
			assert.deepStrictEqual(result.tags, ['fiction', 'horror', 'classic']);
		});

		test('should parse arrays with quoted items', () => {
			const yaml = 'authors:\n  - "John Doe"\n  - "Jane Smith"';
			const result = parseYAML(yaml);
			assert.ok(Array.isArray(result.authors));
			assert.deepStrictEqual(result.authors, ['John Doe', 'Jane Smith']);
		});

		test('should handle null values', () => {
			const yaml = 'title: Test\nempty: null\ntilde: ~\nblank:';
			const result = parseYAML(yaml);
			assert.strictEqual(result.title, 'Test');
			assert.strictEqual(result.empty, null);
			assert.strictEqual(result.tilde, null);
			assert.strictEqual(result.blank, null);
		});

		test('should skip empty lines', () => {
			const yaml = 'title: Test\n\n\nauthor: John\n\n';
			const result = parseYAML(yaml);
			assert.strictEqual(result.title, 'Test');
			assert.strictEqual(result.author, 'John');
		});

		test('should handle mixed content types', () => {
			const yaml = 'title: Story\nwordCount: 50000\npublished: true\ntags:\n  - fiction\n  - award';
			const result = parseYAML(yaml);
			assert.strictEqual(result.title, 'Story');
			assert.strictEqual(result.wordCount, 50000);
			assert.strictEqual(result.published, true);
			assert.deepStrictEqual(result.tags, ['fiction', 'award']);
		});

		test('should handle wikilinks in values', () => {
			const yaml = 'author: [[Edgar Allen Poe]]\ncategory: [[Horror]]';
			const result = parseYAML(yaml);
			assert.strictEqual(result.author, '[[Edgar Allen Poe]]');
			assert.strictEqual(result.category, '[[Horror]]');
		});

		test('should trim whitespace from values', () => {
			const yaml = 'title:    Spaces Around   \nauthor:  John Doe  ';
			const result = parseYAML(yaml);
			assert.strictEqual(result.title, 'Spaces Around');
			assert.strictEqual(result.author, 'John Doe');
		});

		test('should handle colons in quoted values', () => {
			const yaml = 'title: "Time: The Mystery"\nsubtitle: "Part 1: Origins"';
			const result = parseYAML(yaml);
			assert.strictEqual(result.title, 'Time: The Mystery');
			assert.strictEqual(result.subtitle, 'Part 1: Origins');
		});

		test('should return empty object for empty YAML', () => {
			const yaml = '';
			const result = parseYAML(yaml);
			assert.deepStrictEqual(result, {});
		});

		test('should handle single key-value pair', () => {
			const yaml = 'title: Single Entry';
			const result = parseYAML(yaml);
			assert.strictEqual(result.title, 'Single Entry');
		});
	});

	describe('parseMarkdownFile', () => {
		test('should parse complete markdown file with frontmatter', () => {
			const content = '---\ntitle: My Story\nauthor: John\n---\n# Content\nText here';
			const result = parseMarkdownFile(content);
			assert.strictEqual(result.title, 'My Story');
			assert.strictEqual(result.author, 'John');
		});

		test('should return empty object when no frontmatter', () => {
			const content = '# No frontmatter\nJust content here';
			const result = parseMarkdownFile(content);
			assert.deepStrictEqual(result, {});
		});

		test('should extract complex frontmatter from real markdown', () => {
			const content =
				'---\ntitle: "Shadow Over Innsmouth"\nauthor: [[H.P. Lovecraft]]\nwordCount: 15000\npublished: true\ntags:\n  - horror\n  - cosmic\n---\n## The Mysterious Port\nContent begins...';
			const result = parseMarkdownFile(content);
			assert.strictEqual(result.title, 'Shadow Over Innsmouth');
			assert.strictEqual(result.author, '[[H.P. Lovecraft]]');
			assert.strictEqual(result.wordCount, 15000);
			assert.strictEqual(result.published, true);
			assert.deepStrictEqual(result.tags, ['horror', 'cosmic']);
		});

		test('should ignore markdown content', () => {
			const content =
				'---\ntitle: Test\n---\n# Heading with ---\nParagraph with --- delimiters\n```\n---\ncode\n---\n```';
			const result = parseMarkdownFile(content);
			assert.strictEqual(result.title, 'Test');
			assert.strictEqual(Object.keys(result).length, 1);
		});

		test('should handle file with only frontmatter', () => {
			const content = '---\ntitle: Only Frontmatter\nauthor: Jane\n---\n';
			const result = parseMarkdownFile(content);
			assert.strictEqual(result.title, 'Only Frontmatter');
			assert.strictEqual(result.author, 'Jane');
		});

		test('should preserve all field types through parseMarkdownFile', () => {
			const content =
				'---\nid: 123\ntitle: Test\nrating: 4.5\napproved: true\nnull_field: null\ntags:\n  - a\n  - b\n---\nContent';
			const result = parseMarkdownFile(content);
			assert.strictEqual(result.id, 123);
			assert.strictEqual(result.title, 'Test');
			assert.strictEqual(result.rating, 4.5);
			assert.strictEqual(result.approved, true);
			assert.strictEqual(result.null_field, null);
			assert.deepStrictEqual(result.tags, ['a', 'b']);
		});
	});

	describe('Edge Cases', () => {
		test('should handle multiple consecutive newlines in frontmatter', () => {
			const content = '---\ntitle: Test\n\n\nauthor: John\n---\nContent';
			const result = parseMarkdownFile(content);
			assert.strictEqual(result.title, 'Test');
			assert.strictEqual(result.author, 'John');
		});

		test('should handle very long frontmatter', () => {
			const longArray = Array.from({ length: 100 }, (_, i) => `  - item${i}`).join('\n');
			const content = `---\nthemes:\n${longArray}\n---\nContent`;
			const result = parseMarkdownFile(content);
			assert.ok(Array.isArray(result.themes));
			assert.strictEqual(result.themes.length, 100);
		});

		test('should handle keys with hyphens and underscores', () => {
			const yaml = 'word-count: 5000\nfirst_name: John\nsub_category: test-value';
			const result = parseYAML(yaml);
			assert.strictEqual(result['word-count'], 5000);
			assert.strictEqual(result['first_name'], 'John');
			assert.strictEqual(result['sub_category'], 'test-value');
		});

		test('should preserve numeric strings when quoted', () => {
			const yaml = 'numeric: 123\nquoted_numeric: "456"';
			const result = parseYAML(yaml);
			assert.strictEqual(result.numeric, 123);
			assert.strictEqual(result.quoted_numeric, '456');
		});

		test('should handle zero and false values correctly', () => {
			const yaml = 'zero: 0\nempty_string: ""\nfalse_value: false';
			const result = parseYAML(yaml);
			assert.strictEqual(result.zero, 0);
			assert.strictEqual(result.empty_string, '');
			assert.strictEqual(result.false_value, false);
		});

		test('should handle unicode characters', () => {
			const yaml = 'title: "Café de Mystère"\nauthor: "李明"';
			const result = parseYAML(yaml);
			assert.strictEqual(result.title, 'Café de Mystère');
			assert.strictEqual(result.author, '李明');
		});
	});

	describe('Integration Tests', () => {
		test('should chain extractFrontmatter and parseYAML correctly', () => {
			const content = '---\ntitle: Integration\ncount: 42\n---\nContent';
			const frontmatter = extractFrontmatter(content);
			if (frontmatter === null) {
				throw new Error('Expected frontmatter to be extracted');
			}
			const parsed = parseYAML(frontmatter);
			assert.strictEqual(parsed.title, 'Integration');
			assert.strictEqual(parsed.count, 42);
		});

		test('should match parseMarkdownFile output to chained functions', () => {
			const content = '---\ntitle: Match\nvalue: true\n---\nContent';
			const directResult = parseMarkdownFile(content);
			const frontmatter = extractFrontmatter(content);
			const chainedResult = frontmatter ? parseYAML(frontmatter) : {};
			assert.deepStrictEqual(directResult, chainedResult);
		});

		test('should handle realistic pulp fiction metadata', () => {
			const content = `---
title: "The Shadow Over Innsmouth"
author: [[H.P. Lovecraft]]
year: 1931
word-count: 15000
status: published
tags:
  - horror
  - cosmic-horror
  - lovecraft
publication: [[Weird Tales]]
series: [[Cthulhu Mythos]]
---
# The Shadow Over Innsmouth

In the year following an unfortunately apt discovery...`;
			const result = parseMarkdownFile(content);
			assert.strictEqual(result.title, 'The Shadow Over Innsmouth');
			assert.strictEqual(result.author, '[[H.P. Lovecraft]]');
			assert.strictEqual(result.year, 1931);
			assert.strictEqual(result['word-count'], 15000);
			assert.strictEqual(result.status, 'published');
			assert.ok(Array.isArray(result.tags));
			assert.strictEqual(result.tags.length, 3);
			assert.strictEqual(result.publication, '[[Weird Tales]]');
		});
	});
});
