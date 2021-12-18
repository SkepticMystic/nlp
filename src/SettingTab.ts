import { App, PluginSettingTab } from "obsidian";
import NLPPlugin from "./main";

export class SettingTab extends PluginSettingTab {
  plugin: NLPPlugin;

  constructor(app: App, plugin: NLPPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();
  }
}
