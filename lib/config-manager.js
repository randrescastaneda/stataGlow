const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.customCommands = [];
    this.highlights = {};
    this.communityCommandsEnabled = true;
  }

  async initialize(context) {
    await this.loadConfig();
  }

  async loadConfig() {
    const config = vscode.workspace.getConfiguration('language-stata');

    // Load highlight toggles
    this.highlights = {
      functions: config.get('highlight.functions', true),
      macros: config.get('highlight.macros', true),
      strings: config.get('highlight.strings', true),
      regex: config.get('highlight.regex', true),
      factorVariables: config.get('highlight.factorVariables', true),
      comments: config.get('highlight.comments', true)
    };

    // Load community commands setting
    this.communityCommandsEnabled = config.get('enableCommunityCommands', true);

    // Load custom commands
    this.customCommands = config.get('customCommands', []);

    // Try to load user custom commands file if it exists
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      const customFile = path.join(workspaceFolder.uri.fsPath, '.vscode', 'stata-custom.json');
      if (fs.existsSync(customFile)) {
        try {
          const content = fs.readFileSync(customFile, 'utf8');
          const customData = JSON.parse(content);
          if (customData.commands && Array.isArray(customData.commands)) {
            this.customCommands = [...this.customCommands, ...customData.commands];
          }
        } catch (error) {
          console.error('Error loading custom commands file:', error);
        }
      }
    }

    console.log('Config loaded:', {
      highlights: this.highlights,
      customCommands: this.customCommands,
      communityCommandsEnabled: this.communityCommandsEnabled
    });
  }

  handleConfigChange() {
    this.loadConfig();
  }

  reloadHighlighting() {
    // Trigger grammar reload by sending signal to all open editors
    vscode.window.visibleTextEditors.forEach(editor => {
      if (editor.document.languageId === 'stata') {
        // Force refresh by toggling language mode
        const currentLang = editor.document.languageId;
        vscode.languages.setTextDocumentLanguage(editor.document, 'plaintext').then(() => {
          vscode.languages.setTextDocumentLanguage(editor.document, currentLang);
        });
      }
    });
  }

  getHighlightStatus(category) {
    return this.highlights[category] !== false;
  }

  getCustomCommands() {
    return this.customCommands;
  }

  isCommunityCommandsEnabled() {
    return this.communityCommandsEnabled;
  }
}

module.exports = {
  ConfigManager
};
