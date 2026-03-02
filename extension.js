const vscode = require('vscode');
const configManager = require('./lib/config-manager');
const path = require('path');
const fs = require('fs');

let configManager_instance;

// Map color scheme names to theme file names
const COLOR_SCHEME_MAP = {
  'Official': 'stata-glow-official.json',
  'Modern': 'stata-glow-modern.json',
  'Kiwi': 'stata-glow-kiwi.json',
  'OneDark': 'stata-glow-onedark.json',
  'Dracula': 'stata-glow-dracula.json',
  'Light': 'stata-glow-light.json'
};

/**
 * Load a color scheme file and return only .stata-scoped tokenColors
 */
function loadColorScheme(schemeName, extensionPath) {
  const fileName = COLOR_SCHEME_MAP[schemeName];
  if (!fileName) {
    return null;
  }

  const filePath = path.join(extensionPath, 'themes', fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`StataGlow: Theme file not found: ${filePath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const theme = JSON.parse(content);
    return theme.tokenColors || [];
  } catch (error) {
    console.error(`StataGlow: Error loading color scheme: ${error.message}`);
    return null;
  }
}

/**
 * Apply StataGlow color scheme by injecting tokenColorCustomizations
 * scoped to [stata] language files only.
 */
async function applyColorScheme(extensionPath) {
  const config = vscode.workspace.getConfiguration('stataGlow');
  const schemeName = config.get('colorScheme', 'Official');

  const globalConfig = vscode.workspace.getConfiguration('editor');
  const currentCustomizations = globalConfig.get('tokenColorCustomizations') || {};

  if (schemeName === 'None') {
    await removeStataGlowRules(currentCustomizations, globalConfig);
    return;
  }

  const tokenColors = loadColorScheme(schemeName, extensionPath);
  if (!tokenColors) {
    return;
  }

  // Build textMateRules from the theme file
  const stataRules = tokenColors.map(tc => ({
    scope: tc.scope,
    settings: { ...tc.settings }
  }));

  // Merge with existing customizations, replacing any previous StataGlow rules
  const updatedCustomizations = { ...currentCustomizations };

  // Work with the [stata] language-scoped section
  const stataKey = '[stata]';
  const existingStataSection = updatedCustomizations[stataKey] || {};
  const existingRules = existingStataSection.textMateRules || [];

  // Remove old StataGlow-managed rules (those with .stata scopes)
  const stataScopes = new Set(stataRules.map(r => r.scope));
  const userRules = existingRules.filter(r => !stataScopes.has(r.scope));

  updatedCustomizations[stataKey] = {
    ...existingStataSection,
    textMateRules: [...userRules, ...stataRules]
  };

  await globalConfig.update('tokenColorCustomizations', updatedCustomizations, vscode.ConfigurationTarget.Global);
  console.log(`StataGlow: Applied "${schemeName}" color scheme for Stata files`);
}

/**
 * Remove all StataGlow-injected rules from tokenColorCustomizations
 */
async function removeStataGlowRules(currentCustomizations, globalConfig) {
  const updatedCustomizations = { ...currentCustomizations };
  const stataKey = '[stata]';

  if (updatedCustomizations[stataKey]) {
    const existingRules = updatedCustomizations[stataKey].textMateRules || [];
    // Keep only rules that are NOT .stata-scoped (user's own rules)
    const userRules = existingRules.filter(r => {
      const scope = typeof r.scope === 'string' ? r.scope : '';
      return !scope.endsWith('.stata');
    });

    if (userRules.length > 0) {
      updatedCustomizations[stataKey] = {
        ...updatedCustomizations[stataKey],
        textMateRules: userRules
      };
    } else {
      delete updatedCustomizations[stataKey];
    }

    await globalConfig.update(
      'tokenColorCustomizations',
      Object.keys(updatedCustomizations).length > 0 ? updatedCustomizations : undefined,
      vscode.ConfigurationTarget.Global
    );
    console.log('StataGlow: Removed color scheme rules');
  }
}

/**
 * Migrate settings from old "language-stata" prefix to new "stataGlow" prefix.
 * Only runs once — sets a flag in global state after migration.
 */
async function migrateSettings(context) {
  const migrated = context.globalState.get('stataGlow.settingsMigrated', false);
  if (migrated) {
    return;
  }

  const oldConfig = vscode.workspace.getConfiguration('language-stata');
  const newConfig = vscode.workspace.getConfiguration('stataGlow');

  const settingsToMigrate = [
    'highlight.functions',
    'highlight.macros',
    'highlight.strings',
    'highlight.regex',
    'highlight.factorVariables',
    'highlight.comments',
    'enableCommunityCommands',
    'customCommands'
  ];

  let didMigrate = false;
  for (const key of settingsToMigrate) {
    const inspection = oldConfig.inspect(key);
    if (inspection && inspection.globalValue !== undefined) {
      const currentNew = newConfig.inspect(key);
      if (currentNew && currentNew.globalValue === undefined) {
        await newConfig.update(key, inspection.globalValue, vscode.ConfigurationTarget.Global);
        didMigrate = true;
      }
    }
    if (inspection && inspection.workspaceValue !== undefined) {
      const currentNew = newConfig.inspect(key);
      if (currentNew && currentNew.workspaceValue === undefined) {
        await newConfig.update(key, inspection.workspaceValue, vscode.ConfigurationTarget.Workspace);
        didMigrate = true;
      }
    }
  }

  if (didMigrate) {
    vscode.window.showInformationMessage(
      'StataGlow: Settings migrated from "language-stata.*" to "stataGlow.*". ' +
      'You can safely remove old "language-stata.*" entries from your settings.'
    );
  }

  await context.globalState.update('stataGlow.settingsMigrated', true);
}

// --- Semantic Token Provider for custom commands ---
const tokenTypes = ['keyword'];
const tokenModifiers = ['custom'];
const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

class StataCustomCommandsProvider {
  constructor() {
    this._onDidChangeSemanticTokens = new vscode.EventEmitter();
    this.onDidChangeSemanticTokens = this._onDidChangeSemanticTokens.event;
  }

  refresh() {
    this._onDidChangeSemanticTokens.fire();
  }

  provideDocumentSemanticTokens(document) {
    const config = vscode.workspace.getConfiguration('stataGlow');
    const customCommands = config.get('customCommands', []);

    if (!customCommands || customCommands.length === 0) {
      return new vscode.SemanticTokensBuilder(legend).build();
    }

    const commandSet = new Set(
      customCommands.filter(c => typeof c === 'string' && c.trim().length > 0)
    );

    if (commandSet.size === 0) {
      return new vscode.SemanticTokensBuilder(legend).build();
    }

    const builder = new vscode.SemanticTokensBuilder(legend);
    const wordPattern = /\b([a-zA-Z_]\w*)\b/g;

    let inBlockComment = false;

    for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
      const line = document.lineAt(lineNum).text;

      // Determine whether each character position is inside a comment.
      // We track block comments (/* ... */) across lines, and also detect
      // line comments: * at line start, // and /// mid-line.
      const commentMask = new Uint8Array(line.length); // 1 = in comment
      let i = 0;

      while (i < line.length) {
        if (inBlockComment) {
          // Look for closing */
          if (line[i] === '*' && line[i + 1] === '/') {
            commentMask[i] = 1;
            commentMask[i + 1] = 1;
            i += 2;
            inBlockComment = false;
          } else {
            commentMask[i] = 1;
            i++;
          }
        } else {
          // Check for opening /*
          if (line[i] === '/' && line[i + 1] === '*') {
            inBlockComment = true;
            commentMask[i] = 1;
            commentMask[i + 1] = 1;
            i += 2;
          // Check for line-comment: // or ///
          } else if (line[i] === '/' && line[i + 1] === '/') {
            commentMask.fill(1, i);
            break;
          // Check for star comment: * at the start of the line (ignoring leading whitespace)
          } else if (line[i] === '*' && /^\s*$/.test(line.slice(0, i))) {
            commentMask.fill(1, i);
            break;
          } else {
            i++;
          }
        }
      }

      wordPattern.lastIndex = 0;
      let match;
      while ((match = wordPattern.exec(line)) !== null) {
        // Skip if the token starts inside a comment
        if (commentMask[match.index]) {
          continue;
        }
        if (commandSet.has(match[1])) {
          builder.push(lineNum, match.index, match[1].length, 0, 1);
        }
      }
    }

    return builder.build();
  }
}

async function activate(context) {
  console.log('StataGlow extension activated');

  // Run settings migration from old prefix
  await migrateSettings(context);

  // Initialize config manager
  configManager_instance = new configManager.ConfigManager();
  await configManager_instance.initialize(context);

  // Apply color scheme on activation
  await applyColorScheme(context.extensionPath);

  // Create semantic token provider for custom commands
  const customCommandsProvider = new StataCustomCommandsProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: 'stata' },
      customCommandsProvider,
      legend
    )
  );

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async event => {
      if (event.affectsConfiguration('stataGlow.colorScheme')) {
        await applyColorScheme(context.extensionPath);
      }
      if (event.affectsConfiguration('stataGlow')) {
        configManager_instance.handleConfigChange();
        if (event.affectsConfiguration('stataGlow.customCommands')) {
          customCommandsProvider.refresh();
        }
      }
    })
  );

  // Register command to reload highlighting
  context.subscriptions.push(
    vscode.commands.registerCommand('stataGlow.reloadHighlighting', async () => {
      await applyColorScheme(context.extensionPath);
      customCommandsProvider.refresh();
      configManager_instance.reloadHighlighting();
      vscode.window.showInformationMessage('StataGlow highlighting reloaded');
    })
  );

  // Log current configuration
  const config = vscode.workspace.getConfiguration('stataGlow');
  console.log('StataGlow configuration:', {
    colorScheme: config.get('colorScheme'),
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

async function deactivate() {
  console.log('StataGlow extension deactivating — cleaning up injected color rules');

  try {
    const globalConfig = vscode.workspace.getConfiguration('editor');
    const currentCustomizations = globalConfig.get('tokenColorCustomizations') || {};
    await removeStataGlowRules(currentCustomizations, globalConfig);
  } catch (error) {
    console.error('StataGlow: Error during deactivation cleanup:', error.message);
  }
}

module.exports = {
  activate,
  deactivate
};
