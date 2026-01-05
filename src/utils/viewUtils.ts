/**
 * View management utilities for Datacore plugin
 */

import { App } from 'obsidian';

/**
 * Toggle visibility of a sidebar panel view type
 * Creates the view if it doesn't exist, or toggles visibility if it does
 */
export async function toggleSidebarPanel(
	app: App,
	viewType: string
): Promise<void> {
	const { workspace } = app;
	const leaves = workspace.getLeavesOfType(viewType);

	if (leaves.length === 0) {
		// Create new sidebar panel
		const leaf = workspace.getLeaf('split');
		if (!leaf) {return;}
		await leaf.setViewState({
			type: viewType,
			active: true,
		});
	} else {
		// Toggle visibility of existing panels by closing them
		// They will be recreated on next call
		for (const leaf of leaves) {
			leaf.detach();
		}
	}
}