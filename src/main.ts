import { Plugin } from "obsidian";
import model from "wink-eng-lite-web-model";
import winkNLP, { Document, WinkMethods } from "wink-nlp";
import { DEFAULT_SETTINGS } from "./const";
import { Settings } from "./interfaces";
import { MarkupModal } from "./MarkupModal";
import { SettingTab } from "./SettingTab";

export default class NLPPlugin extends Plugin {
	settings: Settings;
	model: WinkMethods;

	async onload() {
		console.log("loading");
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.model = winkNLP(model);
		this.addCommand({
			id: "nlp",
			name: "NLP",
			callback: async () => {
				new MarkupModal(this.app, this).open();
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async docOfCurrFile(): Promise<Document | null> {
		const file = this.app.workspace.getActiveFile();
		if (!file) return null;
		const text = await this.app.vault.cachedRead(file);

		return this.model.readDoc(text);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
