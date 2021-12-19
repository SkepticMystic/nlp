import { App, Modal } from "obsidian";
import NLPPlugin from "./main";
import PoS from "./Components/PoS.svelte";

export class PoSModal extends Modal {
	plugin: NLPPlugin;
	modal: PoSModal;

	constructor(app: App, plugin: NLPPlugin) {
		super(app);
		this.plugin = plugin;
		this.modal = this;
	}

	async onOpen() {
		const { contentEl, plugin } = this;
		const { winkModel } = plugin;
		contentEl.empty();

		const content = await plugin.getActiveFileContent();
		if (!content) return;

		new PoS({
			target: contentEl,
			props: { content, winkModel },
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}
