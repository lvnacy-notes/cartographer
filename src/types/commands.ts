/**
 * Command definition interface for registering Obsidian commands
 */
export interface CommandDefinition {
	id: string;
	name: string;
	callback: () => void | Promise<void>;
}
