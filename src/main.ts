import compromise from "compromise";
import { normalizePath, Notice, Plugin, TFile } from "obsidian";
import { copy } from "obsidian-community-lib";
import { MatchModal } from "./MatchModal";
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
// import * as Worker from "./Workers/refreshDocs.worker";

export default class NLPPlugin extends Plugin {
	settings: Settings;
	winkModel: WinkMethods;
	Docs: { [path: string]: Document } = {};

	async onload() {
		console.log("loading");
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.winkModel = winkNLP(model);

		const { customEntityFilePath } = this.settings;
		if (customEntityFilePath !== "") {
			const customEntitiesStr = await this.app.vault.adapter.read(
				normalizePath(customEntityFilePath)
			);
			const customEntities: CustomEntityExample[] =
				JSON.parse(customEntitiesStr);
			this.winkModel.learnCustomEntities(customEntities);
		}

		this.addCommand({
			id: "markup-modal",
			name: "Open Markup Modal",
			callback: () => {
				new MarkupModal(this.app, this).open();
			},
		});
		this.addCommand({
			id: "match-modal",
			name: "Open Match Modal",
			callback: () => {
				new MatchModal(this.app, this).open();
			},
		});
		this.addCommand({
			id: "refresh-docs",
			name: "Refresh Docs",
			callback: async () => {
				await this.refreshDocs();
			},
		});

		compromise.extend(require("compromise-numbers"));
		compromise.extend(require("compromise-adjectives"));
		compromise.extend(require("compromise-dates"));
		Object.entries({
			verbs: [
				"toPastTense",
				"toPresentTense",
				"toFutureTense",
				"toInfinitive",
				"toGerund",
				"toParticiple",
				"toPositive",
				"toNegative",
			],
			nouns: ["toPlural", "toSingular", "toPossessive"],
			adjectives: [
				"toSuperlative",
				"toComparative",
				"toAdverb",
				"toVerb",
				"toNoun",
			],
			dates: ["toShortForm", "toLongForm"],

			numbers: [
				"toText",
				"toNumber",
				"toOrdinal",
				"toCardinal",
				"increment",
				"decrement",
				"toLocaleString",
			],
			fractions: ["toDecimal", "normalize", "toText", "toPercentage"],
			percentages: ["toFraction"],
		}).forEach(([pos, fns]: [string, string[]]) => {
			fns.forEach((fn) => {
				this.addCommand({
					id: `${pos} - ${fn}`,
					name: `${pos} - ${fn}`,
					editorCallback: async (ed) => {
						const sel = ed.getSelection();
						const compDoc = compromise(sel);
						compDoc[pos]()[fn]();
						const newSel = compDoc.text();

						ed.replaceSelection(newSel);
					},
				});
			});
		});

		[
			"emails",
			"emoticons",
			"emjois",
			"atMentions",
			"abbreviations",
			"people",
			"places",
			"organizations",
			"topics",
		].forEach((entity) => {
			this.addCommand({
				id: `entity - ${entity}`,
				name: `entity - ${entity}`,
				editorCallback: async (ed) => {
					const sel = ed.getSelection();
					const compDoc = compromise(sel);
					const entities = compDoc[entity]().out("array");
					await copy(entities.join(", "));
				},
			});
		});

		this.app.workspace.onLayoutReady(async () => {
			await this.refreshDocs();
			// const worker = Worker();
			// worker.postMessage("{ message: 'hello' }");
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
				this.Docs[file.path] = await this.getWinkDocFromFile(file);
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
		const { as, its } = this.winkModel;
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
		const { as, its } = this.winkModel;
		if (!doc) return new Set();
		return doc[type]()
			.filter(
				(item: ItemToken | ItemEntity) =>
					item.out(its.type) === "word" && !item.out(its.stopWordFlag)
			)
			.out(its.value, as.set) as Set<string>;
	}

	async getWinkDocFromFile(
		file = this.app.workspace.getActiveFile()
	): Promise<Document | null> {
		if (!file) return null;
		const text = await this.app.vault.cachedRead(file);

		return this.winkModel.readDoc(text);
	}

	async getActiveFileContent(cached = true): Promise<string | null> {
		const currFile = this.app.workspace.getActiveFile();
		if (!(currFile instanceof TFile)) return null;
		if (cached) return await this.app.vault.cachedRead(currFile);
		else return await this.app.vault.read(currFile);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
