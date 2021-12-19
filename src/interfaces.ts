export interface Settings {
	customEntityFilePath: string;
	refreshDocsOnLoad: boolean;
}

export interface Sentiment {
	score: number;
	normalizedScore: number;
	tokenizedPhrase: { value: string; tag: string }[];
}
