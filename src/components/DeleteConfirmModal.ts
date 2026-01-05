import {
	App,
	Modal
} from 'obsidian';

/**
 * Confirmation modal for deleting a library
 * Uses Obsidian's Modal API for consistent UX
 */
export class DeleteConfirmModal extends Modal {
	private libraryName: string;
	private onConfirm: (confirmed: boolean) => void;

	constructor(app: App, libraryName: string, onConfirm: (confirmed: boolean) => void) {
		super(app);
		this.libraryName = libraryName;
		this.onConfirm = onConfirm;
	}

	onOpen(): void {
		const { contentEl } = this;

		// Title
		contentEl.createEl('h2', { text: 'Delete library' });

		// Message
		const messageEl = contentEl.createDiv();
		messageEl.createEl('p', {
			text: `Are you sure you want to delete the library "${this.libraryName}"?`,
		});
		messageEl.createEl('p', {
			text: 'This action cannot be undone.',
			cls: 'u-muted',
		});

		// Button container
		const buttonContainer = contentEl.createDiv({ cls: 'delete-confirm-buttons' });

		// Cancel button
		const cancelBtn = buttonContainer.createEl('button', {
			text: 'Cancel',
		});
		cancelBtn.addEventListener('click', () => {
			this.onConfirm(false);
			this.close();
		});

		// Delete button (destructive style)
		const deleteBtn = buttonContainer.createEl('button', {
			text: 'Delete library',
			cls: 'mod-warning',
		});
		deleteBtn.addEventListener('click', () => {
			this.onConfirm(true);
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
