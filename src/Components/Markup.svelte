<script lang="ts">
	import { onMount } from "svelte";
	import { Document, WinkMethods } from "wink-nlp";
	import { copy } from "obsidian-community-lib";

	export let originalText: string;
	export let model: WinkMethods;

	let doc: Document;

	onMount(async () => {
		doc = model.readDoc(originalText);
	});

	let [markTokens, markEntities, markSentences] = [false, false, false];

	const { its, as } = model;
	let [markStart, markEnd] = ["<mark>", "</mark>"];

	let text = originalText;

	$: {
		doc = model.readDoc(originalText);

		if (markTokens)
			doc.tokens().each((ent) => ent.markup(markStart, markEnd));
		if (markEntities)
			doc.entities().each((ent) => ent.markup(markStart, markEnd));
		if (markSentences)
			doc.sentences().each((ent) => ent.markup(markStart, markEnd));
		text = doc.out(its.markedUpText);
	}
</script>

<div class="doc-content">{@html text}</div>
<span class="options-span">
	<div class="left-options">
		<h4>Items to Mark</h4>
		<label>
			<input type="checkbox" bind:checked={markTokens} />
			Tokens
		</label>
		<label>
			<input type="checkbox" bind:checked={markEntities} />
			Entities
		</label>
		<label>
			<input type="checkbox" bind:checked={markSentences} />
			Sentences
		</label>
	</div>
	<div class="right-options">
		<h4>Markup</h4>
		<label>
			<input type="text" bind:value={markStart} width="10" />
			Start
		</label>
		<label>
			<input type="text" bind:value={markEnd} width="10" />
			End
		</label>
	</div>
</span>
<span class="button-span">
	<button
		on:click={async () => {
			copy(text);
		}}
	>
		Copy
	</button>
	<!-- TODO make this work -->
	<button
		on:click={async () => {
			copy(text);
		}}
		aria-label="Will overwrite selected text"
	>
		Insert at cursor
	</button>
</span>

<style>
	.doc-content {
		border: 1px solid black;
		border-radius: 10px;
		padding: 10px;
		max-height: 500px;
	}

	.left-options,
	.right-options {
		display: flex;
		flex-direction: column;
	}

	.options-span {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.button-span {
		margin-top: 10px;
		display: flex;
		flex-direction: row;
	}

	mark {
		background-color: green;
	}
</style>
