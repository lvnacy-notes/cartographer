/**
 * Field value formatting utilities for display in catalog components
 * Handles type-specific formatting for all SchemaField types
 */

/**
 * Format a date value for display
 * Handles Date objects, ISO strings, and invalid values
 * @param value - The date value to format (Date, string, or unknown type)
 * @returns Formatted date string in YYYY-MM-DD format, or '-' if null/empty/invalid
 * @example
 * formatDate(new Date('2025-06-15')) // '2025-06-15'
 * formatDate('2025-06-15') // '2025-06-15'
 * formatDate(null) // '-'
 */
export function formatDate(value: unknown): string {
	if (value === null || value === undefined) {
		return '-';
	}

	if (value instanceof Date) {
		const isoString = value.toISOString();
		return isoString.split('T')[0] ?? '';
	}

	if (typeof value === 'string') {
		const parsedDate = new Date(value);
		if (!isNaN(parsedDate.getTime())) {
			const isoString = parsedDate.toISOString();
			return isoString.split('T')[0] ?? '';
		}
		return value;
	}

	return '-';
}

/**
 * Format a number value for display with optional thousands separators
 * @param value - The number to format
 * @param options - Optional formatting options
 * @param options.useGrouping - Whether to add thousands separators (default: true)
 * @returns Formatted number string, or '-' if null/empty/invalid
 * @example
 * formatNumber(12000) // '12,000'
 * formatNumber(1234.56) // '1,234.56'
 * formatNumber(null) // '-'
 */
export function formatNumber(
	value: unknown,
	options?: { useGrouping?: boolean }
): string {
	if (value === null || value === undefined) {
		return '-';
	}

	const numValue: number = typeof value === 'string' ? parseFloat(value) : (value as number);

	if (typeof numValue !== 'number' || isNaN(numValue)) {
		return '-';
	}

	const shouldGroup = options?.useGrouping ?? true;
	return shouldGroup ? numValue.toLocaleString() : numValue.toString();
}

/**
 * Format a boolean value for display as human-readable text
 * @param value - The boolean value to format
 * @returns 'Yes' for true, 'No' for false, '-' for null/undefined
 * @example
 * formatBoolean(true) // 'Yes'
 * formatBoolean(false) // 'No'
 * formatBoolean(null) // '-'
 */
export function formatBoolean(value: unknown): string {
	if (value === null || value === undefined) {
		return '-';
	}

	if (typeof value === 'boolean') {
		return value ? 'Yes' : 'No';
	}

	if (typeof value === 'string') {
		const lowerValue = value.toLowerCase();
		if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
			return 'Yes';
		}
		if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
			return 'No';
		}
	}

	return '-';
}

/**
 * Format an array value for display as comma-separated string
 * @param value - The array to format
 * @param maxItems - Optional maximum items to display before adding ellipsis
 * @returns Comma-separated string, or '-' if empty/invalid
 * @example
 * formatArray(['a', 'b', 'c']) // 'a, b, c'
 * formatArray(['a', 'b', 'c'], 2) // 'a, b, ...'
 * formatArray([]) // '-'
 */
export function formatArray(value: unknown, maxItems?: number): string {
	if (!Array.isArray(value) || value.length === 0) {
		return '-';
	}

	const stringItems: string[] = value.map(item => String(item));

	if (maxItems !== undefined && stringItems.length > maxItems) {
		const truncated = stringItems.slice(0, maxItems);
		return `${ truncated.join(', ') }, ...`;
	}

	return stringItems.join(', ');
}

/**
 * Format a wikilink array for display by extracting link labels
 * Extracts content from [[Label]] format and displays as comma-separated labels
 * @param value - Array of wikilink strings (e.g., ['[[Lovecraft, H.P.]]', '[[Poe, Edgar Allen]]'])
 * @param maxItems - Optional maximum items to display before adding ellipsis
 * @returns Comma-separated labels, or '-' if empty/invalid
 * @example
 * formatWikilinkArray(['[[Lovecraft, H.P.]]', '[[Poe, Edgar]]']) // 'Lovecraft, H.P., Poe, Edgar'
 * formatWikilinkArray(['[[Author]]'], 1) // 'Author'
 */
export function formatWikilinkArray(
	value: unknown,
	maxItems?: number
): string {
	if (!Array.isArray(value) || value.length === 0) {
		return '-';
	}

	const labels: string[] = value.map(link => {
		if (typeof link !== 'string') {
			return String(link);
		}
		const match = link.match(/\[\[(.*?)\]\]/);
		return match ? match[1] : link;
	}).filter((label): label is string => Boolean(label));

	if (maxItems !== undefined && labels.length > maxItems) {
		const truncated = labels.slice(0, maxItems);
		return `${ truncated.join(', ') }, ...`;
	}

	return labels.join(', ');
}

/**
 * Format an object value for display
 * Returns compact representation showing object keys or '[Object]' if not serializable
 * @param value - The object to format
 * @returns String representation or '-' if null/undefined
 * @example
 * formatObject({ key: 'value' }) // '[Object: key]'
 */
export function formatObject(value: unknown): string {
	if (value === null || value === undefined) {
		return '-';
	}

	if (typeof value === 'object') {
		try {
			const keys = Object.keys(value as Record<string, unknown>);
			if (keys.length === 0) {
				return '[Object]';
			}
			return `[Object: ${keys.join(', ')}]`;
		} catch {
			return '[Object]';
		}
	}

	if (typeof value === 'string') {
		return value;
	}
	return (value as string).toString();
}
