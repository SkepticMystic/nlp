import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";
import compromise from "compromise";
import { normalizePath, Notice, Plugin, TFile } from "obsidian";
import { copy } from "obsidian-community-lib";
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
import { Sentiment, Settings } from "./interfaces";
import { MarkupModal } from "./MarkupModal";
import { MatchModal } from "./MatchModal";
import { PoSModal } from "./PoSModal";
import { SettingTab } from "./SettingTab";
const posTagger = require("wink-pos-tagger");

const sentiment: (str: string) => Sentiment = require("wink-sentiment");

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

		[
			{ name: "Markup", modal: MarkupModal },
			{ name: "Match", modal: MatchModal },
			{ name: "PoS", modal: PoSModal },
		].forEach((modalType) => {
			this.addCommand({
				id: `open-${modalType.name}`,
				name: `Open ${modalType.name} Modal`,
				callback: () => {
					new modalType.modal(this.app, this).open();
				},
			});
		});

		this.addCommand({
			id: "refresh-docs",
			name: "Refresh Docs",
			callback: async () => {
				await this.refreshDocs();
			},
		});

		const addMarks = StateEffect.define(),
			filterMarks = StateEffect.define();

		const markField = StateField.define({
			create() {
				return Decoration.none;
			},
			// This is called whenever the editor updates—it computes the new set
			update(value, tr) {
				// Move the decorations to account for document changes
				value = value.map(tr.changes);
				for (let effect of tr.effects) {
					if (effect.is(addMarks))
						value = value.update({ add: effect.value, sort: true });
					else if (effect.is(filterMarks))
						value = value.update({ filter: effect.value });
				}
				return value;
			},
			// Indicate that this field provides a set of decorations
			provide: (f) => EditorView.decorations.from(f),
		});
		this.registerEditorExtension(markField);

		const posMark = (...classes: string[]) =>
			Decoration.mark({ class: `${classes.join(" ")}` });

		// this.addCommand({
		// 	id: "highlight-pos",
		// 	name: "Highlight PoS",
		// 	editorCallback: async (editor) => {
		// 		let content = editor.getValue();
		// 		const tagger: Tagger = posTagger();
		// 		const tagged = tagger.tagSentence(content);

		// 		let currOffset = 0;
		// 		const marks = tagged.map((tag) => {
		// 			const { value } = tag;
		// 			const index = content.indexOf(value, currOffset);
		// 			currOffset = index + value.length;

		// 			return posMark(tag.tag, tag.pos).range(
		// 				index,
		// 				index + value.length
		// 			);
		// 		});

		// 		(editor.cm as EditorView).dispatch({
		// 			effects: addMarks.of(marks),
		// 		});
		// 	},
		// });
		this.addCommand({
			id: "highlight-pos",
			name: "Highlight PoS",
			editorCallback: async (editor) => {
				let content = editor.getValue();
				const doc = compromise(content);
				const json = doc.json();

				const termsArr: {
					text: string;
					tags: string[];
					pre: string;
					post: string;
				}[] = [];
				json.forEach((sentence) => termsArr.push(...sentence.terms));

				console.log(termsArr);

				let currOffset = 0;
				const marks = termsArr.map((term) => {
					const { text, post, tags } = term;
					const start = content.indexOf(text, currOffset);
					currOffset = start + text.length;

					return posMark(...tags).range(start, currOffset);
				});

				console.log({ marks });
				(editor.cm as EditorView).dispatch({
					effects: addMarks.of(marks),
				});
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
		// this.addCommand({
		// 	id: `sent`,
		// 	name: `Sent`,
		// 	callback: () => {
		// 		const doc = this.Docs[this.app.workspace.getActiveFile().path];
		// 		console.time("1");
		// 		console.log(
		// 			this.getAvgSentimentFromDoc(doc, {
		// 				normalised: true,
		// 				perSentence: true,
		// 			})
		// 		);
		// 		console.timeEnd("1");
		// 		console.time("2");
		// 		console.log(
		// 			this.getAvgSentimentFromDoc(doc, {
		// 				normalised: true,
		// 				perSentence: false,
		// 			})
		// 		);
		// 		console.timeEnd("2");
		// 		// console.time("3");
		// 		// console.log(
		// 		// 	this.getAvgSentimentFromDoc(doc, {
		// 		// 		normalised: false,
		// 		// 		perSentence: true,
		// 		// 	})
		// 		// );
		// 		// console.timeEnd("3");
		// 		// console.time("4");
		// 		// console.log(
		// 		// 	this.getAvgSentimentFromDoc(doc, {
		// 		// 		normalised: false,
		// 		// 		perSentence: false,
		// 		// 	})
		// 		// );
		// 		// console.timeEnd("4");
		// 	},
		// });

		if (this.settings.refreshDocsOnLoad) {
			this.app.workspace.onLayoutReady(async () => {
				await this.refreshDocs();
				// const worker = Worker();
				// worker.postMessage("{ message: 'hello' }");
			});
		}
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
		const notice = new Notice("Refreshing docs...");
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
		notice.hide();
		notice.setMessage("Docs Refreshed");
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

	getAvgSentimentFromDoc(
		doc: Document,
		{ perSentence = false, normalised = true } = {}
	): number {
		const scoreType = normalised ? "normalizedScore" : "score";
		if (perSentence) {
			const sentences = doc.sentences().out();
			const sentiments = sentences.map((sentence) => sentiment(sentence));
			return (
				sentiments.reduce((a, b) => a + b[scoreType], 0) /
				sentences.length
			);
		} else {
			return sentiment(doc.out())[scoreType];
		}
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
