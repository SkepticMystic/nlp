<script lang="ts">
	import { Document, WinkMethods } from "wink-nlp";

	export let model: WinkMethods;
	export let doc: Document;

	let [markTokens, markEntities, markSentences] = [false, false, false];

	const { its, as } = model;
	let [markStart, markEnd] = ["<mark>", "</mark>"];

	$: console.log({ markEntities, markSentences, markTokens });

	$: {
		doc.tokens().each((ent) =>
			ent.markup(markTokens ? markStart : "", markTokens ? markEnd : "")
		);
		doc.entities().each((ent) =>
			ent.markup(
				markEntities ? markStart : "",
				markEntities ? markEnd : ""
			)
		);
		doc.sentences().each((ent) =>
			ent.markup(
				markSentences ? markStart : "",
				markSentences ? markEnd : ""
			)
		);

		doc.out(its.markedUpText);
	}
</script>

{#key [markEntities, markSentences, markTokens]}
	<div class="doc-content">{@html doc.out(its.markedUpText)}</div>
{/key}
<div>
	<label>
		<input type="checkbox" bind:checked={markTokens} />
		Tokens
	</label>
</div>
<div>
	<label>
		<input type="checkbox" bind:checked={markEntities} />
		Entities
	</label>
</div>
<div>
	<label>
		<input type="checkbox" bind:checked={markSentences} />
		Sentences
	</label>
</div>

<style>
	.doc-content {
		border: 1px solid black;
		border-radius: 10px;
		padding: 10px;
	}

	mark {
		background-color: green;
	}
</style>
