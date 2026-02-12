#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Build script: converts YAML command registry to stata.json (TextMate format)
 * Also generates test file and documentation
 */

const COMMANDS_DIR = path.join(__dirname, '..', 'commands');
const GRAMMARS_DIR = path.join(__dirname, '..', 'grammars');
const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');

function loadYAML(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error(`Error loading YAML file ${filePath}:`, error.message);
    return null;
  }
}

function extractCommands(data, sourceType = 'official') {
  const commands = [];
  if (!data || !data.categories) {
    return commands;
  }

  for (const [categoryKey, categoryData] of Object.entries(data.categories)) {
    if (categoryData.commands && Array.isArray(categoryData.commands)) {
      categoryData.commands.forEach(cmd => {
        if (cmd.name) {
          commands.push({
            name: cmd.name,
            category: cmd.category || categoryKey,
            source: sourceType,
            status: cmd.status || 'stable'
          });
        }
      });
    }
  }
  return commands;
}

function buildCommandRegex(commands, sourceType) {
  // Group by source to apply different scopes
  const sortedCommands = commands
    .map(c => c.name)
    .sort()
    .filter((cmd, idx, arr) => idx === 0 || arr[idx - 1] !== cmd); // Remove duplicates

  // Build regex pattern with word boundaries
  return sortedCommands.join('|');
}

function readExistingGrammar() {
  const csonPath = path.join(__dirname, '..', '..', 'language-stata', 'grammars', 'stata.cson');
  if (!fs.existsSync(csonPath)) {
    console.warn(`Warning: Could not find existing stata.cson at ${csonPath}`);
    return null;
  }
  return fs.readFileSync(csonPath, 'utf8');
}

function createStateGrammarJSON(officialCommands, communityCommands, personalCommands) {
  // Create TextMate grammar in JSON format
  const grammar = {
    $schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
    name: 'Stata',
    scopeName: 'source.stata',
    fileTypes: ['do', 'ado', 'mata'],
    patterns: [
      // Official Stata commands (primary)
      {
        comment: 'Official Stata commands',
        match: `\\b(${buildCommandRegex(officialCommands, 'official')})\\b`,
        name: 'keyword.command.official.stata'
      },
      // Community commands (SSC/GitHub)
      {
        comment: 'Community-contributed commands (SSC, GitHub)',
        match: `\\b(${buildCommandRegex(communityCommands, 'community')})\\b`,
        name: 'keyword.command.community.stata'
      },
      // User custom commands (if any)
      ...(personalCommands.length > 0 ? [{
        comment: 'User-defined custom commands',
        match: `\\b(${buildCommandRegex(personalCommands, 'custom')})\\b`,
        name: 'keyword.command.custom.stata'
      }] : []),
      // Include reference to main pattern file (placeholder)
      { include: '#comments' },
      { include: '#strings' },
      { include: '#functions' },
      { include: '#macros' },
      { include: '#operators' }
    ],
    repository: {
      comments: {
        patterns: [
          {
            name: 'comment.line.double-slash.stata',
            begin: '//',
            end: '$'
          },
          {
            name: 'comment.block.stata',
            begin: '/\\*',
            end: '\\*/'
          }
        ]
      },
      strings: {
        patterns: [
          {
            name: 'string.quoted.double.stata',
            begin: '"',
            end: '"',
            patterns: [
              { name: 'constant.character.escape.stata', match: '\\\\.' }
            ]
          }
        ]
      },
      functions: {
        patterns: [
          {
            name: 'support.function.builtin.stata',
            match: '\\b(abs|acos|acosh|asin|asinh|atan|atan2|atanh|ceil|comb|cos|cosh|exp|floor|int|ln|log|log10|max|min|mod|round|sign|sin|sinh|sqrt|tan|tanh)\\('
          }
        ]
      },
      macros: {
        patterns: [
          {
            name: 'variable.other.macro.local.stata',
            match: '`[a-zA-Z_][a-zA-Z0-9_]*\''
          },
          {
            name: 'variable.other.macro.global.stata',
            match: '\\$[a-zA-Z_][a-zA-Z0-9_]*'
          }
        ]
      },
      operators: {
        patterns: [
          {
            name: 'keyword.operator.arithmetic.stata',
            match: '[+\\-*/^]'
          },
          {
            name: 'keyword.operator.comparison.stata',
            match: '(==|!=|<|>|<=|>=)'
          }
        ]
      }
    }
  };

  return grammar;
}

function generateTestFile(officialCommands, communityCommands, personalCommands) {
  const lines = [];
  
  lines.push('/*');
  lines.push('StataGlow - Comprehensive Command Test File');
  lines.push('Generated: ' + new Date().toISOString());
  lines.push('');
  lines.push('This file contains all command tiers for syntax highlighting verification:');
  lines.push('- Official Stata commands: standard highlighting');
  lines.push('- Community commands: italic highlighting');
  lines.push('- Personal custom commands: purple highlighting');
  lines.push('*/');
  lines.push('');
  
  lines.push('// ============================================');
  lines.push('// OFFICIAL STATA COMMANDS (' + officialCommands.length + ')');
  lines.push('// ============================================');
  lines.push('');
  
  // Group official commands by first letter for readability
  const grouped = {};
  officialCommands.forEach(cmd => {
    const first = cmd.name.charAt(0).toUpperCase();
    if (!grouped[first]) grouped[first] = [];
    grouped[first].push(cmd.name);
  });
  
  Object.keys(grouped).sort().forEach(letter => {
    lines.push(`// ${letter}`);
    lines.push(grouped[letter].map(cmd => `// ${cmd}`).join(' '));
    lines.push('');
  });
  
  lines.push('// ============================================');
  lines.push('// COMMUNITY COMMANDS (' + communityCommands.length + ')');
  lines.push('// ============================================');
  lines.push('');
  if (communityCommands.length > 0) {
    lines.push('// SSC/GitHub contributed packages:');
    communityCommands.forEach((cmd, idx) => {
      if (idx % 5 === 0) lines.push('//');
      lines.push(`// ${cmd.name}`);
    });
  } else {
    lines.push('// (None currently configured)');
  }
  lines.push('');
  
  lines.push('// ============================================');
  lines.push('// USER-DEFINED COMMANDS');
  lines.push('// ============================================');
  lines.push('');
  if (personalCommands.length > 0) {
    lines.push('// Add your custom commands in VS Code settings');
    personalCommands.forEach(cmd => {
      lines.push(`// ${cmd.name}`);
    });
  } else {
    lines.push('// (Add custom commands via settings: language-stata.customCommands)');
  }
  lines.push('');
  
  return lines.join('\n');
}

function main() {
  console.log('🔨 Building StataGlow grammar...\n');

  // Load registries
  console.log('📖 Loading command registries...');
  const officialData = loadYAML(path.join(COMMANDS_DIR, 'official_stata_commands.yaml'));
  const sscData = loadYAML(path.join(COMMANDS_DIR, 'ssc_contributed_commands.yaml'));
  const githubData = loadYAML(path.join(COMMANDS_DIR, 'github_contributed_commands.yaml'));

  const officialCommands = extractCommands(officialData, 'official');
  const sscCommands = extractCommands(sscData, 'ssc');
  const githubCommands = extractCommands(githubData, 'github');
  const communityCommands = [...sscCommands, ...githubCommands];

  console.log(`✓ Official commands: ${officialCommands.length}`);
  console.log(`✓ Community commands: ${communityCommands.length} (${sscCommands.length} SSC + ${githubCommands.length} GitHub)`);
  console.log('');

  // Build grammar
  console.log('⚙️  Building TextMate grammar...');
  const grammar = createStateGrammarJSON(officialCommands, communityCommands, []);

  // Write stata.json
  const grammarsPath = path.join(GRAMMARS_DIR, 'stata.json');
  fs.writeFileSync(grammarsPath, JSON.stringify(grammar, null, 2));
  console.log(`✓ Written: ${grammarsPath}`);

  // Generate test file
  console.log('');
  console.log('📝 Generating test file...');
  const testContent = generateTestFile(officialCommands, communityCommands, []);
  const testPath = path.join(EXAMPLES_DIR, 'test_all_commands.do');
  fs.writeFileSync(testPath, testContent);
  console.log(`✓ Written: ${testPath}`);

  console.log('');
  console.log('✅ Build complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Review grammars/stata.json');
  console.log('  2. Test syntax highlighting in VS Code/Positron');
  console.log('  3. Run: npm run validate');
}

if (require.main === module) {
  main();
}

module.exports = {
  extractCommands,
  buildCommandRegex,
  createStateGrammarJSON,
  generateTestFile
};
