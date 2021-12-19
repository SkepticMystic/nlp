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

		// const addMarks = StateEffect.define<Decoration>(),
		// 	filterMarks = StateEffect.define();

		// // This value must be added to the set of extensions to enable this
		// const markField = StateField.define({
		// 	// Start with an empty set of decorations
		// 	create() {
		// 		return Decoration.none;
		// 	},
		// 	// This is called whenever the editor updates—it computes the new set
		// 	update(value, tr) {
		// 		// Move the decorations to account for document changes
		// 		value = value.map(tr.changes);
		// 		// If this transaction adds or removes decorations, apply those changes
		// 		for (let effect of tr.effects) {
		// 			if (effect.is(addMarks))
		// 				value = value.update({ add: effect.value, sort: true });
		// 			else if (effect.is(filterMarks))
		// 				value = value.update({ filter: effect.value });
		// 		}
		// 		return value;
		// 	},
		// 	// Indicate that this field provides a set of decorations
		// 	provide: (f) => EditorView.decorations.from(f),
		// });
		// this.registerEditorExtension(markField);

		// const strikeMark = Decoration.mark({
		// 	attributes: { style: "text-decoration: line-through" },
		// });

		// this.addCommand({
		// 	id: "tag-pos",
		// 	name: "Tag PoS",
		// 	editorCallback: async (editor) => {
		// 		(editor.cm as EditorView).dispatch({
		// 			effects: addMarks.of([strikeMark.range(1, 40)]),
		// 		});

		// 		const tagger: Tagger = posTagger();
		// 		console.log(
		// 			tagger.tagSentence(
		// 				"He is trying to fish for fish in the lake."
		// 			)
		// 		);
		// function addIndentationMarkers(view: EditorView) {
		// 	const builder = new RangeSetBuilder<Decoration>();

		// 	for (const { from, to } of view.visibleRanges) {
		// 		let pos = from;

		// 		while (pos <= to) {
		// 			const line = view.state.doc.lineAt(pos);
		// 			const { text } = line;

		// 			// Decorate empty line
		// 			if (text.trim().length === 0) {
		// 				const indentationWidget = Decoration.widget({
		// 					widget: myWidget,
		// 				});

		// 				builder.add(
		// 					line.from,
		// 					line.from,
		// 					indentationWidget
		// 				);
		// 			}

		// 			// Move on to next line
		// 			pos = line.to + 1;
		// 		}
		// 	}

		// 	return builder.finish();
		// }

		// function createIndentMarkerPlugin() {
		// 	return ViewPlugin.define(
		// 		(view) => ({
		// 			decorations: addIndentationMarkers(view),
		// 			update(update) {
		// 				if (
		// 					update.docChanged ||
		// 					update.viewportChanged
		// 				) {
		// 					this.decorations = addIndentationMarkers(
		// 						update.view
		// 					);
		// 				}
		// 			},
		// 		}),
		// 		{
		// 			decorations: (v) => v.decorations,
		// 		}
		// 	);
		// }
		// 	},
		// });

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
