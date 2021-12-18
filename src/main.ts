import { normalizePath, Plugin } from "obsidian";
import model from "wink-eng-lite-web-model";
import winkNLP, {
	Bow,
	CustomEntityExample,
	Document,
	WinkMethods,
} from "wink-nlp";
import { DEFAULT_SETTINGS } from "./const";
import { Settings } from "./interfaces";
import { MarkupModal } from "./MarkupModal";
import { SettingTab } from "./SettingTab";
import similarity from "wink-nlp/utilities/similarity";

export default class NLPPlugin extends Plugin {
	settings: Settings;
	model: WinkMethods;

	async onload() {
		console.log("loading");
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.model = winkNLP(model);

		const { customEntityFilePath } = this.settings;
		if (customEntityFilePath !== "") {
			const customEntitiesStr = await this.app.vault.adapter.read(
				normalizePath(customEntityFilePath)
			);
			const customEntities: CustomEntityExample[] =
				JSON.parse(customEntitiesStr);
			this.model.learnCustomEntities(customEntities);
		}

		this.addCommand({
			id: "nlp",
			name: "NLP",
			callback: async () => {
				new MarkupModal(this.app, this).open();
			},
		});
		this.addCommand({
			id: "bow",
			name: "BoW",
			callback: async () => {
				const { as, its } = this.model;
				const currDoc = await this.getDocFromFile();
				const targetDoc = await this.getDocFromFile();
				if (!currDoc || !targetDoc) return;

				const bow = this.getNoStopBoW(currDoc);

				console.log(bow);
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

	getNoStopBoW(doc: Document) {
		const { as, its } = this.model;
		return doc
			.tokens()
			.filter(
				(t) => t.out(its.type) === "word" && !t.out(its.stopWordFlag)
			)
			.out(its.value, as.bow) as Bow;
	}

	async getDocFromFile(
		file = this.app.workspace.getActiveFile()
	): Promise<Document | null> {
		if (!file) return null;
		const text = await this.app.vault.cachedRead(file);

		return this.model.readDoc(text);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
