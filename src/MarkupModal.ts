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
		const { model } = plugin;
		contentEl.empty();

		const doc = await plugin.docOfCurrFile();

		new Markup({ target: contentEl, props: { model, doc } });
	}

	onClose() {
		this.contentEl.empty();
	}
}
