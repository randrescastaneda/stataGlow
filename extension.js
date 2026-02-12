const vscode = require('vscode');
const configManager = require('./lib/config-manager');

let configManager_instance;

async function activate(context) {
  console.log('StataGlow extension activated');

  configManager_instance = new configManager.ConfigManager();
  await configManager_instance.initialize(context);

  // Register configuration change listener
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('language-stata')) {
        configManager_instance.handleConfigChange();
      }
    })
  );

  // Register command to reload highlighting
  context.subscriptions.push(
    vscode.commands.registerCommand('stataGlow.reloadHighlighting', () => {
      configManager_instance.reloadHighlighting();
      vscode.window.showInformationMessage('StataGlow highlighting reloaded');
    })
  );

  // Log current configuration
  const config = vscode.workspace.getConfiguration('language-stata');
  console.log('StataGlow configuration:', {
    functions: config.get('highlight.functions'),
    macros: config.get('highlight.macros'),
    strings: config.get('highlight.strings'),
    regex: config.get('highlight.regex'),
    factorVariables: config.get('highlight.factorVariables'),
    comments: config.get('highlight.comments'),
    communityCommands: config.get('enableCommunityCommands'),
    customCommands: config.get('customCommands')
  });
}

function deactivate() {
  console.log('StataGlow extension deactivated');
}

module.exports = {
  activate,
  deactivate
};
