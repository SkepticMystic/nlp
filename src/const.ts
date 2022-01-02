import { Settings } from "./interfaces";

export const TEXT_MANIPULATION_CMDS: { [pos: string]: string[] } = {
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
};

export const ENTITIES = [
	"emails",
	"emoticons",
	"emjois",
	"atMentions",
	"abbreviations",
	"people",
	"places",
	"organizations",
	"topics",
];

export const DEFAULT_SETTINGS: Settings = {
	customEntityFilePath: "",
	refreshDocsOnLoad: false,
};
