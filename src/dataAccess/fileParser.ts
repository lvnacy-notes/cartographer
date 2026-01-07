/**
 * Markdown File Parser
 *
 * Extracts and parses YAML frontmatter from markdown files.
 * Provides utilities for extracting structured data from markdown documents.
 */

/**
 * Extract YAML frontmatter from markdown file content.
 *
 * Looks for content between opening and closing `---` delimiters at start of file.
 *
 * @param fileContent - Raw markdown file content
 * @returns - YAML frontmatter string (without delimiters), or null if not found
 *
 * @example
 * const content = "---\ntitle: My Note\nauthor: Me\n---\n# Content";
 * const yaml = extractFrontmatter(content);
 * // Returns: "title: My Note\nauthor: Me"
 */
export function extractFrontmatter(fileContent: string): string | null {
	// Match frontmatter between opening and closing --- delimiters
	// Handles both empty frontmatter (---\n---) and content-filled frontmatter
	const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
	if (match?.[1] !== undefined) {
		return match[1];
	}
	// Also check for empty frontmatter case: ---\n--- (no content between)
	if (fileContent.match(/^---\n---/)) {
		return '';
	}
	return null;
}

/**
 * Parse YAML frontmatter into a plain object.
 *
 * Handles:
 * - Key-value pairs: `key: value`
 * - Arrays: `key: [item1, item2]` or multi-line with `- item`
 * - Strings with special characters (quoted or unquoted)
 * - Boolean values: `true`, `false`, `yes`, `no`
 * - Null/empty values
 * - Numeric values
 * - ISO date strings
 *
 * Does NOT use external YAML parser—parses line-by-line for better control
 * and error handling.
 *
 * @param yamlString - Raw YAML frontmatter content (without delimiters)
 * @returns - Parsed object with string | number | boolean | string[] | null values
 *
 * @example
 * const yaml = "title: My Note\nauthor: Me\ntags:\n  - note\n  - draft";
 * const obj = parseYAML(yaml);
 * // Returns: { title: 'My Note', author: 'Me', tags: ['note', 'draft'] }
 */
export function parseYAML(yamlString: string): Record<string, unknown> {
	const fields: Record<string, unknown> = {};
	const lines = yamlString.split('\n');
	let currentKey: string | null = null;
	let currentArray: string[] = [];
	let inArrayMode = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? '';
		const trimmed = line.trim();

		// Skip empty lines
		if (!trimmed) {
			continue;
		}

		// Check for array item (line starting with `- `)
		if (trimmed.startsWith('- ')) {
			if (currentKey) {
				// We're in array mode for the current key
				const arrayItem = trimmed.slice(2).trim();
				const cleanItem = removeQuotes(arrayItem);
				currentArray.push(cleanItem);
				inArrayMode = true;
				continue;
			}
		}

		// If we were in array mode and this is not an array item, save the array
		if (inArrayMode && currentKey && currentArray.length > 0) {
			fields[currentKey] = currentArray;
			currentArray = [];
			inArrayMode = false;
		}

		// Try to match `key: value` pattern
		const match = trimmed.match(/^([^:]+):\s*(.*)$/);
		if (!match?.[1]) {
			continue;
		}

		const key = match[1].trim();
		const value = (match[2] ?? '').trim();

		// Check if this starts an array (empty value, next line might be array item)
		if (value === '') {
			const nextLine = i + 1 < lines.length ? (lines[i + 1] ?? '').trim() : '';
			if (nextLine.startsWith('- ')) {
				// This key will have array items
				currentKey = key;
				currentArray = [];
				inArrayMode = true;
				continue;
			}
		}

		// Save any pending array before processing new key
		if (currentKey && currentArray.length > 0) {
			fields[currentKey] = currentArray;
			currentArray = [];
			inArrayMode = false;
		}

		// Process the current key-value pair
		currentKey = key;

		if (value === '') {
			// Empty/null value
			fields[key] = null;
		} else {
			// Parse the value
			fields[key] = parseYAMLValue(value);
		}
	}

	// Handle any remaining array
	if (currentKey && currentArray.length > 0) {
		fields[currentKey] = currentArray;
	}

	return fields;
}

/**
 * Parse a single YAML value (right side of key: value).
 *
 * Handles:
 * - Quoted strings: `"value"` or `'value'`
 * - Unquoted strings
 * - Boolean values: `true`, `false`, `yes`, `no`
 * - Numeric values: integers and decimals
 * - ISO date strings
 * - Null: empty, `null`, `~`
 *
 * @param valueString - The value portion to parse
 * @returns - Parsed value (string | number | boolean | null)
 *
 * @example
 * parseYAMLValue('"hello"')        // 'hello'
 * parseYAMLValue('123')             // 123
 * parseYAMLValue('true')            // true
 * parseYAMLValue('2026-01-05')      // '2026-01-05' (ISO date as string)
 */
function parseYAMLValue(valueString: string): string | number | boolean | null {
	const trimmed = valueString.trim();

	// Null values
	if (trimmed === '' || trimmed === 'null' || trimmed === '~') {
		return null;
	}

	// Check if value is quoted (before removing quotes)
	const isQuoted =
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"));

	// Remove quotes if present
	const unquoted = removeQuotes(trimmed);

	// If originally quoted, return as string (preserve type indicated by quotes)
	if (isQuoted) {
		return unquoted;
	}

	// Boolean values
	const lowerValue = unquoted.toLowerCase();
	if (lowerValue === 'true' || lowerValue === 'yes') {
		return true;
	}
	if (lowerValue === 'false' || lowerValue === 'no') {
		return false;
	}

	// Try to parse as number (only for unquoted values)
	const num = Number(unquoted);
	if (!isNaN(num) && unquoted !== '') {
		return num;
	}

	// Return as string (includes ISO dates, wikilinks, etc.)
	return unquoted;
}

/**
 * Remove surrounding quotes from a string if present.
 *
 * Handles both single and double quotes, but requires matching pairs.
 *
 * @param str - String that may be quoted
 * @returns - String with outer quotes removed (or original if not quoted)
 *
 * @example
 * removeQuotes('"hello"')       // 'hello'
 * removeQuotes("'world'")       // 'world'
 * removeQuotes('[[Link]]')      // '[[Link]]' (no change, no outer quotes)
 * removeQuotes('hello"world')   // 'hello"world' (mismatched, no change)
 */
function removeQuotes(str: string): string {
	if (str.length < 2) {
		return str;
	}

	const firstChar = str[0];
	const lastChar = str[str.length - 1];

	if (
		(firstChar === '"' && lastChar === '"') ||
		(firstChar === "'" && lastChar === "'")
	) {
		return str.slice(1, -1);
	}

	return str;
}

/**
 * Parse a markdown file and extract frontmatter.
 *
 * Convenience function that combines extractFrontmatter and parseYAML.
 *
 * @param fileContent - Full markdown file content
 * @returns - Parsed frontmatter object, or empty object if no frontmatter found
 *
 * @example
 * const content = "---\ntitle: Note\n---\n# Heading";
 * const data = parseMarkdownFile(content);
 * // Returns: { title: 'Note' }
 */
export function parseMarkdownFile(fileContent: string): Record<string, unknown> {
	const frontmatterText = extractFrontmatter(fileContent);
	if (!frontmatterText) {
		return {};
	}
	return parseYAML(frontmatterText);
}
