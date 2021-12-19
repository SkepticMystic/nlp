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

		const originalText = await plugin.getActiveFileContent();
		if (!originalText) return;

		new Markup({
			target: contentEl,
			props: { originalText, model: winkModel },
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}
