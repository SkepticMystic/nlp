<script lang="ts">
	import { WinkMethods } from "wink-nlp";
	import Tagger from "wink-pos-tagger";
	import { Sentiment } from "../interfaces";
	const posTagger = require("wink-pos-tagger");

	const sentiment: (str: string) => Sentiment = require("wink-sentiment");

	export let content: string;
	export let winkModel: WinkMethods;

	const { as, its } = winkModel;

	const doc = winkModel.readDoc(content);
	const sentences = doc.sentences().out();

	const tagger: Tagger = posTagger();
	const taggedSentences = sentences.map((sentence) =>
		tagger.tagSentence(sentence)
	);

	const sentiments = sentences.map((sentence) => sentiment(sentence));

	const stats: { [thing: string]: string[] } = {
		Sentences: sentences,
		Tokens: doc.tokens().out(),
		Entities: doc.entities().out(),
	};

	console.log({ stats });
</script>

<div class="content-container">
	{#each taggedSentences as taggedSentence}
		{#each taggedSentence as tag}
			<span>
				<div class="tagged-token" aria-label={tag.pos}>
					<span class="token">{`${tag.value} `}</span>
					<span class="tag {tag.tag}">
						{tag.tag === "punctuation"
							? "p"
							: tag.tag === "number"
							? "num"
							: tag.tag}
					</span>
				</div>
			</span>
		{/each}
	{/each}
</div>
<div class="stats">
	{#each Object.keys(stats) as stat}
		<div class="stat">
			<span class="stat-name">{stat}</span>:
			<span class="stat-value">{stats[stat].length}</span>
		</div>
	{/each}
</div>
<div class="sentiments">
	<table />
</div>

<style>
	.content-container {
		max-height: 500px;
		overflow-y: scroll;
	}

	.tagged-token {
		display: inline-flex;
		flex-direction: column;
		padding-top: 3px;
	}
	.token {
		text-align: center;
	}
	.tag {
		font-size: 70% !important;
		opacity: 0.8;
		text-align: center;
		border: 1px solid var(--background-modifier-border);
		border-radius: 10px;
		padding: 0px 2px;
	}

	.stats {
		margin-top: 10px;
	}

	.stat {
	}
	.stat-name {
		font-weight: bold;
	}

	.punctuation {
		color: purple !important;
	}
	.number {
		color: blue !important;
	}
	.word {
	}
	.email {
	}
	.emoji {
	}
	.time {
	}
	.hashtag {
	}
	.mention {
	}
	.emoticon {
	}
	.ordinal {
	}
	.quoted_phrase {
	}
	.url {
	}
	.symbol {
	}
	.currency {
	}
	.alien {
	}
</style>
