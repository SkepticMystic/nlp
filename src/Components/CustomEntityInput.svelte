<!-- <script lang="ts">
	import FaPlus from "svelte-icons/fa/FaPlus.svelte";
	import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
	import { CustomEntityExample } from "wink-nlp";
	import type BCPlugin from "../main";
	import { swapItems } from "../utils";

	export let plugin: BCPlugin;

	function blankEntity(): CustomEntityExample {
		return { name: "", patterns: [] };
	}

	let currEntities = [...plugin.settings.customEntities];
	async function update(currEntities: CustomEntityExample[]) {
		plugin.settings.customEntities = currEntities;
		await plugin.saveSettings();
	}
</script>

<div>
	<div class="NLP-Buttons">
		<button
			aria-label="Add New Entity"
			on:click={async () =>
				(currEntities = [...currEntities, blankEntity()])}
		>
			<div class="icon">
				<FaPlus />
			</div>
		</button>
		<button
			aria-label="Reset All Hierarchies"
			on:click={async () => {
				if (
					window.confirm(
						"Are you sure you want to reset all hierarchies?"
					)
				) {
					currEntities = [];
					await update(currEntities);
				}
			}}
		>
			<div class="icon">
				<FaRegTrashAlt />
			</div>
		</button>
	</div>

	{#each currEntities as ent, i}
		<details class="NLP-Entity-Details">
			<summary>
				<label>
					Name:
					<input
						type="text"
						on:change={async (el) => {
							currEntities[i].name = el.target.value;
							await update(currEntities);
						}}
					/>
				</label>

				<span class="NLP-Buttons">
					<button
						aria-label="Swap with Hierarchy Above"
						on:click={async () => {
							currEntities = swapItems(i, i - 1, currEntities);
							await update(currEntities);
						}}>↑</button
					>
					<button
						aria-label="Swap with Hierarchy Below"
						on:click={async () => {
							currEntities = swapItems(i, i + 1, currEntities);
							await update(currEntities);
						}}>↓</button
					>
					<button
						aria-label="Remove Hierarchy"
						on:click={async () => {
							currEntities.splice(i, 1);
							currEntities = currEntities;
							await update(currEntities);
						}}>X</button
					>
				</span>
			</summary>
			<button
				on:click={() => {
					ent.patterns.push("");
				}}>Add Pattern</button
			>
			{#key ent.patterns}
				{#each ent.patterns as pattern}
					<div>
						<label class="NLP-Arrow-Label" for={pattern}>
							{pattern}
						</label>
						<input
							type="text"
							size="20"
							name={pattern}
							value={pattern}
							on:change={async (e) => {
								const { value } = e.target;
								currEntities[i] = value;
								await update(currEntities);
							}}
						/>
					</div>
				{/each}
			{/key}
		</details>
	{/each}
</div>

<style>
	label.NLP-Arrow-Label {
		display: inline-block;
		width: 20px !important;
	}
	div.NLP-Buttons {
		padding-bottom: 5px;
	}

	details.NLP-Entity-Details {
		border: 1px solid var(--background-modifier-border);
		border-radius: 10px;
		padding: 10px 5px 10px 10px;
		margin-bottom: 15px;
	}
	.NLP-Entity-Details summary::marker {
		font-size: 10px;
	}

	.NLP-Entity-Details summary button {
		float: right;
	}
	.icon {
		color: var(--text-normal);
		display: inline-block;
		padding-top: 3px;
		width: 17px;
		height: 17px;
	}
</style> -->
