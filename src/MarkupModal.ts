import { App, Modal } from "obsidian";
import NLPPlugin from "./main";
import Markup from "./Components/Markup.svelte";

export class MarkupModal extends Modal {
	plugin: NLPPlugin;
	modal: MarkupModal;

	constructor(app: App, plugin: NLPPlugin) {
		super(app);
		this.plugin = plugin;
		this.modal = this;
	}

	async onOpen() {
		const { contentEl, plugin } = this;
		const { winkModel } = plugin;
		contentEl.empty();

		const file = this.app.workspace.getActiveFile();
		if (!file) return null;
		const originalText = await this.app.vault.cachedRead(file);

		new Markup({
			target: contentEl,
			props: { originalText, model: winkModel },
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}
