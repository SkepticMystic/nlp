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

export default class NLPPlugin extends Plugin {
	settings: Settings;
	model: WinkMethods;
	Docs: { [path: string]: Document } = {};

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
			id: "markup-modal",
			name: "Open Markup Modal",
			callback: () => {
				new MarkupModal(this.app, this).open();
			},
		});
		this.addCommand({
			id: "refresh-docs",
			name: "Refresh Docs",
			callback: async () => {
				await this.refreshDocs();
			},
		});

		this.app.workspace.onLayoutReady(async () => {
			console.time("refreshDocs");
			await this.refreshDocs();
			console.timeEnd("refreshDocs");
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

	async refreshDocs() {
		for (const file of this.app.vault.getMarkdownFiles()) {
			this.Docs[file.path] = await this.getDocFromFile(file);
		}
	}

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
