<script lang="ts">
	import compromise from "compromise";
	import { copy } from "obsidian-community-lib/dist/utils";
	import { onMount } from "svelte";

	export let content: string;

	let compDoc = compromise(content);

	let query = "";
	let matches = [];

	let queryInput: HTMLInputElement;
	onMount(() => queryInput.focus());

	$: {
		matches = compDoc.match(query).out("array");
		console.log({ query, matches });
	}
</script>

<div class="doc-content">
	{#each matches as match}
		<div>{match}</div>
	{/each}
</div>

<div class="query-div">
	<label>
		Query
		<input type="text" bind:value={query} bind:this={queryInput} />
	</label>
</div>
<div>
	<details>
		<summary>
			Syntax (<a
				href="https://observablehq.com/@spencermountain/compromise-match-syntax"
				aria-label="https://observablehq.com/@spencermountain/compromise-match-syntax"
				>docs</a
			>,
			<a
				href="https://observablehq.com/@spencermountain/compromise-match-test"
				aria-label="https://observablehq.com/@spencermountain/compromise-match-test"
				>Playground</a
			>)
		</summary>

		<p>(This works alot like regex, but more flexibly)</p>
		<p>Search for literal matches like a normal search</p>
		<p>Search for Parts-of-Speech using <code>{`#{PoS}`}</code>:</p>
		<ul>
			<li>
				<code>#verb</code>, <code>#noun</code>, <code>#verbs</code>,
				<code>#verbs</code>...
			</li>
		</ul>
		<p>Use <code>.</code> as a wildcard match (any one thing)</p>
		<p>
			Use <code>*</code> to match all things <i>until</i> the next thing
		</p>
		<ul>
			<li>
				<code>
					"John always ravenously eats his glue".match("john * eats")
				</code>
				→ <code>"John always ravenously eats"</code>
			</li>
		</ul>
		<p>
			Use <code>+</code> to make a query <i>greedy</i> (match as many instances
			of that thing as possible
		</p>
		<ul>
			<li>
				<code>
					"John always ravenously eats his glue".match("john * eats")
				</code>
				→ <code>"really, really good"</code>
			</li>
		</ul>
		<p>Use <code>?</code> to specify that an item is <i>optional</i></p>
		<p>
			There is too much to put in here... check the docs for full
			functionality
		</p>
	</details>
</div>

<span class="button-span">
	<button
		on:click={async () => {
			copy(matches.join("\n"));
		}}
	>
		Copy
	</button>
</span>

<style>
	.doc-content {
		border: 1px solid var(--background-modifier-border);
		border-radius: 5px;
		padding: 10px;
		max-height: 500px;
		overflow-y: scroll;
	}
	.query-div {
		margin: 5px 0px;
	}

	.button-span {
		margin-top: 10px;
		display: flex;
		flex-direction: row;
	}
</style>
