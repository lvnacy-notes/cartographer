import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDocsDir = path.join(__dirname, '..', 'atlas', 'src', 'content', 'docs', 'reference', 'api');

/**
 * Recursively find all .md files in a directory
 */
function findMarkdownFiles(dir, fileList = []) {
	const files = fs.readdirSync(dir);
	
	files.forEach(file => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		
		if (stat.isDirectory()) {
			// Recurse into subdirectory
			findMarkdownFiles(filePath, fileList);
		} else if (file.endsWith('.md')) {
			// Add markdown file to list
			fileList.push(filePath);
		}
	});
	
	return fileList;
}

/**
 * Add frontmatter to a markdown file if missing
 */
function addFrontmatter(filePath) {
	let content = fs.readFileSync(filePath, 'utf-8');
	
	// Skip if frontmatter already exists
	if (content.startsWith('---')) {
		return false;
	}
	
	// Extract title from filename
	const fileName = path.basename(filePath, '.md');
	const title = fileName
		.replace(/-/g, ' ')
		.replace(/\b\w/g, char => char.toUpperCase());
	
	// Create frontmatter
	const frontmatter = `---
title: ${title}
description: API documentation for ${title}
---
`;
	
	// Prepend frontmatter and write back
	content = frontmatter + content;
	fs.writeFileSync(filePath, content);
	
	return true;
}

// Main execution
try {
	const files = findMarkdownFiles(apiDocsDir);
	let processedCount = 0;
	
	files.forEach(file => {
		if (addFrontmatter(file)) {
			processedCount++;
		}
	});
	
	console.log(`✅ Processed ${processedCount} API documentation files (${files.length} total)`);
} catch (error) {
	console.error('❌ Error processing API docs:', error);
	process.exit(1);
}