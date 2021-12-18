import { normalizePath, Notice, Plugin } from "obsidian";
import model from "wink-eng-lite-web-model";
import winkNLP, {
	Bow,
	CustomEntityExample,
	Document,
	ItemEntity,
	ItemToken,
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
			await this.refreshDocs();
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
		console.time("refreshDocs");
		try {
			for (const file of this.app.vault.getMarkdownFiles()) {
				this.Docs[file.path] = await this.getDocFromFile(file);
			}
			new Notice("Docs refreshed");
		} catch (e) {
			console.log(e);
			new Notice(
				"An error occured, check the console for more information."
			);
		}
		console.timeEnd("refreshDocs");
	}

	getNoStopBoW(doc: Document, type: "tokens" | "entities" = "tokens") {
		const { as, its } = this.model;
		if (!doc) return {};
		return doc[type]()
			.filter(
				(item: ItemToken | ItemEntity) =>
					item.out(its.type) === "word" && !item.out(its.stopWordFlag)
			)
			.out(its.value, as.bow) as Bow;
	}
	getNoStopSet(
		doc: Document,
		type: "tokens" | "entities" = "tokens"
	): Set<string> {
		const { as, its } = this.model;
		if (!doc) return new Set();
		return doc[type]()
			.filter(
				(item: ItemToken | ItemEntity) =>
					item.out(its.type) === "word" && !item.out(its.stopWordFlag)
			)
			.out(its.value, as.set) as Set<string>;
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
