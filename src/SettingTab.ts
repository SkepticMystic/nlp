import { App, PluginSettingTab, Setting } from "obsidian";
import NLPPlugin from "./main";
// import CustomEntityInput from "./Components/CustomEntityInput.svelte";

export class SettingTab extends PluginSettingTab {
	plugin: NLPPlugin;

	constructor(app: App, plugin: NLPPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		containerEl.empty();

		// new CustomEntityInput({
		// 	target: containerEl,
		// 	props: { plugin: this.plugin },
		// });

		const customEntityFragment = new DocumentFragment();
		const ceDiv = customEntityFragment.createDiv();
		ceDiv.innerHTML = `The path to a JSON file of <a href="https://winkjs.org/wink-nlp/custom-entities.html" aria-label="https://winkjs.org/wink-nlp/custom-entities.html">custom entities</a> defined for your vault.`;
		new Setting(containerEl)
			.setName("Custom Entity File Path")
			.setDesc(customEntityFragment)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.customEntityFilePath)
					.onChange(async (value) => {
						this.plugin.settings.customEntityFilePath = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
