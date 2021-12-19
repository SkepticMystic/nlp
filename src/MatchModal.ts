import { App, Modal } from "obsidian";
import Match from "./Components/Match.svelte";
import NLPPlugin from "./main";

export class MatchModal extends Modal {
	plugin: NLPPlugin;
	modal: MatchModal;

	constructor(app: App, plugin: NLPPlugin) {
		super(app);
		this.plugin = plugin;
		this.modal = this;
	}

	async onOpen() {
		const { contentEl, plugin } = this;
		contentEl.empty();
		const content = await plugin.getActiveFileContent();

		new Match({ target: contentEl, props: { content } });
	}

	onClose() {
		this.contentEl.empty();
	}
}
